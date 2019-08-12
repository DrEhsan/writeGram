// profile-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const profile = new Schema({
    avatar : {
      img_avatar_orginal : {type : String},
      img_avatar_thumb_200: {type: String},
      img_avatar_thumb_400: {type: String}
    },

    nickname : {type: String}

  }, {
    timestamps: true
  });

  return mongooseClient.model('profile', profile);
};
