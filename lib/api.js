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





exports.getcoreconfig= function(q,req){

	var deferred = q.defer();

	var hostname = req.headers.host; 

	apimodel.getSiteInfo(q).then(function(results){
		var details = {};
		if(results.length > 0 )
		{
			details   =  results[0];
			details.noimage_base= hostname+"/public/images/noimages109.png";
			details.image_base=  hostname+"/pubic/images/";
			details.driver_image = hostname+"/public/uploads/driver_image/";
			details.site_logo = hostname+"/public/uploads/site_logo/logo.png";
			details.sitead_image = '';
			details.fav_icons = favicon;
			details.child_account_types = [];
			details.recent_location = [];

			apimodel.cmsPages(q).then(function(cmsresults){
				//console.log(cmsresults);
				if(cmsresults.length > 0)
				details.cms_pages = cmsresults;


				apimodel.company_model_details(q).then(function(modelresults){

				if(modelresults.length > 0)
				{
				var i=0;
				modelresults.forEach(function(val) {

					 	modelresults[i].model_image_2 = model_image_exists(hostname,val.model_image_2);
					 	modelresults[i].model_image_2 = model_image_exists(hostname,val.model_image_2);
					 	modelresults[i].model_image = model_image_exists(hostname,val.model_image);
					 	modelresults[i].model_image_new = model_image_exists(hostname,val.model_image_new);
					 	modelresults[i].model_fare_image = model_image_exists(hostname,val.model_fare_image);
					 	modelresults[i].model_image_thumb = model_image_exists(hostname,val.model_image_thumb);
					 	modelresults[i].model_image_unfocus = model_image_exists(hostname,val.model_image_unfocus);
					 	modelresults[i].model_image_2 = model_image_exists(hostname,val.model_image_2);

				 	i++;
				});

				details.model_details = modelresults;
				}
				else
				{
				details.model_details =[];
				}

					let message = {'message':"Success",'detail':details,'status':1}
					deferred.resolve(message);
					deferred.makeNodeResolver()
					result=null;

				});

			});

			//console.log(details);
		}

	}); 

	return deferred.promise;	

}

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


exports.driver_profile= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var validate_error  = validateDriverProfile(q,inputParams);

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
		var userid = inputParams.userid;
		apimodel.get_driver_status(q,userid).then(function(checkresults){

			if(checkresults.length > 0)
			{
				var login_status = checkresults[0].login_status;
				var userid = checkresults[0]._id;

				if(login_status == 'S')
				{
					apimodel.driver_profile(q,userid).then(function(profileresults){

					if(profileresults.length > 0 )
					{

						apimodel.get_driver_ratings(q,userid).then(function(ratingresults){

						var avg_rating=0;

							if(ratingresults.length > 0)
							{
								var avg_rating = ratingresults[0].total_rating/ratingresults[0].count;
								avg_rating = avg_rating.toFixed(0);
							}

							message.message = i18n.__('success');
							message.detail = profileresults[0];
							message.detail.total_rating = parseInt(avg_rating);
							message.status = 1;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;

						});
	
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

					apimodel.check_taxi_assign(q,userid).then(function(taxiassignresults){
					apimodel.check_driver_assign(q,taxi_id).then(function(driverassignresults){

						console.log('taxi',taxiassignresults.length);
						console.log('driver',driverassignresults.length);

						if(taxiassignresults.length > 0 && driverassignresults.length > 0 )
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

	                                          apimodel.insert_mapping_taxi(q,taxi_insert_array).then(function(insertresults){

		                                          apimodel.insert_shift_history(q,insertArray).then(function(insertresults){

		                                          	apimodel.driver_profile(q,userid).then(function(profileresults){

		                                          		if(profileresults.length > 0)
		                                          		{
		                                          			var profile_details = {};
		                                          			profile_details.driver_details = profileresults[0];

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


exports.edit_driver_profile= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var validate_error  = validateEditDriverProfile(q,inputParams);

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
		var taxi_km = inputParams.start_km;
		var taxi_id = inputParams.taxi_id;
		var email = inputParams.email;
		var phone = inputParams.phone;
		var password = inputParams.password;
		var lastname = inputParams.lastname;
		var firstname = inputParams.firstname;
		var profile_picture = inputParams.profile_picture;
		
		apimodel.get_driver_status(q,userid).then(function(checkresults){

			if(checkresults.length > 0)
			{
				var login_status = checkresults[0].login_status;
				var userid = checkresults[0]._id;

				if(login_status == 'S')
				{
					try
					{
						//appRoot = ';
						var image_name= uniqid()+"_"+userid+".png";
						var upload_path = appRoot+'/public/uploads/passengers/id_image/';

						let updateArray = {
							'email':email,
							'phone':phone,
							'password':md5(password),
							'lastname':lastname,
							'name':firstname
							};

						fs.writeFile(upload_path+image_name, profile_picture, 'base64', function(err) {

						console.log('image error',err);
							if(err != ''  && err != undefined)
							{
								message.message = i18n.__('image_not_upload');
								message.status = -1;
								deferred.resolve(message);
								deferred.makeNodeResolver()
								message=null;
							}
							else
							{	
								if(profile_picture != '')
								{
									updateArray.profile_picture = image_name;
								}

								apimodel.update_driver_profile(q,updateArray,userid).then(function(drivercheckresults){
									apimodel.update_taxi_km(q,taxi_km,userid).then(function(kmcheckresults){
											message.message = i18n.__('profile_updated');
											message.status = 1;
											deferred.resolve(message);
											deferred.makeNodeResolver()
											message=null;
									})	
								});
							}
						});
					}
					catch(err)
					{
						console.log(err);
					}	
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

exports.update_pass_id_image= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var validate_error  = validatePassIDupload(q,inputParams);

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
		var userid = inputParams.passenger_id;
		var id_image = inputParams.id_image;
		
		apimodel.get_passenger_status(q,userid).then(function(checkresults){

			if(checkresults.length > 0)
			{
					try
					{
						//appRoot = ';
						var image_name= uniqid()+"_"+userid+".png";
						var upload_path = appRoot+'/public/uploads/passengers/id_image/';

						fs.writeFile(upload_path+image_name, id_image, 'base64', function(err) {

						console.log('image error',err);
							if(err != ''  && err != undefined)
							{
								message.message = i18n.__('image_not_upload');
								message.status = -1;
								deferred.resolve(message);
								deferred.makeNodeResolver()
								message=null;
							}
							else
							{	
								let updateArray = {
									'id_image':image_name,
									};

								apimodel.update_passenger_profile(q,updateArray,userid).then(function(drivercheckresults){
											message.message = i18n.__('id_image_success');
											message.status = 1;
											deferred.resolve(message);
											deferred.makeNodeResolver()
											message=null;
								});
							}
						});
					}
					catch(err)
					{
						console.log(err);
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



function validatePassIDupload(q,input)
{
	var constraints = {
		passenger_id: {
		presence: {allowEmpty: false,message:"not empty"},
	},		
	id_image: {
		presence: {allowEmpty: false,message:"not empty"},
	}
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
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

function validateShiftStatus(q,input)
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


function validateEditDriverProfile(q,input)
{
	var constraints = {
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		email: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		phone: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		firstname: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		lastname: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		start_km: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		taxi_id: {
		presence: {allowEmpty: false,message:"not empty"},
		}
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}

function validateDriverProfile(q,input)
{
	var constraints = {
		userid: {
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

	if(hours == 00 && hours == '')
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