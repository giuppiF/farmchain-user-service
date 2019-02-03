
const fs = require('fs')
var mkdirp = require('mkdirp');
var path = require('path');

const storageService = (options) => {

  const saveToDir =  async (rawfile, filename, pathname) => {

    try{
      if (!fs.existsSync(pathname)) {
        await mkdirp.sync(pathname)
      }
      var file = path.join(pathname,filename)
      await moveFile(rawfile,file )
      
      return file

    } catch (err) {
      throw  Error(err)
    }
  }

  const deleteFile =  async (filename, pathname) => {

    try{
      var file = path.join(pathname,filename)
      await fs.unlinkSync(file)
      return true

    } catch (err) {
      throw  Error(err)
    }
  }

  const deleteDir =  async (pathname) => {

    try{
      await fs.rmdirSync(pathname);
      return true

    } catch (err) {
      throw  Error(err)
    }
  }



  return Object.create({
	saveToDir,
  deleteFile,
  deleteDir
  })
}

function moveFile(imagePath,saveTo) {
  return new Promise(function (resolve, reject) {
      fs.rename(imagePath, saveTo, async  (err)=>{
          if(err) reject(err)
          else
          resolve()
      })
  });
}

const start = (options) => {
  return new Promise((resolve, reject) => {

    if (!options) {
      reject(new Error('options settings not supplied!'))
    }

    resolve(storageService(options))
  })
}

module.exports = Object.assign({}, {start})