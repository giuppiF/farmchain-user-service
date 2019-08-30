
const fs = require('fs')
var path = require('path');
var mime = require('mime')
const AWS = require('aws-sdk');

const storageService = (options) => {

  const uploadFileInS3 = (rawfile, filename, pathname) =>  {
    return new Promise(function (resolve, reject) {
      try{ 
        //configuring the AWS environment
        s3 = new AWS.S3();
        params = {
          Bucket: options.awsSettings.s3BucketName,
          Body: fs.createReadStream(rawfile),
          Key:  path.join(pathname.replace(/^\/+/g, ''),filename),
          ContentType: mime.getType(rawfile),
          ACL: 'public-read'
        }
        s3.upload(params, function (err, data) {
          //handle error
          if (err) {
            reject(err)
          }
          //success
          if (data) {
              console.log("Uploaded in:", data.Location);
              resolve(data.Location)

          }
        });
      } catch (err) {
        throw  Error(err)
      }
    });
  }
  
  const deleteFileFromS3 = ( filename) =>  {
    return new Promise(function (resolve, reject) {
      try{ 
        //configuring the AWS environment
        s3 = new AWS.S3();
       
        params = {
          Bucket: options.awsSettings.s3BucketName,
          Key:  filename.replace(/^\/+/g, '')
        }
        s3.deleteObject(params, function(err, data) {
          if (err){
            reject(err);  // error
          } 
          else
          {
            resolve()                // deleted
          }     
        });

      

      } catch (err) {
        throw  Error(err)
      }
    });
  }




  return Object.create({
    uploadFileInS3,
    deleteFileFromS3
  })
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
