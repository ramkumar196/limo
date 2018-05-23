var express = require('express'),
    router = express.Router();

var app = require('../app');


var apimodel = require('../models/apimodel');

var q= require('q');

module.exports = function (app) {

	router.param('key', function (req, res, next, id) {
		var company_key = req.params.key;
		var decrypt_key = app.encrypt_decrypt('decrypt',company_key);
		if(decrypt_key != '')
		{
			apimodel.getCompanyKey(q,decrypt_key).then(function(results){

				if(results.length > 0)
				{
					next();
				}
				else
				{
					var message = {'message':'invalid_company','status':8};
					res.type('text/json');
					res.send(message);
				}

			});
		}
		else
		{
			var message = {'message':'invalid_company','status':8};
			res.type('text/json');
			res.send(message);
		}

		next();
	});

  router.get('/:key/type=:id', function (req, res) {

	var company_key = req.params.id;

	console.log(company_key);

     apimodel.getSiteInfo(q).then(function(results){
        let message = {'message':"Success",'details':results,'status':1}
        res.type('text/json');
        res.send(message);
     });     
  });


  return router;
};