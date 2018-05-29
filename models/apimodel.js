var db = require('../config/dbconnection');
var t=require('../config/table_config.json');
var md5 = require('md5');

exports.getSiteInfo= function(q){	
	
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_SITEINFO);
	 arguments = [
		 //{
		// 	'$match': {
		// 		'companyinfo.company_api_key':key,
		// 		'companydetails.company_status':'A',
		// 	},
		// },
		{
			'$lookup':{
                    'from': t.MDB_CSC,
                    'localField': 'site_country',
                    'foreignField':'_id',
                    'as':'csc',
             },
         },
         {'$unwind':'$csc'},
		 {
			'$project':{
				'app_name':'$app_name',
				'customer_support':'$phone_number',
				'site_country':'$csc.country_name',
				'currency_symbol':'$csc.currency_symbol',
				'currency_code':'$csc.currency_code',
				'aboutpage_description_ar':'$aboutpage_description_ar',
				'aboutpage_description':'$aboutpage_description',
				'admin_email':'$admin_email',
				'skip_credit':{ $ifNull : ['$skip_credit',0]},
				'book_later_interval': { $ifNull : ['$book_later_interval',0]},
				'book_now_interval': { $ifNull : ['$book_now_interval',0]},
				'airport_trip_interval': { $ifNull : ['$airport_trip_interval',0]},
				'repeat_trip_interval':{ $ifNull : ['$repeat_trip_interval',0]},
				'airport_pick_up':{ $ifNull : ['$airport_pick_up',0]},
				'airport_drop':{ $ifNull : ['$airport_drop',0]},
				'default_country_code': { $ifNull : ['$csc.country_code',0]},
				'cancellation_setting': { $ifNull : ['$cancellation_setting',0]},
				'facebook_share':{ $ifNull : ['$facebook_share',0]},
				'twitter_share':{ $ifNull : ['$twitter_share',0]},
				'instagram_share':{ $ifNull : ['$instagram_share',0]},
				'facebook_key': { $ifNull : ["$facebook_key",0]},
				'version_code':{ $ifNull : ['$version_code',0]},
				'version_name': { $ifNull : ["$version_name",0]},
				'is_mandatory_update': { $ifNull : ['$is_mandatory_update',0]},
			}
		},
	];

	 collection.aggregate(arguments).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;

	  });

	 return deferred.promise;

	 return deferred.promise;	

}

exports.cmsPages= function(q){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_CMS);
	 arguments = [
		{
			'$match': {
				'content_status':{'$eq':1}
				},
		},
		{
			'$project':{
				'id':'$_id',
                'menu_name':'$menu_name',
                'menu_link':'$menu_link'
			}
		},
	];

	//console.log(arguments);
	 collection.aggregate(arguments).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
	}



   exports.company_model_details= function(q){
	var deferred = q.defer();	
	var collection = db.get().collection(t.MDB_MOTOR_MODEL);
	var arguments = [
		{
		'$project':{
				'model_id' : '$_id',
				'model_name' : '$model_name',
				'model_name_ar' : '$model_name_ar',
				'category_name' : '$category_name',
				'model_size' : '$model_size',
				'max_luggage' : '$max_luggage',
		        'model_image' : '$model_image',
				'model_image_new' : '$model_image_new',
		        'model_image_unfocus' : '$model_image_unfocus',
				'iconic_image' : '$iconic_image',
				'model_image_thumb' : '$model_image_thumb',
		        'model_image_unfocus_thumb' : '$model_image_unfocus_thumb',
				'iconic_image_thumb' : '$iconic_image_thumb',
				'base_fare' : '$minutes_fare',
				'min_fare' : '$base_fare',
				'base_mins' : '$time',
		        'waiting_cost_per_hour' : '$waiting_time',
		        'airport_pickup_fare' : '$airport_pickup_fare',
				'airport_drop_fare' : '$airport_drop_fare',
				'waiting_free' : '$waiting_free',
				//'min_fare' : '$min_fare',
				//'min_km' : '$min_km',
				//'below_above_km' : '$below_above_km',
				//'below_km' : '$below_km',
				//'above_km' : '$above_km',
				//'cancellation_fare' : '$cancellation_fare',
				'night_charge' : '$night_charge',
				'night_timing_from' : '$night_timing_from',
				'night_timing_to' : '$night_timing_to',
				'night_fare' : '$night_fare',
				'evening_charge' : '$evening_charge',
				'evening_timing_from' : '$evening_timing_from',
				'night_fare' : '$night_fare',
				'evening_charge' : '$evening_charge',
				'evening_timing_from' : '$evening_timing_from',
				'evening_timing_to' : '$evening_timing_to',
				'evening_fare' : '$evening_fare',
				'priority' : '$priority',
		        'model_image_2':'$model_image_2',
		        'model_fare_image':'$model_fare_image'
            }
        }];

         collection.aggregate(arguments).toArray(function(err, results) {	
			//console.log('err',result);			
	    	deferred.resolve(results);
			deferred.makeNodeResolver()
			results=null;		
		});
		return deferred.promise;
	}

exports.getCompanyKey= function(q,key){	
	
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_COMPANY);
	 arguments = [
		{
			'$match': {
				'companyinfo.company_api_key':key,
				'companydetails.company_status':'A',
			},
		},
		{
			'$project':{
				'company_cid':'$_id',
                'company_currency':'$companyinfo.company_currency',
                'company_app_description':'$companyinfo.company_app_description'
			}
		},
	];

	 collection.aggregate(arguments).toArray(function(err, results) {
		//console.log('results',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;

	  });

	 return deferred.promise;	

}

exports.updateLocation = function(q,logData)
{

	var d = q.defer();

	var collection = db.get().collection(t.MDB_DRIVER_INFO);

	var locationdata= logData.locations;
	//locationdata.split('')
	var update_array={};

	if(locationdata != undefined)
	{

		locations = locationdata.split('|');
		var arrlen = locations.length-1; 
		if(locations[arrlen]  != '')
		{
			var locs = locations[arrlen].split(',');
			 logData.latitude = locs[0];
			 logData.longitude = locs[1];
		}
		else
		{
			var locs = locations[arrlen-1].split(',');
			 logData.latitude = locs[0];
			 logData.longitude = locs[1];
		}
			
	
	//if(logData.longitude != '' && logData.latitude != '')
	//{
		let loc={};
		loc.type="Point"
		loc.coordinates=[parseFloat(logData.longitude),parseFloat(logData.latitude)];

	//}

		
	update_array.status = logData.status;
	update_array.update_date = new Date();
	update_array.loc = loc;

	collection.update({_id:parseInt(logData.driver_id)},{'$set':update_array},{'$upsert':false},function(err,data){
	//	console.log('err',err);
		d.resolve(data);
		data=null;	
		
	});
	
	}
	return d.promise;

	
}

exports.check_phone_people= function(q,data){
	var deferred = q.defer();

	let match_array = {
	"phone":data.phone, 
	"user_type":'D', 
	//"company_id":data.company_id
	};

	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.find(match_array).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.driver_login= function(q,data){
	var deferred = q.defer();

	let match_array = {
	"phone":data.phone, 
	"password":md5(data.password), 
	"user_type":'D', 
	//"company_id":data.company_id
	};

	if(global.settings.q8taxi_enable == 0)
	{
		match_array.driver_code = data.driver_code 
	}

	let project = {
		"status":1,
		"login_status":1,
		"login_from":1,
		"device_token":1,
		"device_id":1,					
		"company_id":1,											
		"_id":1
	};

	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.find(match_array,project).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.driver_profile= function(q,userid){
	var deferred = q.defer();
	let arguments = [
						{'$match':{
							'_id':userid,
							'user_type':"D",
							//'taxi_driver_mapping.mapping_status':'A'
						}},
						{'$lookup':{
							'from':t.MDB_COMPANY,
							'localField':"company_id",
							'foreignField':"_id",
							 'as':"company"        
						}},
						{'$unwind':'$company'},
						
						{'$lookup':{
							'from':t.MDB_TAXIMAPPING,
							'localField':"_id",
							'foreignField':"mapping_driverid",
							 'as':"taxi_driver_mapping"        
						}},
						{'$unwind':{ 
							"path": "$taxi_driver_mapping",
           					"preserveNullAndEmptyArrays": true
           				}},
      					//{'$match':{
						// 	"taxi_driver_mapping.mapping_status":"A"   
						// }},
						{'$lookup':{
							'from':t.MDB_TAXI,
							'localField':"taxi_driver_mapping.mapping_taxiid",
							'foreignField':"_id",
							 'as':"taxi"        
						}},
						{'$unwind':{ 
							"path": "$taxi",
           					"preserveNullAndEmptyArrays": true
           				}},
						{'$lookup':{
							'from':t.MDB_MOTOR_MODEL,
							'localField':"taxi.taxi_model",
							'foreignField':"_id",
							 'as':"motor_model"        
						}},
						{'$unwind':{ 
							"path": "$motor_model",
           					"preserveNullAndEmptyArrays": true
           				}},
           				{'$lookup':{
							'from':t.MDB_DRIVER_INFO,
							'localField':"taxi_driver_mapping.mapping_driverid",
							'foreignField':"_id",
							 'as':"driverinfo"        
						}},
						{'$unwind':{ 
							"path": "$driverinfo",
           					"preserveNullAndEmptyArrays": true
           				}},
						{'$project' : {
							//'salutation' : '$salutation',
							'name' : '$name',
							'driver_code' : '$driver_code',
							'company_address' : '$company.companydetails.company_address',
							//'name' : '$name',
							'lastname' : '$lastname',
							'email' : '$email',
							'phone' : '$phone',
							'userid' : '$_id',
							'address' : '$address',
							'password' : '$org_password',
							'otp' : '$otp',
							'photo' : '$photo',
							'starting_km' : { $ifNull : ['$taxi.starting_km','']},
							'device_type' : '$device_type',
							'device_token' : '$device_token',
							'login_status' : '$login_status',
							'user_type' : '$user_type',
							'driver_referral_code' : '$driver_referral_code',
							'notification_setting' : '$notification_setting',
							'company_id' : '$company_id',
							'driver_license_id' : '$driver_license_id',
							'profile_picture':'$profile_picture',
							'driver_status':'$driverinfo.status',
							'shift_status':'$driverinfo.shift_status',
							'bankname':'$company.companydetails.bankname',
							'bankaccount_no':'$company.companydetails.bankaccount_no',
							'company_ownerid':'$company.companydetails.userid',
							'taxi_no':{ $ifNull : ['$taxi.taxi_no','']},
							'taxi_id':{ $ifNull : ['$taxi._id','']},
							//'mapping_startdate':'$taxi_driver_mapping.mapping_startdate',
							//'mapping_enddate':'$taxi_driver_mapping.mapping_enddate',
							'model_name':{ $ifNull : ['$motor_model.model_name','']},							
						}}					
					];

	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('profile err',err);
		//console.log('profile res',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.update_driver_phone= function(q,updateArray,userid){
	var deferred = q.defer();

	let match_array = {
		'_id':userid,
	};
	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.update(match_array,{'$set':updateArray},function(err, results) {
		console.log('err',err);
	 	deferred.resolve('Updated Successfully');
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.driver_statistics = function(q,driver_id,time_range)
{
	var deferred = q.defer();
		let arguments=[
					{'$match':
					        {'driver_id':driver_id,
					        // 'actual_pickup_time':{'$gte':time_range[0],'$lte':time_range[1]}
					    	}
					},
					{
						'$lookup':{
						'from':t.MDB_TRANS,
						'localField':"_id",
						'foreignField':"passengers_log_id",
						'as':"trans"        
						}
					},
					{'$unwind' : {'path' : '$trans', 'preserveNullAndEmptyArrays' : true }},
					{					
				        '$project':
				        {
					        "fare":  {'$cond': { 'if': { '$eq': [ "$travel_status", 1 ] }, 'then': {'$sum':['$trans.fare','$trans.wallet_used_amount','$trans.add_amt','$trans.passenger_pending_amt']}, 'else':0 }},
					        "completed":  {'$cond': { 'if': { '$eq': [ "$travel_status", 1 ] }, 'then': 1, 'else':0 }},
					        "cancelled":  {'$cond': { 'if': { '$eq': [ "$travel_status", 4 ] }, 'then': 1, 'else':0 }} ,
					        "cancelled2":  {'$cond': { 'if': { '$eq': [ "$travel_status", 8 ] }, 'then': 1, 'else':0 }} , 
					        "cancelled3":  {'$cond': { 'if': { '$eq': [ "$travel_status", 6 ] }, 'then': 1, 'else':0 }} ,  
					        "rejected":  {'$cond': { 'if': { '$eq': [ "$driver_reply", 'R' ] }, 'then': 1, 'else':0 }}, 
					        "waiting_time":  {'$cond': { 'if': { '$eq': [ "$travel_status", 1 ] }, 'then': '$trans.waiting_time', 'else':0 }}, 
					       "time_driven": {'$cond':{ 'if': { '$eq': [ "$travel_status", 1 ] }, 'then': {'$subtract':['$drop_time','$actual_pickup_time']}, 'else':0 }} 
				    	},
					},				               
					{
					        '$group' : { 
					         "_id":"$driver_id", 
					        "today_earnings":{'$sum':'$fare'},
					        "completed_trip":{'$sum':'$completed'},
					        "overall_rejected_trips":{'$sum':'$rejected'},
					        "cancelled":{'$sum':{'$sum':['$cancelled','$cancelled2','$cancelled3']}},
					        "time_driven":{'$sum':'$time_driven'},
					        "waiting_time":{'$push':'$waiting_time'},
					        "total_trip": { "$sum": 1 }
					        }
					}	
        
			];

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.aggregate(arguments).toArray(function(err, results) {
		//console.log('statisticsresults',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;       
}


exports.check_qr_scan= function(q,code){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_TAXI);
	 arguments = [
			{
				'$lookup' : {
					'from' : t.MDB_MOTOR_MODEL,
					'localField' : 'taxi_model',
					'foreignField' : '_id',
					'as' : 'model'
				}
			},
			{
				'$unwind' : '$model'
			},
			{
				'$match' :{'qrencodeString':code}
			},
			{
				'$project' : {
				'taxi_id' : '$_id',
				'taxi_no' : '$taxi_no',
				'taxi_model' : '$taxi_model',
				'starting_km' : '$starting_km',
				'model_name' : '$model.model_name',
				}
			},
	];
	 collection.aggregate(arguments).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.tabTokenUpdate= function(q,taxi_id,token){
	var deferred = q.defer();

	let match_array = {
		'_id':taxi_id,
	};
	let updateArray = {
		'tab_token':token
	};
	var collection = db.get().collection(t.MDB_TAXI);
	collection.update(match_array,{'$set':updateArray},function(err, results) {
		console.log('err',err);
	 	deferred.resolve('Updated Successfully');
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.getVideoURL= function(q){
	var deferred = q.defer();
	
	var collection = db.get().collection(t.MDB_SITEINFO);
	collection.find({},{'tab_video':1,'version':1}).toArray(function(err, results) {
		console.log('results',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.get_driver_status= function(q,driver_id){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.find({'_id':parseInt(driver_id),'user_type':'D'},{'_id':1,'login_status':1,'status':1}).toArray(function(err, results) {
		console.log('err',err);
		//console.log('status',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.get_driver_ratings= function(q,driver_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_LOGS_COMPLETED);

	arguments = [
			{
				'$match' :{'driver_id':driver_id}
			},
			{
				'$group' : {
					'_id':'$driver_id',
					'total_rating':{'$sum':'$rating'},
					'count': { '$sum': 1 }	
				}
			},
	];

	collection.aggregate(arguments).toArray(function(err, results) {
		//console.log('results',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}



exports.check_driver_location_update= function(q,trip_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_DRIVER_LOCATION_HISTORY);
	collection.find({'trip_id':parseInt(trip_id)},{'loc.coordinates':1,'distance':1,'_id':1}).toArray(function(err, results) {
		//console.log('resultscheck',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.last_driver_location_update= function(q){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_DRIVER_LOCATION_HISTORY);
	collection.find({},{'_id':-1}).sort({'_id':-1}).limit(1).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.insert_driver_location_update= function(q,insertArray){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_DRIVER_LOCATION_HISTORY);
	collection.insert(insertArray,function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.update_distance= function(q,total_distance,trip_id,status){
	var deferred = q.defer();

	let updateArray = {
		'distance':parseFloat(total_distance),
		'status':status
	};

	var collection = db.get().collection(t.MDB_DRIVER_LOCATION_HISTORY);
	collection.update({trip_id:parseInt(trip_id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.update_logs_distance= function(q,total_distance,trip_id){
	var deferred = q.defer();

	let updateArray = {
		'distance':parseFloat(total_distance)
	};

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.update({trip_id:parseInt(trip_id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err2',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;
		});

	 return deferred.promise;
}

exports.push_driver_location= function(q,location_data,trip_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_DRIVER_LOCATION_HISTORY);
	collection.update({trip_id:parseInt(trip_id)},{'$push':{'loc.coordinates':{'$each':location_data}}},{'$upsert':false},function(err,data){
		console.log('err3',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;
			
		});

	 return deferred.promise;
}

exports.driver_taxi_assign = function(q,userid,time_range){
	var deferred = q.defer();

	let match = {
		'mapping_driverid':parseInt(userid)
		//'mapping_startdate':'',
		//'mapping_enddate':'',
	};

	let arguments = [
						{'$lookup':{
							'from':t.MDB_TAXI,
							'localField':"mapping_taxiid",
							'foreignField':"_id",
							 'as':"taxi"        
						}},
						{'$unwind':'$taxi'},
						{'$lookup':{
							'from':t.MDB_COMPANY,
							'localField':"mapping_companyid",
							'foreignField':"_id",
							 'as':"companyinfo"        
						}},	
						{'$unwind':'$companyinfo'},
						{'$lookup':{
							'from':t.MDB_PEOPLE,
							'localField':"mapping_driverid",
							'foreignField':"_id",
							 'as':"people"        
						}},
						{'$unwind':'$people'},
						{'$lookup':{
							'from':t.MDB_DRIVER_INFO,
							'localField':"mapping_driverid",
							'foreignField':"_id",
							 'as':"driverinfo"        
						}},
						{'$unwind':'$driverinfo'},
						{'$lookup':{
							'from':t.MDB_CSC,
							'localField':"mapping_stateid",
							'foreignField':"stateinfo.state_id",'localField':"mapping_cityid",
							'foreignField':"stateinfo.cityinfo.city_id",
							 'as':"csc"        
						}},
						{'$unwind':{ 
							"path": "$csc",
           					"preserveNullAndEmptyArrays": true
           				}},
           				{'$sort':{'mapping_startdate':1}},
						{'$match':match},
						{'$project' : {
							'mapping_taxiid':'$_id',
							'taxi_id':'$taxi._id',
							'starting_km':'$taxi.starting_km',
							'shift_status':'$driverinfo.shift_status',
							'status':'$driverinfo.status',
						}}					
					];

	var collection = db.get().collection(t.MDB_TAXIMAPPING);
	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('assign err',err);
		//console.log('assign res',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.get_auto_id= function(q,table_name){
	var deferred = q.defer();

	var collection = db.get().collection(table_name);
	collection.find({},{'_id':-1}).sort({'_id':-1}).limit(1).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.update_driver_shift= function(q,updateArray,userid){
	var deferred = q.defer();

	let match_array = {
		'_id':parseInt(userid),
	};

	console.log(match_array);
	var collection = db.get().collection(t.MDB_DRIVER_INFO);
	collection.update(match_array,{'$set':updateArray},function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.insert_shift_history= function(q,insertArray){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_SHIFT_HISTORY);
	collection.insert(insertArray,function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.update_shift_history= function(q,updateArray,shift_id){
	var deferred = q.defer();

	let match_array = {
		'_id':parseInt(shift_id),
	};
	var collection = db.get().collection(t.MDB_SHIFT_HISTORY);
	collection.update(match_array,{'$set':updateArray},function(err, results) {
		console.log('err',err);
	 	deferred.resolve('Updated Successfully');
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.ifTaxiReachService= function(q,km){
	var deferred = q.defer();

	var condition = {"status":"A","km":{'$lte':km}};

	var collection = db.get().collection(t.MDB_TAXI_SERVICE_RANGE);
	collection.find(condition,{'km':1,'label':1,'_id':1}).toArray(function(err, results) {
		//console.log('results',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.driver_pending_trips= function(q,userid){
	var deferred = q.defer();

	var condition = {'driver_id':parseInt(userid),'travel_status':{'$in':[2,3,5,9]},'driver_reply':'A'};

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.find(condition,{'_id':1}).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.insert_mapping_taxi= function(q,insertArray){
	var deferred = q.defer();

	console.log(insertArray);
	var collection = db.get().collection(t.MDB_TAXIMAPPING);
	collection.insert(insertArray,function(err, results) {
		console.log('err5',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.check_taxi_assign= function(q,taxi_id){
	var deferred = q.defer();

	var condition = {'mapping_taxiid':parseInt(taxi_id),'mapping_status':'A'};

	var collection = db.get().collection(t.MDB_TAXIMAPPING);
	collection.find(condition,{'_id':1}).toArray(function(err, results) {
		//console.log('results',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.check_driver_assign= function(q,driver_id){
	var deferred = q.defer();

	var condition = {'mapping_driverid':parseInt(driver_id),'mapping_status':'A'};

	var collection = db.get().collection(t.MDB_TAXIMAPPING);
	collection.find(condition,{'_id':1}).toArray(function(err, results) {
		//console.log('results',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.update_driver_profile= function(q,updateArray,userid){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.update({_id:parseInt(userid)},{'$set':updateArray},{'$upsert':false},function(err,data){
		//console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.update_taxi_km= function(q,taxikm,taxi_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_TAXI);
	collection.update({_id:parseInt(taxi_id)},{'$set':{'starting_km':taxikm}},{'$upsert':false},function(err,data){
		console.log('err',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.update_taxi= function(q,updateArray,taxi_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_TAXI);
	collection.update({_id:parseInt(taxi_id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.get_passenger_status= function(q,userid){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_PASSENGERS);
	collection.find({'_id':parseInt(userid),'user_status':'A'},{'_id':1,'login_status':1,'status':1}).toArray(function(err, results) {
		console.log('err',err);
		//console.log('status',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.taxino_isValid= function(q,taxi_no){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_TAXI);

	console.log(taxi_no);
	collection.find({'taxi_no':taxi_no},{'_id':1,'starting_km':1}).toArray(function(err, results) {
		console.log('err',err);
		//console.log('status',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.taxi_details= function(q,taxi_id){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_TAXI);

	collection.find({'_id':parseInt(taxi_id)},{'_id':1,'starting_km':1}).toArray(function(err, results) {
		console.log('err',err);
		//console.log('status',results);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.update_passenger_profile= function(q,updateArray,userid){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PASSENGERS);
	collection.update({_id:parseInt(userid)},{'$set':updateArray},{'$upsert':false},function(err,data){
		//console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}


exports.insert_driver_feedback= function(q,insertArray){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_DRIVER_FEEDBACK);
	collection.insert(insertArray,function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.update_people= function(q,updateArray,userid){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.update({_id:parseInt(userid)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err2',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.update_mapping= function(q,updateArray,id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_TAXIMAPPING);
	collection.update({'mapping_driverid':parseInt(id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.driver_info_details= function(q,userid){
	var deferred = q.defer();
	let arguments = [
						{'$match':{
							'_id':parseInt(userid),
							'user_type':"D",
							'status':'A'
						}},
           				{'$lookup':{
							'from':t.MDB_DRIVER_INFO,
							'localField':"_id",
							'foreignField':"_id",
							 'as':"driverinfo"        
						}},
						{'$unwind':'$driverinfo'},
						{'$project' : {
							'driver_status':'$driverinfo.status',
							'status':'$status',
							'login_status':'$login_status',
						}}					
					];

					console.log(arguments);

	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.driver_pending_trips= function(q,userid){
	var deferred = q.defer();

	var match_array ={
		'driver_id':parseInt(userid),
		'msg_status':'R',
		'driver_reply':'A',
		'travel_status':{'$in':[9,2,5,3]}
	};

	let arguments = [{
                '$match' : match_array
            },
						{
                '$lookup' : {
                    'from' : t.MDB_PASSENGERS,
                    'localField' : 'passengers_id',
                    'foreignField' : "_id",
                    'as' : "passengers"
                }
            },
			{
				'$unwind' : '$passengers'
			},
            {
                  '$lookup' : {
                    'from' : t.MDB_TRANS,
                    'localField' : '_id',
                    'foreignField' : "passengers_log_id",
                    'as' : "trans"
                }
            },
            {
				'$unwind' : '$trans'
			},
			{
                '$lookup' : {
                    'from' : t.MDB_PEOPLE,
                    'localField' : 'driver_id',
                    'foreignField' : "_id",
                    'as' : "people"
                }
            },
            {
				'$unwind' : '$people'
			},
            
			{
                '$project' : {
                    'pickup_time' : '$pickup_time',
					'pickup_longitude' : '$pickup_longitude',
					'pickup_latitude' : '$pickup_latitude',
					'drop_latitude' : '$drop_latitude',
					'drop_longitude' : '$drop_longitude',
					'travel_status' : '$travel_status',
					'notes' : '$notes_driver',
					'distance' : '$distance',
					'waiting_hour' : '$waitingtime',
					'bookby' : '$bookby',
					'drivername' : '$people.name',
					'passenger_name' : '$passengers.name',
					'passenger_id' : '$passengers._id',
					'passenger_profile_image' : '$passengers.profile_image',
					'passengers_log_id' : '$_id',
					'pickup_location' : '$current_location',
					'drop_location' : {'$ifNull' : [ '$drop_location', 0 ]},
					'travel_status' : '$travel_status',
                    'ratings':'$rating',
                    'tags':'$driver_tags'
                }
            },
            {
                '$sort' : {
                    '_id' : -1
                }
            }
        ];
	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.driver_past_trips= function(q,userid){
	var deferred = q.defer();

	var match_array ={
		'driver_id':parseInt(userid),
		'msg_status':'R',
		'driver_reply':'A',
		'travel_status':parseInt(1)
	};

	let arguments = [{
                '$match' : match_array
            },
			{
                '$lookup' : {
                    'from' : t.MDB_PASSENGERS,
                    'localField' : 'passengers_id',
                    'foreignField' : "_id",
                    'as' : "passengers"
                }
            },
			{
				'$unwind' : '$passengers'
			},
            {
                  '$lookup' : {
                    'from' : t.MDB_TRANS,
                    'localField' : '_id',
                    'foreignField' : "passengers_log_id",
                    'as' : "trans"
                }
            },
            {
				'$unwind' : '$trans'
			},
			{
                '$lookup' : {
                    'from' : t.MDB_PEOPLE,
                    'localField' : 'driver_id',
                    'foreignField' : "_id",
                    'as' : "people"
                }
            },
            {
				'$unwind' : '$people'
			},
			{
                '$project' : {
                    'pickup_time' : '$pickup_time',
					'pickup_longitude' : '$pickup_longitude',
					'pickup_latitude' : '$pickup_latitude',
					'drop_latitude' : '$drop_latitude',
					'drop_longitude' : '$drop_longitude',
					'travel_status' : '$travel_status',
					'amt':{'$cond':[
                            {'$gt':['$trans.driver_edit_status',0]},
                            {'$sum':['$trans.tripfare','$trans.add_amt']},
                             {'$sum':['$trans.actual_paid_amt','$trans.add_amt','$trans.wallet_amount_used']},
                         ],
                    },
					'pickup_time' : {'$dateToString': { 'format': "%d-%m-%Y %H:%M:%S", 'date': "$pickup_time" }},
					'actual_pickup_time' : {'$dateToString': { 'format': "%d-%m-%Y %H:%M:%S", 'date': "$actual_pickup_time" }},
					'drop_time' : {'$dateToString': { 'format': "%d-%M-%Y %H:%m:%S", 'date': "$drop_time" }},
					'notes' : '$notes_driver',
					'distance' : '$distance',
					'waiting_hour' : '$waitingtime',
					'trip_duration' : {'$divide':[{'$subtract':['$drop_time','$actual_pickup_time']},60000]},
					'bookby' : '$bookby',
					'drivername' : '$people.name',
					'passenger_name' : '$passengers.name',
					'passenger_id' : '$passengers._id',
					'passenger_profile_image' : '$passengers.profile_image',
					'passengers_log_id' : '$_id',
					'pickup_location' : '$current_location',
					'drop_location' : {'$ifNull' : [ '$drop_location', 0 ]},
					'travel_status' : '$travel_status',
                    'ratings':'$rating',
                    'tags':'$driver_tags',
                }
            },
            {
                '$sort' : {
                    '_id' : -1
                }
            }
        ];
	var collection = db.get().collection(t.MDB_LOGS_COMPLETED);
	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}



exports.get_trip_detail= function(q,trip_id){
	var deferred = q.defer();

	var match_array ={
		'_id':parseInt(trip_id),
	};

	let arguments = [{
                '$match' : match_array
            },
			{
                '$lookup' : {
                    'from' : t.MDB_PASSENGERS,
                    'localField' : 'passengers_id',
                    'foreignField' : "_id",
                    'as' : "passengers"
                }
            },
			{
				'$unwind' : '$passengers'
			},
            {
                  '$lookup' : {
                    'from' : t.MDB_TRANS,
                    'localField' : '_id',
                    'foreignField' : "passengers_log_id",
                    'as' : "trans"
                }
            },
           	{'$unwind':{ 
					"path": "$trans",
					"preserveNullAndEmptyArrays": true
           	}},
           	{
                '$lookup' : {
                    'from' : t.MDB_TAXI,
                    'localField' : 'taxi_id',
                    'foreignField' : "_id",
                    'as' : "taxi"
                }
            },
            {'$unwind':{ 
					"path": "$taxi",
					"preserveNullAndEmptyArrays": true
           	}},
			{
                '$lookup' : {
                    'from' : t.MDB_DRIVER_INFO,
                    'localField' : 'driver_id',
                    'foreignField' : "_id",
                    'as' : "driverinfo"
                }
            },
            {'$unwind':{ 
					"path": "$driverinfo",
					"preserveNullAndEmptyArrays": true
           	}},
			{
                '$lookup' : {
                    'from' : t.MDB_MOTOR_MODEL,
                    'localField' : 'taxi_modelid',
                    'foreignField' : "_id",
                    'as' : "model"
                }
            },
            {'$unwind':{ 
					"path": "$model",
					"preserveNullAndEmptyArrays": true
           	}},	
			{
                '$lookup' : {
                    'from' : t.MDB_PEOPLE,
                    'localField' : 'driver_id',
                    'foreignField' : "_id",
                    'as' : "people"
                }
            },
            {'$unwind':{ 
					"path": "$people",
					"preserveNullAndEmptyArrays": true
           	}},
			{
                '$project' : {
					'amt':{'$cond':[
                            {'$gt':['$trans.driver_edit_status',0]},
                            {'$sum':['$trans.tripfare','$trans.add_amt']},
                             {'$sum':['$trans.actual_paid_amt','$trans.add_amt','$trans.wallet_amount_used']},
                         ],
                    },
					'pickup_time' : {'$dateToString': { 'format': "%d-%m-%Y %H:%M:%S", 'date': "$pickup_time" }},
					'actual_pickup_time' : {'$dateToString': { 'format': "%d-%m-%Y %H:%M:%S", 'date': "$actual_pickup_time" }},
					'drop_time' : {'$dateToString': { 'format': "%d-%M-%Y %H:%m:%S", 'date': "$drop_time" }},
					'notes' : {'$ifNull':['$notes_driver','']},
					'distance' : {'$ifNull':['$distance',0]},
					'waiting_hour' : '$waitingtime',
					//'trip_duration' : {'$divide':[{'$subtract':['$drop_time','$actual_pickup_time']},60000]},
                    'wallet_amount' : '$used_wallet_amount',
                    'waiting_cost' : {'$ifNull':['$trans.waiting_cost',0]},
                    'fare' : {'$ifNull':['$trans.fare',0]},
                    'wallet_used_amount' : {'$ifNull':['$trans.wallet_amount_used',0]},
                    'add_amt' : {'$ifNull':['$trans.add_amt',0]},
                    'driver_edit_status' : {'$ifNull':['$trans.driver_edit_status',0]},
                    'actual_paid_amt' : {'$ifNull':['$trans.actual_paid_amt',0]},
					'tripfare' : {'$ifNull':['$trans.tripfare',0]},
                     'o_fare':{'$cond':[
                            {'$gt':['$trans.driver_edit_status',0]},
                            {'$sum':['$trans.fare','$trans.wallet_amount_used','$trans.add_amt']},
                             {'$sum':['$trans.actual_paid_amt','$trans.wallet_amount_used']}
                             ]
                        },
                     'trip_duration':{'$cond':[
                            {'$eq':['$trans.drop_time',true]},
                            {'$divide':[{'$subtract':['$drop_time','$actual_pickup_time']},60000]},
                            0
                             ]
                        },
                    'coordinates':'$driverinfo.loc.coordinates',
                    'bearing':'$driverinfo.bearing',
                    'accuracy':'$driverinfo.accuracy',
                    'driver_status':'$driverinfo.status',
					'amt' : { '$sum': '$trans.amt'},
					'trans_id' :{'$ifNull':['$trans._id','']},
					'airport_pickup' :{'$ifNull':['$airport_pickup','']},
					'airport_type' :{'$ifNull':['$airport_type',0]},
					//'actual_distance': {'$sum':'$trans.distance'),
					//'metric' : {'$sum':'$trans.distance_unit'),
					//'job_ref' : {'$sum':'$trans.job_ref'),
					//'payment_type' : {'$sum':'$trans.payment_type'),
					'actual_distance' : {'$ifNull':['$trans.distance',0]},
					'metric' : {'$ifNull':['$trans.distance_unit',0]},
					'job_ref' : {'$ifNull':['$trans.job_ref',0]},
					'payment_type' : {'$ifNull':['$trans.payment_type',0]},
					'passengers_id' : '$passengers_id',
					'passengers_log_id' : '$_id',
					'current_location' : '$current_location',
					'no_passengers' : '$no_passengers',
					'pickup_time' : '$pickup_time',
					'actual_pickup_time' : {'$ifNull':['$actual_pickup_time','']},
					'drop_time' :  {'$ifNull':['$drop_time','']},
					'arrived_time' : {'$ifNull':['$arrived_time','']},
					'rating' : '$rating',
					'notes_driver' : {'$ifNull':['$notes_driver','']},
					'travel_status' : '$travel_status',
					'driver_reply' : '$driver_reply',
					'city_id' : '$search_city',
					'pickup_location' : '$current_location',
					'pickup_latitude' : '$pickup_latitude',
					'pickup_longitude' : '$pickup_longitude',
					'drop_location' : '$drop_location',
					'drop_latitude' : '$drop_latitude',
					'drop_longitude' : '$drop_longitude',
					'taxi_modelid' : '$taxi_modelid',
					'taxi_model_name' : '$model.model_name',
                    'model_image' : '$model.model_image',
					'model_image_new' : '$model.model_image_new',
					'time_to_reach_passen' : {'$ifNull':['$time_to_reach_passen','0']},
					'notification_status' : '$notification_status',
					'used_wallet_amount' : '$used_wallet_amount',
					'bookby' : '$bookby',
					'passenger_name' : '$passengers.name',
					'passenger_phone' : '$passengers.phone',
                    'passenger_image' : '$passengers.profile_image',
					'lateral_end_date' : '$passengers.lateral_end_date',
					'passenger_wallet_amount' : {'$ifNull':['$passengers.wallet_amount',0]},
					'driver_name' : {'$ifNull':['$people.name','']},
					'driver_image' : {'$ifNull':['$people.profile_picture','']},
					'driver_id' : {'$ifNull':['$people._id','']},
					'driver_phone' : {'$ifNull':['$people.phone','']},
					'driver_login_status' : {'$ifNull':['$people.login_status','']},
					'taxi_no' : '$taxi.taxi_no',
					'taxi_speed' : '$taxi.taxi_speed',
					'taxi_min_speed' : '$taxi.taxi_min_speed',
					'taxi_id' : '$taxi._id',
					'taxi_manufacturer' : '$taxi.taxi_manufacturer',
					'taxi_colour' : '$taxi.taxi_colour',
					'waiting_time' : '$waitingtime',
					'distance' : '$distance',
					'drop_location' : '$drop_location',
					'book_tag' : '$book_tag',
					'pas_pay_by' : '$passengers.pay_by',
					'pas_pay_lmt' : '$passengers.trip_amt_limit',
					'pass_id_image' : '$passengers.id_image',
					'tags':'$driver_tags',
					'ratings':'$rating',
                }
            },
            {
                '$sort' : {
                    '_id' : -1
                }
            }
        ];
	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('err trip',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.update_driver_reply= function(q,updateArray,trip_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.update({'_id':parseInt(trip_id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.update_request_details= function(q,updateArray,trip_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_REQUEST_HISTORY);
	collection.update({'trip_id':parseInt(trip_id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.update_reject_trip_det= function(q,updateArray,trip_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.update({'_id':parseInt(trip_id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.trip_exists= function(q,trip_id,table_name){
	var deferred = q.defer();

	let match_array = {
	"trip_id":parseInt(trip_id), 
	};

	var collection = db.get().collection(table_name);
	collection.find(match_array).toArray(function(err, results) {
		console.log('exists err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.fetch_all_logs= function(q,trip_id){
	var deferred = q.defer();

	let match_array = {
	"_id":parseInt(trip_id), 
	};

	console.log(match_array);

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.find(match_array).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.insert_all_logs= function(q,insertArray,table_name){
	var deferred = q.defer();

	var collection = db.get().collection(table_name);
	collection.insert(insertArray,function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.update_moved= function(q,trip_id){
	var deferred = q.defer();

	let updateArray = {
		'moved':parseInt(2)
	};

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);
	collection.update({'_id':parseInt(trip_id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}


exports.SiteSettings= function(q){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_SITEINFO);
	collection.find({'_id':parseInt(1)}).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.sms_template= function(q,sms_id){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_SMS_TEMPLATES);

lang = 'en';

	 arguments = [
		{
			'$match':{
					'_id':parseInt(sms_id)
				},
		},
		{
			'$project':{
				'id':'$_id',
				'sms_title':{'$cond': {
				'if': { '$eq': [ lang, "en" ] },
				'then': "$sms_title",
				'else': "$arabic_sms_title"
				}},
				'sms_description':{'$cond': {
				'if': { '$eq': [ lang, "en" ] },
				'then': "$sms_description",
				'else': "$arabic_sms_description"
				}},
			}
		},
	];

	console.log(arguments);

	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('sms err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.update_trip= function(q,updateArray,trip_id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);

	collection.update({_id:parseInt(trip_id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err2',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;
		});

	 return deferred.promise;
}

exports.update_payentry= function(q,updateArray,trip_id){
	var deferred = q.defer();


	var update_array = {"fare_detail" : 
						 [ {"key":"1","value" :updateArray.cash_pay }, 
						 {"key":"6","value" : updateArray.card_pay},
						 {"key":"3","value" : updateArray.knet_pay},
						 {"key":"additional amount","value" : updateArray.add_amt},
						 {"key":"wallet","value":updateArray.wallet_pay},
						 {"key":"pending","value":updateArray.pending_pay},
						 {"key":"fare_note","value":updateArray.fare_note}
						]};

	var collection = db.get().collection(t.MDB_PASSENGERSLOG);

	collection.update({_id:parseInt(trip_id)},{'$set':update_array},{'$upsert':true},function(err,data){
		console.log('err2',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;
		});

	 return deferred.promise;
}

exports.model_fare_details= function(q,model_id){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_MOTOR_MODEL);

    arguments = [
		{
			'$match':{
					'_id':parseInt(model_id)
				},
		},
		{
			'$project' : {
				"base_fare": '$base_fare',
				"min_fare": '$min_fare',
				"minutes_fare": '$minutes_fare',
				"cancellation_fare": '$cancellation_fare',						
				"below_km": '$below_km',
				"above_km": '$above_km',
				"minutes_fare": '$minutes_fare',						
				"night_charge": '$night_charge',
				"night_timing_from" : '$night_timing_from',
				"night_timing_to" : '$night_timing_to',						
				"night_fare": '$night_fare',
				"evening_charge" : '$evening_charge',
				"evening_timing_from" : '$evening_timing_from',
				"evening_timing_to" : '$evening_timing_to',						
				"evening_fare": '$evening_fare',
				"waiting_time" : '$waiting_time',
				"min_km" : '$min_km',
				"below_above_km" : '$below_above_km',
				"time" : '$time',
				"waiting_free" : '$waiting_free',
				"airport_pickup_fare":'$airport_pickup_fare',
				"airport_drop_fare":'$airport_drop_fare',
			},
		}

	];

	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('sms err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.check_new_request= function(q,driver_id,trip_id,driver_status,start_date){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_DRIVER_REQUEST_DETAILS);

	if(driver_status == 'F')
	{
	var match_array = {'trip_id':parseInt(trip_id)};
	}
	else
	{
	var match_array = {'driver_id':parseInt(trip_id)};
	}

	var arguments = [
				{
                '$match' : match_array
            	},
				{
					'$project' : {
						"trip_id": '$trip_id',
						"available_drivers": '$available_drivers',
						"status": '$status'
					},
				},
				{'$sort':{'_id':-1}},
				{'$limit' : 1}
			];

	collection.aggregate(arguments).toArray(function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}



exports.get_promocode_details= function(q,promocode){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_PASSENGERS_PROMO);
	collection.find({'promocode':promocode},{"promocode":1,"package":1,"promo_used":1,"promo_limit":1,"total_used":1,"total_applied":1}).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.coupon_package_details= function(q,package){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_COUPON_PACKAGE);
	collection.find({'_id':package},{"passenger_commission":1,"corporate_commission":1}).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.update_admin_balance= function(q,admin_amt){
	var deferred = q.defer();

	var updateArray ={
		'account_balance':admin_amt
	};

	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.update({'user_type':'A'},{'$inc':updateArray},{'$upsert':false},function(err,data){
		console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.update_company_balance= function(q,company_amt,company_id){
	var deferred = q.defer();

	var updateArray ={
		'account_balance':company_amt
	};

	var collection = db.get().collection(t.MDB_PEOPLE);
	collection.update({'user_type':'C','company_id':parseInt(company_id)},{'$inc':updateArray},{'$upsert':false},function(err,data){
		console.log('err1',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;	
			
		});

	 return deferred.promise;
}

exports.check_trans_exists= function(q,trip_id){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_TRANS);
	collection.find({'passengers_log_id':parseInt(trip_id)}).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.gateway_details= function(q){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_PAYMENT_MODULES);
	collection.find({'_id':{'$nin':[2,3,5,6]}},{'_id':1,'pay_mod_name':1,'pay_mod_default':1}).sort({'_id':1}).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.insert_transaction= function(q,insertArray){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_TRANS);
	collection.insert(insertArray,function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.insert_wallet_logs= function(q,insertArray){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PASSENGER_WALLET_LOG);
	collection.insert(insertArray,function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.update_transaction= function(q,updateArray,trip_id){
	var deferred = q.defer();

	let match_array = {
		'_id':parseInt(shift_id),
	};
	var collection = db.get().collection(t.MDB_TRANS);
	collection.update(match_array,{'$set':updateArray},function(err, results) {
		console.log('err',err);
	 	deferred.resolve('Updated Successfully');
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.insert_trip_pay_details= function(q,insertArray){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PAYDETAILS);
	collection.insert(insertArray,function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.insert_temp_logs= function(q,insertArray){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PASSENGERS_LOGS_TEMP);
	collection.insert(insertArray,function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.update_passenger= function(q,updateArray,id){
	var deferred = q.defer();

	var collection = db.get().collection(t.MDB_PASSENGERS);

	collection.update({_id:parseInt(id)},{'$set':updateArray},{'$upsert':false},function(err,data){
		console.log('err2',err);
	 	deferred.resolve(data);
		deferred.makeNodeResolver()
		data=null;
		});

	 return deferred.promise;
}

exports.get_passenger_details= function(q,userid){
	var deferred = q.defer();
	var collection = db.get().collection(t.MDB_PASSENGERS);
	collection.find({'_id':parseInt(userid)}).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}


exports.update_promocode= function(q,promocode){
	var deferred = q.defer();

	let match_array = {
		'promocode':promocode, 
		'promo_type':parseInt(1)
	};
	var collection = db.get().collection(t.MDB_PASSENGER_PROMO);
	collection.update(match_array,{'$inc':{'total_applied':1}},function(err, results) {
		console.log('err',err);
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });

	 return deferred.promise;
}

exports.knet_details= function(q){
	var deferred = q.defer();

	let match_array = {
		'payment_gatway':'KNET',
		'company_id':parseInt(1),
		'payment_status': 'A'
	};
	
	var collection = db.get().collection(t.MDB_PAYMENT_GATEWAYS);
	collection.find(match_array,{"_id":1,"knet_alias":1,"payment_method":1,"knet_response_url":1,"knet_error_url":1}).toArray(function(err, results) {
	 	deferred.resolve(results);
		deferred.makeNodeResolver()
		result=null;
	  });


	 return deferred.promise;
}


