'use strict'
const status = require('http-status')
const router = require('express').Router();
const path = require('path')
const passport = require('passport');

module.exports = (options) => {
    const {repo, storageService, storagePath} = options

           /**
   * @swagger
   * tags:
   *   name: User
   *   description: Users API list 
   */
   /**
   * @swagger
   * components:
   *   securitySchemes:
   *     bearerAuth:            # arbitrary name for the security scheme
   *       type: http
   *       scheme: bearer
   *       bearerFormat: JWT
   */



   /**
   * @swagger
   * /user:
   *   get:
   *     summary: Get All Users
   *     description: Lists all users
   *     tags: [User]
   *     produces:
   *       - application/json
   *     responses:
   *             200:
   *                 content:
   *                     application/json:
   *                        schema:
   *                            $ref: '#/components/schemas/User'
   */


    router.get('/', async (req,res) => {
        var users = await repo.getAllUsers();
        res.status(status.OK).json(users)
    })


    
          /**
   * @swagger
   * /user:
   *   post:
   *     summary: Create User
   *     description: API for user creation
   *     tags: [User]
   *     security:
   *        - bearerAuth: []
   *     produces:
   *       - application/json
   *     requestBody:
   *        content:
   *            multipart/form-data:
   *             schema:
   *               type: object
   *               $ref: '#/components/schemas/User'
   *     responses:
   *             200:
   *                 description: User object
   *                 content:
   *                     application/json:
   *                        schema:
   *                            $ref: '#/components/schemas/User'
   *             400:
   *                 description:  User not created for a validation error
   *             401:
   *                 description: Not authorized
   *             404:
   *                 description:  User not created for a generic database error
   *                            
   */
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
                var uploadfile = await storageService.uploadFileInS3(photo.path, filename, pathname )
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

              /**
   * @swagger
   * /user/login:
   *   post:
   *     summary: User Login
   *     description: API for user login
   *     tags: [User]
   *     security:
   *        - bearerAuth: []
   *     produces:
   *       - application/json
   *     requestBody:
   *        content:
   *            multipart/form-data:
   *             schema:
   *               type: object
   *               properties:
   *                 mail:
   *                   type: string
   *                   example: mail@mail.it
   *                 password:
   *                    type: string
   *                    format: password
   *                    
   *     responses:
   *             200:
   *                 description: User object
   *                 content:
   *                     application/json:
   *                        schema:
   *                            $ref: '#/components/schemas/User'
   *             400:
   *                 description:  User not logged in for a validation error
   *             401:
   *                 description: Not authorized
   *             404:
   *                 description:  User not logged in for a generic database error
   *                            
   */

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


       /**
   * @swagger
   * /user/{userId}:
   *   get:
   *     summary: Get User
   *     description: Get a single user
   *     security:
   *        - bearerAuth: []
   *     tags: [User]
   *     produces:
   *       - application/json
   *     parameters:
   *        - name: userId
   *          in: path
   *          required: true
   *          description: User id string
   *          schema:
   *             type : string
   *             format: byte
   *             minimum: 1
   *     responses:
   *             200:
   *                 content:
   *                     application/json:
   *                        schema:
   *                            $ref: '#/components/schemas/User'
   *             400:
   *                 description: Application error
   *             401:
   *                 description: Not authorized
   *             404:
   *                 description: User not found
   */
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

  /**
   * @swagger
   * /user/{userId}:
   *   put:
   *     summary: Update User
   *     description: API for user update
   *     tags: [User]
   *     security:
   *        - bearerAuth: []
   *     produces:
   *       - application/json
   *     parameters:
   *        - name: userId
   *          in: path
   *          required: true
   *          description: User id string
   *          schema:
   *             type : string
   *             format: byte
   *             minimum: 1
   *     requestBody:
   *        content:
   *            multipart/form-data:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   name: name
   *                   description: User's name
   *                   in: formData
   *                   required: true
   *                   type: string
   *                   example: Il bel prodotto
   *                 address:
   *                   name: address
   *                   description: User's address
   *                   in: formData
   *                   required: true
   *                   type: string
   *                   example: Via Roma 10
   *                 photo:
   *                   name: photo
   *                   description: User's photo
   *                   in: formData
   *                   required: false
   *                   type: string
   *                 mail:
   *                   name: mail
   *                   description: User's Mail
   *                   in: formData
   *                   required: false
   *                   type: string
   *                   example: mail@mail.it
   *                 phone:
   *                   name: phone
   *                   description: User's phone
   *                   in: formData
   *                   required: false
   *                   type: string
   *                   example: 234234
   *               required:
   *                    - name
   *                    - address
   *                    - mail
   *                    - phone
   *            application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   name: name
   *                   description: User's name
   *                   in: formData
   *                   required: true
   *                   type: string
   *                   example: Il bel prodotto
   *                 address:
   *                   name: address
   *                   description: User's address
   *                   in: formData
   *                   required: true
   *                   type: string
   *                   example: Via Roma 10
   *                 photo:
   *                   name: photo
   *                   description: User's photo
   *                   in: formData
   *                   required: false
   *                   type: string
   *                   format: binary
   *                 mail:
   *                   name: mail
   *                   description: User's Mail
   *                   in: formData
   *                   required: false
   *                   type: string
   *                   example: mail@mail.it
   *                 phone:
   *                   name: phone
   *                   description: User's phone
   *                   in: formData
   *                   required: false
   *                   type: string
   *                   example: 234234
   *               required:
   *                    - name
   *                    - address
   *                    - mail
   *                    - phone
   *     responses:
   *             200:
   *                 description: User created object
   *                 content:
   *                     application/json:
   *                        schema:
   *                            $ref: '#/components/schemas/User'
   *             400:
   *                 description: User not updated for a validation error
   *             401:
   *                 description: Not authorized
   *             404:
   *                 description: User not updated for a generic database error
   *                            
   */
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
                var user = await repo.getUser(req.params.userID)
                if(user.photo)
                    var deleteFile = await storageService.deleteFileFromS3(user.photo)            

                var photo = req.files.photo    
                var filename = Date.now()+ '-' + photo.originalFilename
                
                var uploadfile = await storageService.uploadFileInS3(photo.path, filename, pathname )
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
   /**
   * @swagger
   * /user/{userId}:
   *   delete:
   *     summary: Delete User
   *     description: Delete a single user
   *     security:
   *        - bearerAuth: []
   *     tags: [User]
   *     produces:
   *       - application/json
   *     parameters:
   *        - name: userId
   *          in: path
   *          required: true
   *          description: User id string
   *          schema:
   *             type : string
   *             format: byte
   *             minimum: 1
   *     responses:
   *             200:
   *                 content:
   *                     application/json:
   *                        schema:
   *                            $ref: '#/components/schemas/User'
   *             400:
   *                 description: Application error
   *             401:
   *                 description: Not authorized
   *             404:
   *                 description: User not found
   */
    router.delete('/:userID', async (req,res) => {
        try{

            var user = await repo.getUser(req.params.userID)
            if(user.photo)
                var deleteFile = await storageService.deleteFileFromS3(user.photo)  

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