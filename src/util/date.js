const dateFormat = require('dateformat')

class Time {
    logFormat() {
        const raw = new Date();
        return `${raw.getDate()}-${raw.getMonth() + 1}-${raw.getFullYear()} ${raw.getHours()}:${raw.getMinutes()}:${raw.getSeconds()}.${`${raw.getMilliseconds()}`.length < 3 ? `${raw.getMilliseconds()}0` : raw.getMilliseconds()}`;
    }
    fullFormat() {
        const raw = new Date();
        return dateFormat(raw, '')
    }
}

module.exports = Time;