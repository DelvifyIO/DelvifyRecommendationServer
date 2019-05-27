// modules =================================================
import express from 'express';
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var path           = require('path');
var models         = require('../db/models');

// configuration ===========================================
var port = process.env.PORT || 8081; // set our port

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(path.join(__dirname, '/../public'))); // set the static files location /public/img will be /img for users
app.use('/test', express.static(path.join(__dirname, '/../test'))); // set the static files location /public/img will be /img for users



// routes ==================================================
require('./route')(app); // pass our application into our routes

// start app ===============================================
models.sequelize.sync().then(function () {
    app.listen(port);
    console.log('Listening to: ' + port); 			// shoutout to the user
});
exports = module.exports = app; 						// expose app