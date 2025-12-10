const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middlewares para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS del frontend)
// Le decimos a Express que la carpeta raíz del proyecto contiene los archivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// --- Configuración de la Base de Datos SQLite ---
const dbPath = path.join(__dirname, 'ykyoga.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Crear la tabla si no existe
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error al crear la tabla:', err.message);
            } else {
                console.log('Tabla "contacts" lista.');
            }
        });
    }
});

// --- Rutas de la API ---

// Ruta para manejar el envío del formulario de contacto
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    const sql = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, message], function(err) {
        if (err) {
            console.error('Error al insertar en la base de datos:', err.message);
            return res.status(500).json({ success: false, message: 'Error al guardar el mensaje.' });
        }
        console.log(`Nuevo contacto guardado con ID: ${this.lastID}`);
        res.json({ success: true, message: '¡Gracias por tu mensaje! Te contactaremos pronto.' });
    });
});

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
    res.json({ message: 'El servidor del backend está funcionando correctamente.' });
});


// --- Iniciar el servidor ---
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
