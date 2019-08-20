// friendship-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');

  const userModel = require('./users.model')
  const { Schema } = mongooseClient;
  const friendshipSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    requested: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    status: { type: String, default: 'Pending', index: true},
    dateSent: { type: Date, default: Date.now, index: true },
    dateAccepted: { type: Date, required: false, index: true }
  }, {
    timestamps: true,
    versionKey: false
  });

  friendshipSchema.statics.unFollow = function (requesterId, requestedId){
    var conditions = {
      requester: requesterId,
      requested: requestedId,
      status: 'Accepted'
    };

    return new Promise(resolve =>{
      friendModel.findOneAndRemove(conditions).then(removed => {
        if (removed){
          resolve({ unFollowed : true })
        }
        else{
          resolve({ error: true, code: 26, name: 'NoReCordFoundToBeRemoved'})
        }
      }).catch(error =>{
        resolve({ error: true, code: 26, name: 'DbErrorSave'})
      })
    })
  }

  friendshipSchema.statics.denyFriendRequest = function (requesterId, requestedId){
    var conditions = {
      requester: requestedId,
      requested: requesterId,
      status: 'Pending'
    };

    return new Promise(resolve =>{
      friendModel.findOneAndRemove(conditions).then(removed => {
        if (removed){
          resolve({ denieded : true })
        }
        else{
          resolve({ error: true, code: 26, name: 'NoReCordFoundToBeRemoved'})
        }
      }).catch(error =>{
        resolve({ error: true, code: 26, name: 'DbErrorSave'})
      })
    })
  }

  friendshipSchema.statics.cancelFriendRequest = function (requesterId, requestedId){
    var conditions = {
      requester: requesterId,
      requested: requestedId,
      status: 'Pending'
    };

    return new Promise(resolve =>{
      friendModel.findOneAndRemove(conditions).then(removed => {
        if (removed){
          resolve({ canceled : true })
        }
        else{
          resolve({ error: true, code: 26, name: 'NoReCordFoundToBeRemoved'})
        }
      }).catch(error =>{
        resolve({ error: true, code: 26, name: 'DbErrorSave'})
      })
    })
  }

  friendshipSchema.statics.acceptFriendRequest = function (requesterId, requestedId){
    var conditions = {
      requester: requestedId,
      requested: requesterId,
      status: 'Pending'
    };

    var updates = {
      status: 'Accepted',
      dateAccepted: Date.now()
    };

    var options = { 'new': true };

    return new Promise(resolve =>{
      friendModel.findOneAndUpdate(conditions, updates, options)
        .then(result =>{
          if (result){
            //userModel.addFollow(requestedId, requesterId);
            resolve(
              result
                .populate({ path : 'requester',  select: { '_id': 1, 'username':1 }, populate : { path : 'profile'}})
                .populate({ path : 'requested',  select: { '_id': 1, 'username':1 }, populate : { path : 'profile'}})
                .execPopulate()
            )
          }
          else{
            resolve({ error: true, code: 26, name: 'NoRequestHasDoneOrPending'})
          }
        })
        .catch(error => {
          resolve({ error: true, code: 26, name: 'DbErrorSave'})
        })
    })
  }


  friendshipSchema.statics.doFriendRequest = function (requesterId, requestedId) {
    var conditions = {
      requester: requesterId,
      requested: requestedId,
    };

    return new Promise(resolve =>{
      friendModel.findOne((conditions))
        .then(result => {
          if (result == null){
            //conditions.lean = false;
            const newfriendShip = new friendModel(conditions);
              newfriendShip.save().then(newfriend => {
                resolve(
                          newfriend
                            .populate({ path : 'requester',  select: { '_id': 1, 'username':1 }, populate : { path : 'profile'}})
                            .populate({ path : 'requested',  select: { '_id': 1, 'username':1 },  populate : { path : 'profile'}})
                            .execPopulate()
                       )
              })
              .catch(error => {
                resolve({ error: true, code: 26, name: 'DbErrorSave'})
              })
          }
          else{
            resolve({error: true, code: 26, name: (result.status === 'Pending') ? 'RequestIsPending': 'RequestersAreFriend'})
          }
        })
        .catch(error => {
          resolve({ error: true, code: 26, name: 'DbErrorSave'});
        })
    })
  }

  var friendModel = mongooseClient.model('friendship', friendshipSchema);

  return friendModel;
};
