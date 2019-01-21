'use strict'
//librerias
var mongoosePaginate = require('mongoose-pagination');
var bcrypt = require('bcrypt-nodejs'); //para cifrar las contraseñas
var fs = require('fs');
var path = require('path');

//modulos
var User = require('../models/user');
var Publication = require('../models/publication');
var Follow = require('../models/follow');
var jwt = require('../services/jwt');
var Institution = require('../models/institution');


//metodo de prueba
function home(req, res) {
  res.status(200).send({
    message: 'Prueba desde home'
  });
}
//Resgistrar usuario
function saveUser(req, res) {
  var params = req.body;
  var user = new User();
  if(params.name && params.lastname && params.rut && params.email && params.yearold && params.gender && params.password ) {
   
    user.name = params.name;
    user.lastname = params.lastname;
    user.rut = params.rut;
    user.email = params.email;
    user.yearold = params.yearold;
    user.gender = params.gender;

    //Coach
    user.formation = params.formation;
    user.payment_bolet = params.payment_bolet;
    user.payment_facture30 = params.payment_facture30;
    user.payment_facture60 = params.payment_facture60;
    user.payment_facture90 = params.payment_facture90;
    user.description = params.description;
    user.role_coach = params.role_coach;
    user.region1 = params.region1;
    user.region2 = params.region2;
    user.region3 = params.region3;
    user.phone_number = params.phone_number;

    //Coachee
    user.registration_date = params.registration_date;
    user.institution = params.institution;
    user.institution_code = params.institution_code;
    user.personas_cargo = params.personas_cargo;
    user.role_coachee = params.role_coachee;  
    user.image = null;
    
    //validacion para que no existan usuarios duplicados
    User.find({
      $or: [{
          email: user.email.toLowerCase()
        },
        {
          rut: user.rut
        }
      ]
    }).exec((err, users) => {
      if (err) return res.status(500).send({
        message: 'Error en la peticion de usuario'
      });
      if (users && users.length >= 1) {
        return res.status(200).send({
          message: 'El usuario ya esta registrado'
        });
      } else {
        //aqui cargo bcryp y cifra el password
        bcrypt.hash(params.password, null, null, (err, hash) => {
          user.password = hash;
          user.save((err, userStored) => {
            if (err) return res.status(500).send({
              message: 'Error al guardar el usuario'
            });
            if (userStored) {
              res.status(200).send({
                user: userStored
              });
            } else {
              res.status(404).send({
                message: 'Usuario no se a podido registrar'
              });
            }
          });
        });
      }
    });
  }else{
    res.status(200).send({
      message: 'Envia todos los campos'
    });
  }
}


//Login usuarios
function loginUser(req, res) {
  var params = req.body;
  var email = params.email;
  var password = params.password;
  //buscamos una coleccion que contenga los siguientes datos
  User.findOne({
    email: email
  }, (err, user) => {
    if (err) return res.status(500).send({
      message: 'Error al ingresar'
    });
    //compara la password cifrada con la password que se ingresa
    if (user) {
      bcrypt.compare(password, user.password, (err, check) => {
        if (check) {
          //devolver datos de usuario en token encriptados
          if (params.gettoken) {
            // generar y devolver el token
            return res.status(200).send({
              token: jwt.createToken(user)
            });
          } else {
            //devlver usuariario sin encriptacion
            user.password = undefined; //para que no devuelva la password
            return res.status(200).send({
              user
            });
          }
        } else {
          //devolver un error
          if (err) return res.status(404).send({
            message: 'El usuario no se a podido identificar'
          });
        }
      });
    } else {
      if (err) return res.status(404).send({
        message: 'No se a podido identificar'
      });
    }
  }); 
}

//cargar datos de un usuario sin token
function getUserW(req, res) {
  var userId = req.params.id;
  User.findById(userId, (err,user) => {
    if (err) return res.status(500).send({message: 'Error en la petición'});
    if (!user) return res.status(404).send({message: 'El usuario no existe'});

    return res.status(200).send({user});
  });
}

// Conseguir datos de un usuario con token
function getUser(req, res){
  var userId = req.params.id;

  User.findById(userId, (err, user) => {
    if(err) return res.status(500).send({message: 'Error en la petición'});

    if(!user) return res.status(404).send({message: 'El usuario no existe'});

    followThisUser(req.user.sub, userId).then((value) => {
      user.password = undefined;

      return res.status(200).send({
        user,
        following: value.following, 
        followed: value.followed
      });
    });

  });
}



  async function followThisUser(identity_user_id, user_id){
    try {
        var following = await Follow.findOne({ user: identity_user_id, followed: user_id}).exec()
            .then((following) => {
                console.log(following);
                return following;
            })
            .catch((err)=>{
                return handleerror(err);
            });
        var followed = await Follow.findOne({ user: user_id, followed: identity_user_id}).exec()
            .then((followed) => {
                console.log(followed);
                return followed;
            })
            .catch((err)=>{
                return handleerror(err);
            });
        return {
            following: following,
            followed: followed
        }
    } catch(e){
        console.log(e);
    }
}


//Devolver un listado de usuarios paginados
function getUsers(req, res) {
  var identity_user_id = req.user.sub; //carga el id del usuario logeado del servicio jwt
  var page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  var itemsPerPage; //5 usuarios por pagina
  User.find({role_coachee: 'yes'}).sort('institution').paginate(page, itemsPerPage,(err, users, total) => {
    if (err) return res.status(500).send({
      message: 'Error en la peticion'
    });

    if (!users) return res.status(404).send({
      message: 'No hay usuarios disponibles'
    });

    followUserIds(identity_user_id).then((value) => {
          return res.status(200).send({
           users,
           users_following: value.following,
           users_follow_me: value.followed,
           total,
           pages: Math.ceil(total / itemsPerPage)
          });
      });
  });
}


  async function followUserIds(user_id){
try{
var following = await Follow.find({"user":user_id}).select({'_id':0, '__v':0, 'user':0}).exec() 
.then((follows) => {
    return follows;
})
.catch((err)=>{
return handleError(err)
});

  var followed = await Follow.find({"followed":user_id}).select({'_id':0, '__v':0, 'followed':0}).exec()
  .then((follows)=>{
  return follows;
  })
  .catch((err)=>{
  return handleError(err)
  });
            
        //Procesar following Ids
            var following_clean = [];
      
            following.forEach((follow) => {
              following_clean.push(follow.followed);
            });
 
            //Procesar followed Ids
            var followed_clean = [];
        
            followed.forEach((follow) => {
              followed_clean.push(follow.user);
            });
            
      
        return {
                 following: following_clean,
                 followed: followed_clean
               }
      
      } catch(e){
      console.log(e);
      }
}
// para cotnar quien nos sigue, cuantas publicaciones tenemos etc
function getCounters(req, res){
  var userId = req.user.sub;

  if(req.params.id){
    userId = req.params.id;
  }
  getCountFollow(userId).then((value) => {
      return res.status(200).send(value);
    });
}

async function getCountFollow(user_id){
  try{
  
  var following = await Follow.count({"user":user_id}).exec().then(count=>{
    return count;
  }).catch((err)=>{return handleError(err);
    });

  var followed = await Follow.count({"followed":user_id}).exec()
    .then(count=>{
      return count;
    }).catch((err)=>{
      return handleError(err);
    });
  
  var publications = await Publication.count({"user":user_id}).exec().then(count => {
      return count;
      }).catch((err) => {
        if(err) return handleError(err);
      });
      
    

      return {
      following:following,
      followed:followed,
      publications: publications
    }

  }catch(e){
  console.log(e);
  }
}


//Editar datos del usuario
function updateUser(req, res){
  var userId = req.params.id;
  var update = req.body;

  //borramos la propiedad password para que no se pueda editar en esta funcion
  delete update.password;

  if(userId != req.user.sub) {
    return res.status(500).send({message: 'no tienes permiso para actualizar'});
  }

  //Validacion usurios duplicados
  User.find({ $or: [
            {email: update.email}, 
            {rut: update.rut}
            ]}).exec((err, users) => {
      
      var user_isset = false;

      users.forEach((user) => {
        if(user && user._id != userId) user_isset = true;
      });

  if(user_isset) return res.status(200).send({message: 'Los datos ya estan en uso'}); 

  User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
      if(err) return res.status(500).send({message: 'Error en la peticion'});
      if(!userUpdated) return res.status(404).send({message: 'no se a podido actualizar el usuario'});
      return res.status(200).send({user: userUpdated});
    });
  });
}

//Subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
  var userId = req.params.id;

  if (req.files){
    var file_path = req.files.image.path;
    var file_split = file_path.split('/');
    var file_name = file_split[2];
    var ext_split = file_name.split('.');  //comprobar la extension del archivo
    var file_ext = ext_split[1];//para saber la extencion


    if (userId != req.user.sub){
      return removeFilesOfUploads(res, file_path, 'no tienes permiso para actualizar');
    }
    //comprobando que las extensiones son correctas
    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
      //actualizamos el documento de usuario logeado
      User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) =>{
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if (!userUpdated) return res.status(404).send({message: 'no se a podido actualizar el usuario'});
        return res.status(200).send({user: userUpdated});
      });
    }else{
      return removeFilesOfUploads(res, file_path, 'extensión no valida');
    }

  }else{
    return res.status(200).send({message: 'no se ha subido la imagen'});
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
  var path_file =  './uploads/users/'+image_file;

  fs.exists(path_file, (exists) =>{
    if(exists){
      res.sendFile(path.resolve(path_file));
    }else{
      res.status(200).send({message: 'no existe la imagen'});
    }
  });
  

}
function getAllUsers(req, res) {
 
    var page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  var itemsPerPage = 8; //8 usuarios por pagina
  User.find({role_coach: 'yes'}).sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
    if (err) return res.status(500).send({message: 'Error en la peticion'});
    if (!users) return res.status(404).send({message: 'No hay usuarios disponibles'});
    return res.status(200).send({
      users,
      total,
      pages: Math.ceil(total/itemsPerPage) 
    });

  });
  
  
}

module.exports = {
  home,
  saveUser,
  loginUser,
  getUser,
  getUserW,
  getUsers,
  getCounters,
  updateUser,
  uploadImage,
  getImageFile,
  getAllUsers
  
}
