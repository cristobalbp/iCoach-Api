'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = Schema({
  text: String,
  created_at: String,
  user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Task', TaskSchema );