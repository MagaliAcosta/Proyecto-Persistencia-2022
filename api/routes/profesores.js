var express = require("express");
var router = express.Router();
var models = require("../models");

const findProfesorDni = (dniBuscado, { onSuccess, onNotFound, onError }) => {
  models.profesores
      .findOne({
        attributes: ["id", "nombre","apellido", "dni"],
        where: {dni: dniBuscado }
      })
      .then(profesor => (profesor ? onSuccess(profesor) : onNotFound()))
      .catch(() => onError());
};

router.get("/", (req, res,next) => {
  const paginaActualNumero = Number.parseInt(req.query.paginaActual);
  const cantidadNumero = Number.parseInt(req.query.cantidad);

  models.profesores.findAll({
    offset: (paginaActualNumero * cantidadNumero), 
    limit: cantidadNumero,
    attributes: ["id","nombre","apellido", "dni"],
       
    include:[
        {as:'Materia-Relacionada', 
        model:models.materia, 
        attributes: ["id","nombre"]}
    ]

    }).then(profesores => res.send(profesores)).catch(error => { return next(error)});
});


router.get("/:dni", (req, res) => {
  findProfesorDni(req.params.dni, {
      onSuccess: profesor => res.send(profesor),
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
  });
});

router.post("/", (req, res) => {
  if(req.body.dni == null){
    res.status(400).send(`Es necesario que se escriba un dni`);
  } else {
    models.profesores
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, dni: req.body.dni, id_materia: req.body.id_materia })
    .then(profesor => res.status(201).send({id:profesor.id, nombre: profesor.nombre, apellido: profesor.apellido, dni:profesor.dni }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send(`Ya existe un profesor con dni: ${req.body.dni}`)
    }
    else {
        console.log(`Error al intentar actualizar la base de datos: ${error}`)
        res.sendStatus(500)
    }
    });
  }
});

router.put("/:dni", (req, res) => {
  const onSuccess = profesor =>
      profesor
          .update({ nombre: req.body.nombre, apellido: req.body.apellido, id_materia: req.body.id_materia}, { fields: ["nombre", "apellido", "id_materia"] })
          .then(() => res.status(200).send("Se ha podido actualizar correctamente"))
          .catch(error => {
                 console.log(`Error al intentar actualizar la base de datos: ${error}`)
                 res.sendStatus(500)
          });
  findProfesorDni(req.params.dni, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
  });
});

router.delete("/:dni", (req, res) => {
  const onSuccess = profesor =>
      profesor
          .destroy()
          .then(() => res.status(200).send("El registro se ha eliminado correctamente"))
          .catch(() => res.sendStatus(500));

  findProfesorDni(req.params.dni, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
  });
});



module.exports = router;