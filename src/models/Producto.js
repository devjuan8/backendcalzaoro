const mongoose = require('mongoose');

const varianteSchema = new mongoose.Schema({
  color: { type: String },
  talla: { type: String },
  stock: { type: Number, default: 0, min: 0 }
}, { _id: false });

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  referencia: { type: String, required: true, unique: true, trim: true }, // SKU
  descripcion: { type: String, trim: true },
  precioNormal: { type: Number, required: true, min: 0 },
  precioOferta: { type: Number, min: 0 },
  descuento: { type: Number, min: 0, max: 90 },
  esOferta: { type: Boolean, default: false },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  imagen: { type: String, default: '' }, // URL
  variantes: [varianteSchema], // Para tallas, colores y stock por variante
  activa: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Producto', productoSchema);