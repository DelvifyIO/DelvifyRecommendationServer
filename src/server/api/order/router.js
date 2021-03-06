var express = require('express');
var router  = express.Router();
const controller = require('./controller');

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Entered order middleware.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', controller.getOrders);
router.post('/', controller.insertOrder);
router.get('/amount', controller.getOrderAmount);
router.get('/interval', controller.getTimeToPurchase);
router.get('/all', controller.getAllOrders);

module.exports = router;