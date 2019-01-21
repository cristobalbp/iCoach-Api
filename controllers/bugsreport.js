'use strict'
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var BugsReport = require('../models/bugsreport');
var User = require('../models/user');

//Guardar publicacion
function saveBug(req, res){
	var params = req.body;
	if (!params.text) return res.status(200).send({message: "debes enviar un texto"})
	
	var bugsreport = new BugsReport();
	bugsreport.text = params.text;
	bugsreport.file = 'null';
	bugsreport.user = req.user.sub; //usuario que esta creanddo la publicacion
	bugsreport.created_at = moment().unix(); //guardar la fecha de creacion

	bugsreport.save((err, bugsreportStored) => {
		if(err) return res.status(500).send({message: "Error al guardar la publicacion"});
		if(!bugsreportStored) return res.status(404).send({message: "la publicacion no a podido ser guardada"});

		return res.status(200).send({bugsreport: bugsreportStored});
	});
}

//Subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
    var bugsreportId = req.params.id;
  
    if (req.files){
      var file_path = req.files.image.path;
      var file_split = file_path.split('/');
      var file_name = file_split[2];
      var ext_split = file_name.split('.');  //comprobar la extension del archivo
      var file_ext = ext_split[1];//para saber la extencion
  
      //comprobando que las extensiones son correctas
      if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
        //actualizamos el documento 
        BugsReport.findOne({'user': req.user.sub, '_id': bugsreportId }).exec((err, bugsreport) => {
              if (bugsreport) {
                BugsReport.findByIdAndUpdate(bugsreportId, {file: file_name}, {new:true},(err, bugsReportUpdated) =>{
                      if(err) return res.status(500).send({message: 'Error en la peticion'});
                      if (!bugsReportUpdated) return res.status(404).send({message: 'no se a podido actualizar la publicacion'});
                      return res.status(200).send({bugsreport: bugsReportUpdated});
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
    var path_file =  './uploads/bugs/'+image_file;
  
    fs.exists(path_file, (exists) =>{
      if(exists){
        res.sendFile(path.resolve(path_file));
      }else{
        res.status(200).send({message: 'no existe la imagen'});
      }
    });
    
  
  }


module.exports = {
    saveBug,
    uploadImage

}