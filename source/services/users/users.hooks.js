const { iff, isProvider } = require('feathers-hooks-common')

const before_internal_populater = cntx => {
  if (cntx.params.populate == undefined){
    return cntx;
  }

  cntx.params.query = {};
  cntx.params.query["$populate"] = ["profile"];
  return cntx;
}

const After_InternalPopulater = cntx => {
  if (cntx.params.populate == undefined || cntx.method != 'patch'){
    return cntx;
  }

  let result = cntx.result;
  result.profile.profileId = result.profile._id;
  delete result.profile.__v;
  delete result.profile._id;

  return cntx;
}

module.exports = {
  before: {
    all: [before_internal_populater],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [After_InternalPopulater],
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
