var express = require('express');
var http = require("http");

var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

var app = express();
var server = http.createServer(app);


//Requerimientos de Require.js
var ClientManager = requirejs('./classes/ClientManager');

//////// Direccionamiento ////////

app.use("/", express.static(__dirname + "/"));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});

app.get('/lotr', function(req, res){
	res.sendFile(__dirname + '/views/main.html');
});

//////// VARIABLES GENERALES ////////////
var clients = [];
var port = 3000;


///////////////////////////////////////////////////       GESTIÓN DE MENSAJES SOCKET.IO            /////////////////////////////////////////////////////////////

//Creo un client manager que se encarga de detalles de conexión
var clientManager = new ClientManager();
clientManager.listen(server);

//Setup server listening on port

server.listen(port, function(){
	console.log('Server funcional en puerto '+ port);
});
