module.exports = function (app){


	const validator = require('validator');
	const responder = require('./responser')

	const signUpEmail = async (req, res, next) => {
    try{

      /*
      console.log(req.ipInfo)

      if (req.headers.agent_token == undefined){
        return responder.sendErrorResponse(res, "NoAgentTokenFound");
      }

      if (req.headers.agent_push_token == undefined){
        return responder.sendErrorResponse(res, "NoAgentPushTokenFound");
      }

      let { agent_token , agent_push_token } = req.headers;*/

      let { email } = req.body;

      if (!validator.isEmail(email)){
        return responder.sendErrorResponse(res, "InvalidEmailAddress");
      }

      let userRes = await app.service('users').find({query : { 'email.address' : email }});

      if (userRes.total == 1){

        let user = userRes.data[0];

        if (user.registerStatus == 1){
          return responder.sendErrorResponse(res, "signUpDoneBefore");
        }

        if (!user.email.isConfirmed){
          return responder.sendErrorResponse(res, "EmailAddressNeedsConfirmation");
        }

        return responder.sendErrorResponse(res, "DuplicatedEmailAddress");
      }

      /*
      let ipInfo = {};

      if (!req.ipInfo.error){
        // we should get ip!
      }

      let device = await app.service('devices').find({ query : { deviceToken :  agent_token }});

      if (device.total > 0){
        let _device = device.data[0];
        if (_device.gcmID != agent_push_token){
          return responder.sendErrorResponse(res, 'GCMIDMISTMATCH');
        }

        await
      }*/



      user = await app.service('users').create({ 'email.address' : email});

      return responder.SendResponse(res, {
        email : email,
        api_key : user.api_key,
      })

    }
    catch(error){
      return responder.sendErrorResponse(res, "CatchError", error);
    }
	}

	app.post("/auth/signUpEmail", signUpEmail);
}