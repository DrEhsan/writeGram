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


  dialogsSchema.statics.sendMessage = function (sender, receiver, data) {

    let conditions_find = {
      "$or": [
        { members: [receiver, sender] },
        { members: [sender, receiver] }
      ]
    }

    return new Promise(resolve => {
      dialogsModel.findOne(conditions_find).then(finded => {

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
              resolve({error : true, errordata : error})
            })
          }).catch(error =>{
            resolve({error : true, errordata : error})
          })
        }
        else
        {
          resolve('To-Do : Update existing dialog')
        }
      }).catch(error=>{
        resolve({error : true, errordata : error})
      })
    })
  }

  var dialogsModel = mongooseClient.model('dialogs', dialogsSchema);

  return dialogsModel;
};
