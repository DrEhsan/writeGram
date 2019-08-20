// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const usersSchema = new Schema({

    email :
    {
      address : {	type :String, index:{ unique: true, spare:	true}},
      isConfirmed: { type: Boolean, default: false },
      token: { type: String, default: ""}
    },

    username :	{	type:String, index:{	unique: true, spare: true }},

    password: 	{	type:String },

    apiKey: { type:String, index:{	unique: true, spare: true }},

    // 0 - just email submited, 1 - username and has submited, 2 - email confirmed
    registerStatus : { type: Number, default: 0},

    profile: {type: Schema.Types.ObjectId, ref: "profile"},

    followers: [{type: Schema.Types.ObjectId, ref: "users", unique: true}],

    following: [{type: Schema.Types.ObjectId, ref: "users", unique: true}],

    devices: {type: Schema.Types.ObjectId, ref: "devices"},

    social : {type: Schema.Types.ObjectId, ref: "socials"}

  }, {
    timestamps: true,
    versionKey: false
  });

  usersSchema.pre('validate', function(next) {

    var crypto = require("crypto");

    if (this.isNew)
    {
      this.apiKey = crypto.createHmac('sha256', this.email + "writeGram")
                               .update(new Date().toString()+"_" +this.email)
                               .digest('hex');

      this.email.token = crypto.createHmac('sha256', this.email + "writeGramEmailToken")
                                .update(new Date().toString()+"_" +this.email)
                                .digest('hex');
    }

    next();
  });

  /**
   * add all follower and following after accepting for both follower and following
   * @function    userModel.addFollow
   * @param       {ObjectId}  follower      - the _id of user who asked to follow
   * @param       {ObjectId}  tobeFollow      - the _id of user who asked to be follow
   */
  usersSchema.statics.addFollow = function (follower, tobeFollow){
    usersModel.findOneAndUpdate({ _id: tobeFollow}, { $push: { followers: follower  } }).exec()
    usersModel.findOneAndUpdate({ _id: follower}, { $push: { following: tobeFollow  } }).exec()
  }

  usersSchema.statics.removeFollow = function (requester, requested){
    usersModel.findOneAndUpdate({ _id: requester}, { $pull: { followers: requested  } }).exec()
    usersModel.findOneAndUpdate({ _id: requested}, { $pull: { following: requester  } }).exec()
  }

  var usersModel = mongooseClient.model('users', usersSchema);

  return usersModel;
};
