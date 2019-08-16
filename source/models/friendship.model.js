// friendship-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const userModel = require('./users.model');

  const { Schema } = mongooseClient;
  const friendshipSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    requested: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    status: { type: String, default: 'Pending', index: true},
    dateSent: { type: Date, default: Date.now, index: true },
    dateAccepted: { type: Date, required: false, index: true }
  }, {
    timestamps: true
  });


  friendshipSchema.statics.doFriendRequest = function (requesterId, requestedId) {
    var conditions = {
      requester: requesterId,
      requested: requestedId
    };

    return new Promise(resolve =>{
      friendModel.findOne((conditions))
        .then(result => {
          if (result == null){
            const newfriendShip = new friendModel(conditions);
              newfriendShip.save().then(newfriend =>{
                resolve(
                          newfriend
                            .populate({ path : 'requester',  populate : { path : 'profile'}})
                            .populate({ path : 'requested',  populate : { path : 'profile'}})
                            .execPopulate()
                       )
              })
              .catch(error =>{ resolve({error: true, type: 'DataBase', msg: error}) })
          }
          else{
            resolve({error: true, type: 'Internal', msg: (result.status === 'Pending' ? 'Pending': 'Freind')})
          }
        })
        .catch(error=>{
          resolve({error: true, type: 'DataBase', msg: error});
        })
    })
  }

  var friendModel = mongooseClient.model('friendship', friendshipSchema);

  return friendModel;
};
