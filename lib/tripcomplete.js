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



exports.complete_trip= function(q,req){

	var deferred = q.defer();

	var hostname = req.headers.host; 

	let inputParams = req.body;
	
	let message = {
		message:'',
		status:0
	};

	var hostname = req.headers.host; 

	var validate_error  = validateCompleteTrip(q,inputParams);

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
		var drop_latitude = inputParams.drop_latitude;
		var drop_longitude = inputParams.drop_longitude;
		var drop_location = inputParams.drop_location;
		var input_waiting_hours = inputParams.waiting_hours;
		
		apimodel.get_trip_detail(q,trip_id).then(function(detailsresults){

			if(detailsresults.length > 0)
			{	
				var travel_status = detailsresults[0].travel_status;
				var driver_id = detailsresults[0].driver_id;
				var driver_status = detailsresults[0].driver_status;
				var passenger_id = detailsresults[0].passengers_id;
				var distance = detailsresults[0].distance;
				if(distance == '')
				{
					distance =0;
				}
				var trans_id = detailsresults[0].trans_id;
				var actual_pickup_time = detailsresults[0].actual_pickup_time;
				var current_drop_time = detailsresults[0].drop_time;
				var airport_pickup = detailsresults[0].airport_pickup;
				var taxi_modelid = detailsresults[0].taxi_modelid;
				var airport_type = detailsresults[0].airport_type;
				var arrived_time = detailsresults[0].arrived_time;
				var promocode = detailsresults[0].promocode;
				var passenger_phone = detailsresults[0].passenger_phone;
				var passenger_wallet_amount = detailsresults[0].passenger_wallet_amount;
				var passenger_id = detailsresults[0].passengers_id;
				var vip_user = detailsresults[0].vip_user;
				var model_id = detailsresults[0].taxi_modelid;
				var pickup_location = detailsresults[0].pickup_location;
				//var drop_location = detailsresults[0].drop_location;
				var pickup_latitude = detailsresults[0].pickup_latitude;
				var pickup_longitude = detailsresults[0].pickup_longitude;
				var company_id = detailsresults[0].company_id;
				var tax = global.settings.tax;

				if((travel_status == 1 && trans_id != '' && trans_id != undefined) || (travel_status == 2 && trans_id != '' && trans_id != undefined) || (travel_status == 5 && trans_id != '' && trans_id != undefined) )
				{

					var update_trip_array = {
 						"travel_status":parseInt(1),
 						"driver_reply":'A',
 						"msg_status":'R'
                    };

                    var update_request_array = {
 						"status":parseInt(7)
                    };

					apimodel.update_trip(q,update_trip_array,trip_id).then(function(checkresults){
							apimodel.update_request_details(q,update_request_array,trip_id).then(function(checkresults){
									message.message = i18n.__('trip_fare_and_status_updated');
									message.status = -1;
									deferred.resolve(message);
									deferred.makeNodeResolver()
									message=null;
							});
					});
				}
				else if(travel_status == 2 || travel_status == 5)
				{
					
					console.log("heree0001");
					update_complete_status(q,travel_status,current_drop_time,actual_pickup_time,distance,tax,drop_latitude,drop_longitude,drop_location,input_waiting_hours,trip_id).then(function(completeresults){
						console.log('completeresults',completeresults);
						if(completeresults > 0)
						{
							console.log("heree0002");

							var timeinterval = completeresults;

							var minutes = timeinterval/60;

							var waiting_minutes = 0;

							if(actual_pickup_time != '' && arrived_time != '')
							{
								waiting_minutes = actual_pickup_time.getTime()-arrived_time.getTime();
								waiting_minutes = waiting_minutes/60;
								waiting_hours = waiting_minutes/60;
							}

							if(global.settings.q8taxi_enable == 1)
							{
								waiting_hours  = input_waiting_hours;
							}

							apimodel.model_fare_details(q,model_id).then(function(fareresults){
														console.log("heree0006");

								if(fareresults.length > 0)
								{
									base_fare            = fareresults[0].base_fare;
                                    min_km_range         = fareresults[0].min_km;
                                    min_fare             = fareresults[0].min_fare;
                                    cancellation_fare    = fareresults[0].cancellation_fare;
                                    below_above_km_range = fareresults[0].below_above_km;
                                    below_km             = fareresults[0].below_km;
                                    above_km             = fareresults[0].above_km;
                                    night_charge         = fareresults[0].night_charge;
                                    night_timing_from    = fareresults[0].night_timing_from;
                                    night_timing_to      = fareresults[0].night_timing_to;
                                    night_fare           = fareresults[0].night_fare;
                                    evening_charge       = fareresults[0].evening_charge;
                                    evening_timing_from  = fareresults[0].evening_timing_from;
                                    evening_timing_to    = fareresults[0].evening_timing_to;
                                    evening_fare         = fareresults[0].evening_fare;
                                    waiting_per_hour     = fareresults[0].waiting_time;
                                    minutes_cost         = fareresults[0].minutes_fare;
                                    time                 = fareresults[0].time;
                                    waiting_free         = fareresults[0].waiting_free;
                                    waiting_cost_min     = fareresults[0].waiting_time;
                                    airport_pickup_fare  = fareresults[0].airport_pickup_fare;
                                    airport_drop_fare         = fareresults[0].airport_drop_fare;
                                    nightfare_applicable = 0;
                                    evefare_applicable  = 0;
								}
								else
								{
									base_fare=min_km_range=min_fare=cancellation_fare=below_above_km_range=below_km=above_km=night_charge=night_timing_from =night_timing_to=night_fare=evening_charge=evening_timing_from=evening_timing_to=evening_fare=waiting_per_hour=minutes_cost=minutes_fare=time=waiting_free=corporate_fare=discount_fare=nightfare_applicable=evefare_applicable= airport_drop_fare=airport_pickup_fare=0;
								}

								var total_fare =tripfare=distance_fare=minute_per_time=minutes_fare=waiting_cost=passenger_pending_amt=tax_amount=passenger_discount = corporate_discount =payment_mod_id=advance_payment=driver_edit_status=roundtrip=credit_card_sts=payment_type=gateway_details=nightfare=eveningfare=waiting_cost=wallet_amount_used=0;

								if(airport_pickup == 1)
								{
									if(airport_type == 1)
									{
										total_fare = trip_fare = airport_pickup_fare;
									}
									else
									{
										total_fare = trip_fare = airport_drop_fare;
									}
								}
								else
								{
									if(minutes <= time){
                                        total_fare = base_fare;    
                                    }

                                    if(global.settings.fare_calculation_type ==  1 || global.settings.fare_calculation_type == 3)
                                    {
                                    	if(distance <= min_km)
                                    	{
                                    		total_fare = min_fare;
                                    	}
                                    	else
                                    	{
                                    		if(distance < below_above_km_range)
                                    		{
	                                    		distance_fare = (distance-min_km) * below_km;
	                                    		total_fare = base_fare + distance_fare;
                                    		}
                                    		else
                                    		{
                                    			distance_fare = (distance-min_km) * above_km;
	                                    		total_fare = base_fare + distance_fare;
                                    		}
                                    	}
                                    }

                                     if(global.settings.fare_calculation_type ==  2 || global.settings.fare_calculation_type == 3)
                                    {
                                    	if(minutes > 0 && minutes > time)
                                    	{
                                    		minute_per_time = minutes/time;

                                    		minutes_cost = minute_per_time*minutes_cost;

                                    		total_fare = total_fare + minutes_cost;
                                    	}
                                    }

                                    minutes_traveled = minutes;


                                    if(waiting_minutes > waiting_free)
                                    {
                                    	deduct_minutes = waiting_minutes -waiting_free;

                                    	waiting_cost = deduct_minutes*waiting_cost_min;

                                    	total_fare = total_fare + waiting_cost;

                                    }

                                    waiting_time = waiting_minutes;

                                    trip_fare =total_fare;


                                    if(global.settings.q8taxi_enable == 1)
                                    {
                                    	tax_amount = (tax/100)*total_fare;
                                    	total_fare = total_fare +tax_amount;
                                    }

                                    														console.log("heree0007");

                                    calculate_discount(q,promocode).then(function(fareresults){

                                    	if(fareresults.length > 0)
                                    	{

                                    		var passenger_discount = fareresults.passenger_discount;
                                    		var corporate_discount =fareresults.corporate_discount;

                                    		total_fare = total_fare - passenger_discount;
                                    	}

                                    	if(airport_pickup != 1)
                                    	{
                                    		//evening fare calculation

                                    	}

                                    	if(global.settings.pending_payment_enable == 1)
                                    	{
                                    		if(passenger_wallet_amount < 0)
                                    		{
                                    			passenger_pending_amt = Math.abs(passenger_wallet_amount);
                                    		}
                                    	}

                                    	//sms send
										var replace_array = {
										'sitename':global.settings.app_name
										};
										// common.send_sms(q,passenger_phone,11,replace_array).then(function(checkresults){
										// });

										try
										{

										waiting_time = convsecstoformat(waiting_time*60);
										total_fare = parseFloat(total_fare).toFixed(2);
										trip_fare = parseFloat(trip_fare).toFixed(2);
										waiting_cost = parseFloat(waiting_cost).toFixed(2);
										minutes_fare = parseFloat(minutes_fare).toFixed(2);
										distance = parseFloat(distance).toFixed(2);
										trip_fare = parseFloat(trip_fare).toFixed(2);

										var details         = {
                                            "trip_id" : trip_id,
                                            "pass_id" : passenger_id,
                                            "distance" : distance,
                                            "trip_fare" : parseFloat(trip_fare),
                                            "referdiscount" : 0,
                                            "promo_discount_per" : 0,
                                            "promodiscount_amount" : 0,
                                            "passenger_discount" :  parseFloat(passenger_discount),
                                            "corporate_discount" :  parseFloat(corporate_discount),
                                            "nightfare_applicable" : nightfare_applicable,
                                            "nightfare" : nightfare,
                                            "eveningfare_applicable" : evefare_applicable,
                                            "eveningfare" : eveningfare,
                                            "waiting_time" : waiting_time,
                                            "waiting_cost" : waiting_cost,
                                            "tax_amount" : 0,
                                            "subtotal_fare" : total_fare,
                                            "total_fare" : total_fare,
                                            "gateway_details" : gateway_details,
                                            "pickup" : pickup_location,
                                            "drop" : drop_location,
                                            "pickup_latitude" : pickup_latitude,
                                            "pickup_longitude" : pickup_longitude,
                                            "drop_latitude" : drop_latitude,
                                            "drop_longitude" : drop_longitude,
                                            "company_tax" : tax,
                                            "waiting_per_hour" : waiting_per_hour,
                                            "roundtrip" : roundtrip,
                                            "minutes_traveled" : minutes_traveled,
                                            "minutes_fare" : minutes_fare,
                                            "metric" : 'km',
                                            "credit_card_status" : credit_card_sts,
                                            "wallet_amount_used" : 0,
                                            "payment_type" : payment_type,
                                            "passenger_pending_amt" : passenger_pending_amt,
                                        };



                                    	 var insert_trans_array = {
                                                    "passengers_log_id" :parseInt(trip_id),
                                                    "distance" : distance,
                                                    "actual_distance" : distance,
                                                    "distance_unit" : 'km',
                                                    "tripfare" :trip_fare,
                                                    "fare" : total_fare,
                                                    "tips" : 0,
                                                    "waiting_cost" :waiting_cost,
                                                    "passenger_discount" :passenger_discount,
                                                    "corporate_amount" : corporate_discount,
                                                    "company_tax" : tax_amount,
                                                    "waiting_time" : waiting_time,
                                                    "trip_minutes" : minutes_traveled,
                                                    "minutes_fare" : minutes_fare,
                                                    "remarks" : '-',
                                                    "payment_type" : payment_mod_id,
                                                    "amt" : total_fare,
                                                    "nightfare_applicable" : nightfare_applicable,
                                                    "nightfare" : nightfare,
                                                    "eveningfare_applicable" : evefare_applicable,
                                                    "eveningfare" : eveningfare,
                                                   // "admin_amount" : admin_commission,
                                                   // "company_amount" : company_commission,
                                                    //"trans_packtype" : trans_packtype,
                                                    "payment_basis" : parseInt(0),
                                                    "notify_status" : parseInt(0),
                                                    "advance_payment" : advance_payment,
                                                    "wallet_amount_used" : wallet_amount_used,
                                                    "current_date" : new Date(),
                                                    "driver_edit_status":driver_edit_status
                                                };
                                        var current_time = new Date();
                                    	}
                                        catch(err)
                                        {
                                        	console.log(err);
                                        }

                                        console.log("heree0011");


                                        if((passenger_wallet_amount >= total_fare && passenger_wallet_amount != 0 && passenger_wallet_amount > 0 && global.settings.wallet_enable == 1) || (vip_user == 1 && passenger_wallet_amount >= global.settings.wallet_advance_limit && current_time.getTime() < lateral_end_date.getTime() && global.settings.wallet_enable == 1))
                                        {
                                        	                                        console.log("heree0015");
                                        	                                        try
                                        	                                        {
                                        	var used_wallet_amount = 0;
                                        	total_fare = total_fare;
                                        	used_wallet_amount =total_fare;
                                        	details.wallet_amount_used =total_fare;
                                        	if (vip_user == 1 && passenger_wallet_amount >= global.settings.wallet_advance_limit && passenger_wallet_amount < 0) {
                                                advance_payment = 1;
                                            }

											var admin_commission = (global.settings.admin_commission*total_fare);
											var company_commission = total_fare - admin_commission;
											var trans_packtype ='N';

											insert_trans_array.wallet_amount_used =parseFloat(used_wallet_amount);
											insert_trans_array.fare = used_wallet_amount;
											insert_trans_array.payment_type = parseInt(6);
											insert_trans_array.admin_amount = admin_commission;
                                            insert_trans_array.company_amount =  company_commission;
                                            insert_trans_array.trans_packtype = trans_packtype;


											if(advance_payment == 1)
											{
												insert_trans_array.driver_edit_status = parseInt(3);
												insert_trans_array.advance_payment = parseInt(1);
												
											}
											}

											catch(err)
											{
												console.log(err);
											}

											 apimodel.update_admin_balance(q,admin_commission).then(function(updatetransresults){
											 	console.log("sadfjsgf098");
											 apimodel.update_company_balance(q,company_commission,company_id).then(function(updatetransresults){
											 	console.log("sadfjsgf099");

											 update_transaction(q,insert_trans_array,trip_id).then(function(updatetransresults){

											 	console.log("sadfjsgf100");

													var update_trip_array = {
													"travel_status":parseInt(1)
													};

													var update_shift_array = {
													"status":'F'
													};

													var update_request_array = {
													"status":parseInt(8)
													};

													apimodel.update_trip(q,update_trip_array,trip_id).then(function(checkresults){
														console.log('here0016');
														apimodel.update_driver_shift(q,update_shift_array,driver_id).then(function(checkresults){
															console.log('here0016');

															apimodel.update_request_details(q,update_request_array,trip_id).then(function(checkresults){

																													console.log('here0017');
	
																 if(advance_payment == 1)
				                                                {
				                                                    payment_array ={
				                                                    'add_amt':0,
				                                                    'cash_pay':0,
				                                                    'card_pay':0,
				                                                    'knet_pay':0,
				                                                    'pending_pay':parseFloat(used_wallet_amount),
				                                                    'wallet_pay':0,
				                                                    'fare_note':''
				                                                    }; 
				                                                }
				                                                else
				                                                {
				                                                   payment_array ={
				                                                    'add_amt':0,
				                                                    'cash_pay':0,
				                                                    'card_pay':0,
				                                                    'knet_pay':0,
				                                                    'pending_pay':0,
				                                                    'wallet_pay':parseFloat(used_wallet_amount),
				                                                    'fare_note':''
				                                                    };
				                                                }
																apimodel.update_payentry(q,payment_array,trip_id).then(function(checkresults){

																	try 
																	{
console.log('herer020');
																	update_wallet_logs(q,passenger_id,used_wallet_amount,1,trip_id,4).then(function(checkresults){
console.log('herer025');

																		detail           = {
																		"fare" : total_fare,
																		"pickup" : pickup_location,
																		"jobreferral" : trip_id,
																		"trip_id" : trip_id
																		};
																		message.message = i18n.__('fare_update_wallet');
																		message.status = details;
																		message.status = 5;
																		deferred.resolve(message);
																		deferred.makeNodeResolver()
																		message=null;

																	});
																}
																catch(err)
																{
																	console.log(err);
																}
																});
															})
														})
													})

												 });
											 });
											 });

                                        }
                                        else if(passenger_wallet_amount != 0 && passenger_wallet_amount > 0 &&  global.settings.wallet_enable == 1)
                                        {
                                        	
                                        	used_wallet_amount = passenger_wallet_amount; 
                                            remaining_amount = total_fare - passenger_wallet_amount; 
                                            total_fare    = remaining_amount.toFixed(2);
                                            subtotal_fare = remaining_amount; 
                                            details.total_fare=total_fare; 
                                            details.subtotal_fare=subtotal_fare; 
                                            details.wallet_amount_used=used_wallet_amount;
                                            apimodel.gateway_details(q).then(function(fareresults){

											if(fareresults.length > 0)
											{
												i=0;
												 fareresults.forEach(function(val) {
												 	var pay_mode_name = val.pay_mod_name;
												 	pay_mode_name= pay_mode_name.replace('_','').toLowerCase();
												 	fareresults[i]['image_normal'] =  hostname+'/'+'public/image/'+pay_mode_name+'_normal.png';
												 	fareresults[i]['image_active'] = hostname+'/'+'public/image/'+pay_mode_name+'_active.png';
												 });
												 details.gateway_details = fareresults;

											}
											else
											{
												details.gateway_details =[]
											}


                                            if(travel_status != 5)
                                            {
		                                         	apimodel.insert_trip_pay_details(q,details).then(function(checkresults){
		                                            message.message = i18n.__('trip_completed_driver');
													message.details = details;
													message.status = 4;
													deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;

													});
	                                        	}
												else
												{
													message.message = i18n.__('trip_completed_driver');
													message.details = details;
													message.status = 4;
													deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;	
												}
											});
                                        }
                                        else
                                        {

                                            apimodel.gateway_details(q).then(function(fareresults){

											i=0;
											fareresults.forEach(function(val) {
											var pay_mode_name = val.pay_mod_name;
											pay_mode_name= pay_mode_name.replace('_','').toLowerCase();
											fareresults[i]['image_normal'] =  hostname+'/'+'public/image/'+pay_mode_name+'_normal.png';;
											fareresults[i]['image_active'] = hostname+'/'+'public/image/'+pay_mode_name+'_active.png';;
											});
											details.gateway_details = fareresults;


                                            if(travel_status != 5)
                                            {
		                                         	apimodel.insert_trip_pay_details(q,details).then(function(checkresults){
		                                            message.message = i18n.__('trip_completed_driver');
													message.details = details;
													message.status = 4;
													deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;

													});
	                                        	}
												else
												{
													message.message = i18n.__('trip_completed_driver');
													message.details = details;
													message.status = 4;
													deferred.resolve(message);
													deferred.makeNodeResolver()
													message=null;	
												}
											});
                                        }

                                    });

								}
							});
						}

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

function validateCompleteTrip(q,input)
{
	//{"trip_id":"105693","drop_latitude":"29.3053256","drop_longitude":"47.9668757","drop_location":"Block%203%2C%20Kuwait%2C%20null%2C%20null","distance":"","actual_distance":"","waiting_hour":""}

	var constraints = {
		trip_id: {
		presence: {allowEmpty: false,message:"must not empty"},
		},
		drop_latitude: {
		presence: {allowEmpty: false,message:"must not empty"},
		},	
		drop_longitude: {
		presence: {allowEmpty: false,message:"must not empty"},
		},
		drop_location: {
		presence: {allowEmpty: false,message:"must not empty"},
		},	
		// actual_distance: {
		// presence: {allowEmpty: false,message:"must not empty"},
		// },	
		waiting_hour: {
		presence: {allowEmpty: false,message:"must not empty"},
		},	
	};
	validate.options = {format: "flat"};
	var result = validate(input, constraints);
	return result;
}


function update_complete_status(q,travel_status,drop_time,actual_pickup_time,total_distance,tax,drop_latitude,drop_longitude,drop_location,waiting_hours,trip_id)
{
	var deferred = q.defer();

	console.log("heeere003");

	if(travel_status != 5)
	{
		try
		{
			var update_trip_array = {
			"travel_status":parseInt(5),
			"driver_reply":'A',
			"msg_status":'R',
            'drop_latitude' : drop_latitude,
            'drop_longitude' : drop_longitude,
            'drop_location' : drop_location,
			'distance' : total_distance,
            'drop_time' : new Date(),
            'waitingtime' : waiting_hours,
            'company_tax' : tax
		};

	    var update_request_array = {
				"status":parseInt(7)
	    };

	    var drop_time = new Date();

	    console.log(drop_time);
		apimodel.update_trip(q,update_trip_array,trip_id).then(function(checkresults){
			apimodel.update_request_details(q,update_request_array,trip_id).then(function(checkresults){

				var time_interval = drop_time.getTime() - actual_pickup_time.getTime();

				deferred.resolve(time_interval);
				deferred.makeNodeResolver()
				time_interval=null;

			});
		});
		}
		catch(err)
		{
			console.log(err);
		}
	}
	else
	{
		console.log("heeere004");
		try 
		{
		var time_interval = drop_time.getTime() - actual_pickup_time.getTime();
		deferred.resolve(time_interval);
		deferred.makeNodeResolver()
		time_interval=null;
		}
		catch(err)
		{
			console.log(err);
		}

	}

	return deferred.promise;	

}

function calculate_discount(q,promocode,total_fare)
{
	var deferred = q.defer();

	var details = {};

	if(promocode == '')
	{
		details.passenger_discount = 0;
		details.corporate_discount = 0;
		deferred.resolve(details);
		deferred.makeNodeResolver()
		time_interval=null;
	}

	apimodel.get_promocode_details(q,promocode).then(function(promocoderesults){

		if(promocoderesults.length > 0)
		{
			var package = promocoderesults[0].package;
			var promo_limit = promocoderesults[0].promo_limit;
			var total_applied = promocoderesults[0].total_applied;

			apimodel.get_promocode_details(q,package).then(function(packageresults){

				if(packageresults.length > 0)
				{
					var passenger_commission = packageresults[0].passenger_commission;
					var corporate_commission = packageresults[0].corporate_commission;


					if(total_applied < promo_limit)
					{
						var passenger_discount = total_fare * passenger_commission; 
						var corporate_discount = total_fare * corporate_commission; 

						details.passenger_discount = passenger_discount;
						details.corporate_discount = corporate_discount;
						deferred.resolve(details);
						deferred.makeNodeResolver()
						time_interval=null;


					}
					else
					{
						details.passenger_discount = 0;
						details.corporate_discount = 0;
						deferred.resolve(details);
						deferred.makeNodeResolver()
						time_interval=null;
					}
				}
				else
				{
					details.passenger_discount = 0;
					details.corporate_discount = 0;
					deferred.resolve(details);
					deferred.makeNodeResolver()
					time_interval=null;
				}


			});
		}
		else
		{
			details.passenger_discount = 0;
			details.corporate_discount = 0;
			deferred.resolve(details);
			deferred.makeNodeResolver()
			time_interval=null;
		}
	});

	return deferred.promise;	
}

function update_transaction(q,update_array,trip_id)
{
	var deferred = q.defer();

	var details ={};

		apimodel.get_auto_id(q,t.MDB_TRANS).then(function(autoidresults){

			if(autoidresults.length > 0)
			{
				var last_insert_id = autoidresults[0]._id+1;

				update_array._id = last_insert_id;

				apimodel.check_trans_exists(q,trip_id).then(function(transresults){

					if(transresults.length > 0)
					{
						apimodel.update_transaction(q,update_array,trip_id).then(function(updateresults){
							details.status = 1;
							deferred.resolve(details);
							deferred.makeNodeResolver()
							time_interval=null;
						});
					}
					else
					{
						apimodel.insert_transaction(q,update_array,trip_id).then(function(updateresults){
							details.status = 1;
							deferred.resolve(details);
							deferred.makeNodeResolver()
							time_interval=null;
						});
					}
				});
			}
			else
			{
				details.status = 0;
				deferred.resolve(details);
				deferred.makeNodeResolver()
				time_interval=null;
			}

		});

	return deferred.promise;	
}


function update_wallet_logs(q,passenger_id,add_amt,negative,trip_id,recharge_type)
{
	var deferred = q.defer();

	var details ={};

console.log('herer021');

console.log('passenger_id',passenger_id);

	apimodel.get_passenger_details(q,passenger_id).then(function(detailresults){

console.log('detailresults',detailresults.length);

		if(detailresults.length > 0)
		{
			try 
			{
			var current_wallet_amount = detailresults[0].wallet_amount;
			var update_wallet_amt = 0; 
			var additional_amt = 0; 

			if(negative == 1)
			{
				update_wallet_amt = current_wallet_amount -add_amt;
				additional_amt = -add_amt;
			}
			else
			{
				update_wallet_amt = current_wallet_amount -add_amt;
				additional_amt = add_amt;
			}

			var updateArray = {

				'wallet_amount':parseFloat(update_wallet_amt),
				'last_wallet_update':new Date()

			};
			}
			catch(err)
			{
				console.log(err);

			}
console.log('herer022');

			apimodel.update_passenger(q,updateArray,passenger_id).then(function(detailresults){

				console.log('herer023');


				if(recharge_type == '')
					{
						recharge_type = 4;
					}

					var insert_array      = {
		            "passenger_id":parseInt(passenger_id),
		            "change_amount":parseFloat(add_amt),
		            "wallet_amount":parseFloat(update_wallet_amt),
		            "created_date" : new Date(),
		            "created_by" : parseInt(passenger_id),
		            "recharge_type" :parseInt(recharge_type),
		            "trip_id" :parseInt(trip_id),
		            "paid_status" :parseInt(1),
		            };

				apimodel.insert_wallet_logs(q,insert_array).then(function(detailresults){
console.log('herer024');

					details.status = 1;
					deferred.resolve(details);
					deferred.makeNodeResolver()
					time_interval=null;

					
	        	});
        	});
		}
		else
		{
			details.status = 0;
			deferred.resolve(details);
			deferred.makeNodeResolver()
			time_interval=null;
		}

	})
	return deferred.promise;	
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

