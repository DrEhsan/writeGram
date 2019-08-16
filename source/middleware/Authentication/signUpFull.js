module.exports = function (app){

	const validator = require('validator');
  const responder = require('./responser')
  const multer = require('multer');
  const crypto = require('crypto');
  const ensureApiKey = require('../ensureApiKey');
  const sharp = require('sharp');

  const storage = multer.diskStorage({
    destination: './public/uploads/avatars/original',
    filename: function (req, file, cb) {

      cb(null, Date.now() + '-' + file.originalname )
    }
  })

  const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 10000000
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

  const buildAvatars = async (filePath, fileName) => {
    let uploadFolder = "./public/uploads/avatars/";
    await sharp(filePath)
                         .resize(200)
                         .rotate()
                         .toFile(uploadFolder + 'thumb_200/thumb_200_' + fileName);

    await sharp(filePath)
                         .resize(400)
                         .rotate()
                         .toFile(uploadFolder + 'thumb_400/thumb_400_' + fileName);
  }

  const signUpFull = async (req, res, next) => {

    let promise = new Promise((resolve) =>{
      uploadAvatar (req, res, err => {

        if (err){
          resolve('AvatarNotUploaded')
        }
        else if (req.file == undefined){
          resolve('NoAvatarAttach')
        }
        else{
          resolve('ok')
        }
      })
    })

    const result =  (await Promise.all([promise]))[0];

    let {username, password} = req.body;

    if (!validator.isLength(username, {min: 2, max: 16})){
      return responder.sendErrorResponse(res, 'BadUserName');
    }

    if (!validator.isLength(password, {min: 2, max: 16})){
      return responder.sendErrorResponse(res, 'Badpassword');
    }

    var users = await app.service('users').find({ query : { username: username }});

    if (users.total >= 1){
      return responder.sendErrorResponse(res, 'DuplicatedUserName');
    }

    if (req.feathers.user.profile != null){
      return responder.sendErrorResponse(res, 'signUpDoneBefore');
    }

    let email = req.feathers.user.email.address;

    var patchData = {
      username: username,
      password: crypto.createHmac('sha256', username + email + "writeGram2019")
                      .update(username + "_" + password + "_" + email)
                      .digest('hex'),
      registerStatus: 1
    }

    if (result == "AvatarNotUploaded"){
      return responder.sendErrorResponse(res, 'AvatarNotUploaded');
    }

    var profile = {};

    if (result == 'ok'){
      let uploadFolder = "./public/uploads/avatars/";
      let filePath = uploadFolder + 'original/'+ req.file.filename;
      let { img_avatar_thumb_200, img_avatar_thumb_400 } = buildAvatars(filePath, req.file.filename);

      profile = {
        avatar : {
          img_avatar_orginal : req.file.filename,
          img_avatar_thumb_200: 'thumb_200_' + req.file.filename,
          img_avatar_thumb_400: 'thumb_400_' + req.file.filename
        }
      }

      let profileUser = await app.service('profile').create(profile);
      patchData.profile = profileUser._id;
    }

    var resPatch = await app.service('users').patch(req.feathers.user._id, patchData);

    return responder.SendResponse(res,
    {
      user_id : resPatch._id,
      profile : profile
    });
  }

  app.post("/auth/signUpFull", ensureApiKey, signUpFull);
}