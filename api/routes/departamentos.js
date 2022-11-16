var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  
  models.departamentos
      .findAll({
          attributes: ["id", "nombre"],
          include: [
            {
              as: 'Carreras-Relacionadas', model:models.carrera, attributes: ["id", "nombre"]
          }]
      })
      .then(departamento => res.send(departamento))
      .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.departamentos
    .create({ nombre: req.body.nombre })
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

const findDepartamento = (nombreABuscar, { onSuccess, onNotFound, onError }) => {
  models.departamentos
    .findOne({
      attributes: ["id", "nombre"],
      include: [
        {
          as: 'Carreras-Relacionadas', model:models.carrera, attributes: ["id", "nombre"]
      }],
      where: { nombre: nombreABuscar }
    })
    .then(departamento => (departamento ? onSuccess(carrera) : onNotFound()))
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
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
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