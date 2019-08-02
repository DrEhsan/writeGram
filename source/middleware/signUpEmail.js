module.exports = function (app){

		const validator = require('validator');
		const responder = require('./responser')

    const signUpEmail = async (req, res, next) => {

			try{

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