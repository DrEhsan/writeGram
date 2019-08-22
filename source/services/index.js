const users = require('./users/users.service.js');
const profile = require('./profile/profile.service.js');
const devices = require('./devices/devices.service.js');
const friendship = require('./friendship/friendship.service.js');
const custom = require('./custom/custom.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(profile);
  app.configure(devices);
  app.configure(friendship);
  app.configure(custom);
};
