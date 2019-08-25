/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

//process.on('unhandledRejection', (reason, p) =>
  //logger.error('Unhandled Rejection at: Promise ', p, reason)
//);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);


let io = app.io;

io.on('connection', async socket => {

  if (socket.handshake.query == undefined){
    return socket.disconnect();
  }

  /*
  if (socket.handshake.headers.apikey == undefined){
    return socket.disconnect();
  }*/


  let apikey = socket.handshake.query.apikey;

  let res = await app.service('users').Model
    .findOne({ apiKey: apikey })
    .populate({
      path : 'dialogs',
      select: { '_id': 1},
      populate : {
        path : 'members' ,
        select: { '_id': 1, 'username' : 1, 'profile': 1},
        populate : {
          path : 'profile',
          select : { 'avatar' : 1}
        }
      }
    })
    /*
    .populate({
      path : 'chats',
      select: { '_id': 1, 'title' : 1, 'cover' : 1}
    })*/
    //.sort('updatedAt', -1)
    .exec();

    //console.log('res' + res)
  if (res == null){

    return socket.disconnect();
  }
  else{

    socket.user = res;

    socket.join('user_'+res._id);

    socket.emit('connected', { status: true, payload: { connected : true } });

    socket.on('sendMessage', async data => {

      if (data.peer == 'dialog'){

        let conditions_find = {
          "$or": [
            { members: [data.inputPeer, socket.user._id] },
            { members: [socket.user._id, data.inputPeer] }
          ]
        }

        let conditions = {
          members: [data.inputPeer, socket.user._id]
        }

        let ehsan = await app.service('dialogs').Model
        .findOne(conditions_find).exec();

        console.log(ehsan)

        if (ehsan == null){

          let model = app.service('dialogs').Model;
          let dialogModel = new model(conditions)
          let promise = new Promise(resolve => {
            dialogModel.save().then(saved => {

              let msgConditions = {
                sender: socket.user._id,
                messageType: data.messageType == 'Text' ? 0 : 1,
                isForwarded: data.isForwarded,
                body: data.body
              }

              let msgModel = app.service('messages').Model;
              let messageModel = new msgModel(msgConditions)


              messageModel.save().then(newSaved => {
                resolve({message : newSaved, dialog : saved})
              }).catch(error => {
                resolve({error : true, errordata : error})
              })

            }).catch(error => {
              resolve({error : true, errordata : error})
            })
          })

          let result = (await Promise.all([promise]))[0];

          if (result.error){
            console.log(result.errordata)
          }
          else{
            socket.join('dialog_' + result.dialog._id);
            socket.to('user_'+data.inputPeer).emit('newMessageUpdate', {sender : res.username, body : data.body});
            socket.emit('sendMessage', data.body);
          }
        }
      }
    })

    /*
    let dialogsArr = res.dialogs;

    var dialogsCap = [];

    let Promise = Promise.resolve

    dialogsArr.forEach(dialog => {

      cntx.app.service('users').Model

    });*/



  }



});


