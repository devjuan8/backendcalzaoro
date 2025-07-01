const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productoController');

// /api/v1/productos
router.get('/', ctrl.obtenerProductos);
router.post('/', ctrl.crearProducto);
router.get('/:id', ctrl.obtenerProducto);
router.put('/:id', ctrl.actualizarProducto);
router.delete('/:id', ctrl.eliminarProducto);
router.patch('/:id/estado', ctrl.cambiarEstadoProducto);
router.patch('/:id/sumar-stock', ctrl.sumarStock);

module.exports = router;