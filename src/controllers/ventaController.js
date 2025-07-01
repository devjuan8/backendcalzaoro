const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// Registrar venta y descontar stock
exports.crearVenta = async (req, res) => {
  try {
    const { items } = req.body;
    let total = 0;

    // Descontar stock
    for (const item of items) {
      const prod = await Producto.findById(item.producto);
      if (!prod) return res.status(400).json({ error: 'Producto no encontrado' });

      const variante = prod.variantes.find(v => v.color === item.color && v.talla === item.talla);
      if (!variante || variante.stock < item.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para ${prod.nombre}` });
      }
      variante.stock -= item.cantidad;
      await prod.save();

      item.referencia = prod.referencia;
      item.nombre = prod.nombre;
      item.precioUnitario = prod.precio;
      total += prod.precio * item.cantidad;
    }

    const venta = new Venta({ items, total });
    await venta.save();
    res.status(201).json(venta);
  } catch (e) {
    res.status(400).json({ error: 'Error al registrar venta' });
  }
};

// Listar ventas
exports.obtenerVentas = async (req, res) => {
  const ventas = await Venta.find().sort({ fecha: -1 });
  res.json(ventas);
};