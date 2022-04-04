const chalk = require('chalk')
const Time = require('./date')

const time = new Time(); 

class Logger {
    getDate = () => chalk.bold.bgHex('#151830').whiteBright(` ${time.logFormat()} `);
    info = (message) => console.log(`${chalk.bold.bgGreen.whiteBright(` | INFORMATION   `)}${this.getDate()}${chalk.bold.bgGreenBright.whiteBright(` `)} ${chalk.bold.greenBright(message)}`)
    warn = (message) => console.log(`${chalk.bold.bgHex('#FFA500').whiteBright(` | WARNING       `)}${this.getDate()}${chalk.bold.bgHex('#FFA500').whiteBright(` `)} ${chalk.bold.hex('#FFA500')(message)}`)
    error = (message) => console.log(`${chalk.bold.bgRed.whiteBright(` | ERROR         `)}${this.getDate()}${chalk.bold.bgRed.whiteBright(` `)} ${chalk.bold.red(message)}`)
    debug = (message) => console.log(`${chalk.bold.bgHex('#6a0dad').whiteBright(` | DEBUG         `)}${this.getDate()}${chalk.bold.bgHex('#6a0dad').whiteBright(` `)} ${chalk.bold.hex('#6a0dad')(message)}`)
    web = (message) => console.log(`${chalk.bold.bgBlue.whiteBright(` | WEBSITE       `)}${this.getDate()}${chalk.bold.bgBlue.whiteBright(` `)} ${chalk.bold.blue(message)}`)
    db = (message) => {
        if (!message.includes('INSERT INTO accessLogs')) {
            console.log(`${chalk.bold.bgMagenta.whiteBright(` | DATABASE      `)}${this.getDate()}${chalk.bold.bgMagenta.whiteBright(` `)} ${chalk.bold.magenta(message)}`)
        }        
    }
    other = (message) => console.log(`${chalk.bold.bgCyan.whiteBright(` | MISCELLANEOUS` )}${this.getDate()}${chalk.bold.bgCyan.whiteBright(` `)} ${chalk.bold.cyan(message)}`)
}

module.exports = Logger