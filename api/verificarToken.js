const jwt = require("jsonwebtoken")
const moment = require("moment");

const verificador = (req, res, next) => {
    if(!req.headers['token-alumno']) {
        res.status(400).send("Es necesario el token de logueo")
    }
    
    const token = req.headers['token-alumno']

    try{
        jwt.verify(token, "unaSolaTabla")
    } catch(error){
        res.status(400).send("Token incorrecto")
    }

    if(token.expiresIn < moment().unix()){
        res.status(400).send("El token ha expirado")
    }

    next();
}

module.exports = {
    verificador: verificador
}