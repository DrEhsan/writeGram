module.exports = function (app){

    const ensureApiKey = require('./ensureApiKey');
    const responder = require('./responser');
    const crypto = require('crypto')

    const signOut = async (req, res, next) => {

        let user = req.feathers.user;

        let newApiKey = crypto.createHmac('sha256', user.email.address + "writeGram")
                                .update(new Date().toString()+"_" +user.email.address)
                                .digest('hex');

        await app.service('users').patch(user._id, { apiKey: newApiKey });

        return responder.SendResponse(res, { signedOut : true });
    }

    app.post("/auth/signOut", ensureApiKey, signOut);
}