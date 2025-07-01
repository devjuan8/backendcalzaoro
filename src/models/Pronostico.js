const mongoose = require('mongoose');

const pronosticoSchema = new mongoose.Schema({
  fixtureId: { type: Number, required: true, unique: true },
  fecha: { type: Date, required: true },
  equipos: {
    local: String,
    visitante: String
  },
  liga: {
    nombre: String,
    pais: String
  },
  respuestaIA: { type: String, required: true },
  ganadorEstimado: String,
marcadorProbable: String,
apuestaSegura: String,
apuestaRiesgoMedio: String,

  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pronostico', pronosticoSchema);
