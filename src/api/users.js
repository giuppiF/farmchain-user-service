'use strict'
const status = require('http-status')
const router = require('express').Router();
const path = require('path')
const passport = require('passport');

module.exports = (options) => {
    const {repo, storageService, storagePath} = options

    router.get('/', async (req,res) => {
        var users = await repo.getAllUsers();
        res.status(status.OK).json(users)
    })

    //POST new user route (optional, everyone has access)
    router.post('/', options.auth.optional, async (req, res, next) => {

    
        const userData = {
            name: req.body.name,
            //address: req.body.address,
            mail: req.body.mail,
            //phone: req.body.phone,
            //photo: req.body.photo,
            password: req.body.password,
            farm: req.body.farm
        }

        try{
            var userCreated = await repo.createUser(userData)
            userData._id = userCreated._id
            if(req.files.photo){
                var photo = req.files.photo
    
                var filename = Date.now()+ '-' + photo.originalFilename
                var pathname = path.join( req.originalUrl, userCreated._id.toString())
                var completePath = path.join(storagePath,pathname)
                var uploadfile = await storageService.saveToDir(photo.path, filename, completePath )
                userCreated.photo = path.join(pathname, filename)
                userCreated.save()
            }

            userCreated ?
                res.status(status.OK).json({ 
                    user: userCreated.toAuthJSON(),
                    farm: userCreated.farm
                })
            :
                res.status(404).send()
        } catch (err) {
            res.status(400).send({'msg': err.message})
        }
    

    });

    router.post('/login', options.auth.optional, (req, res, next) => {


        if(!req.body.mail) {
          return res.status(422).json({
            errors: {
              email: 'is required',
            },
          });
        }
      
        if(!req.body.password) {
          return res.status(422).json({
            errors: {
              password: 'is required',
            },
          });
        }
      
        return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
          if(err) {
            return next(err);
          }
      
          if(passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();
            console.log(passportUser)
            return res.json({ 
                user: user.toAuthJSON(),
                farm: passportUser.farm
             });
          }
      
          return res.status(400).send(info);
        })(req, res, next);
      });


      //GET current route (required, only authenticated users have access)
        router.get('/current', options.auth.required,  async (req, res, next) => {
            try{
                const { user: { id } } = req;
                var user = await repo.getUser(id)
                user ?
                    res.status(status.OK).json(user)
                :
                    res.status(404).send()
            } catch (err) {
                res.status(400).send({'msg': err.message})
            }

        });

  
    router.get('/:userID', options.auth.required, options.auth.isCurrentUser, async (req,res) => {
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

    router.put('/:userID', options.auth.required, options.auth.isCurrentUser, async (req,res) => {
        const userData = {
            name: req.body.name,
            address: req.body.address,
            mail: req.body.mail,
            phone: req.body.phone
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