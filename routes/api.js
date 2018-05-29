var express = require('express'),
    router = express.Router();

var app = require('../app');


var apimodel = require('../models/apimodel');
var apilib = require('../lib/api');
var loginlib = require('../lib/login');
var profilelib = require('../lib/profile');
var homelib = require('../lib/home');
var extraslib = require('../lib/extras');
var logoutlib = require('../lib/logout');
var tripdetaillib = require('../lib/tripdetail');
var upcominglib = require('../lib/upcoming');
var tripstartlib = require('../lib/tripstart');
var completetriplib = require('../lib/tripcomplete');
var fareupdatelib = require('../lib/fareupdate');

var i18n = require('i18n');


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

		//next();
	});

  // router.get('/:key/type=getcoreconfig', function (req, res) {
  //    apimodel.getSiteInfo(q).then(function(results){
  //       let message = {'message':"Success",'details':results,'status':1}
  //       res.type('text/json');
  //       res.send(message);
  //    });     
  // });

  router.get('/:key/', function (req, res) {
         var type = req.query.type;
         var starttime = new Date();
		 console.log(type+" "+starttime);

		if(type == 'getcoreconfig')
		{ 
			apilib[type](q,req).then(function(results){
					var time = new Date();
					var endtime =time.getTime();
					var execution_time = endtime-starttime;
					results.execution_time = execution_time+" ms";
					res.send(results);
			 });
		}
		else
		{
			var message = {'message':'invalid_company','status':8};
			res.type('text/json');
			res.send(message);
		}

  });


  router.post('/:key/', function (req, res) {
         var type = req.query.type;
         var time = new Date();
         var starttime =time.getTime();
		 console.log(type +"  "+ starttime );

		 /*

		if(type == 'driver_login' ||  type == 'taxiqr_scan' ||  type == 'driver_shift_status' ||
		 type == 'driver_profile' || type == 'update_taxi_info' || type == 'driver_statistics' ||
		  type =='edit_driver_profile' || type == 'update_pass_id_image')
		{ 
			apilib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}
		else
		 */

		if(type == 'driver_login' ||  type == 'taxiqr_scan' || type == 'update_taxi_info')
		{
			loginlib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}
		else if(type == 'driver_profile' || type == 'edit_driver_profile')
		{
			profilelib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}
		else if(type == 'driver_statistics' || type == 'driver_shift_status')
		{
			homelib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}
		else if(type == 'update_pass_id_image')
		{
			extraslib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}
		else if(type == 'user_logout')
		{
			logoutlib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}
		else if(type == 'driver_booking_list' || type == 'get_trip_detail')
		{
			tripdetaillib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}
		else if(type == 'driver_reply')
		{
			upcominglib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}else if(type == 'driver_arrived' || type == 'start_trip')
		{
			tripstartlib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}else if(type == 'complete_trip')
		{
			completetriplib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}else if(type == 'tripfare_update')
		{
			fareupdatelib[type](q,req).then(function(results){
				var time = new Date();
				var endtime =time.getTime();
				var execution_time = endtime-starttime;
				results.execution_time = execution_time+" ms";
				res.send(results);
			 });
		}
		else
		{
			var message = {'message':i18n.__('invalid_request'),'status':-1};
			res.type('text/json');
			res.send(message);
		}

  });

  return router;
};