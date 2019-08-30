
//const { iff, discard, isProvider } = require('feathers-hooks-common')

const doFriendRequest = async cntx => { return await requestDispatcher(cntx, 'doFriendRequest'); }
const acceptFriendRequest = async cntx => { return await requestDispatcher(cntx, 'acceptFriendRequest'); }

const filterQuery = async cntx => {
  let queryType = cntx.params.query;

  if (queryType.$cancelFriendRequest){
    return await requestDispatcher(cntx, 'cancelFriendRequest');
  }
  else if (queryType.$denyFriendRequest){
    return await requestDispatcher(cntx, 'denyFriendRequest');
  }
  else if (queryType.$unFollow){
    return await requestDispatcher(cntx, 'unFollow');
  }
  else if (queryType.$removeFollower){
    return await requestDispatcher(cntx, 'removeFollower');
  }
  else if (queryType.$getFriendRequests){
    return await getPendingRequests(cntx);
  }
  else if (queryType.$getFollowers){
    return await getFollowers(cntx);
  }
  else if (queryType.$getFollowings){
    return await getFollowings(cntx);
  }

  cntx.result = { status : false, error: { innerCode: 26, reason: "MethodNotAllowed"} }
  return cntx;
}

const requestDispatcher = async (cntx, method) => {
  let requester = cntx.params.user;
  let friendShip = cntx.app.service('friendship').Model;
  let { requested_user } = cntx.data != undefined ? cntx.data  : cntx.params.body;

  let promise = null;
  let customize_body = false;
  let status_code = 202;

  switch(method){
    case 'doFriendRequest': promise = friendShip.doFriendRequest(requester._id, requested_user); customize_body = true; break;
    case 'acceptFriendRequest': promise = friendShip.acceptFriendRequest(requester._id, requested_user); customize_body = true; break;
    case 'cancelFriendRequest':  promise = friendShip.cancelFriendRequest(requester._id, requested_user); break;
    case 'denyFriendRequest':  promise = friendShip.denyFriendRequest(requester._id, requested_user); break;
    case 'unFollow' : promise = friendShip.unFollow(requester._id, requested_user); break;
    case 'removeFollower' : promise = friendShip.removeFollower(requester._id, requested_user); break;
  }

  let result = (await Promise.all([promise]))[0];

  // error occured!
  if (result.error){
    var ResBody = { status_code : 500, status : false, error: { innerCode: result.name, reason: result.code }}
    cntx.result = ResBody;
    return cntx;
  }

  // some methods needs editation in users model
  let userModel = cntx.app.service('users').Model;
  switch(method){
    case "acceptFriendRequest" : userModel.addFollow(requested_user, requester._id); break;
    case "unFollow" : userModel.removeFollow(requested_user, requester._id); break;
    case "removeFollower" : userModel.removeFollower(requested_user, requester._id); break;
  }

  if (customize_body){
    // send result of request : To-Do -> build successful packet on after hook
    status_code = 201;
    result = result.toObject();

    result.requester.user_id = result.requester._id;
    result.requested.user_id = result.requested._id;
    result.requester.profile.profile_id = result.requester.profile._id;
    result.requested.profile.profile_id = result.requested.profile._id;

    delete result.requester._id;
    delete result.requested._id;
    delete result.requester.profile._id;
    delete result.requested.profile._id;
    delete result._id;
  }

  cntx.result = { status_code: status_code, status: true, payload : result};
  return cntx;
}

const getPendingRequests = async cntx => {
  let query = [{
    $match: {
      "requested" : cntx.params.user_id,
      "status" : 'Pendings'
     }
  }, {
    $lookup: {
      from: "users",
      localField: "requester",
      foreignField: "_id",
      as: "requester"
    }
  }, {
    $unwind: {
      path: "$requester",
      preserveNullAndEmptyArrays: true
    }
  },{
    $lookup: {
      from: "profiles",
      localField: "requester.profile",
      foreignField: "_id",
      as: "requester.profile",
    }
  },{
    $unwind: {
      path: "$requester.profile",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $addFields: {"requester.user_id": "$requester._id"},
    $addFields: {"requester.profile.profile_id": "$requester.profile._id"},
  },
  {
    $project: {
      _id: 0,
      "requester._id": 0,
      "requester.email": 0,
      "requester.register_status": 0,
      "requester.api_key": 0,
      "requester.password": 0,
      "requester.profile._id": 0,
      "requester.profile.__v": 0,
    }
  }]

  let result = await cntx.app.service('friendship').Model.aggregate(query).exec();
  cntx.result = {
    status : true,
    payload: {
      requests_count : result.length,
      requests: result
    }
  }

  return cntx;
}

const getFollowers = async cntx => {

  let conditions = {
    _id: cntx.params.user._id,
  }

  let skip = cntx.params.query.$skip != undefined ? Number(cntx.params.query.$skip) : 0;
  let limit = cntx.params.query.$limit != undefined ? Number(cntx.params.query.$limit) : 1;

  let res = await cntx.app.service('users').Model
              .findOne(conditions)
              .populate({
                  path : 'followers',
                  select: {
                    '_id': 1,
                    'username': 1
                  },
                  populate :
                  {
                    path : 'profile',
                    select: {
                      '_id': 1,
                      'avatar': 1
                    }
                  }
              })
              .slice('followers', [skip, skip + limit])
              .select(['followers'])
              .exec();

  cntx.result = res;
  return cntx;
}

const getFollowings = async cntx => {

  let conditions = {
    _id: cntx.params.user._id,
  }

  let skip = cntx.params.query.$skip != undefined ? Number(cntx.params.query.$skip) : 0;
  let limit = cntx.params.query.$limit != undefined ? Number(cntx.params.query.$limit) : 1;

  let res = await cntx.app.service('users').Model
              .findOne(conditions)
              .populate({
                  path : 'followings',
                  select: {
                    '_id': 1,
                    'username': 1
                  },
                  populate :
                  {
                    path : 'profile',
                    select: {
                      '_id': 1,
                      'avatar': 1
                    }
                  }
              })
              .slice('followings', [skip, skip + limit])
              .select(['followings'])
              .exec();

  cntx.result = res;
  return cntx;
}

const buildFollowingsPacket = cntx => {

  if (cntx.params.query.$getFollowings){

    cntx.result = cntx.result.toObject();

    delete cntx.result._id;

    let followings = cntx.result.followings;

    let _followings = [];
    followings.forEach(following => {

      following.profile.profile_id = following.profile._id;

      delete following.profile._id;

      var new_following = {
        following_id : following._id,
        username : following.username,
        profile : following.profile,
      }

      _followings.push(new_following)
    });

    delete cntx.result.followings;
    cntx.result.followings = _followings;
    cntx.params.following = true;
  }
}

const buildFollowersPacket = cntx => {
  if (cntx.params.query.$getFollowers){
    cntx.result = cntx.result.toObject();

    delete cntx.result._id;

    let followers = cntx.result.followers;

    let _followers = [];
    followers.forEach(follower => {
      follower.profile.profile_id = follower.profile._id;
      delete follower.profile._id;

      var newfollower = {
        follower_id : follower._id,
        username : follower.username,
        profile : follower.profile,
      }

      _followers.push(newfollower)
    });

    delete cntx.result.followers;
    cntx.result.followers = _followers;
  }
}

const buildFinalOutPut = (cntx) => {

  if (cntx.params.following){
    let res = {
      status : true,
      payload : {
        followings_count : cntx.result.followings.length,
        followings : cntx.result.followings
      }
    }

    cntx.result = res;
    return cntx;
  }

  let res = {
    status : true,
    payload : {
      followers_count : cntx.result.followers.length,
      followers : cntx.result.followers
    }
  }

  cntx.result = res;
  return cntx;
}


module.exports = {
  before: {
    all: [],
    find: [filterQuery],
    get: [],
    create: [doFriendRequest],
    update: [],
    patch: [acceptFriendRequest],
    remove: [filterQuery]
  },

  after: {
    all: [],
    find: [buildFollowersPacket, buildFollowingsPacket, buildFinalOutPut],
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
