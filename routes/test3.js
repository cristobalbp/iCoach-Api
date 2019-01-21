'use strict'
var express = require('express');
var Test3Controller = require('../controllers/test3');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/savetest3', md_auth.ensureAuth, Test3Controller.saveTest3);
api.get('/gettest3/:id', md_auth.ensureAuth, Test3Controller.getTest3);
api.get('/my-test3/:page?', md_auth.ensureAuth, Test3Controller.getMyTest3);


module.exports = api;