'use strict'
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res){
	res.status(200).send({message: "Hola desde el controlador"});
}
//Guardar publicacion
function savePublication(req, res){
	var params = req.body;
	if (!params.text) return res.status(200).send({message: "debes enviar un texto"})
	
	var publication = new Publication();
	publication.text = params.text;
	publication.file = 'null';
	publication.user = req.user.sub; //usuario que esta creanddo la publicacion
	publication.created_at = moment().unix(); //guardar la fecha de creacion

	publication.save((err, publicationStored) => {
		if(err) return res.status(500).send({message: "Error al guardar la publicacion"});
		if(!publicationStored) return res.status(404).send({message: "la publicacion no a podido ser guardada"});

		return res.status(200).send({publication: publicationStored});
	});
}
//Obtener lista de publicaciones
function getPublications(req, res){
	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
		if(err) return res.status(500).send({message: "Error al devolver el seguimiento"});
		var follows_clean = [];
		follows.forEach((follow) => {
			follows_clean.push(follow.followed); 
		});
		
	// Para sacar mis propias publicaciones
	follows_clean.push(req.user.sub);


		//buscamos las publicaciones que tienen los usuarios
		Publication.find({user: {"$in": follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
				if(err) return res.status(500).send({message: "Error al devolver publicaciones"});
				if(!publications) return res.status(404).send({message: "no hay publicaciones"});
				return res.status(200).send({
					total_items: total,
					pages: Math.ceil(total/itemsPerPage),
					page: page,
					items_per_page: itemsPerPage,
					publications 
				});

		});
		
	});
}

//Obtener una publciacion por su id
function getPublication(req, res){
	var publicationId = req.params.id;

	Publication.findById(publicationId, (err, publication) => {
		if(err) return res.status(500).send({message: "Error al devolver publicaciones"});
		if(!publication) return res.status(404).send({message: "no existe publicacion "});
		return res.status(200).send({publication});

	});
}
//Obtener publicaciones de solo 1 usuario
function getPublicationsUser(req, res){
	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var user = req.user.sub;
	if(req.params.user){
		user = req.params.user;
	}

	var itemsPerPage = 4;

	Publication.find({user: user}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
		if(err) return res.status(500).send({message: 'Error devolver publicaciones'});

		if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

		return res.status(200).send({
			total_items: total,
			pages: Math.ceil(total/itemsPerPage),
			page: page,
			items_per_page: itemsPerPage,
			publications
		});
	});

}

//Eliminar una publicacion
function deletePublication(req, res){
	var publicationId = req.params.id;

	Publication.find({'user': req.user.sub, '_id': publicationId}).remove(err => {
		if(err) return res.status(500).send({message: 'Error al borrar publicaciones'});
		
		return res.status(200).send({message: 'Publicación eliminada correctamente'});
	});
}

//Subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
  var publicationId = req.params.id;

  if (req.files){
    var file_path = req.files.image.path;
    var file_split = file_path.split('/');
    var file_name = file_split[2];
    var ext_split = file_name.split('.');  //comprobar la extension del archivo
    var file_ext = ext_split[1];//para saber la extencion

    //comprobando que las extensiones son correctas
    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
      //actualizamos el documento de la publicacion
    	Publication.findOne({'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {
    		if (publication) {
    			Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new:true},(err, publicationUpdated) =>{
        			if(err) return res.status(500).send({message: 'Error en la peticion'});
        			if (!publicationUpdated) return res.status(404).send({message: 'no se a podido actualizar la publicacion'});
        			return res.status(200).send({publication: publicationUpdated});
      			});
    		}else{
    		    return removeFilesOfUploads(res, file_path, 'Authorizacion no valida');
    		}
    	});
      	
    }else{
      return removeFilesOfUploads(res, file_path, 'extensión no valida');
    }

  }else{
    return res.status(200).send({message: 'no se ha subido la imagen '});
  }
}

function removeFilesOfUploads(res, file_path, message) {
  fs.unlink(file_path, (err) => {
          return res.status(200).send({
            message: message
          });
        });
}

function getImageFile(req, res){
  var image_file = req.params.imageFile;
  var path_file =  './uploads/publications/'+image_file;

  fs.exists(path_file, (exists) =>{
    if(exists){
      res.sendFile(path.resolve(path_file));
    }else{
      res.status(200).send({message: 'no existe la imagen'});
    }
  });
  

}


module.exports = {
	probando,
	savePublication,
	getPublications,
	getPublicationsUser,
	getPublication,
	deletePublication,
	uploadImage,
	getImageFile,

}