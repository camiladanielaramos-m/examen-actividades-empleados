// Clase Nodo para la Lista Enlazada
// Representa una actividad individual en la lista enlazada
class Actividad {
    constructor(id, nombre, descripcion, estado = 'Pendiente') {
        this.id = Number(id);
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.estado = estado; // 'Pendiente', 'En proceso' o 'Completada'
        this.siguiente = null; // Puntero de la lista enlazada al siguiente nodo
    }
}

module.exports = Actividad;
