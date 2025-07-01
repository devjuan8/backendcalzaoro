const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generarPromptPronostico = (data) => {
  return `
Actúa como un analista deportivo profesional.

Analiza el siguiente partido de fútbol que se jugará hoy:

📅 Fecha: ${data.infoPartido.fecha}
🏟 Estadio: ${data.infoPartido.estadio}, ${data.infoPartido.ciudad}
⚽ Enfrentamiento: ${data.infoPartido.local} vs ${data.infoPartido.visitante}

📊 Últimos 10 partidos del ${data.infoPartido.local}:
${data.ultimosLocal.map(p => `• ${p.teams.home.name} ${p.goals.home} - ${p.goals.away} ${p.teams.away.name}`).join('\n')}

📊 Últimos 10 partidos del ${data.infoPartido.visitante}:
${data.ultimosVisitante.map(p => `• ${p.teams.home.name} ${p.goals.home} - ${p.goals.away} ${p.teams.away.name}`).join('\n')}

🔁 Últimos enfrentamientos entre ambos:
${data.enfrentamientosPrevios.map(p => `• ${p.teams.home.name} ${p.goals.home} - ${p.goals.away} ${p.teams.away.name}`).join('\n')}

Responde con un JSON de la siguiente forma:

{
  "analisis": "Análisis breve del enfrentamiento",
  "ganador_estimado": "Nombre del equipo con más probabilidad",
  "marcador_probable": "Ejemplo: 2-1 a favor de X",
  "apuesta_segura": "Texto de la apuesta segura",
  "apuesta_riesgo_medio": "Texto de la apuesta de riesgo medio"
}
  `;
};



exports.consultarIA = async (prompt) => {
  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  return res.choices[0].message.content;
};
