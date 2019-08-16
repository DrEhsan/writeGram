
const authentication = require('./Authentication')
const friendship = require('./FriendShip')

module.exports = function(app){

    app.configure(authentication);
    app.configure(friendship);

}