module.exports = function(app){

	const ensureApiKey = require('./ensureApiKey')
	const validator = require('validator')
	const responder = require('./responser')

	const signInByEmail = async (req, res, next) =>{
		try{

			let {email, password} = req.body;

			if (!validator.isEmail(email)){
				return responder.sendErrorResponse(res, "InvalidEmailAddress");
			}

			let _email = app.service('users').find({ query : { 'email.address' : email }});

			if (_email.total < 1){
				return responder.sendErrorResponse(res, 'UserOrEmailNotFound');
			}

			if (_email.profile == undefined){
				return responder.sendErrorResponse(res, 'signUpNotCompleted');
			}

			let hash = crypto.createHmac('sha256', _email.username + email + "writeGram2019")
											.update(_email.username + "_" + password + "_" + email)
											.digest('hex')

			if (hash != _email.password){
				return responder.sendErrorResponse(res, 'PasswordIsIncorrect');
			}

			let newApiKey =	crypto.createHmac('sha256', email + "writeGram")
														.update(new Date().toString()+"_" + email)
														.digest('hex');

			req.feathers.populate = true;

			await app.service('users').patch(_email._id, { apiKey: newApiKey });

			{
				// get wall
				//
			}

			var res = {
				user_id : _email._id,
				profile : _email.profile // get profile data
			}

		}
		catch(err){

		}
	}


	app.post('/auth/signInByEmail', signInByEmail)
}