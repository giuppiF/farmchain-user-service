const jwt = require('express-jwt');

const authentication = (secret) => { 
  const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;

    if(authorization && authorization.split(' ')[0] === 'Bearer') {
      return authorization.split(' ')[1];
    }
    return null;
  };

  var  isCurrentUser = (req,res,next) => {
    var currentUser = req.user.id
    console.log(req.user)
    currentUser == req.params.userID ?
      next()
    :
      res.status(403).send()

  }

  return {
    required: jwt({
      secret: secret,
      userProperty: 'user',
      getToken: getTokenFromHeaders,
    }),
    optional: jwt({
      secret: secret,
      userProperty: 'user',
      getToken: getTokenFromHeaders,
      credentialsRequired: false,
    }),
    isCurrentUser
  };

}
const start = (secret) => {
  return new Promise((resolve, reject) => {
    if (!secret) {
      reject(new Error('secret not supplied!'))
    }
    
    resolve(authentication(secret))
  })
}

module.exports = Object.assign({}, {start})

