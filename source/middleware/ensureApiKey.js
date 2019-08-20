const ensureApiKey =  async (req, res, next) =>{

	try{

		const responder = require('./Authentication/responser')

		let app = req.app;

		if (!req.headers.apikey){
			return responder.sendErrorResponse(res, "NoAuthHeader");
		}

    let apiKey = req.headers.apikey;

    let user = await app.service('users').find({ query: { apiKey: apiKey}});

    if (user.total < 1){
      return responder.sendErrorResponse(res, "NotAuthorized");
    }



    req.feathers.user = user.data[0];
    next();
	}
	catch (error){
		return responder.sendErrorResponse(res, "CatchError", error);
	}
}

module.exports = ensureApiKey;