// messages-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const messages = new Schema({
    sender : { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    dialog : { type: Schema.Types.ObjectId, ref: 'dialogs', required: true, index: true },
    body:{type: String},

    isForwarded : {type: Boolean, index: true, default: false},
    forwardMessage : { type: Schema.Types.ObjectId, ref: 'messages', index: true },

    messageType :{type: Number, required: true, index: true, default: 0},

    photoData : {
      photoSmall : {type: String},
      photoMain : {type: String},
      caption : {type: String, index: true}
    }

  }, {
    timestamps: true
  });

  return mongooseClient.model('messages', messages);
};
