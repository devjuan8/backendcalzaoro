const express = require('express');
const router = express.Router();
const pronosticoController = require('../controllers/pronosticoController');

// Buscar ligas activas por país o global


// Obtener partidos de hoy
router.get('/hoy', pronosticoController.partidosHoy);

// Generar pronóstico automático para un partido
router.get('/pronostico/:fixtureId', pronosticoController.generarPronosticoIA);

router.post('/generar-todos', pronosticoController.generarPronosticosDelDia);

router.get('/fecha/:fecha', pronosticoController.partidosPorFecha);

router.get('/ligas', pronosticoController.obtenerLigas);

// Obtener partidos próximos o de hoy por liga
router.get('/liga/:ligaId/partidos', pronosticoController.partidosPorLiga);

// Obtener partidos por liga y fecha específica
router.get('/liga/:ligaId/fecha/:fecha', pronosticoController.partidosPorLigaYFecha);
module.exports = router;
