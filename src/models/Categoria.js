const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  padre: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', default: null }, // Para jerarquía
  activa: { type: Boolean, default: true }
});

module.exports = mongoose.model('Categoria', categoriaSchema);