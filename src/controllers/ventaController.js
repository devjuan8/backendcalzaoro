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

// Registrar venta desde WhatsApp (sin descontar stock)
exports.crearVentaWhatsApp = async (req, res) => {
  try {
    const { items } = req.body;
    let total = 0;
    const itemsVenta = [];

    // Procesar items sin descontar stock
    for (const item of items) {
      const prod = await Producto.findById(item.producto);
      if (!prod) {
        console.warn(`Producto no encontrado: ${item.producto}`);
        continue; // Continuar con otros productos en lugar de fallar
      }

      // Calcular precio (usar precioOferta si existe y es menor)
      let precioUnitario = prod.precioNormal;
      if (prod.precioOferta && prod.precioOferta < prod.precioNormal) {
        precioUnitario = prod.precioOferta;
      }

      // Obtener color y talla de la variante si existe
      let color = null;
      let talla = null;
      if (item.variante) {
        color = item.variante.color || null;
        talla = item.variante.talla || null;
      }

      const cantidad = item.cantidad || 1;
      const subtotal = precioUnitario * cantidad;
      total += subtotal;

      itemsVenta.push({
        producto: prod._id,
        referencia: prod.referencia || '',
        nombre: prod.nombre,
        color: color,
        talla: talla,
        cantidad: cantidad,
        precioUnitario: precioUnitario
      });
    }

    if (itemsVenta.length === 0) {
      return res.status(400).json({ error: 'No se pudo procesar ningún producto' });
    }

    const venta = new Venta({ items: itemsVenta, total });
    await venta.save();
    res.status(201).json(venta);
  } catch (e) {
    console.error('Error al registrar venta de WhatsApp:', e);
    res.status(400).json({ error: 'Error al registrar venta' });
  }
};

// Listar ventas
exports.obtenerVentas = async (req, res) => {
  const ventas = await Venta.find().sort({ fecha: -1 });
  res.json(ventas);
};