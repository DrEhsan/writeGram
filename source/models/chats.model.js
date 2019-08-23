// chats-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const chats = new Schema({
    memebers : [{ type: Schema.Types.ObjectId, ref: 'users', required: true, index: true }],

    // chatType : 0 - simple chat btw two people, 1 - chats more than two people
    chatType : {type: Number, required: true, index: true, default: 0},
    isGroup : {type: Boolean, required: true, index: true, default: false},

    groupData : {
      creator: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
      admins : [{
        _id:false,
        user: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
        privilages: {type: Number, required: true, index: true, default: 0},
      }],
      title: {type: String, index: true, default: 'Chat Title'},
      chatPhoto : {type: String},
    },



  }, {
    timestamps: true
  });

  return mongooseClient.model('chats', chats);
};
