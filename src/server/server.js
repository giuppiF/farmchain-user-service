const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser');
const formData = require("express-form-data");
const cors = require("cors")

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const start  = (options) => {
    return new Promise((resolve,reject) =>{
        if(!options.repo){
            reject(new Error('Il repository non è connesso'))
        }
        if(!options.port){
            reject(new Error('Non è disponibile nessuna porta'))
        }
        const app = express()

        
        // Swagger API docs implementation
        const swaggerSpec = swaggerJsdoc(options.swaggerOptions);
        app.use('/user/api-docs.json', (req,res)=>{
            res.send(swaggerSpec)
        });
        app.use('/user/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


        // morgan gestisce il logging sul web server (formati dev, short ... )
        app.use(morgan('dev'))

        // helmet aggiunge header di sicurezza
        app.use(helmet())
        app.use(bodyParser.json()); 
	app.use(cors())
        app.use(formData.parse({
            uploadDir: options.storagePath,
            autoClean: true
        }));

        //app.use(session({ secret: 'passport-farmchain', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));


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
