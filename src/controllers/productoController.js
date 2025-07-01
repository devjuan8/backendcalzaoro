const Producto = require('../models/Producto');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { uploadFile } = require('../services/s3Service');

// Listar productos
exports.obtenerProductos = async (req, res) => {
  const productos = await Producto.find().populate('categoria').sort({ createdAt: -1 });
  res.json(productos);
};

// Crear producto
exports.crearProducto = [
  upload.single('imagen'),
  async (req, res) => {
    try {
      console.log('Body recibido:', req.body);
      console.log('File recibido:', req.file);
      let imageUrl = '';
      if (req.file) {
        const result = await uploadFile(req.file);
        console.log('Resultado de uploadFile:', result);
        imageUrl = result.Location;
      }
      let variantes = req.body.variantes;
      if (typeof variantes === 'string') {
        try {
          variantes = JSON.parse(variantes);
        } catch (e) {
          variantes = [];
        }
      }
      const prod = new Producto({
        ...req.body,
        variantes,
        imagen: imageUrl
      });
      console.log('Producto a guardar:', prod);
      await prod.save();
      res.status(201).json(prod);
    } catch (e) {
      console.error('Error al crear producto:', e);
      res.status(400).json({ error: 'Error al crear producto', detalle: e.message });
    }
  }
];

// Obtener producto por ID
exports.obtenerProducto = async (req, res) => {
  const prod = await Producto.findById(req.params.id).populate('categoria');
  if (!prod) return res.status(404).json({ error: 'No encontrado' });
  res.json(prod);
};

// Actualizar producto
// Actualizar producto
exports.actualizarProducto = [
  upload.single('imagen'),
  async (req, res) => {
    try {
      console.log('Body recibido en actualizar:', req.body);
      console.log('File recibido en actualizar:', req.file);
      
      let imageUrl = req.body.imagen; // Mantener imagen actual si no se sube nueva
      if (req.file) {
        const result = await uploadFile(req.file);
        console.log('Resultado de uploadFile en actualizar:', result);
        imageUrl = result.Location;
      }
      
      let variantes = req.body.variantes;
      if (typeof variantes === 'string') {
        try {
          variantes = JSON.parse(variantes);
        } catch (e) {
          variantes = [];
        }
      }
      
      const updateData = {
        ...req.body,
        variantes,
        imagen: imageUrl
      };
      
      console.log('Datos a actualizar:', updateData);
      
      const prod = await Producto.findByIdAndUpdate(
        req.params.id, 
        updateData, 
        { new: true }
      ).populate('categoria');
      
      if (!prod) return res.status(404).json({ error: 'No encontrado' });
      
      console.log('Producto actualizado:', prod);
      res.json(prod);
    } catch (e) {
      console.error('Error al actualizar producto:', e);
      res.status(400).json({ error: 'Error al actualizar producto', detalle: e.message });
    }
  }
];

// Eliminar producto
exports.eliminarProducto = async (req, res) => {
  const prod = await Producto.findByIdAndDelete(req.params.id);
  if (!prod) return res.status(404).json({ error: 'No encontrado' });
  res.json({ mensaje: 'Eliminado' });
};

// Desactivar/activar producto
exports.cambiarEstadoProducto = async (req, res) => {
  const { id } = req.params;
  const { activa } = req.body;
  const prod = await Producto.findByIdAndUpdate(id, { activa }, { new: true });
  if (!prod) return res.status(404).json({ error: 'No encontrado' });
  res.json(prod);
};

// Sumar stock a una variante
exports.sumarStock = async (req, res) => {
  const { id } = req.params; // producto
  const { color, talla, cantidad } = req.body;
  const prod = await Producto.findById(id);
  if (!prod) return res.status(404).json({ error: 'No encontrado' });

  const variante = prod.variantes.find(v => v.color === color && v.talla === talla);
  if (!variante) return res.status(404).json({ error: 'Variante no encontrada' });

  variante.stock += cantidad;
  await prod.save();
  res.json(prod);
};