const users = require('./users/users.service.js');
const profile = require('./profile/profile.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(profile);
};
