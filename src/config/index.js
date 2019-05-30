const {dbSettings, serverSettings, uploadServiceSettings, farmServiceSettings, authSettings,swaggerOptions} = require('./config')
const db = require('./mongo')
const authConfig = require('./auth')

module.exports = Object.assign({}, {dbSettings, serverSettings, db, uploadServiceSettings, farmServiceSettings,authSettings, authConfig,swaggerOptions})