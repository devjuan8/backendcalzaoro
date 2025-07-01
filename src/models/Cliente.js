const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  telefono: { type: String, trim: true },
  direccion: { type: String, trim: true },
  diasDeVisita: [{ type: String }], // Ej: ['lunes', 'jueves']
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cliente', clienteSchema);