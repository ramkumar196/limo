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
var md5 = require('md5');
var t=require('../config/table_config.json');
var uniqid = require('uniqid');
var path = require('path');
var mime = require('mime');

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

exports.edit_driver_profile= function(q,req){

	var deferred = q.defer();

	let inputParams = req.body;

	console.log(inputParams);
	
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

						var mime_type = base64MimeType(profile_picture);
						if(mime_type == '' || mime_type == undefined)
						{
							mime_type ='png';
						}

						var image_name= uniqid()+"_"+userid+'.'+mime_type;
						var upload_path = appRoot+'/public/uploads/driver_image/';

						let updateArray = {
							'email':email,
							'phone':phone,
							'password':md5(password),
							'org_password':password,
							'lastname':lastname,
							'name':firstname
							};

							profile_picture = profile_picture.replace(/^data:image\/png;base64,/, "");

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
								var current_km= 0;

								apimodel.taxi_details(q,taxi_id).then(function(taxiresults){
									if(taxiresults.length > 0)
									{
										 current_km = taxiresults[0].starting_km;
									
										if(taxi_km >= current_km)
										{
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
										else
										{
											message.message = i18n.__('endkm_sholuld')+" "+current_km;
											message.status = -1;
											deferred.resolve(message);
											deferred.makeNodeResolver()
											message=null;
										}
									}
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

function base64MimeType(encoded) {
  var result = null;

  if (typeof encoded !== 'string') {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
    mime_type = result.split('/');
    result =mime_type[1];
  }

  console.log('mime',result);

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