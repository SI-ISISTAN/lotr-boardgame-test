var express = require('express');
var http = require("http");
var passport = require('passport');

var express  = require('express');
var app      = express();
var flash    = require('connect-flash');
var requirejs = require('requirejs');
var server = http.createServer(app);
var bcrypt   = require('bcrypt-nodejs');
requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require,
    paths : {
        'mangosta' : 'moongoose'
    }
});
var mongoose = require('mongoose');

mongoose.connect('mongodb://matanegui:patrite0@ds061611.mongolab.com:61611/lotr-test');


var ClientManager = requirejs('./classes/ClientManager');
var schemas = requirejs('./routes/schemas');


var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');



require('./routes/passport')(passport, schemas); // pass passport for configuration



// set up our express application
//app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'walterwayarnolehacenfaltapromesas' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.set('view engine', 'ejs'); // set up ejs for templating



//////// Direccionamiento ////////

app.use("/", express.static(__dirname + "/"));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});


app.get('/lotr', isLoggedIn, function(req, res) {
        res.render('main.ejs', {
            user : req.user
        });

    });

app.get('/admin', isAdminLoggedIn, function(req, res) {  
        res.render('admin.ejs', {});
    });

app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });

    });

app.get('/profile', isLoggedIn, function(req, res) {
        if (req.user.facebook.token == undefined && req.user.twitter.token == undefined && req.user.google.token == undefined){
                res.redirect('/');
        }
        else{
    		res.render('profile.ejs', {
    			user : req.user
    		});
        }
	});

app.get('/survey', isLoggedIn, function(req, res) {
        res.render('survey.ejs', {
            user : req.user,
            sch : schemas
        });
    });

// =============================================================================
// AUTHENTICATE (NOT LOGGED IN) =============
// =============================================================================
 // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/admin', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

// facebook --------------------------------
app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email','user_friends'] }));

	// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
}));

// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

		// handle the callback after twitter has authenticated the user
		app.get('/auth/twitter/callback',
			passport.authenticate('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));
// google ---------------------------------

		// send to google to do the authentication
		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

		// the callback after google has authenticated the user
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

     // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/login', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {

        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            if (user.facebook.token == undefined && user.twitter.token == undefined && user.google.token == undefined){
                res.redirect('/');
            }
            else{
             res.redirect('/profile');
            }
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            if (user.facebook.token == undefined && user.twitter.token == undefined && user.google.token == undefined){
                res.redirect('/');
            }
            else{
                res.redirect('/profile');
            }
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            if (user.facebook.token == undefined && user.twitter.token == undefined && user.google.token == undefined){
                    res.redirect('/');
            }
            else{
                res.redirect('/profile');
            }
        });
    });

// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

//Otras llamadas get y post

//Obtengo todas las configuraciones para el sitio de admin
app.get("/getconfigs", function(req, res){
        //retornar esquemas
        var configs = {};
                    schemas.configSchema.findOne({}, function(err, config){
                        if (err){
                            return err;

                        }
                        if (config){
                                configs = config.configs;
                                res.json({ 'configs' : configs, 'default':config.currentConfig });
                        }
                    });
    
});

//Obtengo todas las recomendaciones
app.get("/getadvices", function(req, res){
    schemas.adviceSchema.find({}, function(err, result){
        if (err){
            console.log("Error");
        }
        else{
            res.json({ 'advices' : result});           
        }
    });
});

//Obtengo todas los usuarios
app.get("/getallusers", function(req, res){
    schemas.userSchema.find({}, function(err, result){
        if (err){
            console.log("Error");
        }
        else{
            res.json({ 'users' : result});           
        }
    });
});

app.post("/changeconfig", function(req, res){
        schemas.configSchema.findOne({}, function(err, config){
                        if (err){
                            return err;

                        }
                        if (config){
                                //debo encontrar la config y cambiarla
                                var i=0;
                                var found = false;
                                while (!found && i<config.configs.length){
                                    if (config.configs[i].configName == req.body.config){
                                        found=true;
                                        config.configs.splice(i,1);
                                        config.configs.push(req.body.data);
                                        config.save(function(err) {
                                            if (err){
                                                throw err;
                                            }
                                            else{
                                                res.json({ 'success' : true });
                                            }
                                        });
                                    }
                                    i++;
                                }
                                if (!found){
                                    config.configs.push(req.body.data);
                                        config.save(function(err) {
                                            if (err){
                                                throw err;
                                            }
                                            else{
                                                res.json({ 'success' : true });
                                            }
                                        });
                                }
                        }
                    });
});

app.post("/saveadvice", function(req, res){
    var ad = new schemas.adviceSchema();
    ad.type=req.body.type;
    ad.name=req.body.name;
    ad.text=req.body.text;
    ad.explicit = req.body.explicit;
    ad.conditions = req.body.conditions;
    ad.save(function(err) {
            if (err){
                throw err;
             }
             else{
                res.json({ 'success' : true });
            }
    });
});

app.post("/changedefault", function(req, res){
        schemas.configSchema.findOne({}, function(err, config){
                        if (err){
                            return err;

                        }
                        if (config){
                                //debo encontrar la config y cambiarla
                                config.currentConfig = req.body.default;
                                config.save(function(err) {
                                            if (err){
                                                throw err;
                                            }
                                            else{
                                                res.json({ 'success' : true });
                                            }
                                });
                        }
                    });
    
});

//Obtener los datos de la encuesta
app.post("/getsurvey", function(req, res){   
        var survey = null;
        schemas.userSchema.findOne({'local.userID' : req.body.userID}, function(err, user){
                        if (err){
                            return err;

                        }
                        if (user){
                            if (typeof(user.survey)!='undefined'){
                                survey = user.survey;
                            }
                            res.json({ 'survey' : survey });
                        }
                    });
        
});

//Obtener los datos del análisis
app.post("/getsymlog", function(req, res){   
        var symlog = null;
        schemas.userSchema.findOne({'local.userID' : req.body.userID}, function(err, user){
                        if (err){
                            return err;

                        }
                        if (user){
                            var sl= JSON.parse(JSON.stringify(user)).symlog;
                            
                            if (typeof(sl)!='undefined'){
                                symlog=sl;
                            }
                            else{
                            }
                            res.json({ 'symlog' : symlog });
                        }
                    });
        
});


// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function isAdminLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && typeof (req.user)!= 'undefined' &&  typeof(req.user.admin.username) != 'undefined')
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


//////// VARIABLES GENERALES ////////////
var clients = [];

///////////////////////////////////////////////////       GESTIÓN DE MENSAJES SOCKET.IO            /////////////////////////////////////////////////////////////

//Creo un client manager que se encarga de detalles de conexión
var clientManager = new ClientManager(schemas);
clientManager.listen(server);

//Setup server listening on port
var port     = process.env.PORT || 3000;
server.listen(port, function(){
	console.log('Server funcional en puerto '+ port);
});
