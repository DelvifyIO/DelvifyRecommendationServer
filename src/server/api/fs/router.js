var express = require('express');
var router  = express.Router();
const controller = require('./controller');
const multer = require('multer');
const upload = multer();


// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Entered file system middleware.');
    next(); // make sure we go to the next routes and don't stop here
});

router.post('/parseCatalog/:userID', upload.single('file'), controller.parseCatalog);
router.post('/uploadCatalog/:userID', upload.single('file'), controller.uploadCatalog);
router.post('/storeCatalog/:userID', upload.single('file'), controller.storeCatalog);

module.exports = router;