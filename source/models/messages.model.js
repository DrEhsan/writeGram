// messages-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const messages = new Schema({

    // @user that sent this message
    sender : { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },

    // @dialog that this message belongs to
    dialog : { type: Schema.Types.ObjectId, ref: 'dialogs', required: true, index: true },

    // forwarded @message id
    forward_from : { type: Schema.Types.ObjectId, ref: 'messages', index: true },

    // reply to @message id
    reply_to: { type: Schema.Types.ObjectId, ref: 'messages', index: true },

    // the receiption has got and read the message
    read : {type: Boolean, index: true, default: false},

    /**
     * delete flag:
     * 0. Not deleted yet!
     * 1. deleted by sender for himself
     * 2. deleted by sender for every one
     * 3. deleted by reciver for himself
     */

    deleted :{type: Number, required: true, index: true, default: 0},

    /**
     * message type flag:
     * 0. Text Body!
     * 1. Photo (version 2)
     * 2. Video (version 3)
     * 3. File (version 4)
     * 4. Location (version 5)
     */

    messageType :{type: Number, required: true, index: true, default: 0},


    // body for text message
    body:{type: String},

  }, {
    timestamps: true
  });

  return mongooseClient.model('messages', messages);
};
