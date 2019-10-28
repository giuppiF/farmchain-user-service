const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose);
const Joi = require('joi');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const  {authSettings} = require('../config')
var SALT_WORK_FACTOR = 10;
 /**
   * @swagger
   * components:
   *  schemas:
   *   User:
   *     properties:
   *       name:
   *         name: name
   *         description: User name
   *         in: formData
   *         required: true
   *         type: string
   *       address:
   *         name: address
   *         description: User address
   *         in: formData
   *         required: true
   *         type: string
   *       mail:
   *         name: mail
   *         description: User mail
   *         in: formData
   *         required: true
   *         type: string
   *       phone:
   *         name: phone
   *         description: User phone
   *         in: formData
   *         required: true
   *         type: string
   *       photo:
   *         name: photo
   *         description: User photo
   *         in: formData
   *         required: true
   *         type: string
   *         format: binary
   *       password:
   *         name: password
   *         description: User password
   *         in: formData
   *         required: true
   *         type: string
   *         format: password
   *       farm:
   *         name: farm
   *         description: User farm id
   *         in: formData
   *         required: true
   *         type: string
   *         example: 2312312323
   *            
   */

var joiUserSchema = Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string(),
    mail: Joi.string().email().required(),
    phone: Joi.string(),
    photo: Joi.string(),
    password: Joi.string(),
    farm: Joi.string(),
});

var mongooseUserSchema = new Mongoose.Schema(Joigoose.convert(joiUserSchema));

mongooseUserSchema.pre('save', async function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password'))  return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });

});

mongooseUserSchema.pre('save', async function(next) {
    var user = this;

    
    if(!user.isModified('mail')) return next();
    let userMail = await User.find({mail : user.mail}, function (err, docs) {
        if (docs.length){
            console.log('user exists: ',user.mail);
            next(new Error("User exists!"));
        }
    });
});

mongooseUserSchema.methods.comparePassword = async function(candidatePassword) {
    
    const match = await bcrypt.compare(candidatePassword, this.password);
    return match
};
  
mongooseUserSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        mail: this.mail,
        id: this._id,
        farm: this.farm,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, authSettings.JWTSecret);
}
  
mongooseUserSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        mail: this.mail,
        token: this.generateJWT(),
    };
};

const User = Mongoose.model('User', mongooseUserSchema);
module.exports = Mongoose.model('User', mongooseUserSchema);