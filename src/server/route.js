var expressJwt = require('express-jwt/lib');
var path = require('path');

module.exports = function (app) {

    // middleware to use for all requests
    app.use(function (req, res, next) {
        // do logging
        console.log('Entered first middleware.');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, OPTIONS, X-Requested-With, Content-Type, Accept, timezone, Authorization, merchantId",);
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE",);
        next(); // make sure we go to the next routes and don't stop here
    });

    // use JWT auth to secure the api
    // app.use('/api', exp/ressJwt({secret: secret.secret}).unless({path: ['/api/user/login', '/api/user/signup']}));

    // server routes ===========================================================
    // handle things like api calls

    // app.use('/app', require('./controllers/AppController'));
    app.use('/api/user', require('./api/user'));
    app.use('/api/product', require('./api/product'));
    app.use('/api/category', require('./api/category'));
    app.use('/api/engagement', require('./api/engagement'));
    app.use('/api/recommendation', require('./api/recommendation'));
    app.use('/api/order', require('./api/order'));
    app.use('/api/config', require('./api/config'));
    app.use('/api/auth', require('./api/authentication'));
    app.use('/api/admin', require('./api/admin'));
    app.use('/api/js', require('./api/js'));
    app.use('/api/query', require('./api/query'));
    app.use('/api/password', require('./api/password'));

    app.use('/api/master/register', require('./api/register'));
    app.use('/api/master/client', require('./api/client'));

    // frontend routes =========================================================
    // route to handle all angular requests
    //
    // app.get('/test/*', function(req, res) {
    //     res.sendfile('./public/test/index.js');
    // });

};