// Initializes the `devices` service on path `/devices`
const createService = require('feathers-mongoose');
const createModel = require('../../models/devices.model');
const hooks = require('./devices.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/devices', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('devices');

  service.hooks(hooks);
};
