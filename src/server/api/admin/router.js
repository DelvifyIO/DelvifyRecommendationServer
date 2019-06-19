var express = require('express');
var router  = express.Router();
const controller = require('./controller');

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Entered admin middleware.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', controller.getAdmins);
router.post('/', controller.addAdmin);
router.patch('/:id', controller.updateAdmin);
router.delete('/', controller.removeAdmin);

module.exports = router;