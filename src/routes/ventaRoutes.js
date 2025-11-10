const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ventaController');

// Rutas más específicas primero
router.post('/whatsapp', ctrl.crearVentaWhatsApp);
router.post('/', ctrl.crearVenta);
router.get('/', ctrl.obtenerVentas);

module.exports = router;