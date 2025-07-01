const Categoria = require('../models/Categoria');

// Crear categoría
exports.crearCategoria = async (req, res) => {
  try {
    const cat = new Categoria(req.body);
    await cat.save();
    res.status(201).json(cat);
  } catch (e) {
    res.status(400).json({ error: 'Error al crear categoría' });
  }
};

// Listar categorías (opcional: árbol)
exports.obtenerCategorias = async (req, res) => {
  const categorias = await Categoria.find();
  res.json(categorias);
};

// Desactivar/activar categoría
exports.cambiarEstadoCategoria = async (req, res) => {
  const { id } = req.params;
  const { activa } = req.body;
  const cat = await Categoria.findByIdAndUpdate(id, { activa }, { new: true });
  if (!cat) return res.status(404).json({ error: 'No encontrada' });
  res.json(cat);
};

// ...existing code...

// Editar categoría
exports.editarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, padre } = req.body;
  const cat = await Categoria.findByIdAndUpdate(id, { nombre, padre }, { new: true });
  if (!cat) return res.status(404).json({ error: 'No encontrada' });
  res.json(cat);
};

// Eliminar categoría
exports.eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  const cat = await Categoria.findByIdAndDelete(id);
  if (!cat) return res.status(404).json({ error: 'No encontrada' });
  res.json({ ok: true });
};