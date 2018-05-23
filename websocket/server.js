var socketobj = {};
var q= require('q');
var locationService = require('../lib/driver_location_service');

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
				socketobj[sessiondriver].on('location_update', function(data){
				//console.log(data);

				let  outputData ;

				//outputData.message = 'driver_update'+data.driver_id;
				// outputData.status = 1;

				locationService.updateLocation(q,data).then(function(updateresults){

					console.log('status',data.status);

					if(data.status == 'A')
					{
						locationService.saveLocation(q,data).then(function(results){

						socket.emit("location_update_res",results);

						});
					}
					else
					{
						socket.emit("location_update_res",updateresults);	
					}	

				});

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




