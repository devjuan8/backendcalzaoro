const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  nombre: String,
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true
  },
  esMayoreo: {
    type: Boolean,
    default: false
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const pedidoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  nombreCliente: String,
  items: [itemPedidoSchema],
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completado', 'cancelado'],
    default: 'pendiente'
  },
  abonos: [
    {
      monto: {
        type: Number,
        required: true,
        min: 0
      },
      fecha: {
        type: Date,
        default: Date.now
      }
    }
  ],
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  notas: String
});

// Middleware para guardar nombres de cliente y productos
pedidoSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified('cliente')) {
      const Cliente = mongoose.model('Cliente');
      const cliente = await Cliente.findById(this.cliente);
      if (cliente) {
        this.nombreCliente = cliente.nombre;
      }
    }

    if (this.isNew || this.isModified('items')) {
      const Producto = mongoose.model('Producto');
      
      for (const item of this.items) {
        if (!item.nombre) {
          const producto = await Producto.findById(item.producto);
          if (producto) {
            item.nombre = producto.nombre;
          }
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Pedido', pedidoSchema);