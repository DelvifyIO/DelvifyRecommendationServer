var express = require('express');
var router  = express.Router();
const controller = require('./controller');
const multer = require('multer');
const upload = multer();


// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Entered ai middleware.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/search', controller.searchByText);
router.post('/search', upload.single('image'), controller.searchByImage);
router.post('/recognize', upload.single('audio'), controller.recognizeAudio);
router.get('/searchDemo', controller.searchDemo);

module.exports = router;