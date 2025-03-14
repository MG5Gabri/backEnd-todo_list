// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
var mysql = require('mysql2');
var bcrypt = require('bcrypt'); // Para cifrar contraseñas
var jwt = require('jsonwebtoken'); // Para generar tokens de autenticación

// Crear una instancia de la aplicación Express
var app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://127.0.0.1:5501', // Ajustar según el frontend
}));

// Middlewares para JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configurar la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'MiSQLStrongClave123!',
  database: 'todo_list'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// ---------------------------------------------------
// 1. Consultar usuario y contraseña (Login)
app.post('/login', (req, res) => {
  const { usuario, contraseña } = req.body;
  
  // Lógica para verificar el usuario y la contraseña
  if (usuario === 'ejemplo' && contraseña === '123456') {
      res.status(200).json({ mensaje: 'Login exitoso' });
  } else {
      res.status(401).json({ mensaje: 'Contraseña incorrecta' });
  }

  const sql = "SELECT * FROM usuarios WHERE usuario = ?";
  db.query(sql, [usuario], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ success: false, message: "Error en la consulta" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = results[0];

    // Comparar contraseña encriptada
    bcrypt.compare(contraseña, user.contraseña, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error al verificar la contraseña" });
      }
      if (!result) {
        return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
      }

      // Generar token JWT
      const token = jwt.sign({ id: user.id, usuario: user.usuario }, "secreto123", { expiresIn: '1h' });

      res.json({ success: true, message: "Login exitoso", token });
    });
  });
});

// ---------------------------------------------------
// 2. Registrar un nuevo usuario
app.post('/registro', async (req, res) => {
  const { usuario, contraseña, correo } = req.body;

  if (!usuario || !contraseña || !correo) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  try {
    const hash = await bcrypt.hash(contraseña, 10);
    const sql = "INSERT INTO usuarios (usuario, contraseña, correo) VALUES (?, ?, ?)";
    
    db.query(sql, [usuario, hash, correo], (err, result) => {
      if (err) {
        console.error("Error al registrar usuario:", err);
        return res.status(500).json({ success: false, message: "Error al registrar usuario" });
      }
      res.json({ success: true, message: "Usuario registrado correctamente", id: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al encriptar contraseña" });
  }
});

// ---------------------------------------------------
// 3. Cargar todas las tareas del usuario logueado
app.get('/tareas/:idUsuario', (req, res) => {
  const { idUsuario } = req.params;
  
  const sql = "SELECT * FROM tareas WHERE id_usuario = ?";
  db.query(sql, [idUsuario], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ success: false, message: "Error en la consulta" });
    }
    res.json(results);
  });
});

// ---------------------------------------------------


// Rutas adicionales
app.get('/hola', (req, res) => {
  res.send('¡Hola Mundo Gabo!');
});

// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

//----------------------------------------------------------------------------
// inserción de tareas en MySQL
app.post('/tareas', (req, res) => {
  const { nombre_tarea } = req.body;
  
  if (!nombre_tarea) {
      return res.status(400).json({ success: false, message: "La tarea no puede estar vacía" });
  }

  const sql = "INSERT INTO tareas (nombre_tarea) VALUES (?)";
  db.query(sql, [nombre_tarea], (err, result) => {
      if (err) {
          console.error("Error al insertar tarea:", err);
          return res.status(500).json({ success: false, message: "Error al insertar tarea" });
      }
      res.json({ success: true, message: "Tarea agregada con éxito", id: result.insertId });
  });
});
//-----------------------------------------------------------------------------

//----------------------------------------------------------------------------
// endPoint para eliminar Tareas en SQL
app.delete('/tareas/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = "DELETE FROM tareas WHERE id = ?";
  db.query(sql, [id], (err, result) => {
      if (err) {
          console.error("Error al eliminar tarea:", err);
          return res.status(500).json({ success: false, message: "Error al eliminar tarea" });
      }
      res.json({ success: true, message: "Tarea eliminada correctamente" });
  });
});
//-----------------------------------------------------------------------------