// chats-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const chats = new Schema({

    members : [{ type: Schema.Types.ObjectId, ref: 'users', required: true, index: true, unique: true }],

    chat_title : {type: String, required: true, index: true},
    chat_photo: {type: String, index: true},

    creator: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },

    admins: [{
      _id: false,
      permission: {type: Number, required: true, default: 0},
      admin : { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true, unique: true }
    }],

    members_count: {type: Number, required: true, default: 0},

  }, {
    timestamps: true
  });

  return mongooseClient.model('chats', chats);
};
