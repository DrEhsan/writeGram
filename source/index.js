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

        let result = (await app.service('dialogs').Model.sendMessage(socket.user, data.inputPeer, data));

        if (result.error){
          console.log(result.errordata)
        }
        else{
          socket.join('dialog_' + result.dialog._id);
          socket.to('user_'+data.inputPeer).emit('newMessageUpdate', {sender : res.username, body : data.body});
          socket.emit('sendMessage', data.body);
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


