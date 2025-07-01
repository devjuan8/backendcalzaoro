const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');
const auth = require('../middlewares/authMiddleware');

router.get('/hoy', auth, rutaController.obtenerRutaHoy);
router.get('/manana', auth, rutaController.obtenerRutaManana);
router.post('/', auth, rutaController.crearRuta);
router.get('/', auth, rutaController.obtenerRutasPorDia);
router.get('/todas', auth, rutaController.obtenerTodasLasRutas); // <--- NUEVA RUTA
router.post('/hoy/visitado', auth, rutaController.marcarVisitado);
router.put('/hoy', auth, rutaController.editarRutaHoy);

module.exports = router;