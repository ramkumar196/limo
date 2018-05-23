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