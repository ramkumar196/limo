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



//Update Taxi Info
exports.user_logout= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var time_range = getStartingDateAndEndingDate(config.TIMEZONE);

	var validate_error  = validateUserLogout(q,inputParams);

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
		var taxi_no = inputParams.taxi_number;
		var end_km = inputParams.end_km;
		var model_type = inputParams.model_type;
		var feedback = inputParams.feedback;
		var shift_id = inputParams.shiftupdate_id;

		apimodel.driver_info_details(q,userid).then(function(checkresults){

			if(checkresults.length > 0)
			{

				console.log(checkresults);
				var user_status = checkresults[0].status;
				var driver_status = checkresults[0].driver_status;
				var login_status = checkresults[0].login_status;
				var userid = checkresults[0]._id;

				if(user_status == 'B' || user_status == 'T')
				{
					message.message = i18n.__('user_blocked');
					message.status = -7;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}

				if(login_status == 'N')
				{
					message.message = i18n.__('logout_success');
					message.status = 1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
					return false;
				}

				apimodel.taxino_isValid(q,taxi_no).then(function(taxivalidresults){

					if(taxivalidresults.length > 0)
					{
						var current_start_km = taxivalidresults[0].starting_km;
						//var taxi_id = taxivalidresults[0]._id;

						if(end_km > current_start_km)
						{

							apimodel.get_auto_id(q,t.MDB_DRIVER_FEEDBACK).then(function(feedbackresults){

								if(feedbackresults.length > 0)
								{
									var last_insert_id = feedbackresults[0]._id + 1;

									var insertArray = {'_id':parseInt(last_insert_id),
									'driver_id' : parseInt(userid),
									'taxi_id' :parseInt(taxi_id),
									'company_id' :parseInt(1),
									'car_model' : model_type,
									'feedback' : feedback
									};

									apimodel.insert_driver_feedback(q,insertArray).then(function(insertfeedbackresults){
										apimodel.driver_pending_trips(q,userid).then(function(pendingtripresults){

											if(pendingtripresults.length > 0 || driver_status != 'F')
											{
												message.message = i18n.__('driver_in_trip');
												message.status = 0;
												deferred.resolve(message);
												deferred.makeNodeResolver()
												message=null;
											}
											else
											{
												apimodel.ifTaxiReachService(q,end_km).then(function(taxireachresults){
													var km_reach_status = 0;
													var service_id = 0;
													if(taxireachresults.length > 0 )
													{
														km_reach_status = 1;
														service_id = taxireachresults._id;
													}

														var shift_update_array =
														{
						                                    "shift_end" : new Date(),
						                                    "login_end" : new Date(),
						                                    "status" : "Logout",
						                                    "end_km" : end_km,
						                                    "km_reach_status" : parseInt(km_reach_status),
						                                    "taxi_service_id":parseInt(service_id)
														};

														var taxi_update_array = {
															'starting_km':end_km
														};

														var mapping_update_array = {
															'mapping_status':'D'
														};


														var driver_shift_array={
															"shift_status":'OUT',
															'status':'F'
														};


														var people_update_array={
															'login_status':'N',
															'device_token':'',
															'device_type':'',
															'device_id':'',
															"notification_setting" :parseInt(0),
                                    						"notification_status" : parseInt(0)
														};


													try
													{

													apimodel.update_driver_shift(q,driver_shift_array,userid).then(function(taxireachresults){
														apimodel.update_shift_history(q,shift_update_array,shift_id).then(function(taxireachresults){
															apimodel.update_mapping(q,mapping_update_array,userid).then(function(taxireachresults){
																apimodel.update_taxi(q,taxi_update_array,taxi_id).then(function(taxireachresults){
																	apimodel.update_people(q,people_update_array,userid).then(function(taxireachresults){


																		message.message = i18n.__('logout_success');
																		message.status = 1;
																		deferred.resolve(message);
																		deferred.makeNodeResolver()
																		message=null;

																	});
																});
															});
														});
													});

													}
													catch(err)
													{
														message.message = i18n.__('try_again');
														message.status = -1;
														deferred.resolve(message);
														deferred.makeNodeResolver()
														message=null;
													}

												});
											}

										});
									});
								}
							})

						}
						else
						{
							message.message = i18n.__('endkm_sholuld')+" "+current_start_km;
							message.status = -7;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;
						}
					}
					else
					{

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

	return deferred.promise;	
}



function validateUserLogout(q,input)
{
	var constraints = {
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
	 },
	 model_type: {
		presence:{allowEmpty: false,message:"not empty"},

	 },
	 taxi_number: {
		presence: {allowEmpty: false,message:"not empty"},
	 },
	  feedback: {
		presence: {allowEmpty: false,message:"not empty"},
	 },
	  end_km: {
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