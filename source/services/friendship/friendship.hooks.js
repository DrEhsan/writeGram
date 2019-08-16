
const doFriendRequest = async cntx =>{
  let friendShip = cntx.app.service('friendship').Model;

  let {requester, requested} = cntx.data;

  let a = friendShip.doFriendRequest2(requester, requested);
  let result = await Promise.all([a]);
  console.log(result);

  cntx.result = result[0];
  return cntx;
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [doFriendRequest],
    update: [],
    patch: [],
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
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
