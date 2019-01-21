'use strict'
var Institution = require('../models/institution');
var bcrypt = require('bcrypt-nodejs'); //para cifrar las contraseñas
var jwt2 = require('../services/jwt2');
    
function saveInstitutionCode(req, res){
	var params = req.body;
	var institution = new Institution();
	if(params.name && params.code && params.password){
		institution.name = params.name;
		institution.code = params.code;
		institution.password = params.password;
		institution.user = req.user.sub; //usuario que esta creando la institucion

		//Test personalidad
		institution.reformador = params.reformador;
		institution.ayudador = params.ayudador;
		institution.triunfador = params.triunfador;
		institution.artista = params.artista;
		institution.pensador = params.pensador;
		institution.leal = params.leal; 
		institution.entusiasta = params.entusiasta;
		institution. protector = params.protector;
		institution.pacifico = params.pacifico;
	 
		// Estilos de aprendizaje
		institution.cinestesico  = params.cinestesico;
		institution.visual = params.visual;
		institution.auditivo = params.auditivo;

		//Comprobamos si ya existe el code
		Institution.find({ $or: [
			{code: institution.code.toLowerCase()}
		]
		}).exec((err, institutions) => {

			if(err) return res.status(500).send({message: "Error en la peticion"});

			if(institutions && institutions.length >= 1){
				return res.status(200).send({message: 'El codigo ya a sido ingresado'}); 
			}else{
			 //aqui cargo bcryp y cifra el password
			 bcrypt.hash(params.password, null, null, (err, hash) => {
				institution.password = hash;
				institution.save((err, institutionStored) => {
				  if (err) return res.status(500).send({
					message: 'Error al guardar la institucion'
				  });
				  if (institutionStored) {
					res.status(200).send({
					  institucion: institutionStored
					});
				  } else {
					res.status(404).send({
					  message: 'Institucion no se a podido guardar'
					});
				  }
				});
			  });
			}
		});
	}else{
	res.status(200).send({ message: 'Envia todos los campos necesarios' });	
	}
}

// Para dejar entrar al registro de participante
function allowAccess(req, res){
	var params = req.body;
	var code = params.code;
	var password = params.password;
	//buscamos una coleccion que contenga los siguientes datos
	Institution.findOne({ code: code }, (err, institution) => {
	  if (err) return res.status(500).send({ message: 'Error al dar acceso' });
	  //compara la password cifrada con la password que se ingresa
	  if (institution) {
		bcrypt.compare(password, institution.password, (err, check) => {
		  if (check) {
			//devolver datos ingresados
				if(params.gettoken2){
					// devolver token y Generar token	
					return res.status(200).send({ token: jwt2.createToken(institution)})
				}else{
					// datos de la institucion limpios
					institution.password = undefined;
					return res.status(200).send({ institution });
				}
	
		  } else {
			//devolver un error
			if (err) return res.status(404).send({ message: 'El usuario no a podido entrar' });
		  }
		});
	  } else {
		return res.status(404).send({ message: 'No se a podido ingresar' });
	  }
	}); 
}
// conseguir datos (resultados test) de la empresa
function getInstitution(req, res){

	var institutionId = req.params.id;

	Institution.findById(institutionId, (err, institution) => {
    if(err) return res.status(500).send({message: 'Error en la petición'});

		if(!institution){
			return res.status(404).send({message: 'La institución no existe'});
		} else{
			institution.password = undefined;
			return res.status(200).send({ institution });
		}
  });
}

// obtener todos las empresas creadas por el usuario
function getMyInstitutions(req, res){
	var userId = req.user.sub;

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Institution.find({user: userId}).populate('user','name lastname institution image').sort('+created_at').paginate(page, itemsPerPage, (err, institution, total) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!institution) return res.status(404).send({message: 'No hay mensajes'});

		return res.status(200).send({
			total: total,
			pages: Math.ceil(total/itemsPerPage),
			institution
		});
	});
}


module.exports = {
	saveInstitutionCode,
	allowAccess,
	getMyInstitutions,
	getInstitution
}
