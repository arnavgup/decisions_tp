var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');

var express = require('express');
var app = express();

app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');

app.use(morgan('tiny'));	

app.use(bodyParser.urlencoded({ extended: true }));

app.set('passport', require('./models/authentication.js').init(app));

var httpServer = require('http').createServer(app);
var sio =require('socket.io');
var io = sio(httpServer);
var gameSockets = require('./routes/serverSocket.js');
gameSockets.init(io);


require('./routes/memberRoutes').init(app);


app.use(express.static(__dirname + '/public'));
  
app.use(function(req, res) {
	var message = 'Error, did not understand path '+req.path;

  res.status(404).render('error', { 'message': message });
});



httpServer.listen(50000, function() {
  console.log('Listening on port:'+this.address().port);
});

