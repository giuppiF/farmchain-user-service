'use strict'
const User = require('../models/user.model')
require('../config/passport');
const repository = () => {
    
  const getAllUsers = async () => {
    try {
      let users = await User.find();
      return users
    } catch (error) {
      throw Error(error);
    }
  }

  const getUser = async (id) =>
  {
    try {
      let user = await User.findById(id);
      return user
    } catch (error){
      throw Error(error);
    }
  }

  const createUser = async (payload) => {
    try{
      let user = await new User(payload)
      await user.save()   
      return user
    } catch (error) {
      throw Error(error)
    }
  }
    
  const updateUser = async (id, userBody) => {
    try{
      let user = await User.findByIdAndUpdate(id,userBody,{new: true,runValidators: true})
      return user
    } catch (error) {
      throw Error(error)
    }
  }

  const deleteUser = async (id) => {
    try{
      let user = await User.findByIdAndRemove(id)
      return user
    } catch (error) {
      throw Error(error)
    }
  }

  


  return Object.create({
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  })
}

const connect = (connection) => {
  return new Promise((resolve, reject) => {
    if (!connection) {
      reject(new Error('connection db not supplied!'))
    }
    
    resolve(repository(connection))
  })
}

module.exports = Object.assign({}, {connect})
