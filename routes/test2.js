'use strict'
var express = require('express');
var Test2Controller = require('../controllers/test2');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/savetest2', md_auth.ensureAuth, Test2Controller.saveTest2);
api.get('/gettest2/:id', md_auth.ensureAuth, Test2Controller.getTest2);
api.get('/my-test2/:page?', md_auth.ensureAuth, Test2Controller.getMyTest2);


module.exports = api;