module.exports = function (app){

	const validator = require('validator');
  const responder = require('./responser')
  const multer = require('multer');
  const crypto = require('crypto');
  const ensureApiKey = require('../ensureApiKey');
  const sharp = require('sharp');

  const multipartMiddleware = multer();

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
    fileFilter: async function (req, file, cb) {

      let { username , password} = req.body;

      if (!validator.isLength(username, {min: 2, max: 20})){
        cb('BadUserName');
      }

      else if (!validator.isLength(password, {min: 5, max: 16})){
        cb('Badpassword');
      }
      else{
        var users = await app.service('users').find({ query : { username: username }});
        if (users.total >= 1){
          cb('DuplicatedUserName');
        }

        else if (req.feathers.user.profile != null){
          cb('signUpDoneBefore');
        }
        else{
          sanitizeFile(file, cb);
        }
      }
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

  const fethBody = async (req, res, next) =>{
    console.log(req.body)
  }

  const signUpFull = async (req, res, next) => {

    try{

      let promise = new Promise((resolve) =>{
        uploadAvatar (req, res, err => {

          if (err){
            resolve(err)
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

      if (result != "ok"){
        return responder.sendErrorResponse(res, result);
      }


      let { username , password} = req.body;
      let email = req.feathers.user.email.address;

      var patchData = {
        username: username,
        password: crypto.createHmac('sha256', username + email + "writeGram2019")
                        .update(username + "_" + password + "_" + email)
                        .digest('hex'),
        registerStatus: 1
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
    catch(error){
      return responder.sendErrorResponse(res, "CatchError", error);
    }
  }

  app.post("/auth/signUpFull", ensureApiKey, signUpFull);
}