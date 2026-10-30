const express = require('express');
const path = require('path');
const fs = require('fs');
const ListaEnlazada = require('./models/ListaEnlazada');

const app = express();
const PORT = 3000;

// Ruta del archivo de persistencia .txt
const rutaTxt = path.join(__dirname, 'data', 'actividades.txt');

// Instancia de la estructura de datos Lista Enlazada
const gestorActividades = new ListaEnlazada(rutaTxt);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// RUTAS DE LA API (CRUD con Lista Enlazada)
// ==========================================

// 1. CONSULTAR todas las actividades
app.get('/api/actividades', (req, res) => {
    try {
        const actividades = gestorActividades.consultarTodas();
        res.json({
            exito: true,
            total: actividades.length,
            datos: actividades
        });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al consultar actividades: ' + error.message });
    }
});

// 2. CONSULTAR una actividad por ID
app.get('/api/actividades/:id', (req, res) => {
    const actividad = gestorActividades.consultarPorId(req.params.id);
    if (actividad) {
        res.json({ exito: true, datos: actividad });
    } else {
        res.status(404).json({ exito: false, mensaje: 'Actividad no encontrada' });
    }
});

// 3. REGISTRAR una nueva actividad
app.post('/api/actividades', (req, res) => {
    const { nombre, descripcion, estado } = req.body;

    if (!nombre || !descripcion) {
        return res.status(400).json({ 
            exito: false, 
            mensaje: 'El nombre y la descripción son obligatorios.' 
        });
    }

    const nueva = gestorActividades.registrar(nombre, descripcion, estado || 'Pendiente');
    res.status(201).json({
        exito: true,
        mensaje: 'Actividad registrada con éxito en la lista enlazada y guardada en .txt',
        datos: nueva
    });
});

// 4. ACTUALIZAR una actividad existente
app.put('/api/actividades/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    const actualizada = gestorActividades.actualizar(id, nombre, descripcion, estado);

    if (actualizada) {
        res.json({
            exito: true,
            mensaje: 'Actividad actualizada exitosamente en la lista enlazada y en .txt',
            datos: actualizada
        });
    } else {
        res.status(404).json({ 
            exito: false, 
            mensaje: `No se encontró la actividad con ID ${id}` 
        });
    }
});

// 5. ELIMINAR una actividad
app.delete('/api/actividades/:id', (req, res) => {
    const eliminada = gestorActividades.eliminar(req.params.id);
    if (eliminada) {
        res.json({ exito: true, mensaje: 'Actividad eliminada correctamente de la lista enlazada' });
    } else {
        res.status(404).json({ exito: false, mensaje: 'Actividad no encontrada' });
    }
});

// 6. RUTA PARA VER EL ARCHIVO .TXT DIRECTAMENTE
app.get('/api/ver-txt', (req, res) => {
    if (fs.existsSync(rutaTxt)) {
        res.type('text/plain').sendFile(rutaTxt);
    } else {
        res.send('El archivo actividades.txt aún no ha sido generado.');
    }
});

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('========================================================');
    console.log(' SERVIDOR DE GESTIÓN DE ACTIVIDADES (PROGRAMACIÓN WEB)');
    console.log('========================================================');
    console.log(` Servidor activo en: http://localhost:${PORT}`);
    console.log(` Archivo persistente: ${rutaTxt}`);
    console.log('========================================================');
});
