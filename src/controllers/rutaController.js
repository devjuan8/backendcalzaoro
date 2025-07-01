const Ruta = require('../models/Ruta');
const Cliente = require('../models/Cliente');

// Obtener la ruta de hoy (persistente)
exports.obtenerRutaHoy = async (req, res) => {
  const usuario = req.usuario.id;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let ruta = await Ruta.findOne({ usuario, fecha: hoy }).populate('clientes.cliente');
  if (!ruta) {
    // Si no existe, sugerir clientes por día de visita
    const diaSemana = hoy.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const sugeridos = await Cliente.find({ diasDeVisita: diaSemana });
    return res.json({ clientesSugeridos: sugeridos, clientes: [] });
  }
  res.json(ruta);
};

// Obtener la ruta de mañana (persistente)
exports.obtenerRutaManana = async (req, res) => {
  const usuario = req.usuario.id;
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  manana.setHours(0, 0, 0, 0);

  let ruta = await Ruta.findOne({ usuario, fecha: manana }).populate('clientes.cliente');
  if (!ruta) {
    const diaSemana = manana.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const sugeridos = await Cliente.find({ diasDeVisita: diaSemana });
    return res.json({ clientesSugeridos: sugeridos, clientes: [] });
  }
  res.json(ruta);
};

// Crear ruta manualmente (opcional, para pruebas)
exports.crearRuta = async (req, res) => {
  const { fecha, clientes } = req.body;
  const usuario = req.usuario.id;
  const ruta = new Ruta({ usuario, fecha: new Date(fecha), clientes });
  await ruta.save();
  res.status(201).json(ruta);
};

// Editar la ruta de hoy (agregar/quitar clientes, reordenar)
exports.editarRutaHoy = async (req, res) => {
  const usuario = req.usuario.id;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { clientes } = req.body; // [{cliente, visitado}]
  let ruta = await Ruta.findOneAndUpdate(
    { usuario, fecha: hoy },
    { clientes },
    { new: true, upsert: true }
  ).populate('clientes.cliente');
  res.json(ruta);
};

// Marcar cliente como visitado en la ruta de hoy
exports.marcarVisitado = async (req, res) => {
  const usuario = req.usuario.id;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { clienteId } = req.body;

  let ruta = await Ruta.findOne({ usuario, fecha: hoy });
  if (!ruta) return res.status(404).json({ error: 'No hay ruta para hoy' });

  ruta.clientes = ruta.clientes.map(c =>
    c.cliente.toString() === clienteId
      ? { ...c.toObject(), visitado: true }
      : c
  );
  await ruta.save();
  ruta = await Ruta.findById(ruta._id).populate('clientes.cliente');
  res.json(ruta);
};

// Obtener rutas por día (no se usa en el flujo principal)
exports.obtenerRutasPorDia = async (req, res) => {
  const usuario = req.usuario.id;
  const { fecha } = req.query;
  const rutas = await Ruta.find({ usuario, fecha: new Date(fecha) }).populate('clientes.cliente');
  res.json(rutas);
};

exports.obtenerTodasLasRutas = async (req, res) => {
  const usuario = req.usuario.id;
  // Trae todas las rutas del usuario, ordenadas por fecha descendente
  const rutas = await Ruta.find({ usuario }).sort({ fecha: -1 }).populate('clientes.cliente');
  res.json(rutas);
};