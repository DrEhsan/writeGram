// Initializes the `friendship` service on path `/friendship`
const createService = require('feathers-mongoose');
const createModel = require('../../models/friendship.model');
const hooks = require('./friendship.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/friendship', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('friendship');

  service.hooks(hooks);
};
