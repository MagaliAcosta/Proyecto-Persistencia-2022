var express = require("express");
var router = express.Router();
var models = require("../models");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.profesores
    .findAll({
      attributes: ["nombre", "apellido"],
      include:[{as:'materia-Relacionada', model:models.materia, attributes: ["id","nombre"]}]

    })
    .then(profesores => res.send(profesores))
    .catch(() => res.sendStatus(500));
});

router.post("/registrarse", (req, res) => {
    const passwordEncriptada = bcrypt.hashSync(req.body.password, 10)
    models.profesores
    .create({nombre: req.body.nombre, apellido: req.body.apellido, email: req.body.email, dni:req.body.dni, id_carrera: req.body.id_carrera, password: passwordEncriptada})
    .then(profesores => res.status(201).send(`El usuario ${profesores.nombre} se ha creado con éxito.`))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: el mail o dni ya se encuentran asociado a otra cuenta.')
      } else if (error == "SequelizeValidationError: Validation error: Validation len on dni failed") {
        res.status(400).send('Ingrese un DNI valido.')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });  
});

router.post("/login", (req, res) => {
    // Se busca que exista un usuario registrado con el mail
    models.profesores.findOne({
      where: {email: req.body.email}
    })
    .then(user => {
      if(!user) {
          res.status(404).send(`No existe ninguna cuenta asociada al mail: ${req.body.email}`)
      } else {
          // Si existe un usuario entonces se valida la contrasenia
          if (bcrypt.compareSync(req.body.password, user.password)) {
              // Se genera un token
              let token = jwt.sign({ user: user}, "secret", { expiresIn: "24h"});
              res.status(201).send(`Hola de nuevo ${user.nombre}!\nSu token es: ${token}`)    
          } else {
              res.send("Contraseña y/o mail incorrectos")  //TODO
          }
      }
    }).catch(err => {
      res.status(500).send(err)
    })
  })
  

const findMateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findMateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findMateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findMateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
