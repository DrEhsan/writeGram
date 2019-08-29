// dialogs-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const dialogsSchema = new Schema({
    members : [{ type: Schema.Types.ObjectId, ref: 'users', required: true, index: true }],

  }, {
    timestamps: true
  });


  dialogsSchema.statics.saveDialogForUser = function (members, dialog){

    let promises = [];

    let userModel = app.service('users').Model;
    members.forEach(member => {
      let promise = new Promise(resolve =>{

        let condition = { _id : member};
        let update = {
          $push: { dialogs: dialog }
        }

        userModel.findOneAndUpdate(condition, update).then(updated => {
          resolve(updated)
        }).catch(error => {
          resolve(error)
        })
      })

      promises.push(promise)
    });

    return promises;
  }

  dialogsSchema.statics.sendMessage = function (sender, receiver, data) {

    let conditions_find = {
      "$or": [
        { members: [receiver, sender] },
        { members: [sender, receiver] }
      ]
    }

    return new Promise(resolve => {

      // lets find the dialog
      dialogsModel.findOne(conditions_find).then(finded => {

        // if it is null then lets create a new dialog for members
        if (finded == null){
          let conditions = {
            members: [receiver, sender]
          }

          let _dialogModel = new dialogsModel(conditions);

          _dialogModel.save().then(saved => {

            let msgConditions = {
              sender: sender,
              messageType: data.messageType == 'Text' ? 0 : 1,
              isForwarded: data.isForwarded,
              body: data.body,
              dialog: saved._id
            }

            let msgModel = app.service('messages').Model;
            let messageModel = new msgModel(msgConditions);

            messageModel.save().then(newSaved => {
              resolve({message : newSaved, dialog : saved})
            }).catch(error => {
              resolve({ error: true, code: 26, name: 'ErrorOnDb'})
            })
          }).catch(error =>{
            resolve({ error: true, code: 26, name: 'ErrorOnDb'})
          })
        }
        else
        {
          // dialog exists and then lets save new message for it
          let msgConditions = {
            sender: sender,
            messageType: data.messageType == 'Text' ? 0 : 1,
            isForwarded: data.isForwarded,
            body: data.body,
            dialog: finded._id
          }

          let msgModel = app.service('messages').Model;
          let messageModel = new msgModel(msgConditions);

          messageModel.save().then(newSaved => {
            resolve({message : newSaved, dialog : finded, isOld : true})
          }).catch(error => {
            resolve({ error: true, code: 26, name: 'ErrorOnDb'})
          })
        }
      }).catch(error=>{
        resolve({ error: true, code: 26, name: 'ErrorOnDb'})
      })
    })
  }

  var dialogsModel = mongooseClient.model('dialogs', dialogsSchema);

  return dialogsModel;
};
