'use strict'
var jwt = require('jwt-simple');
var secret = 'clave_secreta_institutionjwt2';

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'la petición no tiene cabecera de autenticación'});
    }
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try{
        var payload = jwt.decode(token, secret);
        if(payload.exp <= moment().unix()){
          return res.status(401).send({message: 'El token a expirado' });
        }
      }catch(ex){
          return res.status(404).send({message: 'el token no es valido'});
      }
      req.institution = payload;
      next();
}