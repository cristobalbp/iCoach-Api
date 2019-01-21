'use strict'
var Test1 = require('../models/test1');
var User = require('../models/user');
var moment = require('moment');


function saveTest1(req, res){
    var test1 = new Test1();
    var params = req.body;

   if(params.visual && params.auditivo && params.cinestesico){
    test1.visual = params.visual;
    test1.cinestesico = params.cinestesico;
    test1.auditivo = params.auditivo; //por alguna razon no me guarda
    test1.user = req.user.sub; //usuario que esta ingresando el test
    test1.created_at = moment().unix();

    test1.save((err, test1Stored) => {
		if(err) return res.status(500).send({message: "Error al guardar"});
		if(!test1Stored) return res.status(404).send({message: "el test no a podido ser guardado"});

		return res.status(200).send({test1: test1Stored});
	});
    }else{
    res.status(200).send({
        message: 'Envia todos los campos'
      });
    } 
}

//Obtener por su id
function getTest1(req, res){
	var test1Id = req.params.id;
	Test1.findById(test1Id, (err, test1) => {
    if(err) return res.status(500).send({message: 'Error en la petición'});

		if(!test1){
			return res.status(404).send({message: 'La institución no existe'});
		} else{
			test1.password = undefined;
			return res.status(200).send({ test1 });
		}
  });
}


// obtener todos los test realizados
function getMyTest(req, res){
	var userId = req.user.sub;

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Test1.find({user: userId}).populate('user','name lastname institution image').sort('-created_at').paginate(page, itemsPerPage, (err, test1, total) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!test1) return res.status(404).send({message: 'No hay mensajes'});

		return res.status(200).send({
			total: total,
			pages: Math.ceil(total/itemsPerPage),
			test1
		});
	});
}



module.exports = {
    saveTest1,
    getTest1,
	getMyTest
};