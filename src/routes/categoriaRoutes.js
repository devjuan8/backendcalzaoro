const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoriaController');

router.post('/', ctrl.crearCategoria);
router.get('/', ctrl.obtenerCategorias);
router.patch('/:id/estado', ctrl.cambiarEstadoCategoria);
router.put('/:id', ctrl.editarCategoria);
router.delete('/:id', ctrl.eliminarCategoria);

module.exports = router;