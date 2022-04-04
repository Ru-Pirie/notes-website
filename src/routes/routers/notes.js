const express = require('express');
const Walker = require('../../util/walk')
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');

class Router {
    constructor(client) {
        this.name = 'notes';
        this.path = '/notes';
        this.dirPath = path.join(__dirname, '../../data/html/notes')
        this.client = client;
        this.enabled = true;
        this.router = express.Router();
        this.refreshTokens = []
    }

    async setupRoutes() {
        this.router.get('/', (req, res) => {
            res.redirect('/')
        })

        this.router.get('/edit/:id', async (req, res) => {
            if (!req.params.id) return res.redirect('/')
            const templateHTML = fs.readFileSync(`${this.dirPath}/special_template.html`, 'utf8')
            const title = await this.client.db.query('SELECT name, subject FROM titles WHERE uuid = ?', [ req.params.id ])
            const body = await this.client.db.query('SELECT content FROM contents WHERE uuid = ?', [ req.params.id ])
            if (title.length !== 1 || body.length !== 1) return res.redirect('/')
            res.end(templateHTML.replace('{{SUBJECT}}', title[0].subject).replace('{{TITLE}}', title[0].name).replace('{{CONTENT}}', body[0].content).replace('{{URL}}', `https://notes.ru-pirie.com/notes/view/${req.params.id}`))
        })

        this.router.get('/view/:id', async (req, res) => {
            if (!req.params.id) return res.redirect('/')
            const templateHTML = fs.readFileSync(`${this.dirPath}/special_view.html`, 'utf8')
            const title = await this.client.db.query('SELECT name, subject FROM titles WHERE uuid = ?', [ req.params.id ])
            const body = await this.client.db.query('SELECT content FROM contents WHERE uuid = ?', [ req.params.id ])
            if (title.length !== 1 || body.length !== 1) return res.redirect('/')
            res.end(templateHTML.replace('{{SUBJECT}}', title[0].subject).replace('{{TITLE}}', title[0].name).replace('{{CONTENT}}', body[0].content).replace('{{URL}}', `https://notes.ru-pirie.com/notes/view/${req.params.id}`))
        })

        this.router.post('/delete/:id', this.authenticateToken, async (req, res) => {
            if (!req.params.id) return res.redirect('/')
            this.client.db.query('DELETE FROM titles WHERE uuid = ?', [ req.params.id])
            this.client.db.query('DELETE FROM contents WHERE uuid = ?', [ req.params.id])
            return res.json({ success: true })
        })

        this.router.post('/save/:id', this.authenticateToken, async (req, res) => {
            await this.client.db.query('UPDATE titles SET name = ? WHERE uuid = ?', [ req.body.title, req.params.id ])
            await this.client.db.query('UPDATE contents SET content = ? WHERE uuid = ?', [ req.body.content, req.params.id ])
            return res.end();
        })

        this.router.post('/clone/:id', this.authenticateToken, async (req, res) => {
            if (!req.params.id) return res.redirect('/')
            const title = await this.client.db.query('SELECT * FROM titles WHERE uuid = ?', [ req.params.id ])
            const body = await this.client.db.query('SELECT * FROM contents WHERE uuid = ?', [ req.params.id ])
            if (title.length !== 1 || body.length !== 1) return res.redirect(`/notes/edit/${req.params.id}`)
            
            const pageUUID = crypto.randomUUID();

            await this.client.db.query('INSERT INTO titles VALUES (?, ?, ?)', [ `${title[0].name} (Clone)`, pageUUID, title[0].subject ]);
            await this.client.db.query('INSERT INTO contents VALUES (?, ?)', [ pageUUID, body[0].content ]);

            return res.json({ success: true, uuid: pageUUID })
        })
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