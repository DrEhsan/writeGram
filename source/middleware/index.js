
const authentication = require('./Authentication')
//const alirezaTest = require

module.exports = function(app){

    app.configure(authentication);

    app.use(function (req, res, next) {
      console.log(req.body)
      console.log(req.url)
      next()
    })

    app.use('/friendship', function(req, res, next){

      if (req.method === 'DELETE'){
        req.feathers.body = req.body;
      }

      next();
    })


}