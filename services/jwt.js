'use strict'

var jwt = require('jwt-simple');
var moment = require('moment'); //aqui cargamos la libreria para generar fechas
var secret = 'clave_secreta_icoach'; //clave secreta para desifrar los token
exports.createToken = function(user){
  //cargara el objeto con los datos del usuario
  var payload = {
      sub: user._id,
      name: user.name,
      lastname: user.lastname,
      rut: user.rut,
      email: user.email,
      gender: user.gender,
      //Coach
      formation: user.formation,
      yearold: user.yearold,
      role_coach: user.role_coach,
      image: user.image,
      payment_bolet: user.payment_bolet,
      payment_facture30: user.payment_facture30,
      payment_facture60: user.payment_facture60,
      payment_facture90: user.payment_facture90,
      description: user.description,
      region1: user.region1,
      region2: user.region2,
      region3: user.region3,
     //Coachee
      personas_cargo: user.personas_cargo,
      institution: user.institution,
      registration_date: user.registration_date,
      role_coachee: user.role_coachee,


      iat: moment().unix(),
      exp: moment().add(30,'days').unix
  };
  return jwt.encode(payload, secret)
};

