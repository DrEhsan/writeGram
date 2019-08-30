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
    date_request_sent: { type: Date, default: Date.now, index: true },
    date_request_accepted: { type: Date, required: false, index: true }
  }, {
    timestamps: true,
    versionKey: false
  });

  // remove from follow list
  friendshipSchema.statics.removeFollower = function (account_to_be_remove, account_main){
    var conditions = {
      requester: account_main,
      requested: account_to_be_remove,
      status: 'Accepted'
    };

    return new Promise(resolve => {
      friendModel.findOneAndRemove(conditions).then(removed => {
        if (removed){
          resolve({ removedFollower : true })
        }
        else{
          resolve({ error: true, code: 26, name: 'NoReCordFoundToBeRemoved'})
        }
      }).catch(error =>{
        resolve({ error: true, code: 26, name: 'DbErrorSave'})
      })
    })
  }

  friendshipSchema.statics.unFollow = function (requester_id, requested_id){
    var conditions = {
      requester: requester_id,
      requested: requested_id,
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

  friendshipSchema.statics.denyFriendRequest = function (requester_id, requested_id){
    var conditions = {
      requester: requested_id,
      requested: requester_id,
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

  friendshipSchema.statics.cancelFriendRequest = function (requester_id, requested_id){
    var conditions = {
      requester: requester_id,
      requested: requested_id,
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

  friendshipSchema.statics.acceptFriendRequest = function (requester_id, requested_id){
    var conditions = {
      requester: requested_id,
      requested: requester_id,
      status: 'Pending'
    };

    var updates = {
      status: 'Accepted',
      date_request_accepted: Date.now()
    };

    var options = { 'new': true };

    return new Promise(resolve => {
      friendModel.findOneAndUpdate(conditions, updates, options)
        .then(result =>{
          if (result){
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


  friendshipSchema.statics.doFriendRequest = function (requester_id, requested_id) {
    var conditions = {
      requester: requester_id,
      requested: requested_id,
    };

    return new Promise(resolve =>{
      friendModel.findOne((conditions))
        .then(result => {
          if (result == null){
            //conditions.lean = false;
            const new_friendship = new friendModel(conditions);
            new_friendship.save().then(newfriend => {
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
