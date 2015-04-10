var express = require('express');
var http = require("http");
var passport = require('passport');

var express  = require('express');
var app      = express();


//var passport = require('passport');
//var flash    = require('connect-flash');
var requirejs = require('requirejs');
var server = http.createServer(app);

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});
//Requerimientos de Require.js
var ClientManager = requirejs('./classes/ClientManager');
var schema = require('./routes/schemas.js');


/*
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');




// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

//app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'walterwayarnolehacenfaltapromesas' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

*/

//////// Direccionamiento ////////

app.use("/", express.static(__dirname + "/"));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});

app.get('/lotr', function(req, res){
	res.sendFile(__dirname + '/views/main.html');
});

/*

	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/lotr',
			failureRedirect : '/'
}));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

*/
//////// VARIABLES GENERALES ////////////
var clients = [];

///////////////////////////////////////////////////       GESTIÓN DE MENSAJES SOCKET.IO            /////////////////////////////////////////////////////////////

//Creo un client manager que se encarga de detalles de conexión
var clientManager = new ClientManager();
clientManager.listen(server);

//Setup server listening on port
var port     = process.env.PORT || 3000;
server.listen(port, function(){
	console.log('Server funcional en puerto '+ port);
});
