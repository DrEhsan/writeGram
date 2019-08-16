// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const users = new Schema({

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

    followers: [{
      _id : false,
      follower : {type: Schema.Types.ObjectId, ref: "users"}
    }],

    following: [{
      _id : false,
      following : {type: Schema.Types.ObjectId, ref: "users"}
    }],

    devices: {type: Schema.Types.ObjectId, ref: "devices"},

    social : {type: Schema.Types.ObjectId, ref: "socials"}

  }, {
    timestamps: true
  });

  users.pre('validate', function(next) {

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

  return mongooseClient.model('users', users);
};
