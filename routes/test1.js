'use strict'
var express = require('express');
var Test1Controller = require('../controllers/test1');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/savetest1', md_auth.ensureAuth, Test1Controller.saveTest1);
api.get('/gettest1/:id', md_auth.ensureAuth, Test1Controller.getTest1);
api.get('/my-test/:page?', md_auth.ensureAuth, Test1Controller.getMyTest);

module.exports = api;
