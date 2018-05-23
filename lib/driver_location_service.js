var apimodel = require('../models/apimodel');
var q= require('q');
var haversine = require( 'haversine' );
var validate = require("validate.js");
var i18n = require('i18n');


exports.updateLocation = function(q,data)
{
	var deferred = q.defer();

	apimodel.updateLocation(q,data).then(function(results){
        let message = {'message':"Success",'status':1}
        
	 	deferred.resolve(message);
		deferred.makeNodeResolver()
		message=null;

     });

   return deferred.promise;
   
}


exports.saveLocation = function(q,data)
{
	var deferred = q.defer();

	let message  = {message:"",status:0};

	var validate_error  = validateLocationUpdate(q,data);

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
		// try
		// {
		var location_data = [];
		var location  = data.locations;
		var location_array = location.split('|');
		var trip_id  = data.trip_id;
		var driver_id  = data.driver_id;
		var status  = data.status;

		location_array.forEach(function(element) {
			if(element != '')
			{
				var latlang_split = element.split(',');
				var latlng= [];
				latlng[1] = parseFloat(latlang_split[0]);
				latlng[0] = parseFloat(latlang_split[1]);
				location_data.push(latlng);
			}
		});

		apimodel.check_driver_location_update(q,trip_id).then(function(checkresults){

			if(checkresults.length > 0)
			{
				var prev_location = checkresults[0].loc.coordinates;
				var prev_distance = checkresults[0].distance;
				var total_distance = 0;

				var prev_lat_lng = prev_location[prev_location.length-1];
				//getting previous last lat lng
				var pickup = prev_lat_lng;

				var options = {
					unit:'km',
					format:'[lon,lat]'
				};

				location_data.map(function(element)
				{
					if(element != '')
					{
						var drop = element;

						var distance = haversine(pickup,drop,options);

						console.log(distance);

						total_distance += distance;

						pickup = drop;
					}
				});

				//console.log('hereeeeeeeeeee',total_distance);

				total_distance = total_distance+prev_distance;
			

				apimodel.update_distance(q,total_distance,trip_id,status).then(function(lastresults){
					apimodel.update_logs_distance(q,total_distance,trip_id,status).then(function(lastresults){

						//location_data.map(function(element)
						//{
							apimodel.push_driver_location(q,location_data,trip_id).then(function(lastresults){
						
								message.message = i18n.__('driver_history_updated');
								message.status = 1;
								deferred.resolve(message);
								deferred.makeNodeResolver()
								message=null;

							});
						//});
					});
				});
			}
			else
			{
				apimodel.last_driver_location_update(q).then(function(lastresults){

					if(lastresults.length > 0)
					{
						var lastupdate_id = lastresults[0]._id + 1;

						let insertArray ={
						'driver_id':parseInt(driver_id),
						'trip_id':parseInt(trip_id),
						'status':status,
						'distance':0,
						'_id':parseInt(lastupdate_id),
						'createdate':new Date(),
						'loc':{type:"MultiPoint",coordinates:location_datas}
						};

						console.log('insert array',insertArray);

						apimodel.insert_driver_location_update(q,insertArray).then(function(checkresults){

							message.message = i18n.__('driver_history_updated');
							message.status = 1;
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;

						});
					}
				});
			}
		});
	}

	return deferred.promise;
	
	// }
	// catch(err)
	// {
	// 	message.message = i18n.__('driver_history_updated');
	// 	message.status = -1;
	// 	res.type('text/json');
 //    	res.send(message);
	// }	
}

function validateLocationUpdate(q,input)
{
	var constraints = {
		status: {
		presence: {allowEmpty: false,message:"not empty"},
	},
		locations: {
		presence: {allowEmpty: false,message:"not empty"},
	},
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
	}
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}