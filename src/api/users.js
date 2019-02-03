'use strict'
const status = require('http-status')
const router = require('express').Router();
const path = require('path')

module.exports = (options) => {
    const {repo, storageService, storagePath} = options

    router.get('/', async (req,res) => {
        var users = await repo.getAllUsers();
        res.status(status.OK).json(users)
    })

    router.post('/', async (req,res) => {
        const userData = {
            name: req.body.name,
            address: req.body.address,
            mail: req.body.mail,
            phone: req.body.phone,
            photo: req.body.photo
        }

        try{
            var user = await repo.createUser(userData)
            userData._id = user._id
            if(req.files.photo){
                var photo = req.files.photo
    
                var filename = Date.now()+ '-' + photo.originalFilename
                var pathname = path.join( req.originalUrl, user._id.toString())
                var completePath = path.join(storagePath,pathname)
                var uploadfile = await storageService.saveToDir(photo.path, filename, completePath )
                user.photo = path.join(pathname, filename)
                user.save()
            }

            user ?
                res.status(status.OK).json(user)
            :
                res.status(404).send()
        } catch (err) {
            res.status(400).send({'msg': err.message})
        }
    })

    router.get('/:userID', async (req,res) => {
        try{
            var user = await repo.getUser(req.params.userID)
            user ?
                res.status(status.OK).json(user)
            :
                res.status(404).send()
        } catch (err) {
            res.status(400).send({'msg': err.message})
        }
    })

    router.put('/:userID', async (req,res) => {
        const userData = {
            name: req.body.name,
            address: req.body.address,
            mail: req.body.mail,
            phone: req.body.phone,
            photo: req.body.photo
        }
        try{


            if(req.files.photo){
                
                var pathname = req.originalUrl
                var completePathname = path.join(storagePath, pathname)
                var user = await repo.getUser(req.params.userID)
                if(user.photo)
                    var deleteFile = await storageService.deleteFile(user.photo,storagePath)            

                var photo = req.files.photo    
                var filename = Date.now()+ '-' + photo.originalFilename
                
                var uploadfile = await storageService.saveToDir(photo.path, filename, completePathname )
                userData.photo = path.join(pathname,filename)
                

            }else{
                userData.photo=req.body.photo
            }
            var user = await repo.updateUser(req.params.userID,userData)
            user ?
                res.status(status.OK).json(user)
            :
                res.status(404).send()
        } catch (err) {
            res.status(400).send({'msg': err.message})
        }
    })

    router.delete('/:userID', async (req,res) => {
        try{

            var pathname = path.join(storagePath, req.originalUrl)
            var user = await repo.getUser(req.params.userID)
            if(user.photo)
                var deleteFile = await storageService.deleteFile(user.photo,storagePath)  
                var deleteDir = await storageService.deleteDir(pathname)  

            user = await repo.deleteUser(req.params.userID)
            user ?
                res.status(status.OK).json(user)
            :
                res.status(404).send()
        } catch (err) {
            res.status(400).send({'msg': err.message})
        }
    })

    
    return router;
}