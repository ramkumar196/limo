var apimodel = require('../models/apimodel');
var favicon = require('../config/favicon.json');
var config = require('../config/common_config.json');
var q= require('q');
var appRoot = require('app-root-path');
var validator = require('validator');
var fs = require('fs');
var validate = require("validate.js");
var dateFormat = require('dateformat');	
var time = require('time');
var i18n = require('i18n');
var t=require('../config/table_config.json');
var common=require('../lib/common.js');
var uniqid = require('uniqid');



exports.driver_reply= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var hostname = req.headers.host; 

	var validate_error  = validateDriverReply(q,inputParams);

	if(validate_error != undefined)
	{
		if(validate_error[0])
		{
			message.message = validate_error[0];
			message.status = -1;
			deferred.resolve(message);
			deferred.makeNodeResolver()
			message=null;
		}
		else
		{
			message.message = i18n.__('validation_error');
			message.status = -1;
			deferred.resolve(message);
			deferred.makeNodeResolver()
			message=null;
		}
	}
	else
	{
		var trip_id = inputParams.trip_id;
		var driver_id = inputParams.driver_id;
		var taxi_id = inputParams.taxi_id;
		var company_id = inputParams.company_id;
		var driver_reply = inputParams.driver_reply;
		var field = inputParams.field;
		var flag = inputParams.flag;
		var version_no = inputParams.version_no;
		var taxi_model = inputParams.taxi_model;
		
		apimodel.get_trip_detail(q,trip_id).then(function(detailsresults){

			if(detailsresults.length > 0)
			{	
				var current_driver_reply = detailsresults[0].driver_reply;
				var passenger_phone = detailsresults[0].passenger_phone;
				var travel_status = 9;
				if(driver_reply == 'R')
				{
					travel_status = 10;
				}

				var update_request_array = {
							'status':'F'
						};

				update_driver_reply(q,travel_status,driver_reply,driver_id,taxi_id,company_id,taxi_model,field,flag,trip_id,current_driver_reply).then(function(replyresults){

					console.log('replyresults',replyresults);

				if(replyresults > 0)
				{
					var statistics = '';
					var driver_details = '';

					var time_range = getStartingDateAndEndingDate(config.TIMEZONE);

					common.driver_statistics(q,driver_id,time_range).then(function(statisticsresults){

					statistics=statisticsresults;
					driver_details=detailsresults[0];

						if(replyresults == 1)
						{
							var update_shift_array = {
								'status':'B'
							};
							var update_request_array = {
								'status':parseInt(3)
							};
							apimodel.update_driver_shift(q,update_shift_array,driver_id).then(function(checkresults){
								apimodel.update_request_details(q,update_request_array,trip_id).then(function(checkresults){
										var to  = passenger_phone;

										var replace_array = {
											'trip_id':trip_id
										};
										common.send_sms(q,to,3,replace_array).then(function(checkresults){
										console.log('smsmms',checkresults);
										});

										var detail = {
											'trip_id':trip_id,
											'driver_details':driver_details,
											'driver_statistics':statistics
										};
										message.message = i18n.__('request_confirmed');
										message.detail = detail;
										message.status = 1;
										deferred.resolve(message);
										deferred.makeNodeResolver()
										message=null;
								});
							});
						}
						else if(replyresults == 2)
						{
							common.update_rejected_trip_det(trip_id).then(function(checkresults){
								message.message = i18n.__('request_rejected');
								message.driver_statistics = statistics;
								message.status = 2;
								deferred.resolve(message);
								deferred.makeNodeResolver();
								message=null;	
							});
						}
						else if(replyresults == 3)
						{
							var update_shift_array = {
								'status':'F'
							};
							var update_request_array = {
								'status':parseInt(9)
							};
							apimodel.update_driver_shift(q,update_shift_array,driver_id).then(function(checkresults){
								console.log('111111111');
								apimodel.update_request_details(q,update_request_array,trip_id).then(function(checkresults){
																	console.log('222222');
try
{
									common.update_cancel_trip_det(q,trip_id).then(function(checkresults){
																											console.log('333333');

											message.message = i18n.__('trip_cancelled_driver');

											message.driver_statistics = statistics;
											message.status = 3;
											deferred.resolve(message);
											deferred.makeNodeResolver()
											message=null;
									});
								}
								catch(err)
								{
									console.log(err);
								}
								});
							});
						}
						else if(replyresults == 4)
						{
							message.message = i18n.__('trip_already_cancel_rejected');
							message.driver_statistics = statistics;
							message.status = 4;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;

						}else if(replyresults == 5)
						{
							try
							{
							message.message = i18n.__('trip_already_confirm');
							message.driver_statistics = statistics;
							message.status = 5;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
							}
							catch(err)
							{
								console.log(err);
							}	

						}else if(replyresults == 6)
						{
							message.message = i18n.__('trip_already_confirm');
							message.driver_statistics = statistics;
							message.status = 6;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;

						}else if(replyresults == 7)
						{
							apimodel.update_cancel_trip_det(q,trip_id,update_request_array).then(function(checkresults){

							message.message = i18n.__('trip_cancel');
							message.driver_statistics = statistics;
							message.status = 7;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
							});

						}else if(replyresults == 8)
						{
							message.message = i18n.__('trip_cancel_timeout');
							message.driver_statistics = statistics;
							message.status = 8;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
						}
					});
				}
				else
				{
					message.message = i18n.__('trip_cancel_timeout');
					message.status = -1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				});
			}
			else
			{
				message.message = i18n.__('invalid_trip');
				message.status = -1;
				deferred.resolve(message);
				deferred.makeNodeResolver()
				message=null;
			}

		});
	}

	return deferred.promise;	
}



function update_driver_reply(q,travel_status,driver_reply,driver_id,taxi_id,company_id,taxi_model,field,flag,trip_id,current_driver_reply)
{
	var deferred = q.defer();
	var update_array = {
					'travel_status' : parseInt(travel_status),
					'driver_reply' : driver_reply,
					'driver_id' : parseInt(driver_id,),
					'taxi_id' : parseInt(taxi_id),
					'company_id' : parseInt(company_id),
					'taxi_model_id' : parseInt(taxi_model),
					'msg_status' : 'R'
				};

		if(driver_reply != 'A')
		{
			update_array.driver_comments = field;
		}

		if(current_driver_reply == '')
		{
			apimodel.update_driver_reply(q,update_array,trip_id).then(function(updateresults){

				if(updateresults.result.nModified == 1)
				{
					if(driver_reply == 'A')
					{
						//1
						message = parseInt(1);
						deferred.resolve(message);
						deferred.makeNodeResolver()
						message=null;
					}
					else if(driver_reply == 'R')
					{
						//2
						message = parseInt(2);
						deferred.resolve(message);
						deferred.makeNodeResolver()
						message=null;
					}
					else if(driver_reply == 'C')
					{
						//3
						message = parseInt(3);
						deferred.resolve(message);
						deferred.makeNodeResolver()
						message=null;
					}
				}
				else
				{
					//4
					message = parseInt(4);
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}

			});
		}
		else
		{
			if(flag ==1)
			{
				var update_array     = {
				'travel_status' : parseInt(9),
				'driver_reply' : driver_reply,
				'driver_comments' : field,
				'msg_status' : 'R'
				}

				apimodel.update_driver_reply(q,update_array,trip_id).then(function(updateresults){

					if(updateresults.result.nModified == 1)
					{
						if(driver_reply == 'R')
						{
							//2
							message = parseInt(2);
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
						}
						else if(driver_reply =='C')
						{
							//3
							message = parseInt(3);
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
						}
					}
					else
					{
						//4
						message = parseInt(4);
						deferred.resolve(message);
						deferred.makeNodeResolver()
						message=null;
					}
				
				});
			}
			else
			{
				if(current_driver_reply == 'A')
				{
					//5
					message = parseInt(5);
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				else if(current_driver_reply == 'R')
				{
					//6
					message = parseInt(6);
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				else if(currenct_driver_reply == 'C')
				{
					//7
					message = parseInt(7);
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				else
				{
					//0
					message = parseInt(0);
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}

			}
		}
		return deferred.promise;

}

function validateDriverReply(q,input)
{
	var constraints = {
		trip_id: {
		presence: {allowEmpty: false,message:"not empty"},
		},			
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
		},			
		taxi_id: {
		presence: {allowEmpty: false,message:"not empty"},
		},			
		company_id: {
		presence: {allowEmpty: false,message:"not empty"},
		},									
		version_no: {
		presence: {allowEmpty: false,message:"not empty"},
		},			
		taxi_model: {
		presence: {allowEmpty: false,message:"not empty"},
		},		
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}

function getCurrentDate(timezone,date_format){

	var now = new time.Date();
	now.setTimezone(timezone);						
	return dateFormat(new Date(now.toLocaleDateString()),"yyyy-mm-dd");			
}

function getStartingDateAndEndingDate(timezone){
	var now = new time.Date();
	now.setTimezone(timezone);							
	start_date=dateFormat(new Date(now.toLocaleDateString()),"yyyy-mm-dd 00:00:00");		
	ending_date=dateFormat(new Date(now.toLocaleDateString()),"yyyy-mm-dd 23:59:59");

	var start_date = new time.Date(start_date, timezone);			
	var ending_date = new time.Date(ending_date, timezone);			
	return [new Date(start_date.toLocaleString()), new Date(ending_date.toLocaleString())]		
}

