var express = require('express');
var router  = express.Router();
const controller = require('./controller');

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Entered authentication middleware.');
    next(); // make sure we go to the next routes and don't stop here
});

router.post('/login', controller.login);

module.exports = router;