var querystring = require('querystring');
var apimodel = require('../models/apimodel');
var axios = require('axios');
var t=require('../config/table_config.json');


exports.send_sms= function(q,to,id,replace_array){
	var deferred = q.defer();

	apimodel.sms_template(q,id).then(function(detailsresults){

	to = '66310516';


	if(detailsresults.length > 0)
	{
		try
		{
		var msg = detailsresults[0].sms_description;

		if(replace_array.sitename != undefined)
		{
			msg = msg.replace('##SITE_NAME##',replace_array.sitename);
		}

		if(replace_array.taxi_colour != undefined)
		{
			msg= msg.replace('##COLOR##',replace_array.taxi_colour);
		}

		if(replace_array.taxi_manufacturer != undefined)
		{
			msg= msg.replace('##MANUFACTURE##',replace_array.taxi_manufacturer);
		}

		if(replace_array.taxi_no != undefined)
		{
			msg=msg.replace('##NUMBER##',replace_array.taxi_no);
		}

		if(replace_array.trip_id != undefined)
		{
			msg=msg.replace('##booking_key##',replace_array.trip_id);
		}
		}
		catch(err)
		{
			console.log('sms error');
		}

		if(to.indexOf('+') < 0) {	
			to = global.settings.default_country_code+to;
		}
		try
		{
		const postData = querystring.stringify({
			'username':global.settings.smsbox_username,
			'password':global.settings.smsbox_password,
			'customerid':global.settings.smsbox_customerid,
			'sendertext':global.settings.smsbox_senderid,
			'messagebody':msg,
			'recipientnumbers':to,
			'defdate':'',
			'isblink':'false',
			'isflash':'false'
		});

			axios.get('http://www.smsbox.com/smsgateway/services/messaging.asmx/Http_SendSMS?'+postData)
			  .then(response => {
			    console.log(response.data.url);
			    console.log(response.data.explanation);
			  })
			  .catch(error => {
			    console.log(error);
			  });

			deferred.resolve('success');
			deferred.makeNodeResolver()
			response=null;

		}
		catch(err)
		{
			console.log(err);
		}
	}
	})
	

return deferred.promise;


}

exports.hesabe_pay= function(q,passenger_id,amount,hostname){
	var deferred = q.defer();

	var details = {};

	                	console.log('fare009',amount);

	apimodel.knet_details(q).then(function(detailsresults){

		if(detailsresults.length > 0)
		{
			console.log('fare0011');
			try 
			{
			amount = amount.toFixed(3);
       		success_url=hostname+"'knet_wallet_response.html";
        	failure_url=hostname+"/knet_wallet_response.html";
            
       		knet_alias = detailsresults[0].knet_alias;
       		payment_method = detailsresults[0].payment_method;

       		if(payment_method == 'L')
       		{
       			url = "https://www.hesabe.com/authpost";
       		}
       		else
       		{
       			url = "http://demo.hesabe.com/authpost";
       		}

       		console.log(url)

       		var success_url=failure_url="http://35.184.206.12/knet_wallet_response.html";

       		console.log('success url ',success_url);
           
       		var data={
       		MerchantCode:knet_alias,
       		Amount:amount,
       		SuccessUrl:success_url,
       		FailureUrl:failure_url,
       		Variable1:amount,
       		Variable2:parseInt(passenger_id),
       		Method:'1'
       		};
       		}
       		catch(err)
       		{
       			console.log(err);
       		}
       					try
			
			{
			console.log('fare012',url,data);

			axios.post(url,data)
			  .then(response => {

			//console.log(response.data);


				details.response = response.data;
				details.status = 1;
				deferred.resolve(details);
				deferred.makeNodeResolver()
				response=null;

			    //console.log(response.data.explanation);
			  })
			  .catch(error => {
			    console.log('axios',error);
				details.error = error;
				details.status = 0;
				deferred.resolve(details);
				deferred.makeNodeResolver()
				response=null;
			  });
			}
       		catch(err)
       		{
       			console.log(err);
       		}

			
		}
		else
		{
			 details.status = 0;

			deferred.resolve(details);
			deferred.makeNodeResolver()
			response=null;
		}

		});

	
	return deferred.promise;

}


exports.update_cancel_trip_det = function(q,trip_id)
{
	var deferred = q.defer();

	var  table_name = t.MDB_LOGS_CANCELLED;

	apimodel.trip_exists(q,trip_id,table_name).then(function(tripresults){

		if(tripresults.length == 0)
		{
			apimodel.fetch_all_logs(q,trip_id).then(function(fetchresults){

				if(fetchresults.length > 0)
				{
					apimodel.insert_all_logs(q,fetchresults,table_name).then(function(insertresults){

						apimodel.update_moved(q,trip_id).then(function(fetchresults){
						
							var message = {};
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;

						});
					});
				}

			});
		}
	});

	return deferred.promise;
}


exports.update_reject_trip_det = function(q,trip_id)
{
	var deferred = q.defer();

	var  table_name = t.MDB_LOGS_REJECTED;

	apimodel.trip_exists(q,trip_id,table_name).then(function(tripresults){

		if(tripresults.length == 0)
		{
			apimodel.fetch_all_logs(q,trip_id).then(function(fetchresults){

				if(fetchresults > 0)
				{
					apimodel.insert_all_logs(q,fetchresults,table_name).then(function(fetchresults){
						apimodel.update_moved(q,trip_id).then(function(fetchresults){
						
							var message = {};
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;

						});
					});
				}

			});
		}
	});

	return deferred.promise;
}



exports.update_completed_trip_det = function(q,trip_id)
{
	var deferred = q.defer();

	var  table_name = t.MDB_LOGS_COMPLETED;

	apimodel.trip_exists(q,trip_id,table_name).then(function(tripresults){

		if(tripresults.length == 0)
		{
			apimodel.fetch_all_logs(q,trip_id).then(function(fetchresults){

				console.log('fetch_results',fetchresults);
				console.log('fetch_results length',fetchresults.length);

				if(fetchresults.length > 0)
				{
					apimodel.insert_all_logs(q,fetchresults,table_name).then(function(fetchresults){
						apimodel.update_moved(q,trip_id).then(function(fetchresults){
						
							var message = {};
							deferred.resolve(message);
							deferred.makeNodeResolver()
							message=null;

						});
					});
				}

			});
		}
	});

	return deferred.promise;
}


exports.driver_statistics = function(q,userid,time_range)
{
	var deferred = q.defer();

	apimodel.driver_statistics(q,userid,time_range).then(function(statisticsresults){

		var statistics = {};

		if(statisticsresults.length > 0 )
		{
			statistics = statisticsresults[0];
	 		deferred.resolve(statistics);
			deferred.makeNodeResolver()
			message=null;
		}
		else
		{
			statistics.total_trip =0;
			statistics.completed_trip =0;
			statistics.total_earnings =0;
			statistics.overall_rejected_trips =0;
			statistics.cancelled_trips =0;
			statistics.today_earnings =0;
			statistics.shift_status ='IN';
			statistics.time_driven =0;
			statistics.waiting_time =0;
			statistics.status =1;
	 		deferred.resolve(statistics);
			deferred.makeNodeResolver()
			message=null;
		}
	});

	return deferred.promise;
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