
const authentication = require('./Authentication')

module.exports = function(app){

    app.configure(authentication);
}