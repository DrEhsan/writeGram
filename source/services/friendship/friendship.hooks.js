
const doFriendRequest = async cntx =>{

  let requester = cntx.params.user;
  let friendShip = cntx.app.service('friendship').Model;
  let {requestedUser} = cntx.data;
  let promise = friendShip.doFriendRequest(requester, requestedUser);
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
  cntx.result = result;
  return cntx;
}

const acceptFriendRequest = async cntx =>{
  let requester = cntx.params.user;
  let friendShip = cntx.app.service('friendship').Model;
  let {requestedUser} = cntx.data;
  let promise = friendShip.acceptFriendRequest(requester._id, requestedUser);
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
  cntx.result = result;
  return cntx;
}

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

const fetchError = cntx => {





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
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [fetchError],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
