const express = require('express');
const Walker = require('../../util/walk')
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

class Router {
    constructor(client) {
        this.name = 'root';
        this.path = '/';
        this.dirPath = path.join(__dirname, '../../data/html/root')
        this.client = client;
        this.enabled = true;
        this.router = express.Router();
        this.refreshTokens = []
    }

    async setupRoutes() {
        const files = await Walker.walk(this.dirPath);

        files.files.forEach(async file => {
            const routePath = file.exact.split(this.name)[1].replace(/\\/gi, '/').split('.')[0]
            if (file.name === 'index.html') {
                this.router.get('/', (req, res) => {
                    return res.sendFile(file.exact)
                })
            } else if (!file.name.startsWith('special_')) {
                this.router.get(routePath, (req, res) => {

                    return res.sendFile(file.exact)
                    
                })
            }
        })

        this.router.post('/token', (req, res) => {
            const refreshToken = req.body.token
            if (refreshToken == null) return res.sendStatus({ success: false })

            if (!this.refreshTokens.includes(refreshToken)) return res.json({ success: false })

            jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
                if (err) return res.json(403)
                const accessToken = generateAccessToken({ name: user.name })
                res.json({ success: true, accessToken: accessToken })
            })
        })

        this.router.delete('/logout', (req, res) => {
            this.refreshTokens = this.refreshTokens.filter(token => token !== req.body.token)
            res.sendStatus(204)
        })


        this.router.post('/login', async (req, res) => {
            if (req.body.username || req.body.password) {
                if (!req.body.username || !req.body.password) return res.end(fs.readFileSync(`${this.dirPath}/special_login.html`, 'utf8').replace('{{err}}', 'Missing Username / Password'))
                const user = await this.client.db.query('SELECT * FROM users WHERE username = ?', [ req.body.username ]);
                if (user.length !== 1) res.end(fs.readFileSync(`${this.dirPath}/special_login.html`, 'utf8').replace('{{err}}', 'No user was found with the given username and password'))
                else {
                    if (user[0].password === req.body.password) {
                        
                        const user = {
                            name: req.body.username
                        }    

                        const accessToken = generateAccessToken(user)
                        const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET)
                        this.refreshTokens.push(refreshToken)
                        res.end(fs.readFileSync(`${this.dirPath}/special_index.html`, 'utf8').replace('{{ACCESS_TOKEN}}', accessToken).replace('{{REFRESH_TOKEN}}', refreshToken));

                    } else res.end(fs.readFileSync(`${this.dirPath}/special_login.html`, 'utf8').replace('{{err}}', 'No user was found with the given username and password'))
                }
            } else if (req.headers['authorization']) {
                console.log("Logged in check")
            } else return res.end(fs.readFileSync(`${this.dirPath}/special_login.html`, 'utf8').replace('{{err}}', 'Illigal request made. I\'m unsure of what you did.'))
            
        })

        this.router.post('/token', (req, res) => {
            const refreshToken = req.body.token
            if (refreshToken == null) return res.sendStatus(401)
            if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
            jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
              if (err) return res.sendStatus(403)
              const accessToken = generateAccessToken({ name: user.name })
              res.json({ accessToken: accessToken })
            })
        })

        this.router.post('/validateToken', (req, res) => {
            const token = req.headers['authorization']
            jwt.verify(token.split(' ')[1], process.env.ACCESS_SECRET, (err, user) => {
                if (err) return res.json({ success: false })
                else return res.json({ success: true })
            })
        })

        function generateAccessToken(user) {
            return jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '30s' })
        }
    }

    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)

        jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
            console.log(err)
            if (err) return res.sendStatus(403)
            req.user = user
            next()
        });
    }

    getRouter = () => this;

}

module.exports = Router;