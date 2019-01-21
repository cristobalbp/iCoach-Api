//objeto que se llama igual a la coleccion de mongodb
'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//esquema de institution
var InstitutionSchema = Schema({
    name: String,
    code: String,
    password: String,
    // Personalidad
    reformador: String,
    ayudador: String,
    triunfador: String,
    artista: String, 
    pensador: String, 
    leal: String,
    entusiasta: String,
    protector: String,
    pacifico: String,

    // Estilos de aprendizaje
    cinestesico: String, 
    visual: String,
    auditivo: String,

    //usuario que crea la institucion
    user: { type: Schema.ObjectId, ref: 'User' }
});
module.exports = mongoose.model('Institution', InstitutionSchema);