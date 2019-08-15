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

				let user = await app.service('users').find({query : { 'email.address' : email }});

				if (user.total == 1){

					if (!user.data[0].email.isConfirmed){
						return responder.sendErrorResponse(res, "EmailAddressNotConfirmed");
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
					apiKey : user.apiKey,
				})

			}
			catch(error){
				return responder.sendErrorResponse(res, "CatchError", error);
			}
	}

	app.post("/auth/signUpEmail", signUpEmail);
}