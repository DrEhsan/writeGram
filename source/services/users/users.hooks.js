
const populater = cntx => {
  if (!cntx.populate){
    return cntx;
  }

  let app = cntx.app;

  cntx.params.query["$populate"] = "profile";
}

module.exports = {
  before: {
    all: [populater],
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
