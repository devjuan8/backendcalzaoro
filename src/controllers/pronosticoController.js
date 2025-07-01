const footballApi = require('../services/footballApiService');
const openai = require('../services/openaiService');
const Pronostico = require('../models/Pronostico');


exports.obtenerLigas = async (req, res) => {
    try {
        const data = await footballApi.getLigasDisponibles();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener ligas' });
    }
};

exports.partidosHoy = async (req, res) => {
    try {
        const partidos = await footballApi.getPartidosHoy();
        res.json(partidos);
    } catch (err) {
        res.status(500).json({ error: 'Error al traer partidos de hoy' });
    }
};
exports.generarPronosticoIA = async (req, res) => {
    try {
        const { fixtureId } = req.params;

        // Revisar si ya existe
        const existente = await Pronostico.findOne({ fixtureId });
        if (existente) {
            console.log(`⏩ Pronóstico ya existe para ${fixtureId}, devolviendo`);
            return res.json(existente);
        }

        // Obtener datos del fixture
        const { fixture, teams, league } = await footballApi.getFixtureById(fixtureId);

        if (!fixture || !teams || !teams.home || !teams.away) {
            return res.status(400).json({ error: 'Datos incompletos del partido.' });
        }

        const homeId = teams.home.id;
        const awayId = teams.away.id;

        // Obtener últimos partidos y head-to-head
        const [ultimosHome, ultimosAway, headToHead] = await Promise.all([
            footballApi.getUltimosPartidos(homeId),
            footballApi.getUltimosPartidos(awayId),
            footballApi.getHeadToHead(homeId, awayId),
        ]);

        const resumen = {
            infoPartido: {
                fecha: fixture.date,
                estadio: fixture.venue?.name || 'N/D',
                ciudad: fixture.venue?.city || 'N/D',
                local: teams.home.name,
                visitante: teams.away.name,
                status: fixture.status?.long || 'N/D'
            },
            ultimosLocal: ultimosHome,
            ultimosVisitante: ultimosAway,
            enfrentamientosPrevios: headToHead,
        };

        // Invocar IA
        const prompt = openai.generarPromptPronostico(resumen);
        const respuestaTexto = await openai.consultarIA(prompt);

        // Intentar parsear como JSON (si es posible)
        let parsed = {};
        try {
            parsed = JSON.parse(respuestaTexto);
        } catch {
            parsed.analisis = respuestaTexto;
        }

        // Crear y guardar pronóstico
        const nuevo = new Pronostico({
            fixtureId,
            fecha: fixture.date,
            equipos: {
                local: teams.home.name,
                visitante: teams.away.name
            },
            liga: {
                nombre: league.name,
                pais: league.country
            },
            respuestaIA: parsed.analisis || respuestaTexto,
            ganadorEstimado: parsed.ganador_estimado || null,
            marcadorProbable: parsed.marcador_probable || null,
            apuestaSegura: parsed.apuesta_segura || null,
            apuestaRiesgoMedio: parsed.apuesta_riesgo_medio || null
        });

        await nuevo.save();
        console.log(`✅ Pronóstico generado y guardado para ${fixtureId}`);
        res.json(nuevo);

    } catch (err) {
        console.error("❌ Error al generar pronóstico IA:", err.response?.data || err.message || err);
        res.status(500).json({ error: 'Error al generar pronóstico con IA' });
    }
};

exports.generarPronosticosDelDia = async (req, res) => {
    try {
        const partidos = await footballApi.getPartidosHoy();
        const generados = [];

        for (const p of partidos) {
            const fixtureId = p.fixture.id;

            // Verificar si ya existe
            const existente = await Pronostico.findOne({ fixtureId });
            if (existente) {
                console.log(`⏩ Ya existe pronóstico para ${fixtureId}`);
                continue;
            }

            try {
                const { fixture, teams, league } = await footballApi.getFixtureById(fixtureId);

                if (!fixture || fixture.status.short !== 'NS') continue;

                const [ultimosHome, ultimosAway, headToHead] = await Promise.all([
                    footballApi.getUltimosPartidos(teams.home.id),
                    footballApi.getUltimosPartidos(teams.away.id),
                    footballApi.getHeadToHead(teams.home.id, teams.away.id),
                ]);

                const resumen = {
                    infoPartido: {
                        fecha: fixture.date,
                        estadio: fixture.venue?.name,
                        ciudad: fixture.venue?.city,
                        local: teams.home.name,
                        visitante: teams.away.name,
                    },
                    ultimosLocal: ultimosHome,
                    ultimosVisitante: ultimosAway,
                    enfrentamientosPrevios: headToHead,
                };

                const prompt = openai.generarPromptPronostico(resumen);
                const respuestaTexto = await openai.consultarIA(prompt);

                // Intentar parsear como JSON
                let parsed = {};
                try {
                    parsed = JSON.parse(respuestaTexto);
                } catch (parseError) {
                    console.error(`⚠️ Error al parsear JSON IA para fixture ${fixtureId}`);
                    parsed.analisis = respuestaTexto; // fallback: guardar el texto completo como análisis
                }

                const nuevo = new Pronostico({
                    fixtureId,
                    fecha: fixture.date,
                    equipos: {
                        local: teams.home.name,
                        visitante: teams.away.name
                    },
                    liga: {
                        nombre: league.name,
                        pais: league.country
                    },
                    respuestaIA: parsed.analisis || respuestaTexto,
                    ganadorEstimado: parsed.ganador_estimado || null,
                    marcadorProbable: parsed.marcador_probable || null,
                    apuestaSegura: parsed.apuesta_segura || null,
                    apuestaRiesgoMedio: parsed.apuesta_riesgo_medio || null
                });

                await nuevo.save();
                generados.push(nuevo);
                console.log(`✅ Pronóstico guardado para ${fixtureId}`);
            } catch (error) {
                console.error(`❌ Error generando pronóstico para ${fixtureId}:`, error.message);
            }
        }

        res.json({ total: generados.length, generados });
    } catch (err) {
        console.error("❌ Error en generación masiva:", err.message);
        res.status(500).json({ error: 'Error al generar los pronósticos del día' });
    }
};
exports.partidosPorFecha = async (req, res) => {
    try {
        const { fecha } = req.params;

        if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(400).json({ error: 'Fecha inválida. Usa el formato YYYY-MM-DD' });
        }

        const partidos = await footballApi.getPartidosPorFecha(fecha);
        res.json(partidos);
    } catch (err) {
        console.error("❌ Error al traer partidos por fecha:", err.message);
        res.status(500).json({ error: 'Error al obtener partidos de esa fecha' });
    }
};
// Obtener todas las ligas disponibles
exports.obtenerLigas = async (req, res) => {
  try {
    const data = await footballApi.getLigasDisponibles();
    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener ligas:", err.message);
    res.status(500).json({ error: 'Error al obtener ligas' });
  }
};

// Obtener partidos próximos (hoy) de una liga
exports.partidosPorLiga = async (req, res) => {
  try {
    const { ligaId } = req.params;
    const hoy = new Date().toISOString().slice(0, 10);
    const partidos = await footballApi.getPartidosPorLigaYFecha(ligaId, hoy);
    res.json(partidos);
  } catch (err) {
    console.error("❌ Error al obtener partidos por liga:", err.message);
    res.status(500).json({ error: 'Error al obtener partidos de la liga' });
  }
};

// Obtener partidos por liga y fecha específica
exports.partidosPorLigaYFecha = async (req, res) => {
  try {
    const { ligaId, fecha } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: 'Fecha inválida. Usa el formato YYYY-MM-DD' });
    }
    const partidos = await footballApi.getPartidosPorLigaYFecha(ligaId, fecha);
    res.json(partidos);
  } catch (err) {
    console.error("❌ Error al obtener partidos por liga y fecha:", err.message);
    res.status(500).json({ error: 'Error al obtener partidos' });
  }
};