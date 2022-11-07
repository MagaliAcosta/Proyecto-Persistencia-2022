var express = require("express");
var router = express.Router();
var models = require("../models");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.alumno
    .findAll({
      attributes: ["nombre", "apellido"]
    })
    .then(alumnos => res.send(alumnos))
    .catch(() => res.sendStatus(500));
});

router.post("/registrarse", (req, res) => {
    const passwordEncriptada = bcrypt.hashSync(req.body.password, 10)
    models.alumno
    .create({nombre: req.body.nombre, apellido: req.body.apellido, email: req.body.email, dni:req.body.dni, id_carrera: req.body.id_carrera, password: passwordEncriptada})
    .then(alumno => res.status(201).send(`El usuario ${alumno.nombre} se ha creado con éxito.`))
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
    models.alumno.findOne({
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
  

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = carrera =>
    carrera
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
    findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = carrera =>
    carrera
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
