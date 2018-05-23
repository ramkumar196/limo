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


exports.driver_booking_list= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var hostname = req.headers.host; 

	var validate_error  = validateBookingList(q,inputParams);

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
				
				var details = {};
					apimodel.driver_pending_trips(q,userid).then(function(pendingtripresults){
						apimodel.driver_past_trips(q,userid).then(function(pasttripresults){
							try
							{
							if(pendingtripresults.length > 0)
							{
								var i = 0
								pendingtripresults.forEach(function(element) {
								
									pendingtripresults[i].profile_image = get_passenger_profile(element.passenger_profile_image,hostname);

									i++;
								});
								details.pending_trips = pendingtripresults;
							}
							else
							{
								details.pending_trips =[];
							}

							if(pasttripresults.length > 0)
							{
								var i = 0
								pasttripresults.forEach(function(element) {
								
									pasttripresults[i].payment_type = get_payment_type(element.payment_type);
									pasttripresults[i].distance = element.distance.toFixed(2);
									pasttripresults[i].profile_image = get_passenger_profile(element.passenger_profile_image,hostname);

									i++;
								});
								details.past_trips = pasttripresults;
							}
							else
							{
								details.past_trips =[];
							}

							message.message = i18n.__('success');
							message.details = details;
							message.status = 1;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;	

							}
				catch(err)
				{
					console.log(err);
				}

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


exports.get_trip_detail= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var hostname = req.headers.host; 

	var validate_error  = validateTripDetail(q,inputParams);

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
		var details = {};
		apimodel.get_trip_detail(q,trip_id).then(function(tripdetailresults){

				if(tripdetailresults.length > 0)
				{
					var i = 0
					tripdetailresults.forEach(function(element) {
					
						tripdetailresults[i].payment_type = get_payment_type(element.payment_type);
						tripdetailresults[i].distance = element.distance.toFixed(2);
						tripdetailresults[i].passenger_image = get_passenger_profile(element.passenger_profile_image,hostname);
						tripdetailresults[i].driver_image = get_driver_profile(element.driver_image,hostname);

						i++;
					});
					details = tripdetailresults;
					message.message = i18n.__('success');
					message.details = details;
					message.status = 1;
					deferred.resolve(message);
					deferred.makeNodeResolver()
					message=null;
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

function validateBookingList(q,input)
{
	var constraints = {
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
	},		
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}

function validateTripDetail(q,input)
{
	var constraints = {
		trip_id: {
		presence: {allowEmpty: false,message:"not empty"},
	},		
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

function get_payment_type(payment_type)
{
	var payment_type_msg ='';
	switch(payment_type)
	{
		case 1:
		payment_type_msg = i18n.__('cash_label');
		break;
		case 2:
		payment_type_msg = i18n.__('card_label');
		break;
		case 3:
		payment_type_msg = i18n.__('knet_label');
		break;
		case 6:
		payment_type_msg = i18n.__('wallet_label');
		break;
		default:
		payment_type_msg = i18n.__('cash_label');
		break;
	}

	return payment_type_msg;
}

function get_passenger_profile(profile,hostname)
{
	try{
		if (fs.existsSync(appRoot+'public/uploads/passenger/'+profile)) {
	 		return  hostname+'/'+'public/uploads/passenger/'+profile;
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

function get_driver_profile(profile,hostname)
{
	try{
		if (fs.existsSync(appRoot+'public/uploads/driver_image/'+profile)) {
	 		return  hostname+'/'+'public/uploads/driver_image/'+profile;
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