// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
//var path = require('path');

// Crear una instancia de la aplicación Express
var app = express();

// Usar CORS para permitir solicitudes desde el puerto 5500 (o el origen de tu frontend)
app.use(cors({
  origin: 'http://127.0.0.1:5500/', // Aquí puedes ajustar esto al origen de tu frontend
}));

// Middlewares para la configuración básica de Express
app.use(express.json()); // Para parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Rutas del servidor
app.get('/', (req, res) => {
  res.send('¡Hola desde mi backend en Express!');
});

// Rutas adicionales
app.get('/hola', (req, res) => {
  res.send('¡Hola Mundo Gabo!');
});

// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});