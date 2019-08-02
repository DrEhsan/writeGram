module.exports =  {

    sendErrorResponse : function (response, type, error = null) {

				let statusCode = 503;
        var resBody = { reason: "ServiceUnavailable"};

				console.log(error)
        switch (type){

					case "CatchError": resBody = { reason: type, innerException: error}; break;

					case "InvalidEmailAddress": resBody = { innerCode: 19, reason: type}; statusCode = 406; break;
					case "DuplicatedEmailAddress": resBody = { innerCode: 20, reason: type};  statusCode = 406; break;
					case "EmailAddressNotConfirmed": resBody = { innerCode: 21, reason: type}; statusCode = 406; break;

        }

        return response.status(statusCode).send({status: false, error: resBody})
      },

      SendResponse : function (response, data) {
        return response.send({status: true, payload: data})
      }

};