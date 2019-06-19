// modules =================================================
import express from 'express';
var expressJwt         = require ('express-jwt');
var bodyParser         = require('body-parser');
// var cookieParser   = require('cookie-parser');
// var logger         = require('morgan');
var methodOverride     = require('method-override');
var path               = require('path');
var passport           = require('passport');
var { passportConfig } = require('../config/passort');
var models             = require('../db/models');
var app                = express();

// configuration ===========================================
var port = process.env.PORT || 8081; // set our port
// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(passport.initialize());
passportConfig(passport);
app.use('/api', expressJwt({ secret: process.env.WEB_SECRET })
    .unless({ path: [
        '/api/auth/login',
        '/api/category',
        '/api/category/featured',
        '/api/product',
        { url: '/api/config', methods: ['GET'] },
        { url: '/api/engagement/*', methods: ['POST'] },
        { url: '/api/order/*', methods: ['POST'] },
        '/api/recommendation',
        '/api/recommendation/featured',
        '/api/recommendation/cart',
    ]}));

// routes ==================================================
require('./route')(app); // pass our application into our routes

// start app ===============================================
models.sequelize.sync().then(function () {
    app.listen(port);
    console.log('Listening to: ' + port); 			// shoutout to the user
});
exports = module.exports = app; 						// expose app