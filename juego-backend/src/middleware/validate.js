const { validationResult } = require('express-validator');

// Middleware que corta la request si hay errores de validación
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error:  'Datos inválidos',
      fields: errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
}

module.exports = { validate };
