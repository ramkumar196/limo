var socketobj = {};
var q= require('q');
var locationService = require('../lib/driver_location_service');
var validate = require("validate.js");
var i18n = require('i18n');



module.exports = function(io)
{
	// Emit welcome message on connection
	io.on('connection', function(socket)
	{
		console.log( socket.id + ' - connected..' );

		//console.log( socket);
		var sessiondriver= (socket.handshake.query.driverid != undefined)?socket.handshake.query.driverid:5;
		socketobj[sessiondriver] = socket;
		//console.log(sessiondriver);

				var message ={};

				socket.on('driver_logout_admin', function(data){

					console.log('driver_logout_admin')

					message.message = i18n.__('driver_logout_via_admin');
					message.status = 15;

					socketobj[data].emit('location_update_res',message);
				});

				socket.on('refresh_driver', function(data){

					console.log('refresh_driver'+data)

					message.message = i18n.__('refresh_driver');
					message.status = 18;

					socketobj[data].emit('refresh_driver',message);
				});

				socketobj[sessiondriver].on('location_update', function(data){

				var validate_error  = validateLocationUpdate(q,data);


				if(validate_error != undefined)
				{
					if(validate_error[0])
					{
						message.message = validate_error[0];
						message.status = -1;

						//console.log(message);
						socketobj[sessiondriver].emit("location_update_res",message);

					}
					else
					{
						message.message = i18n.__('validation_error');
						message.status = -1;
						socketobj[sessiondriver].emit("location_update_res",message);

					}
				}
				else
				{

					let  outputData ;

				//outputData.message = 'driver_update'+data.driver_id;
				// outputData.status = 1;


						message.message = i18n.__('location_updated');
						message.status = 1;

					locationService.check_trip_request(q,data).then(function(checkresults){

							console.log('checkresults',checkresults);

							var status = checkresults.status;

							console.log('checkresults status',status);

							if(status == 1)
							{
								var details = checkresults.details;
								message.message = i18n.__('api_request_confirmed_passenger');
								message.status = 5;
								message.details = details;
								//console.log(message);
								//socket.emit("location_update_res",message);
							}
							else if(status == 20)
							{
								var details = checkresults.details;
								message.message = i18n.__('dispatcher_trip_cancelled');
								message.status = 10;
								message.details = details;
								//console.log(message);
								//socket.emit("location_update_res",message);
							}
							else if(status == 4)
							{
								var details = checkresults.details;
								message.message = i18n.__('passenger_trip_cancelled');
								message.status = 7;
								message.details = details;
								//console.log(message);
								//socket.emit("location_update_res",message);
							}
							else
							{
								message.message = i18n.__('location_updated');
								message.status = 1;
								message.details = [];
							}

						locationService.updateLocation(q,data).then(function(updateresults){
							try
							{
							console.log('status',data.status);

							if(data.status == 'A')
							{
								locationService.saveLocation(q,data).then(function(results){
								console.log(message);
								message.distance = 0;
								message.runningtime = '00:00:00';
								socketobj[sessiondriver].emit("location_update_res",message);

								});
							}
							else
							{
								console.log(message);
								socketobj[sessiondriver].emit("location_update_res",message);	
							}
							}
							catch(err)
							{
								console.log(err);
							}	

						});
					});
				}

			});

		socketobj[sessiondriver].on('connect', function(event)
		{
			console.log(event);
		});

		socketobj[sessiondriver].removeAllListeners('connect');


		// //Sending Data to users on connect
		// socketobj[sessiondriver].emit(
		// 				'broadcast_data',
		// 				{
		// 					message: 'Welcome!',
		// 					id: socket.id
		// 				}
		// 			);

		socketobj[sessiondriver].on('error', function(error)
		{
			console.log( 'Error - ' + JSON.stringify(error) );
		});

		socketobj[sessiondriver].on('disconnect', function(event_name)
		{
			console.log( 'Disconnected.. - ' + socket.id );
			//console.log( event_name );
		});
	});
}


function validateLocationUpdate(q,input)
{
	var constraints = {
		driver_id: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		status: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		bearing: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		accuracy: {
		presence: {allowEmpty: false,message:"not empty"},
		},
		locations: {
		presence: {allowEmpty: false,message:"not empty"},
		}
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}




