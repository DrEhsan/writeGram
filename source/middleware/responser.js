module.exports =  {

    sendErrorResponse : function (response, type, error = null) {

				let statusCode = 503;
        var resBody = { reason: "ServiceUnavailable"};

        switch (type){

					case "CatchError": resBody = { reason: type, innerException: error}; break;

          // Email error messages
					case "InvalidEmailAddress": resBody = { innerCode: 19, reason: type}; statusCode = 406; break;
					case "DuplicatedEmailAddress": resBody = { innerCode: 20, reason: type};  statusCode = 406; break;
					case "EmailAddressNotConfirmed": resBody = { innerCode: 21, reason: type}; statusCode = 406; break;
          //--------------------------------------------------------------------------------------------------

          // Authentication error messages
          case "NoAuthHeader" : resBody = { innerCode: 22, reason: type}; statusCode = 417; break;
          case "NotAuthorized": resBody = { innerCode: 23, reason: type}; statusCode = 401; break;
          //--------------------------------------------------------------------------------------------------

          // Avatar & files
          case "AvatarNotUploaded" : resBody = { innerCode: 25, reason: type}; statusCode = 415; break;
          case "signUpDoneBefore" : resBody = { innerCode: 25, reason: type}; statusCode = 406; break;

          // Length
          case "BadUserName" : resBody = { innerCode: 25, reason: type}; statusCode = 406; break;
          case "Badpassword" :  resBody = { innerCode: 25, reason: type}; statusCode = 406; break;

          // Username
          case "DuplicatedUserName" :  resBody = { innerCode: 25, reason: type}; statusCode = 406; break;

        }

        return response.status(statusCode).send({status: false, error: resBody})
      },

      SendResponse : function (response, data) {
        return response.send({status: true, payload: data})
      }

};