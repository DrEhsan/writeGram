const { iff, discard, isProvider } = require('feathers-hooks-common')

const getMessages = cntx => {

  if (cntx.params.query.dialog == undefined){
    cntx.result = { status : false, error: { innerCode: 26, reason: "MethodNotAllowed"} }
    return cntx;
  }

  let query = {
    dialog : cntx.params.query.dialog,
    read: false,
    deleted: 0,
    $limit : cntx.params.query.$limit != undefined ? cntx.params.query.$limit : 10,
    $skip : cntx.params.query.$skip != undefined ? cntx.params.query.$skip : 0,
    $sort: {
      createdAt: -1
    },
    $populate : ['sender']
  }

  cntx.params.query = query;
  return cntx;
}

const buildGetMessagesPacket = cntx => {

  var logged_in_user = cntx.params.user._id;



  let messages = cntx.result.data;

  let _messageHolder = [];

  messages.forEach(message => {

    let newMessage = {
      message_id: message._id,
      message_type: message.messageType,
      sender_is_me : (logged_in_user.equals(message.sender._id)) ? true : false,
      sender: {
        sender_id : message.sender._id,
        sender_username: message.sender.username
      },
    }

    if (message.reply_to != undefined){
      newMessage.reply_to = message.reply_to
    }

    if (message.reply_to != undefined){
      newMessage.forward_from = message.forward_from
    }

    _messageHolder.push(newMessage)
  });


  let result = {
    status: true,
    payload: {
      messagesTotal : cntx.result.total,
      messagesSkip  : cntx.result.skip,
      messagesCount : cntx.result.data.length,
      messages : _messageHolder
    }
  }

  cntx.result = result;
  return cntx;

}

module.exports = {
  before: {
    all: [],
    find: [getMessages],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [buildGetMessagesPacket

    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
