'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Test3Schema = Schema({
    reformador: String,
    ayudador: String,
    triunfador: String,
    artista: String,
    pensador: String,
    leal: String,
    entusiasta: String,
    protector: String,
    pacifico: String,
    created_at: String,
    user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Test3', Test3Schema );