var express = require("express");
var router = express.Router();
var models = require("../models");
const departamento = require("../models/departamento");

router.get("/", (req, res) => {
    const paginaActualNumero = Number.parseInt(req.query.paginaActual);
    const cantidadNumero = Number.parseInt(req.query.cantidad);
  
    models.departamento.findAll({
      offset: (paginaActualNumero * cantidadNumero), 
      limit: cantidadNumero,
      attributes: ["nombre","id_carrera"],
         
      include:[
          {as:'Carrera-Relacionada', 
          model:models.carrera, 
          attributes: ["id","nombre"]
        }
      ]
  
      }).then(departamento => res.send(departamento))
      .catch(() => res.sendStatus(500));
  });

  router.post("/", (req, res) => {
    models.departamento
      .create({ nombre: req.body.nombre, id_carrera: req.body.id_carrera })
      .then(departamento => res.status(201).send({ id: departamento.id }))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otro departamento con el mismo nombre')
        }
        else {
          console.log(`Error al intentar insertar en la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
  });

  const findDepartamento = (id, { onSuccess, onNotFound, onError }) => {
    models.departamento
      .findOne({
        attributes: ["id", "nombre", "id_carrera"],
        where: { id }
      })
      .then(departamento => (departamento ? onSuccess(departamento) : onNotFound()))
      .catch(() => onError());
  };

  router.get("/:nombre", (req, res) => {
    findDepartamento(req.params.nombre, {
      onSuccess: departamento => res.send(departamento),
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  });


  router.put("/:nombre", (req, res) => {
    const onSuccess = departamento =>
      departamento
        .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
        .then(() => res.sendStatus(200))
        .catch(error => {
          if (error == "SequelizeUniqueConstraintError: Validation error") {
            res.status(400).send('Bad request: existe otro departamento con el mismo nombre')
          }
          else {
            console.log(`Error al intentar actualizar la base de datos: ${error}`)
            res.sendStatus(500)
          }
        });
      findDepartamento(req.params.nombre, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  });


  router.delete("/:nombre", (req, res) => {
    const onSuccess = departamento =>
      departamento
        .destroy()
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
    findDepartamento(req.params.nombre, {
      onSuccess,
      onNotFound: () => res.sendStatus(404),
      onError: () => res.sendStatus(500)
    });
  });
  





module.exports = router;