// Initializes the `friends` service on path `/friends`
const createService = require('./custom.class.js');
const mongoClass = require('../../mongoClass')
const hooks = require('./custom.hooks');
const createModel = require('../../models/custom.model');
const ensureApiKey = require('../../middleware/ensureApiKey')

module.exports = function (app) {

  const paginate = app.get('paginate');
  const Model = createModel(app);

  const options = {
    mongoClass : mongoClass,
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/custom', ensureApiKey, createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('custom');

  service.hooks(hooks);
};
