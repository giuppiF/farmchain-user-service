const mongoose = require('mongoose');

const getMongoURL = (options) => {
    const url = options.server
    const dbName = options.db
    return `mongodb://${url}/${dbName}`
}

const connect = (options, mediator) => {
    mediator.once('boot.ready', () => {
        mongoose.connect(
           getMongoURL(options),
           {
               "user": options.user,
               "pass": options.password
        })
        
        // Get Mongoose to use the global promise library
        mongoose.Promise = global.Promise;
         
        var db = mongoose.connection;

        
        //Bind connection to error event (to get notification of connection errors)
        db.on('error', (err) => {mediator.emit('db.error',err)});
        
        mediator.emit('db.ready',db)

    })
}
  
module.exports = Object.assign({}, {connect})
  
