var express = require('express');
var router  = express.Router();
const controller = require('./controller');

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Entered recommendation middleware.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/similar', controller.getSimilarities);
router.get('/featured', controller.getFeatured);
router.get('/cart', controller.getFeatured);

module.exports = router;