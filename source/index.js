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

    // every user has his own channel after authentication
    socket.join('user_'+socket.user._id);

    // lets fire client that it has been connected successfully
    socket.emit('connected', { status: true, payload: { connected : true } });


    // subscribe on dialog rooms


    // this event handles message sending from clients
    socket.on('sendMessage', async data => {

      // handling dialog type chats
      if (data.peer == 'dialog'){

        let dialogsModel = app.service('dialogs').Model

        let result = (await dialogsModel.sendMessage(socket.user, data.inputPeer, data));

        if (result.error){

          // Todo : send error message to client that error happend!
          console.log(result.errordata)
        }
        else{

          let dialogRoom = 'dialog_' + result.dialog._id;

          var socksInRoom = io.sockets.adapter.rooms[dialogRoom];

          if (socksInRoom != undefined){
            if (socksInRoom.sockets[socket.id]){
              socket.to(dialogRoom).emit('newMessageUpdate', {sender : socket.user.username, body : data.body});
              socket.emit('sendMessage', data.body);
            }
          }
          else{
            // client joins the dialog room
            socket.join(dialogRoom);

            // lets say client that new message incoming
            socket.to('user_' + data.inputPeer).emit('newMessageUpdate', {sender : socket.user.username, body : data.body, dialog: result.dialog._id});

            // reply sender the result
            socket.emit('sendMessage', data.body);

            dialogsModel.saveDialogForUser([socket.user._id, data.inputPeer], result.dialog._id)
          }
        }
      }
    })


    socket.on('gotMessage', data => {

      /**
       * To Do :
       * 1. send notify to peer user that message has read
       * 2. set read flag on message model
       * 3. standard check before joining room
       * */


      let dialogRoom = 'dialog_' + data.dialog;
      socket.join(dialogRoom);

      var socksInRoom = io.sockets.adapter.rooms[dialogRoom];

      if (socksInRoom != undefined){
        if (socksInRoom.sockets[socket.id]){

        }
      }
    })
  }
});


