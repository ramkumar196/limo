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



exports.driver_arrived= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var hostname = req.headers.host; 

	var validate_error  = validateDriverArrived(q,inputParams);

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
		
		apimodel.get_trip_detail(q,trip_id).then(function(detailsresults){

			if(detailsresults.length > 0)
			{	

				var travel_status = detailsresults[0].travel_status;
				var driver_status = detailsresults[0].driver_status;
				var passenger_phone = detailsresults[0].passenger_phone;
				var taxi_no = detailsresults[0].taxi_no;
				var taxi_colour = detailsresults[0].taxi_colour;
				var taxi_manufacturer = detailsresults[0].taxi_manufacturer;
				var driver_id = detailsresults[0].driver_id;

				if(travel_status == 4)
				{
					message.message = i18n.__('trip_cancelled_passenger');
					message.status = -1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				else if(travel_status != 9 || driver_status == 'A')
				{
					message.message = i18n.__('passenger_in_journey');
					message.status = -1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				else
				{
					var update_trip_array = {
 						"travel_status":parseInt(3),
                        "arrived_time":new Date()
                    };

                    var update_shift_array = {
 						"status":'B'
                    };

                    var update_request_array = {
 						"status":parseInt(5)
                    };

					apimodel.update_trip(q,update_trip_array,trip_id).then(function(checkresults){
						apimodel.update_driver_shift(q,update_shift_array,driver_id).then(function(checkresults){
							apimodel.update_request_details(q,update_request_array,trip_id).then(function(checkresults){

								var replace_array = {
									'taxi_colour':taxi_no,
									'taxi_manufacturer':taxi_manufacturer,
									'taxi_no':taxi_no,
									'sitename':global.settings.app_name,
								};
								// common.send_sms(q,passenger_phone,9,replace_array).then(function(checkresults){
								// });

								message.message = i18n.__('driver_arrival_send');
								message.status = 1;
								deferred.resolve(message);
								deferred.makeNodeResolver()
								message=null;
							})
						});
					});

				}

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


exports.start_trip= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var hostname = req.headers.host; 

	var validate_error  = validateStartTrip(q,inputParams);

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
		var latitude = inputParams.latitude;
		var longitude = inputParams.longitude;
		var actual_pickup_location = inputParams.actual_pickup_location;
		
		apimodel.get_trip_detail(q,trip_id).then(function(detailsresults){

			if(detailsresults.length > 0)
			{	

				var travel_status = detailsresults[0].travel_status;
				var driver_status = detailsresults[0].driver_status;
				var drop_latitude = detailsresults[0].drop_latitude;
				var drop_longitude = detailsresults[0].drop_longitude;
				var drop_location = detailsresults[0].drop_location;
				var driver_login_status = detailsresults[0].driver_login_status;

				if(travel_status == 4)
				{
					message.message = i18n.__('trip_cancelled_passenger');
					message.status = -1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				else if(travel_status == 2 || driver_status == 'A')
				{
					message.message = i18n.__('passenger_in_journey');
					message.status = -1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				else if(driver_login_status == 'N')
				{
					message.message = i18n.__('driver_not_login');
					message.status = -1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
				}
				else
				{
					var update_trip_array = {
 						'travel_status' :parseInt(2),
                        'actual_pickup_time' : new Date(),
                        'current_location' : actual_pickup_location,
                        'pickup_latitude' : latitude,
                        'pickup_longitude' : longitude
                    };

                    var update_shift_array = {
 						"status":'A'
                    };

                    var update_request_array = {
 						"status":parseInt(6)
                    };

					apimodel.update_trip(q,update_trip_array,trip_id).then(function(checkresults){
						apimodel.update_driver_shift(q,update_shift_array,driver_id).then(function(checkresults){
							apimodel.update_request_details(q,update_request_array,trip_id).then(function(checkresults){

								var trip_details ={
                                            "pickup_latitude" : latitude,
                                            "pickup_longitude" :longitude,
                                            "pickup_location" : actual_pickup_location,
                                            "drop_latitude" : drop_latitude,
                                            "drop_longitude" : drop_longitude,
                                            "drop_location" : drop_location
                                        };
								message.message = i18n.__('journey_started');
								message.detail = trip_details;
								message.status = 1;
								deferred.resolve(message);
								deferred.makeNodeResolver()
								message=null;
							})
						});
					});

				}

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


function validateDriverArrived(q,input)
{
	var constraints = {
		trip_id: {
		presence: {allowEmpty: false,message:"must not empty"},
		}	
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}

function validateStartTrip(q,input)
{
	var constraints = {
		trip_id: {
		presence: {allowEmpty: false,message:"must not empty"},
		},
		latitude: {
		presence: {allowEmpty: false,message:"must not empty"},
		},	
		longitude: {
		presence: {allowEmpty: false,message:"must not empty"},
		},
		actual_pickup_location: {
		presence: {allowEmpty: false,message:"must not empty"},
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

