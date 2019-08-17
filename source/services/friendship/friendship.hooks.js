
const { iff, discard, isProvider } = require('feathers-hooks-common')

const requestDispatcher = async (cntx, method) => {
  let requester = cntx.params.user;
  let friendShip = cntx.app.service('friendship').Model;
  let { requestedUser } = cntx.data;

  let promise = null;

  switch(method){
    case 'doFriendRequest': promise = friendShip.doFriendRequest(requester._id, requestedUser); break;
    case 'acceptFriendRequest': promise = friendShip.acceptFriendRequest(requester._id, requestedUser); break;
  }

  let result = (await Promise.all([promise]))[0];

  // error occured!
  if (result.error){
    var ResBody = {
      status : false,
      error: {
        innerCode: result.name,
        reason: result.code
      }
    }

    cntx.result = ResBody;
    return cntx;
  }

  // send result of request : To-Do -> build successful packet on after hook

  result = result.toObject();

  result.requester.userId = result.requester._id;
  result.requested.userId = result.requested._id;
  result.requester.profile.profileId = result.requester.profile._id;
  result.requested.profile.profileId = result.requested.profile._id;

  delete result.requester._id;
  delete result.requested._id;
  delete result.requester.profile._id;
  delete result.requested.profile._id;
  delete result._id;

  cntx.result = { status: true, payload : result};
  return cntx;
}

const doFriendRequest = async cntx => { return await requestDispatcher(cntx, 'doFriendRequest'); }
const acceptFriendRequest = async cntx => { return await requestDispatcher(cntx, 'acceptFriendRequest'); }

const filterMethod = async cntx => {
  let queryType = cntx.params.query;

  if (queryType.$doFriendRequest){
    return await doFriendRequest(cntx);
  }

  if (queryType.$acceptFriendRequest){
    return await acceptFriendRequest(cntx);
  }

  cntx.result = {
    status : false,
      error: {
        innerCode: 26,
        reason: "MethodNotAllowed"
      }
  }

  return cntx;
}

const filterFields = cntx => {

  console.log('fetchError2')



}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [doFriendRequest],
    update: [],
    patch: [acceptFriendRequest],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [/*iff(isProvider('external'),
                  discard('requester.token'),
                  discard('requester.isConfirmed'),
                  discard('requester.apiKey'),
                  discard('requester.__v'),
                  discard('requester.password'),
                  discard('requester.__v'),
  )*/],
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
