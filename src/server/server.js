const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser');
const formData = require("express-form-data");

const start  = (options) => {
    return new Promise((resolve,reject) =>{
        if(!options.repo){
            reject(new Error('Il repository non è connesso'))
        }
        if(!options.port){
            reject(new Error('Non è disponibile nessuna porta'))
        }
        const app = express()

        // morgan gestisce il logging sul web server (formati dev, short ... )
        app.use(morgan('dev'))

        // helmet aggiunge header di sicurezza
        app.use(helmet())
        app.use(bodyParser.json()); 
        app.use(formData.parse({
            uploadDir: options.storagePath,
            autoClean: true
        }));
        app.use((err,req,res,next) => {
            reject(new Error('Something went wrong!, err:' + err))
            res.status(500).send('Something went wrong!')
        })
        
        const userApi = require('../api/users')(options)
        app.use('/user',userApi)
        app.use(express.static(options.storagePath));


        const server = app.listen(options.port, () => resolve(server))
    })
}


module.exports = Object.assign({},{start});