require('dotenv').config();

const express = require('express')
const app = express();

const fs = require('fs');
const http = require('http');
const https = require('https');

const path = require('path');
const PORT = process.env.PORT || 3000;

const Logger = require('./src/util/logger');
const Database = require('./src/util/database');
const Walker = require('./src/util/walk');

const log = new Logger();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

client = { 
    createdAt: Date.now(), 
    log,
};

client.log.info(`Client has been created (${client.createdAt}). Running main...`)

app.all('*', async (req, res, next) => { 
    const IP = req.headers['x-forwarded-for'] || req.socket.remoteAddress.split(':')[3]

    if (!req.originalUrl.startsWith('/static')) client.log.web(`(${req.method}) ${IP} Accessed page '${req.originalUrl}'`)
  
    if (req.originalUrl.split('.')[1]) {
        const statics = await Walker.walk('./src/routes/static')
        let foundFile = undefined;
        statics.files.forEach(file => { 
            if (file.exact.replace(/(\\)/gi, '/').split('/routes')[1] === req.originalUrl) {
                foundFile = file.exact        
            } 
        })

        if (foundFile) return res.sendFile(foundFile);
    } else {
        next();
    }
})

async function main() {
    const db = new Database(client);
    await db.initialize();
    const files = await Walker.walk('./src/routes/routers')

    for (const file of files.files) {
        const Router = require(file.exact)
        const router = new Router(client);

        await router.setupRoutes();

        app.use(router.path, router.router)
        client.log.web(`${router.name} has been routed to ${router.path}`)
    }

    client.log.info('Database created and synced')
    client.db = db;

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '/src/routes/static/pages/404.html'), 404)
    })
}

main()

if (process.env.NODE_ENV === 'prod') {
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/ru-pirie.com/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/ru-pirie.com/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/ru-pirie.com/chain.pem', 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
    };

    http.createServer(app).listen(80, () => {
        client.log.web(`Created HTTP server on 80.`)
    })

    https.createServer(credentials, app).listen(443, () => {
        client.log.web(`Created HTTPS server on 443.`)
    })
    
}  else {
    http.createServer(app).listen(PORT, () => {
        client.log.web(`Listening on port ${PORT}. Development environment.`)
    })
}

module.exports = client
