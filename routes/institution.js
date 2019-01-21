'use strict'
var express = require('express');
var InstitutionController = require('../controllers/institution');

var api = express.Router();
var md_auth2 = require('../middlewares/authenticated2');
var md_auth = require('../middlewares/authenticated');


api.post('/save-institution', md_auth.ensureAuth, InstitutionController.saveInstitutionCode);
api.post('/allow-access', InstitutionController.allowAccess);
api.get('/my-institutions/:page?', md_auth.ensureAuth, InstitutionController.getMyInstitutions);
api.get('/get-institution/:id', md_auth.ensureAuth, InstitutionController.getInstitution);


module.exports = api;