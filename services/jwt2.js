'use strict'
var jwt = require('jwt-simple');
var secret = 'clave_secreta_institutionjwt2';

exports.createToken = function(institution){
 var payload = {
    sub: institution._id,
    name: institution.name,
    code: institution.code
 };
 return jwt.encode(payload, secret);
};