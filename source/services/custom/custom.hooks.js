
const findtest = cntx => {

  let { query } = cntx.params;


  if (query.$getFriendRequests){



    cntx.params.query = query;
    return cntx;
  }

  cntx.result = 'methodNotAllowed';
  return cntx;
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
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
