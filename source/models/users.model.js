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

        profile: {type: Schema.Types.ObjectId, ref: "profiles"},

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
