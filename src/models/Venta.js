const mongoose = require('mongoose');

const itemVentaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  referencia: String,
  nombre: String,
  color: String,
  talla: String,
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true }
}, { _id: false });

const ventaSchema = new mongoose.Schema({
  items: [itemVentaSchema],
  total: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venta', ventaSchema);