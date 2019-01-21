'use strict'
var express = require('express');
var BugsReportController = require('../controllers/bugsreport');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/bugs'});

api.post('/bugs', md_auth.ensureAuth, BugsReportController.saveBug);
api.post('/upload-image-bug/:id', [md_auth.ensureAuth, md_upload], BugsReportController.uploadImage);


module.exports = api;