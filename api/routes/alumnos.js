var express = require("express");
var router = express.Router();
var models = require("../models");
var bcrypt = require("bcrypt")
var jwt = require("jsonwebtoken")

const findAlumnoDni = (dniBuscado, { onSuccess, onNotFound, onError }) => {
  models.alumnos
      .findOne({
        attributes: ["id", "nombre","apellido", "dni"],
        include:[
          {as:'Carrera-Relacionada', 
          model:models.carrera, 
          attributes: ["id","nombre"]
        }
      ],
        where: {dni: dniBuscado }
      })
      .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
      .catch(() => onError());
};

router.get("/paginado", (req, res,next) => {
  const paginaActualNumero = Number.parseInt(req.query.paginaActual);
  const cantidadNumero = Number.parseInt(req.query.cantidad);

  models.alumnos.findAll({
    offset: (paginaActualNumero * cantidadNumero), 
    limit: cantidadNumero,
    attributes: ["id","nombre","apellido","email","dni","password"],
       
    include:[
        {as:'Carrera-Relacionada', 
        model:models.carrera, 
        attributes: ["id","nombre"]
      }
    ]

    }).then(alumno => res.send(alumno)).catch(error => { return next(error)});
});

router.get("/", (req, res,next) => {

  models.alumnos.findAll({
    attributes: ["id","nombre","apellido","email","dni","password"],
      
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

router.post("/registrarse", (req, res) => {

  if(req.body.email == null){
    res.status(400).send(`Es necesario que se escriba un email para registrarse`);
  } else if(req.body.password == null){
    res.status(400).send(`Es necesario que se escriba una password para registrarse`)
  } else {
    const contraEncriptada = bcrypt.hashSync(req.body.password, 10);

    models.alumnos
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, dni: req.body.dni, email: req.body.email, password: contraEncriptada, id_carrera: req.body.id_carrera })
    .then(alumno => res.status(201).send(`Bienvenidx ${alumno.nombre}, el registro se ha creado con éxito:)`))
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

router.post("/loguearse", (req, res) => {

  models.alumnos.findOne({
    where: {email: req.body.email}
  })
  .then(alumno => {
    if(!alumno) {
        res.status(404).send(`No existe ninguna cuenta registrada con el mail: ${req.body.email}`)
    } else {
        if (bcrypt.compareSync(req.body.password, alumno.password)) {
            let token = jwt.sign({alumno: alumno}, "unaSolaTabla");
            res.status(201).send(`El token para hacer las consultas es: ${token}`)    
        } else {
            res.status(400).send("Contraseña y/o mail incorrectos") 
        }
    }
  }).catch(err => {
    res.status(500).send(err)
  })
});

router.post("/registrarse", (req, res) => {

  if(req.body.email == null){
    res.status(400).send(`Es necesario que se escriba un email para registrarse`);
  } else if(req.body.password == null){
    res.status(400).send(`Es necesario que se escriba una password para registrarse`)
  } else {
    const contraEncriptada = bcrypt.hashSync(req.body.password, 10);

    models.alumnos
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, dni: req.body.dni, email: req.body.email, password: contraEncriptada, id_carrera: req.body.id_carrera })
    .then(alumno => res.status(201).send(`Bienvenidx ${alumno.nombre}, el registro se ha creado con éxito:)`))
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