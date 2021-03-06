const users = require('./users/users.service.js');
const profile = require('./profile/profile.service.js');
const devices = require('./devices/devices.service.js');
const friendship = require('./friendship/friendship.service.js');
const custom = require('./custom/custom.service.js');
const dialogs = require('./dialogs/dialogs.service.js');
const messages = require('./messages/messages.service.js');
const chats = require('./chats/chats.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(profile);
  app.configure(devices);
  app.configure(friendship);
  app.configure(custom);
  app.configure(dialogs);
  app.configure(messages);
  app.configure(chats);
};
