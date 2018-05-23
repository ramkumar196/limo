
var connection={};

var express = require('express'),
  app = express(),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  api = require('./routes/api')(app);

var db = require('./config/dbconnection');
var md5 = require('md5');
var base64 = require('base-64');
var q= require('q');
var i18n = require("i18n");
var socket = require( 'socket.io' );

var apimodel = require('./models/apimodel');

i18n.configure({
locales: ['en', 'ar'],
  
directory: __dirname + '/locales',
 defaultLocale: 'en',
updateFiles: false, 
  autoReload: true,    
});
app.use(i18n.init);

var mongodb= require('mongodb');
var http = require('http');

var server = http.createServer(app);

var io = socket.listen( server );

let socketobj={};


//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
  }));

app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());

var options = {
  inflate: true,
  limit: '1mb',
  type: 'application/json'
};
app.use(bodyParser.raw(options));
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// app.use(function(req, res, next) {

//       console.log(req.body);

//   // req.rawBody = '';
//   // req.setEncoding('utf8');

//   // req.on('data', function(chunk) { 
//   //   req.rawBody += chunk;
//   // });

//   req.on('end', function() {
//     next();
//   });
// });

db.connect('mongodb://localhost:27017','Local-Grandlimo-demo',function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
  	console.log(i18n.__('db_connect_success'));
  	}
});

app.io           = io;

app.use('/',api);

app.use('/api/index',api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

//development error handler
//will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    console.trace(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

//production error handler
//no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.encrypt_decrypt = function(action,a)
{
	var key = 'Taxi Application';
	var output = '';

	try{
		var encrypt_key = 'ndotencript_';
		var iv = md5(md5(key));
		if(action == 'encrypt')
		{
			output= base64.encode(encrypt_key+a);
		}
		else
		{
			op = base64.decode(a);
			op = op.split('_');
			if(op[1] != undefined && op[1] != '')
			{
				output = op[1];
			}
			else
			{
				output = '';
			}

		}
	} catch (err) {
			return output;
	}

	return output;
}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


require('./websocket')(io);

var port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

server.listen(port);

module.exports = app;