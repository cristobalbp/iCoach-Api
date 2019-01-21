'use strict'
var Test3 = require('../models/test3');
var User = require('../models/user');

var moment = require('moment');

function saveTest3(req, res){
    var test3 = new Test3();
    var params = req.body;

   if(params.reformador && params.ayudador && params.triunfador && params.artista && params.pensador 
    && params.leal && params.entusiasta && params.protector && params.pacifico){

    test3.reformador = params.reformador;
    test3.ayudador = params.ayudador;
    test3.triunfador = params.triunfador; 
    test3.artista = params.artista; 
    test3.pensador = params.pensador;
    test3.leal = params.leal;
    test3.entusiasta = params.entusiasta;
    test3.protector = params.protector;
    test3.pacifico = params.pacifico;
    test3.user = req.user.sub; //usuario que esta ingresando el test
    test3.created_at = moment().unix();

    test3.save((err, test3Stored) => {
		if(err) return res.status(500).send({message: "Error al guardar"});
		if(!test3Stored) return res.status(404).send({message: "el test no a podido ser guardado"});

		return res.status(200).send({test3: test3Stored});
	});
    }else{
    res.status(200).send({
        message: 'Envia todos los campos'
      });
    } 
}

//Obtener por su id
function getTest3(req, res){
	var test3Id = req.params.id;

	Test3.findById(test3Id, (err, test3) => {
		if(err) return res.status(500).send({message: "Error al devolver "});
		if(!test3) return res.status(404).send({message: "no existe  "});
		return res.status(200).send({test3});

	});
}

// obtener todos los test realizados
function getMyTest3(req, res){
	var userId = req.user.sub;

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Test3.find({user: userId}).populate('user','name lastname institution image').sort('+created_at').paginate(page, itemsPerPage, (err, test3, total) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!test3) return res.status(404).send({message: 'No hay mensajes'});

		return res.status(200).send({
			total: total,
			pages: Math.ceil(total/itemsPerPage),
			test3
		});
	});
}

module.exports = {
    saveTest3,
    getTest3,
    getMyTest3
};
