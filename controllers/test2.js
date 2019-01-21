'use strict'
var Test2 = require('../models/test2');
var User = require('../models/user');

var moment = require('moment');

function saveTest2(req, res){
    var test2 = new Test2();
    var params = req.body;

   if(params.hiena && params.perro && params.bufalo && params.leon){
    test2.hiena = params.hiena;
    test2.perro = params.perro;
    test2.bufalo = params.bufalo; 
    test2.leon = params.leon; 
    test2.user = req.user.sub; //usuario que esta ingresando el test
    test2.created_at = moment().unix();

    test2.save((err, test2Stored) => {
		if(err) return res.status(500).send({message: "Error al guardar"});
		if(!test2Stored) return res.status(404).send({message: "el test no a podido ser guardado"});

		return res.status(200).send({test2: test2Stored});
	});
    }else{
    res.status(200).send({
        message: 'Envia todos los campos'
      });
    } 
}

//Obtener por su id
function getTest2(req, res){
	var test2Id = req.params.id;

	Test2.findById(test2Id, (err, test2) => {
		if(err) return res.status(500).send({message: "Error al devolver "});
		if(!test2) return res.status(404).send({message: "no existe  "});
		return res.status(200).send({test2});

	});
}

// obtener todos los test realizados
function getMyTest2(req, res){
	var userId = req.user.sub;

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Test2.find({user: userId}).populate('user','name lastname institution image').sort('-created_at').paginate(page, itemsPerPage, (err, test2, total) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!test2) return res.status(404).send({message: 'No hay mensajes'});

		return res.status(200).send({
			total: total,
			pages: Math.ceil(total/itemsPerPage),
			test2
		});
	});
}

module.exports = {
    saveTest2,
    getTest2,
    getMyTest2
};