'use strict'
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Task = require('../models/task');
var User = require('../models/user');

//Guardar 
function saveTask(req, res){
	var params = req.body;
	
	var task = new Task();
	task.text = params.text;
	task.user = req.user.sub; //usuario que esta creanddo
	task.created_at = moment().unix(); //guardar la fecha de creacion

	task.save((err, taskStored) => {
		if(err) return res.status(500).send({message: "Error al guardar la publicacion"});
		if(!taskStored) return res.status(404).send({message: "la publicacion no a podido ser guardada"});

		return res.status(200).send({task: taskStored});
	});
}


// obtener todos las empresas creadas por el usuario
function getTasks(req, res){
	var userId = req.user.sub;

	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	Task.find({user: userId}).populate('user','name lastname institution image').sort('+created_at').paginate(page, itemsPerPage, (err, task, total) => {
		if(err) return res.status(500).send({message: 'Error en la petición'});
		if(!task) return res.status(404).send({message: 'No hay mensajes'});

		return res.status(200).send({
			total: total,
			pages: Math.ceil(total/itemsPerPage),
			task
		});
	});
}

//Obtener una task por su id
function getTask(req, res){
	var taskId = req.params.id;

	Task.findById(taskId, (err, task) => {
		if(err) return res.status(500).send({message: "Error al devolver publicaciones"});
		if(!task) return res.status(404).send({message: "no existe publicacion "});
		return res.status(200).send({task});

	});
}

//Eliminar una tarea
function deleteTask(req, res){
	var taskId = req.params.id;

	Task.find({'user': req.user.sub, '_id': taskId}).remove(err => {
		if(err) return res.status(500).send({message: 'Error al borrar publicaciones'});
		
		return res.status(200).send({message: 'Publicación eliminada correctamente'});
	});
}


module.exports = {
    saveTask,
    getTasks,
	deleteTask,
	getTask
}