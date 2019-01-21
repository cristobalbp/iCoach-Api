'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Test1Schema = Schema({
  auditivo: String,
  visual: String,
  cinestesico: String,
  created_at: String,
  user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Test1', Test1Schema );