'use strict'
const {EventEmitter} = require('events')
const server = require('./server/server')
const repository = require('./repository/repository')
const config = require('./config')
const mediator = new EventEmitter()
const services = require('./services/')


mediator.on('db.ready', async (db) => {
    console.error('Database started!!')
    var repo = await repository.connect(db);

    var storageService = await services.storageService.start({
        path: config.uploadServiceSettings.path
    })

    var farmService = await services.farmService.start({
        host: config.farmServiceSettings.host,
        port: config.farmServiceSettings.port
    })

    var app = await server.start({
        port:  config.serverSettings.port,
        repo: repo,
        storagePath: config.uploadServiceSettings.path,
        storageService: storageService,
        farmService: farmService
    })

    
    app.on('close', () => {
        repo.disconnect()
      })
})

mediator.on('db.error', (err) => {
    console.error('Errore nello start del db '+err)
  })


config.db.connect(config.dbSettings, mediator)


mediator.emit('boot.ready');
