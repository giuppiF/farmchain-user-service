const Mongoose = require('mongoose');
const Joigoose = require('joigoose')(Mongoose);
const Joi = require('joi');

var joiUserSchema = Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    mail: Joi.string().email().required(),
    phone: Joi.string().required(),
    photo: Joi.string()
});

var mongooseUserSchema = new Mongoose.Schema(Joigoose.convert(joiUserSchema));


module.exports = Mongoose.model('User', mongooseUserSchema);