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


  dialogsSchema.statics.sendMessge = function (sender, receiver) {

    let conditions_find = {
      "$or": [
        { members: [receiver, sender] },
        { members: [sender, receiver] }
      ]
    }

    dialogsModel.findOne(conditions_find).then(finded => {
      if (finded == null){
        let conditions = {
          members: [receiver, sender]
        }


      }
    })

  }

  var dialogsModel = mongooseClient.model('dialogs', dialogsSchema);

  return dialogsModel;
};
