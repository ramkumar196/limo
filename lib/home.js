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
var uniqid = require('uniqid');

exports.driver_shift_status= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var time_range = getStartingDateAndEndingDate(config.TIMEZONE);

	var validate_error  = validateDriverShift(q,inputParams);

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
		var userid = inputParams.driver_id;
		var reason = inputParams.reason;

		apimodel.get_driver_status(q,userid).then(function(checkresults){

			if(checkresults.length > 0)
			{
				var login_status = checkresults[0].login_status;
				var user_status = checkresults[0].status;
				var userid = checkresults[0]._id;

				if(user_status == 'B' || user_status == 'T')
				{
					message.message = i18n.__('user_blocked');
					message.status = -7;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}

				if(login_status == 'S')
				{
					var time_range = getStartingDateAndEndingDate(config.TIMEZONE);

					apimodel.driver_taxi_assign(q,userid,time_range).then(function(assignresults){

						if(assignresults.length > 0 )
						{

							var shiftstatus = inputParams.shiftstatus;
							var updateShiftArray = {
								'shiftstatus':shiftstatus,
								'status':'F'
							};

							
							var taxi_id = assignresults[0].taxi_id;
							var taxi_start_km= assignresults[0].starting_km;
							var current_shift_status= assignresults[0].shift_status;
							var current_status= assignresults[0].status;
	
							console.log("here");
							//Shift Condition Start
							if(shiftstatus == 'IN')
							{
								//Shift In Update
								apimodel.update_driver_shift(q,updateShiftArray,userid).then(function(assignresults){
								
									apimodel.get_auto_id(q,t.MDB_SHIFT_HISTORY).then(function(autoidresults){

										if(autoidresults.length > 0 )
										{

											var last_insert_id = autoidresults[0]._id+1;
											var km_reach_status = 0;
											var taxi_service_id = 0;

											apimodel.ifTaxiReachService(q,taxi_start_km).then(function(taxiserviceresults){

												if(taxiserviceresults.length > 0)
												{
													km_reach_status = 1;
													taxi_service_id = taxiserviceresults[0]._id;
												}
											
												 let insertArray = {
			                                            "_id":last_insert_id,
			                                            "driver_shift_id" : parseInt(userid),
			                                            "taxi_id" : taxi_id,
			                                            "shift_start" : new Date(),
			                                            "shift_end" : "",
			                                            "reason" : reason,
			                                            "createdate" : new Date(),
			                                            "start_km" : parseInt(taxi_start_km),
														"end_km" : parseInt(0),
														"km_reach_status" : parseInt(km_reach_status),
														"taxi_service_id" : parseInt(taxi_service_id),
														"service_status" : "D",
														"status" : "Shift IN",
														"driver_id" : parseInt(userid),
			                                        };

		                                       apimodel.insert_shift_history(q,insertArray).then(function(insertresults){

		                                       		message.message = i18n.__('driver_shift');
													message.detail = {'update_id':last_insert_id};
													message.status = 1;
													deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;

		                                       });
		                                   });
										}
										else
										{
											message.message = i18n.__('try_again');
											message.status = -2;
											deferred.resolve(message);
											deferred.makeNodeResolver()
											message=null;
										}

									});
								});

							}
							else
							{
								if(current_status != 'F')
								{
									message.message = i18n.__('trip_in_future');
									message.status = -4;
									deferred.resolve(message);
									deferred.makeNodeResolver()
									message=null;
								}

								apimodel.driver_pending_trips(q,userid).then(function(pendingresults){

									if(pendingresults.length == 0)
									{
										//Shift OUT Update
										updateShiftArray.shift_status = 'OUT';
										var shift_update_id = inputParams.update_id;

										apimodel.update_driver_shift(q,updateShiftArray).then(function(assignresults){

											 let insertArray = {
		    											"shift_end":new Date(),
                               							"status":"Shift OUT",
		                                        };

	                                       apimodel.update_shift_history(q,insertArray,shift_update_id).then(function(insertresults){

	                                       	message.message = i18n.__('driver_shift_out');
											message.status = 1;
											deferred.resolve(message);
											deferred.makeNodeResolver()
											message=null;

	                                       });
				                         
										});
									}
									else
									{
										message.message = i18n.__('trip_in_future');
										message.status = -4;
										deferred.resolve(message);
										deferred.makeNodeResolver()
										message=null;
									}

								});
							}
							//Shift Condition End

						}
						else
						{
							message.message = i18n.__('taxi_not_assigned');
							message.status = -3;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
						}
					});
				}
				else
				{
					message.message = i18n.__('driver_not_login');
					message.status = -1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
			}
			else
			{
				message.message = i18n.__('invalid_user_driver');
				message.status = -1;
				deferred.resolve(message);
				deferred.makeNodeResolver()
				message=null;
			}

		});
	}

	return deferred.promise;	
}


exports.driver_statistics= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var validate_error  = validateDriverStatistics(q,inputParams);

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
		var userid = inputParams.driver_id;
		apimodel.get_driver_status(q,userid).then(function(checkresults){

			if(checkresults.length > 0)
			{
				var login_status = checkresults[0].login_status;
				
console.log('login_status',login_status);
				var userid = checkresults[0]._id;

				if(login_status == 'S')
				{
					apimodel.driver_profile(q,userid).then(function(profileresults){

					if(profileresults.length > 0 )
					{
						var driver_name = profileresults[0].name;
						var statistics = {};

						var time_range = getStartingDateAndEndingDate(config.TIMEZONE);

						apimodel.driver_statistics(q,userid,time_range).then(function(statisticsresults){

							if(statisticsresults.length > 0 )
							{
								var total_waiting_time = 0;

								try
								{
								statistics = statisticsresults[0];

								var time_driver_array = statisticsresults[0].waiting_time;

									time_driver_array.forEach(function(val) {

									 	if(val != '')
									 	{
											var waitingtime = val.split(':');

											if(waitingtime[0] != '' && waitingtime[0] != undefined)
											{
												total_waiting_time += parseInt(waitingtime[0])*60;
											}

											if(waitingtime[1] != '' && waitingtime[0] != undefined)
											{
												total_waiting_time += parseInt(waitingtime[1]);
											}
										}

									});

								statistics.waiting_time = convsecstoformat(total_waiting_time);
								statistics.today_earnings = statisticsresults[0].today_earnings.toFixed(2);
								statistics.time_driven = convsecstoformat(statisticsresults[0].time_driven);
								}
								catch(err)
								{
									console.log('error',err);
								}

								

								message.message = i18n.__('success');
								statistics.driver_name =driver_name;
						 		message.detail = statistics;
						 		message.status = 1;
						 		deferred.resolve(message);
								deferred.makeNodeResolver()
								message=null;
							}
							else
							{
								statistics.driver_name =driver_name;
								statistics.total_trip =0;
								statistics.completed_trip =0;
								statistics.total_earnings =0;
								statistics.overall_rejected_trips =0;
								statistics.cancelled_trips =0;
								statistics.today_earnings =0;
								statistics.shift_status ='IN';
								statistics.time_driven ="00:00";
								statistics.waiting_time ="00:00";
								statistics.status =1;

								message.message = i18n.__('success');
						 		message.detail = statistics;
						 		message.status = 1;
						 		deferred.resolve(message);
								deferred.makeNodeResolver()
								message=null;
							}
						});

					}
					else
					{
						message.message = i18n.__('invalid_user_driver');
						message.status = -1;
						deferred.resolve(message);
						deferred.makeNodeResolver()
						message=null;
					}
					});
				}
				else
				{
					message.message = i18n.__('driver_not_login');
					message.status = -1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
			}
			else
			{
				message.message = i18n.__('invalid_user_driver');
				message.status = -1;
				deferred.resolve(message);
				deferred.makeNodeResolver()
				message=null;
			}

		});
	}

	return deferred.promise;	
}

function validateDriverShift(q,input)
{
	var constraints = {
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
	},		
	shiftstatus: {
		presence: {allowEmpty: false,message:"not empty"},
	}
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}

function validateDriverStatistics(q,input)
{
	var constraints = {
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
		}
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}

function model_image_exists(hostname,val)
{
	try{
	if (fs.existsSync(appRoot+config.MODEL_IMGPATH+val)) {
 		return  hostname+'/'+config.MODEL_IMGPATH.val;
 	}
 	else
 	{
 		return  hostname+'/'+config.NO_IMAGE;
 	}
 	}
 	catch(ex)
 	{
 		console.log('error',ex);
 	}
}


function convsecstoformat(secs)
{
	try
	{
	var hours = secs/3600;
	var minutes = (secs -(hours*3600))/60;
	var seconds = (secs -(hours*3600 + minutes*60));

	hours= zeropadding(hours.toFixed(0));
	minutes = zeropadding(minutes.toFixed(0));
	seconds = zeropadding(seconds.toFixed(0));

	if(hours == '00' && hours == '')
	{
		return minutes+":"+seconds;
	}
	else
	{
		return hours+":"+minutes+":"+seconds;
	}
	}
	catch(err)
	{
		console.log(err);
	}

}

function zeropadding(a)
{
	h = (a < 10) ? ("0" + a) : a;

	return h;
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