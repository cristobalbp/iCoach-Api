'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;
//conexion base de datos
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/iCoach', { useNewUrlParser: true })
          .then(()=>{
          console.log("conexión a bd establecida");
          //Creando el servidor
          app.listen(port, () => {
            console.log("servidor corriendo correctamente en la url: localhost:3800 ");
              })
        }).catch(error => console.log(error));


