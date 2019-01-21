//objeto que se llama igual a la coleccion de mongodb
'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//esquema de user
var UserSchema = Schema({
   name: String,
   lastname: String,
   rut: String,
   email: String,
   formation: String,
   yearold: String,
   gender: String,
   password: String,
   //Coach
   role_coach: String, 
   image: String,
   payment_bolet: Boolean,
   payment_facture30: Boolean,
   payment_facture60: Boolean,
   payment_facture90: Boolean,
   description: String,
   region1: String,
   region2: String,
   region3: String,
   phone_number: String,
   //Coachee
   registration_date: String,
   institution: String,
   institution_code: String,
   personas_cargo: Number,
   role_coachee: String
});
//guardar documentos como user ya que en mongoose se guardara como users
module.exports = mongoose.model('User', UserSchema);
