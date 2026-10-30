const fs = require('fs');
const path = require('path');
const Actividad = require('./Actividad');

// Clase Lista Enlazada (Estructura de Datos)
class ListaEnlazada {
    constructor(rutaArchivo) {
        this.cabeza = null;        // Inicio de la lista enlazada (head)
        this.longitud = 0;         // Cantidad de nodos
        this.ultimoId = 0;         // Contador autoincrementable de IDs
        this.rutaArchivo = rutaArchivo;
        
        // Cargar datos previos desde el archivo .txt
        this.cargarDesdeTxt();
    }

    // 1. REGISTRAR ACTIVIDAD (Inserción al final de la lista enlazada)
    registrar(nombre, descripcion, estado = 'Pendiente') {
        this.ultimoId++;
        const nuevaActividad = new Actividad(this.ultimoId, nombre, descripcion, estado);

        if (!this.cabeza) {
            // Si la lista está vacía, el nuevo nodo se convierte en la cabeza
            this.cabeza = nuevaActividad;
        } else {
            // Recorremos la lista hasta encontrar el último nodo
            let actual = this.cabeza;
            while (actual.siguiente !== null) {
                actual = actual.siguiente;
            }
            // Enlazamos el último nodo con la nueva actividad
            actual.siguiente = nuevaActividad;
        }

        this.longitud++;
        this.guardarEnTxt();
        return nuevaActividad;
    }

    // 2. CONSULTAR TODAS LAS ACTIVIDADES (Recorrido de la lista enlazada)
    consultarTodas() {
        const actividades = [];
        let actual = this.cabeza;

        while (actual !== null) {
            actividades.push({
                id: actual.id,
                nombre: actual.nombre,
                descripcion: actual.descripcion,
                estado: actual.estado
            });
            actual = actual.siguiente; // Avanza al siguiente nodo
        }

        return actividades;
    }

    // 3. CONSULTAR POR ID (Búsqueda secuencial)
    consultarPorId(id) {
        let actual = this.cabeza;
        const idBuscado = Number(id);

        while (actual !== null) {
            if (actual.id === idBuscado) {
                return {
                    id: actual.id,
                    nombre: actual.nombre,
                    descripcion: actual.descripcion,
                    estado: actual.estado
                };
            }
            actual = actual.siguiente;
        }
        return null;
    }

    // 4. ACTUALIZAR ACTIVIDAD (Modificación de datos en el nodo correspondiente)
    actualizar(id, nombre, descripcion, estado) {
        let actual = this.cabeza;
        const idBuscado = Number(id);

        while (actual !== null) {
            if (actual.id === idBuscado) {
                if (nombre !== undefined && nombre !== null && nombre.trim() !== '') {
                    actual.nombre = nombre.trim();
                }
                if (descripcion !== undefined && descripcion !== null && descripcion.trim() !== '') {
                    actual.descripcion = descripcion.trim();
                }
                if (estado !== undefined && estado !== null && estado.trim() !== '') {
                    actual.estado = estado.trim();
                }

                // Guardar los cambios actualizados en el archivo .txt
                this.guardarEnTxt();

                return {
                    id: actual.id,
                    nombre: actual.nombre,
                    descripcion: actual.descripcion,
                    estado: actual.estado
                };
            }
            actual = actual.siguiente;
        }
        return null;
    }

    // 5. ELIMINAR ACTIVIDAD (Eliminación de nodo en lista enlazada)
    eliminar(id) {
        if (!this.cabeza) return false;

        const idBuscado = Number(id);

        // Si el elemento a eliminar es la cabeza
        if (this.cabeza.id === idBuscado) {
            this.cabeza = this.cabeza.siguiente;
            this.longitud--;
            this.guardarEnTxt();
            return true;
        }

        // Si está en medio o al final
        let actual = this.cabeza;
        while (actual.siguiente !== null && actual.siguiente.id !== idBuscado) {
            actual = actual.siguiente;
        }

        if (actual.siguiente !== null) {
            // Desvinculamos el nodo saltándolo
            actual.siguiente = actual.siguiente.siguiente;
            this.longitud--;
            this.guardarEnTxt();
            return true;
        }

        return false;
    }

    // PERSISTENCIA: Guardar la lista enlazada en el archivo .txt
    guardarEnTxt() {
        try {
            const lineas = [];
            let actual = this.cabeza;

            while (actual !== null) {
                // Formato limpio: ID | Nombre | Descripcion | Estado
                const nombreLimpio = actual.nombre.replace(/\|/g, '-');
                const descLimpia = actual.descripcion.replace(/\|/g, '-');
                lineas.push(`${actual.id} | ${nombreLimpio} | ${descLimpia} | ${actual.estado}`);
                actual = actual.siguiente;
            }

            fs.writeFileSync(this.rutaArchivo, lineas.join('\n'), 'utf8');
        } catch (error) {
            console.error('Error al guardar en el archivo .txt:', error.message);
        }
    }

    // PERSISTENCIA: Cargar datos desde el archivo .txt al iniciar
    cargarDesdeTxt() {
        try {
            // Si el archivo no existe, creamos unos datos de prueba iniciales
            if (!fs.existsSync(this.rutaArchivo)) {
                const datosIniciales = [
                    '1 | Elaborar Reporte Mensual | Realizar balance financiero de actividades de la empresa | Pendiente',
                    '2 | Capacitación del Personal | Curso introductorio de herramientas digitales para empleados | En proceso',
                    '3 | Mantenimiento de Equipos | Revisión de equipos de cómputo en oficinas | Completada'
                ].join('\n');
                fs.writeFileSync(this.rutaArchivo, datosIniciales, 'utf8');
            }

            const contenido = fs.readFileSync(this.rutaArchivo, 'utf8');
            const lineas = contenido.split('\n');

            this.cabeza = null;
            this.longitud = 0;
            this.ultimoId = 0;

            for (const linea of lineas) {
                const lineaLimpia = linea.trim();
                if (!lineaLimpia) continue;

                const partes = lineaLimpia.split('|').map(p => p.trim());
                if (partes.length >= 4) {
                    const id = Number(partes[0]);
                    const nombre = partes[1];
                    const descripcion = partes[2];
                    const estado = partes[3];

                    const nodo = new Actividad(id, nombre, descripcion, estado);

                    if (!this.cabeza) {
                        this.cabeza = nodo;
                    } else {
                        let actual = this.cabeza;
                        while (actual.siguiente !== null) {
                            actual = actual.siguiente;
                        }
                        actual.siguiente = nodo;
                    }

                    this.longitud++;
                    if (id > this.ultimoId) {
                        this.ultimoId = id;
                    }
                }
            }

            console.log(`[Lista Enlazada] Cargadas ${this.longitud} actividades desde ${path.basename(this.rutaArchivo)}`);
        } catch (error) {
            console.error('Error al cargar archivo .txt:', error.message);
        }
    }
}

module.exports = ListaEnlazada;
