'use strict'

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var db = require('./index');

//cargaremos archivos de rutas
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');
var message_routes = require('./routes/message');
var institution_routes = require('./routes/institution');
var test1_routes = require('./routes/test1');
var test2_routes = require('./routes/test2');
var test3_routes = require('./routes/test3');
var bugsreport_routes = require('./routes/bugsreport');
var task_routes = require('./routes/task');

//middelwares metodo que se ejecuta antes de llegar al controlador
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Configuracion cabeceras y cors

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});
var originsWhitelist = [
  'http://localhost:4200',      //this is my front-end url for development

];
var corsOptions = {
  origin: function(origin, callback){
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true
}

app.use(cors(corsOptions));

//rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);
app.use('/api', institution_routes);
app.use('/api', test1_routes);
app.use('/api', test2_routes);
app.use('/api', test3_routes);
app.use('/api', bugsreport_routes);
app.use('/api', task_routes);


//exportar configuracion
module.exports = app;
