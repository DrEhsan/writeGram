// Initializes the `profile` service on path `/profile`
const createService = require('feathers-mongoose');
const createModel = require('../../models/profile.model');
const hooks = require('./profile.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/profile', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('profile');

  service.hooks(hooks);
};
