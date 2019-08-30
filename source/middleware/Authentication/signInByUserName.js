module.exports = function(app){

	const validator = require('validator')
	const crypto = require('crypto')
	const responder = require('./responser')

	const signInByUserName = async (req, res, next) =>{
		try{

			let {username, password} = req.body;

			let users = await app.service('users').find({ query : { 'username' : username }});

			if (users.total < 1){
				return responder.sendErrorResponse(res, 'UserOrEmailNotFound');
			}

			let user = users.data[0];

			if (user.profile == undefined){
				return responder.sendErrorResponse(res, 'signUpNotCompleted');
			}

			let hash = crypto.createHmac('sha256', user.username + user.email + "writeGram2019")
											.update(user.username + "_" + password + "_" + user.email)
											.digest('hex')

			if (hash != user.password){
				return responder.sendErrorResponse(res, 'PasswordIsIncorrect');
			}

			let new_api_key =	crypto.createHmac('sha256', email + "writeGram")
														.update(new Date().toString()+"_" + email)
														.digest('hex');

			var patched_user = await app.service('users').patch(user._id, { api_key: new_api_key }, {populate: 'profile'});

			{
				// get wall
				//
			}

			var resBody = {
				user_id : patched_user._id,
				api_key: new_api_key,
				profile : patched_user.profile // get profile data
			}

			return responder.SendResponse(res, resBody)

		}
		catch(err){
			console.log(err)
			return responder.sendErrorResponse(res, 'CatchError', err)
		}
	}

	app.post('/auth/signInByUserName', signInByUserName)
}