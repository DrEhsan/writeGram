module.exports =  {

    sendErrorResponse : function (response, type, error = null) {

				let status_code = 503;
        var resBody = { reason: "ServiceUnavailable"};

        switch (type){

					case "CatchError": resBody = { reason: type, innerException: error}; break;

          // Email error messages
					case "InvalidEmailAddress": resBody = { innerCode: 19, reason: type}; status_code = 406; break;
					case "DuplicatedEmailAddress": resBody = { innerCode: 20, reason: type};  status_code = 406; break;
					case "EmailAddressNeedsConfirmation": resBody = { innerCode: 21, reason: type}; status_code = 406; break;
          //--------------------------------------------------------------------------------------------------

          // Authentication error messages
          case "NoAuthHeader" : resBody = { innerCode: 22, reason: type}; status_code = 417; break;
          case "NotAuthorized": resBody = { innerCode: 23, reason: type}; status_code = 401; break;
          //--------------------------------------------------------------------------------------------------

          // Avatar & files
          case "AvatarNotUploaded" : resBody = { innerCode: 25, reason: type}; status_code = 415; break;

          // Length
          case "BadUserName" : resBody = { innerCode: 25, reason: type}; status_code = 406; break;
          case "Badpassword" :  resBody = { innerCode: 25, reason: type}; status_code = 406; break;

          // Username
          case "DuplicatedUserName" :  resBody = { innerCode: 25, reason: type}; status_code = 406; break;
          case "UserOrEmailNotFound" :  resBody = { innerCode: 25, reason: type}; status_code = 406; break;

          case "NoAgentTokenFound" : resBody = { innerCode: 25, reason: type}; status_code = 417; break;
          case "NoAgentPushTokenFound" : resBody = { innerCode: 25, reason: type}; status_code = 417; break;

          case "signUpDoneBefore" : resBody = { innerCode: 25, reason: type}; status_code = 406; break;
          case "signUpNotCompleted" : resBody = { innerCode: 25, reason: type}; status_code = 406; break;

          case "PasswordIsIncorrect" : resBody = { innerCode: 25, reason: type}; status_code = 401; break;

        }

        return response.status(status_code).send({status: false, error: resBody})
      },

      SendResponse : function (response, data) {
        return response.send({status: true, payload: data})
      }

};