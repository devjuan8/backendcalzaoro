const mongoose = require('mongoose');

const rutaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fecha: { type: Date, required: true },
  clientes: [
    {
      cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
      visitado: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model('Ruta', rutaSchema);