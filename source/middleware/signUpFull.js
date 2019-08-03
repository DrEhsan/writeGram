module.exports = function (app){

	const validator = require('validator');
	const responder = require('./responser')
	const signUpFull = (req, res, next) =>{

		try{

			let {username, password} = req.body;
			let {avatar} = req.file;

			

		}
		catch(error){

		}
	}
}