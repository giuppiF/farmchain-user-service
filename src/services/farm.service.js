const axios = require('axios')


const farmService = (options) => {

    const updateFarmUser = async (farmId,user) => {
        try{
            const url = `http://${options.host}:${options.port}/farm/${farmId}/user/${user._id}`
            let config = {
                headers: {
                "Content-Type" : "application/json",
                }
            }
            var response = await axios.put(url,user,config)
            return response;
        } catch (err){
            throw  Error(err.response.status)
        }
    }

    const deleteFarmUser = async (farmId,userId) => {
        try{
            const url = `http://${options.host}:${options.port}/farm/${farmId}/user/${userId}`
            let config = {
                headers: {
                "Content-Type" : "application/json",
                }
            }
            var response = await axios.delete(url,config)
            return response;
        } catch (err){
            throw  Error(err.response.status)
        }
    }
    


    return Object.create({
        updateFarmUser,
        deleteFarmUser
    })
}

const start = (options) => {
    return new Promise((resolve, reject) => {

      if (!options) {
        reject(new Error('options settings not supplied!'))
      }

      resolve(farmService(options))
    })
  }

module.exports = Object.assign({}, {start})