'use strict'
var express = require('express');
var TaskController = require('../controllers/task');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/bugs'});

api.post('/task', md_auth.ensureAuth, [md_auth.ensureAuth, md_upload], TaskController.saveTask);
api.get('/gettask/:page?', md_auth.ensureAuth, TaskController.getTasks);
api.delete('/task/:id', md_auth.ensureAuth, TaskController.deleteTask);
api.get('/get-task/:id', md_auth.ensureAuth, TaskController.getTask);


module.exports = api;