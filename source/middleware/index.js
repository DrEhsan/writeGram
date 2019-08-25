
const authentication = require('./Authentication')

module.exports = function(app){

    app.configure(authentication);

    app.use('/friendship', function(req, res, next){

      if (req.method === 'DELETE'){
        req.feathers.body = req.body;
      }

      next();
    })

    
}