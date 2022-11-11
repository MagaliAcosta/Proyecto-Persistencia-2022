var express = require("express");
var router = express.Router();
var models = require("../models");

const findAlumnoDni = (dniBuscado, { onSuccess, onNotFound, onError }) => {
  models.profesores
      .findOne({
        attributes: ["id", "nombre","apellido", "dni"],
        where: {dni: dniBuscado }
      })
      .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
      .catch(() => onError());
};


router.get("/", (req, res,next) => {

  models.alumnos.findAll({attributes: ["id","nombre","apellido","email","dni","password"],
       
    include:[
        {as:'Carrera-Relacionada', 
        model:models.carrera, 
        attributes: ["id","nombre"]
      }
    ]

    }).then(alumno => res.send(alumno)).catch(error => { return next(error)});
});

router.get("/:dni", (req, res) => {
  findAlumnoDni(req.params.dni, {
      onSuccess: alumno => res.send(alumno),
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
  });
});

router.post("/", (req, res) => {
  if(req.body.dni == null){
    res.status(400).send(`Es necesario que se escriba un dni`);
  } else {
    models.alumnos
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, dni: req.body.dni, email: req.body.email, password: req.body.password, id_carrera: req.body.id_carrera })
    .then(profesor => res.status(201).send({id:profesor.id, nombre: profesor.nombre, apellido: profesor.apellido, dni:profesor.dni }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send(`Ya existe un alumno con dni: ${req.body.dni}`)
    }
    else {
        console.log(`Error al intentar actualizar la base de datos: ${error}`)
        res.sendStatus(500)
    }
    });
  }
});

router.put("/:dni", (req, res) => {
  const onSuccess = alumno =>
      alumno
          .update({ nombre: req.body.nombre, apellido: req.body.apellido, email: req.body.email, password: req.body.password, id_carrera: req.body.id_carrera}, { fields: ["nombre", "apellido", "id_materia"] })
          .then(() => res.status(200).send("Se ha podido actualizar correctamente"))
          .catch(error => {
                 console.log(`Error al intentar actualizar la base de datos: ${error}`)
                 res.sendStatus(500)
          });
  findAlumnoDni(req.params.dni, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
  });
});

router.delete("/:dni", (req, res) => {
  const onSuccess = alumno =>
  alumno
          .destroy()
          .then(() => res.status(200).send("El registro se ha eliminado correctamente"))
          .catch(() => res.sendStatus(500));

  findAlumnoDni(req.params.dni, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
  });
});

module.exports = router;