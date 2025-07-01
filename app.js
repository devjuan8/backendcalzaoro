const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Crear instancia de Express
const app = express();

// Opciones CORS
const corsOptions = {
  origin: [
    'https://rutero-lizeth.vercel.app', // producción
    'http://localhost:5173',            // desarrollo local
    'http://localhost:5174',            // desarrollo local
    'https://fronted-beta.vercel.app',
  ],
  credentials: true,
};


app.use(cors(corsOptions));
app.use(express.json()); // Para parsear JSON en los requests

// Ruta principal
app.get('/', (req, res) => {
  res.send('Backend funcionando en Vercel 🚀');
});

// Rutas tienda
app.use('/api/v1/categorias', require('./src/routes/categoriaRoutes'));
app.use('/api/v1/productos', require('./src/routes/productoRoutes'));
app.use('/api/v1/ventas', require('./src/routes/ventaRoutes'));

// Usuario único (admin)
app.use('/api/v1/auth', require('./src/routes/authRoutes'));

// Puedes dejar las rutas de clientes/rutas si las usas para otra cosa

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
