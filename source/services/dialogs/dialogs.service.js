// Initializes the `chats` service on path `/chats`
const createService = require('feathers-mongoose');
const createModel = require('../../models/dialogs.model');
const hooks = require('./dialogs.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/dialogs', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('dialogs');

  service.hooks(hooks);
};
