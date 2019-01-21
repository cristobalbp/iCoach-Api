'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Test2Schema = Schema({
  hiena: String,
  perro: String,
  bufalo: String,
  leon: String,
  created_at: String,
  user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Test2', Test2Schema );

