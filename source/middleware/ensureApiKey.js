const ensureApiKey =  (req, res, next) =>{

	try{

		const responder = require('./Authentication/responser')

		let app = req.app;

		if (!req.headers.api_key){
			return responder.sendErrorResponse(res, "NoAuthHeader");
		}

		let api_key = req.headers.api_key;

		app.service('users').find({ query: { api_key: api_key}})
			.then(user=>{
				if (user.total < 1){
					return responder.sendErrorResponse(res, "NotAuthorized");
				}

				req.feathers.user = user.data[0];
				next();
			})
			.catch(error => {
				return responder.sendErrorResponse(res, "CatchError", error);
			})
	}
	catch (error){
		return responder.sendErrorResponse(res, "CatchError", error);
	}
}

module.exports = ensureApiKey;