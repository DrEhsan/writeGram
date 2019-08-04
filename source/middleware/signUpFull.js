module.exports = function (app){

	const validator = require('validator');
  const responder = require('./responser')
  const multer = require('multer');

  const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        // null as first argument means no error
        cb(null, Date.now() + '-' + file.originalname )
    }
  })

  const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function (req, file, cb) {
        sanitizeFile(file, cb);
    }
  }).single('avatar');

  function sanitizeFile(file, cb) {
    // Define the allowed extension
    let fileExts = ['png', 'jpg', 'jpeg']
    // Check allowed extensions
    let isAllowedExt = fileExts.includes(file.originalname.split('.')[1].toLowerCase());
    // Mime type must be an image
    let isAllowedMimeType = file.mimetype.startsWith("image/")
    if (isAllowedExt && isAllowedMimeType) {
        return cb(null, true) // no errors
    }
    else {
        // pass error msg to callback, which can be displaye in frontend
        cb('InvalidFileTypeMime')
    }
  }


	const signUpFull = async (req, res, next) =>{

		try{

      let {username, password} = req.body;

      if (!validator.isLength(username, {min: 2, max: 16})){
        return responder.sendErrorResponse(res, 'BadUserName');
      }

      if (!validator.isLength(password, {min: 2, max: 16})){
        return responder.sendErrorResponse(res, 'Badpassword');
      }

      var result = await app.service('users').find({ query : { username: username }});

      if (result.total > 1){
        return responder.sendErrorResponse(res, 'DuplicatedUserName');
      }

      var patchData = {
        username: username,
        password: crypto.createHmac('sha256', username + "writeGram2019")
                        .update(username + "_" + password)
                        .digest('hex')
      }

      if (req.file != undefined) {
        uploadAvatar(req, res, (err) => {
          if (err){
              return responder.sendErrorResponse(res, 'AvatarNotUploaded');
          }
          else{

              // To-Do : need to create profile

          }
        })
      }
		}
		catch(error){

		}
	}
}