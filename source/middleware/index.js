// eslint-disable-next-line no-unused-vars

const signUpEmail = require('./signUpEmail')

module.exports = function (app) {
  // Add your custom middleware here. Remember that
  // in Express, the order matters.

  app.configure(signUpEmail);

};
