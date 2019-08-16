// eslint-disable-next-line no-unused-vars

const signUpEmail = require('./signUpEmail')
const signUpFull = require('./signUpFull')
const signOut = require('./signOut')
const signInByEmail = require('./signInByEmail')
const signInByUserName = require('./signInByUserName')

module.exports = function (app) {
  // Add your custom middleware here. Remember that
  // in Express, the order matters.

  app.configure(signUpEmail);
  app.configure(signUpFull);
  app.configure(signOut);
  app.configure(signInByEmail);
  app.configure(signInByUserName);

};
