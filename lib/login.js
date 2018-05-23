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


exports.driver_login= function(q,req){

	//let inputParams = JSON.parse(req.rawBody);
	let inputParams = req.body;

	var deferred = q.defer();

	let message = {
		message:'',
		status:0
	};

	var validate_error  = validateDriverLogin(q,inputParams);

	console.log(validate_error);

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
		apimodel.check_phone_people(q,inputParams).then(function(checkresults){
			var details = {};
			if(checkresults.length > 0 )
			{
				apimodel.driver_login(q,inputParams).then(function(results){

					 if(results.length > 0)
					 {
					 	var user_status = results[0].status;
					 	var login_status = results[0].login_status;
					 	var login_from = results[0].login_from;
					 	var device_token = results[0].device_token;
					 	var device_id = results[0].device_id;
					 	var company_id = results[0].company_id;
					 	var userid = results[0]._id;

					 	if(user_status == 'D')
					 	{
					 		message.message = i18n.__('account_deactivte');
					 		message.status = 0;
					 		deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
					 	}
					 	else if(user_status == 'T')
					 	{
					 		message.message = i18n.__('account_deactivte');
					 		message.status = 0;
					 		deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
					 	}
					 	else if(login_status == 'S' && login_from == 'A' && device_id != inputParams.device_id)
					 	{	
					 		message.message = i18n.__('already_login');
					 		message.status = 0;
					 		deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
					 	}
					 	else if(login_status == 'S' && login_from == 'A' && device_id == inputParams.device_id)
					 	{

							let update_array  = {
							"notification_setting" :1,
							"login_from" : "D",
							"login_status" : "S",
							"device_id" : device_id,
							"device_token" : device_token,
							"device_type" : device_type,
							"notification_status" :1,
							"phone":inputParams.phone,
							};

							apimodel.update_driver_phone(q,update_array,userid).then(function(updatedriver){
					 			//if(updatedriver.length > 0 )
					 			//{
					 				let details = {};
									apimodel.driver_profile(q,userid).then(function(profileresults){

										if(profileresults.length > 0 )
										{
											details.driver_details = {};

											details.driver_details = profileresults[0];

											var taxi_id = profileresults[0].taxi_id;

											if((config.Q8TAXI_ENABLE == 1) && (taxi_id == '' || taxi_id == 0))
											{
												message.message = i18n.__('taxi_not_assigned');
											 	message.status = -1;
												deferred.resolve(message);
												deferred.makeNodeResolver()
												message=null;
											}
										}
										else
										{
											if((config.Q8TAXI_ENABLE == 1))
											{
												message.message = i18n.__('taxi_not_assigned');
											 	message.status = -1;
												deferred.resolve(message);
												deferred.makeNodeResolver()
												message=null;
											}
										}

											var time_range = getStartingDateAndEndingDate(config.TIMEZONE);
											apimodel.driver_statistics(q,userid,time_range).then(function(statisticsresults){

												details.statistics = {};

												if(statisticsresults.length > 0 )
												{
													details.statistics = statisticsresults[0];
													message.message = i18n.__('login_success');
											 		message.detail = details;
											 		message.status = 1;
											 		message.q8taxi_enable = parseInt(config.Q8TAXI_ENABLE);
											 		deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;
												}
												else
												{
													details.statistics.total_trip =0;
													details.statistics.completed_trip =0;
													details.statistics.total_earnings =0;
													details.statistics.overall_rejected_trips =0;
													details.statistics.cancelled_trips =0;
													details.statistics.today_earnings =0;
													details.statistics.shift_status ='IN';
													details.statistics.time_driven =0;
													details.statistics.waiting_time =0;
													details.statistics.status =1;

													message.message = i18n.__('login_success');
											 		message.detail = details;
											 		message.status = 1;
											 		message.q8taxi_enable = parseInt(config.Q8TAXI_ENABLE);
											 		deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;
												}
											});
									});
					 			//}
					 		});
					 	}
					 	else
					 	{
					 		let update_array  = {
							"notification_setting" :1,
							"login_from" : "D",
							"login_status" : "S",
							"device_id" : inputParams.device_id,
							"device_token" : inputParams.device_token,
							"device_type" : inputParams.device_type,
							"notification_status" :1,
							};

							apimodel.update_driver_phone(q,update_array,userid).then(function(updatedriver){
					 			//if(updatedriver.length > 0 )
					 			//{
					 				let details = {};
									apimodel.driver_profile(q,userid).then(function(profileresults){

										if(profileresults.length > 0 )
										{
											details.driver_details = {};

											details.driver_details = profileresults[0];

											var taxi_id = profileresults[0].taxi_id;

											if((config.Q8TAXI_ENABLE == 1) && (taxi_id == '' || taxi_id == 0))
											{
												message.message = i18n.__('taxi_not_assigned');
											 	message.status = -1;
												deferred.resolve(message);
												deferred.makeNodeResolver()
												message=null;
											}
										}
										else
										{
											details.driver_details = {};

											if(config.Q8TAXI_ENABLE == 1)
											{
												message.message = i18n.__('taxi_not_assigned');
											 	message.status = -1;
												deferred.resolve(message);
												deferred.makeNodeResolver()
												message=null;
											}
										}

											var time_range = getStartingDateAndEndingDate(config.TIMEZONE);
											apimodel.driver_statistics(q,userid,time_range).then(function(statisticsresults){

											details.statistics = {};

												if(statisticsresults.length > 0 )
												{
													details.statistics = statisticsresults[0];

													var total_waiting_time = 0;

													try
													{
													details.statistics = statisticsresults[0];

														var time_driver_array = statisticsresults[0].waiting_time;

														 time_driver_array.forEach(function(val) {

														 	if(val != '')
														 	{
																var waitingtime = val.split(':');

																if(waitingtime[0] != '' && waitingtime[0] != undefined)
																{
																	total_waiting_time += parseInt(waitingtime[0]);
																}

																if(waitingtime[1] != '' && waitingtime[0] != undefined)
																{
																	total_waiting_time += parseInt(waitingtime[1]) / 60;
																}
															}

														 });
													

													}
													catch(err)
													{
														console.log('error',err);
													}

													details.statistics.waiting_time = total_waiting_time;
													details.statistics.waiting_time = convsecstoformat(total_waiting_time);
													details.statistics.today_earnings = statisticsresults[0].today_earnings.toFixed(2);
													details.statistics.time_driven = convsecstoformat(statisticsresults[0].time_driven);

													message.message = i18n.__('login_success');
											 		message.detail = details;
											 		message.status = 1;
											 		message.q8taxi_enable = parseInt(config.Q8TAXI_ENABLE);
											 		deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;
												}
												else
												{
													details.statistics.total_trip =0;
													details.statistics.completed_trip =0;
													details.statistics.total_earnings =0;
													details.statistics.overall_rejected_trips =0;
													details.statistics.cancelled_trips =0;
													details.statistics.today_earnings =0;
													details.statistics.shift_status ='IN';
													details.statistics.time_driven ="00:00";
													details.statistics.waiting_time ="00:00";
													details.statistics.status =1;

													message.message = i18n.__('login_success');
											 		message.detail = details;
											 		message.status = 1;
											 		message.q8taxi_enable = parseInt(config.Q8TAXI_ENABLE);
											 		deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;
												}
											});
									});
					 			//}
					 		});
					 	}
					 }
					 else
					 {
					 	message.message = i18n.__('password_failed');
					 	message.status = -1;
						deferred.resolve(message);
						deferred.makeNodeResolver()
						message=null;
					 }

				});
			}
			else
			{	
				message.message= i18n.__('phone_not_exists');
				message.status= 2;
				deferred.resolve(message);
				deferred.makeNodeResolver()
				message=null;			
			}
		});	
	}

	return deferred.promise;
}


exports.taxiqr_scan= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var validate_error  = validateQRscan(q,inputParams);

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
		var code = inputParams.code;
		var tab_device_token = inputParams.tab_device_token;
		apimodel.check_qr_scan(q,code).then(function(checkresults){

			if(checkresults.length > 0)
			{
				var taxi_id = checkresults[0].taxi_id;

				apimodel.tabTokenUpdate(q,taxi_id,tab_device_token).then(function(updateresults){

					apimodel.getVideoURL(q).then(function(siteresults){

						if(siteresults.length > 0)
						{
							var version = siteresults[0].version;
							var video_url= siteresults[0].tab_video;
							message.message = i18n.__('success');
							message.detail = checkresults[0];
							message.version = version;
							message.video_url = video_url;
							message.status = 1;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
						}
						else
						{
							message.message = i18n.__('success');
							message.version = '';
							message.video_url = '';
							message.detail = checkresults[0];
							message.status = 1;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
						}
					});
				});
			}
			else
			{
				message.message = i18n.__('invalid_taxinumber');
				message.status = -1;
				deferred.resolve(message);
				deferred.makeNodeResolver()
				message=null;
			}

		});
	}

	return deferred.promise;	
}

//Update Taxi Info
exports.update_taxi_info= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var time_range = getStartingDateAndEndingDate(config.TIMEZONE);

	var validate_error  = validateTaxiUpdate(q,inputParams);

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
		var taxi_id = inputParams.taxi_id;
		var start_km = inputParams.start_km;

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

					apimodel.check_taxi_assign(q,taxi_id).then(function(taxiassignresults){
					apimodel.check_driver_assign(q,userid).then(function(driverassignresults){

						console.log('taxi',taxiassignresults.length);
						console.log('driver',driverassignresults.length);

						if(taxiassignresults.length > 0 || driverassignresults.length > 0 )
						{
							message.message = i18n.__('selected_taxi_already_assign');
							message.status = -1;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
						}
						else
						{
							apimodel.ifTaxiReachService(q,start_km).then(function(taxiserviceresults){

								apimodel.get_auto_id(q,t.MDB_TAXIMAPPING).then(function(autoidresults){

								apimodel.get_auto_id(q,t.MDB_SHIFT_HISTORY).then(function(shiftautoidresults){

									if(autoidresults.length > 0)
									{
										if(shiftautoidresults.length > 0)
										{	
											var mapping_last_id = autoidresults[0]._id + 1;
											var shift_last_id = shiftautoidresults[0]._id + 1;
											var km_reach_status = 0;
											var taxi_service_id = 0;
											if(taxiserviceresults.length > 0)
											{
												km_reach_status = 1;
												taxi_service_id = taxiserviceresults[0]._id;
											}

											let insertArray ={
                                                '_id' : parseInt(shift_last_id),
                                                'driver_shift_id' : parseInt(userid),
                                                'taxi_id' : parseInt(taxi_id),
                                                'shift_start' : new Date(),
                                                'login_start' : new Date(),
                                                'shift_end' : null,
                                                'reason' : null,
                                                'createdate' : new Date(),
                                                'start_km' : start_km,
                                                'end_km' : parseInt(0),
                                                'km_reach_status' : parseInt(km_reach_status),
                                                'taxi_service_id' : parseInt(taxi_service_id),
                                                'service_status' : 'D',
                                                'status' : 'Login / Shift IN',
                                                'driver_id' : parseInt(userid),
	                                         };


	                                        let taxi_insert_array = {
	                                        	'_id':parseInt(mapping_last_id),
												'mapping_driverid' : parseInt(userid),
												'mapping_taxiid' :parseInt(taxi_id),
												'mapping_companyid' :parseInt(1),
												'mapping_status' :'A',
												'mapping_createdby' :parseInt(userid)
	                                        };

	                                        let shiftupdateArray = {
	                 							'shift_status':'IN',
	                 							'status':'F'
	                                        };

	                                          apimodel.insert_mapping_taxi(q,taxi_insert_array).then(function(insertresults){

		                                          apimodel.insert_shift_history(q,insertArray).then(function(insertresults){
		                                          	
		                                          	apimodel.update_driver_shift(q,shiftupdateArray,userid).then(function(insertresults){

		                                          	apimodel.driver_profile(q,userid).then(function(profileresults){

		                                          		if(profileresults.length > 0)
		                                          		{
		                                          			var profile_details = {};


		                                          			profile_details.driver_details = profileresults[0];
		                                          			profile_details.driver_details.shiftupdate_id = shift_last_id;

			                                          		var time_range = getStartingDateAndEndingDate(config.TIMEZONE);
															apimodel.driver_statistics(q,userid,time_range).then(function(statisticsresults){

																profile_details.statistics = {};


																if(statisticsresults.length > 0 )
																{

																	var total_waiting_time = 0;

																	try
																	{
																	profile_details.statistics = statisticsresults[0];

																		var time_driver_array = statisticsresults[0].waiting_time;

																		 time_driver_array.forEach(function(val) {

																		 	if(val != '')
																		 	{
																				var waitingtime = val.split(':');

																				if(waitingtime[0] != '' && waitingtime[0] != undefined)
																				{
																					total_waiting_time += parseInt(waitingtime[0]);
																				}

																				if(waitingtime[1] != '' && waitingtime[0] != undefined)
																				{
																					total_waiting_time += parseInt(waitingtime[1]) / 60;
																				}
																			}

																		 });
																	

																	}
																	catch(err)
																	{
																		console.log('error',err);
																	}

																	profile_details.statistics.waiting_time = total_waiting_time;
																	profile_details.statistics.waiting_time = convsecstoformat(total_waiting_time);
																	profile_details.statistics.today_earnings = statisticsresults[0].today_earnings.toFixed(2);
																	profile_details.statistics.time_driven = convsecstoformat(statisticsresults[0].time_driven);

																	message.message = i18n.__('driver_info_update');
															 		message.detail = profile_details;
															 		message.status = 1;
															 		deferred.resolve(message);
																	deferred.makeNodeResolver()
																	message=null;
																}
																else
																{
																	profile_details.statistics.total_trip =0;
																	profile_details.statistics.completed_trip =0;
																	profile_details.statistics.total_earnings =0;
																	profile_details.statistics.overall_rejected_trips =0;
																	profile_details.statistics.cancelled_trips =0;
																	profile_details.statistics.today_earnings =0;
																	profile_details.statistics.shift_status ='IN';
																	profile_details.statistics.time_driven ="00:00";
																	profile_details.statistics.waiting_time ="00:00";
																	profile_details.statistics.status =1;

																	message.message = i18n.__('driver_info_update');
															 		message.detail = profile_details;
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
				                                       });
		                                          		
				                                    });
			                                    });
	                                      }
	                                      else
	                                      {
	                                      	message.message = i18n.__('try_again');
									 		message.status = -1;
									 		deferred.resolve(message);
											deferred.makeNodeResolver()
											message=null;
	                                      }
      								}
      								else
	                                {
	                                  	message.message = i18n.__('try_again');
								 		message.status = -1;
								 		deferred.resolve(message);
										deferred.makeNodeResolver()
										message=null;
	                                }
									
								});
								});
							});
						}
						//end already assign check
					});
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

	return deferred.promise;	
}



function validateDriverLogin(q,input)
{
	var constraints = {
		phone: {
		presence: {allowEmpty: false,message:"not empty"},
	},
	password: {
		presence:{allowEmpty: false,message:"not empty"},

	 },
	 driver_code: {
		presence: {allowEmpty: false,message:"not empty"},
	 }
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}

function validateQRscan(q,input)
{
	var constraints = {
		code: {
		presence: {allowEmpty: false,message:"not empty"},
	}
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}


function validateTaxiUpdate(q,input)
{
	var constraints = {
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		taxi_id: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		taxi_number: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		start_km: {
		presence: {allowEmpty: false,message:"not empty"},
		}
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
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