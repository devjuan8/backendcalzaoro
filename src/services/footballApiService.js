const axios = require('axios');
require('dotenv').config();
const moment = require('moment-timezone'); // Asegúrate de tener esto instalado

const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': process.env.FOOTBALL_API_KEY
  }
});

exports.getLigasDisponibles = async () => {
  try {
    const res = await api.get('/leagues');
    return res.data.response;
  } catch (error) {
    console.error('❌ Error en getLigasDisponibles:', error.response?.data || error.message);
    throw error;
  }
};
exports.getPartidosHoy = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const res = await api.get('/fixtures', {
      params: { date: hoy }
    });

    // Obtener hora actual en UTC
    const ahora = new Date();

    // Filtrar partidos con estado "NS" (Not Started) y hora posterior a ahora
    const partidosFuturos = res.data.response.filter(p => {
      return (
        p.fixture.status.short === 'NS' &&
        new Date(p.fixture.date) > ahora
      );
    });

    return partidosFuturos;
  } catch (error) {
    console.error('❌ Error en getPartidosHoy:', error.response?.data || error.message);
    throw error;
  }
};
exports.getEstadisticasFixture = async (fixtureId) => {
  try {
    const [stats, fixture] = await Promise.all([
      api.get('/fixtures/statistics', { params: { fixture: fixtureId } }),
      api.get('/fixtures', { params: { id: fixtureId } })
    ]);

    return {
      fixture: fixture.data.response[0],
      estadisticas: stats.data.response
    };
  } catch (error) {
    console.error('❌ Error en getEstadisticasFixture:', error.response?.data || error.message);
    throw error;
  }
};
exports.getUltimosPartidos = async (teamId) => {
  const res = await api.get('/fixtures', {
    params: {
      team: teamId,
      last: 10
    }
  });
  return res.data.response;
};
exports.getHeadToHead = async (team1, team2) => {
  const res = await api.get('/fixtures/headtohead', {
    params: {
      h2h: `${team1}-${team2}`,
      last: 5
    }
  });
  return res.data.response;
};
exports.getFixtureById = async (fixtureId) => {
  const res = await api.get('/fixtures', {
    params: { id: fixtureId }
  });

  const data = res.data.response[0];

  // Retornar como objeto directo
  return {
    fixture: data.fixture,
    league: data.league,
    teams: data.teams,
    goals: data.goals,
    score: data.score
  };
};
exports.getPartidosPorFecha = async (fecha) => {
  try {
    const res = await api.get('/fixtures', {
      params: {
        date: fecha,
        season: 2025 // Agrega este filtro
      }
    });
    return res.data.response;
  } catch (error) {
    console.error('❌ Error en getPartidosPorFecha:', error.response?.data || error.message);
    throw error;
  }
};
exports.getLigasDisponibles = async () => {
  try {
    const res = await api.get('/leagues');
    return res.data.response;
  } catch (error) {
    console.error('❌ Error en getLigasDisponibles:', error.response?.data || error.message);
    throw error;
  }
};
// Obtener partidos de una liga por fecha específica
exports.getPartidosPorLigaYFecha = async (ligaId, fechaLocal) => {
  try {
    // Día UTC actual + el siguiente día UTC, por si alguno cae después de las 7pm hora COL
    const fechaMoment = moment.tz(fechaLocal, 'YYYY-MM-DD', 'America/Bogota');
    const inicio = fechaMoment.clone().startOf('day').utc().format('YYYY-MM-DD');
    const siguiente = fechaMoment.clone().add(1, 'day').startOf('day').utc().format('YYYY-MM-DD');

    // Consulta dos días en UTC
    const [res1, res2] = await Promise.all([
      api.get('/fixtures', {
        params: {
          league: ligaId,
          season: 2025,
          date: inicio
        }
      }),
      api.get('/fixtures', {
        params: {
          league: ligaId,
          season: 2025,
          date: siguiente
        }
      })
    ]);

    // Unir y filtrar por fechaLocal en zona horaria Colombia
    const partidos = [...res1.data.response, ...res2.data.response].filter(p => {
      const fechaUTC = moment.utc(p.fixture.date);
      const fechaCol = fechaUTC.clone().tz('America/Bogota').format('YYYY-MM-DD');
      return fechaCol === fechaLocal;
    });

    return partidos;
  } catch (error) {
    console.error('❌ Error en getPartidosPorLigaYFecha:', error.response?.data || error.message);
    throw error;
  }
};


