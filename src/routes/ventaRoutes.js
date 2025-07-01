const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ventaController');

router.post('/', ctrl.crearVenta);
router.get('/', ctrl.obtenerVentas);

module.exports = router;