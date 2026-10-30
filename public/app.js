// Logica de cliente simple para el examen

let actividadesActuales = [];

const form = document.getElementById('formularioActividad');
const inputId = document.getElementById('actividadId');
const inputNombre = document.getElementById('nombre');
const inputDescripcion = document.getElementById('descripcion');
const selectEstado = document.getElementById('estado');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const tituloFormulario = document.getElementById('tituloFormulario');
const cuerpoTabla = document.getElementById('cuerpoTabla');
const alerta = document.getElementById('alerta');

const buscador = document.getElementById('buscador');
const filtroEstado = document.getElementById('filtroEstado');

document.addEventListener('DOMContentLoaded', () => {
    cargarActividades();
});

// 1. Cargar actividades desde la lista enlazada (GET)
async function cargarActividades() {
    try {
        const respuesta = await fetch('/api/actividades');
        const data = await respuesta.json();

        if (data.exito) {
            actividadesActuales = data.datos;
            renderizarTabla(actividadesActuales);
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        mostrarMensaje('Error al conectar con el servidor.');
    }
}

// 2. Renderizar filas de la tabla
function renderizarTabla(actividades) {
    cuerpoTabla.innerHTML = '';

    if (actividades.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay actividades registradas.</td></tr>';
        return;
    }

    actividades.forEach(act => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${act.id}</td>
            <td><strong>${escaparHtml(act.nombre)}</strong></td>
            <td>${escaparHtml(act.descripcion)}</td>
            <td>
                <strong>${act.estado}</strong>
                <select class="select-rapido" onchange="cambiarEstadoRapido(${act.id}, this.value)">
                    <option value="" disabled selected>Cambiar estado...</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Completada">Completada</option>
                </select>
            </td>
            <td>
                <button type="button" class="btn-accion" onclick="editarActividad(${act.id})">Editar</button>
                <button type="button" class="btn-accion" onclick="eliminarActividad(${act.id})">Eliminar</button>
            </td>
        `;

        cuerpoTabla.appendChild(fila);
    });
}

// 3. Registrar o Actualizar (Form Submit)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const nombre = inputNombre.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const estado = selectEstado.value;

    if (!nombre || !descripcion) {
        alert('Completa el nombre y la descripción');
        return;
    }

    try {
        let respuesta;
        if (id) {
            // Actualizar (PUT)
            respuesta = await fetch(`/api/actividades/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, descripcion, estado })
            });
        } else {
            // Registrar (POST)
            respuesta = await fetch('/api/actividades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, descripcion, estado })
            });
        }

        const data = await respuesta.json();
        if (data.exito) {
            mostrarMensaje(data.mensaje);
            limpiarFormulario();
            cargarActividades();
        } else {
            alert(data.mensaje);
        }
    } catch (error) {
        alert('Error al guardar datos');
    }
});

// 4. Cargar datos en el formulario para editar
function editarActividad(id) {
    const act = actividadesActuales.find(a => a.id === id);
    if (!act) return;

    inputId.value = act.id;
    inputNombre.value = act.nombre;
    inputDescripcion.value = act.descripcion;
    selectEstado.value = act.estado;

    tituloFormulario.textContent = `Editar Actividad #${act.id}`;
    btnGuardar.textContent = 'Guardar Cambios';
    btnCancelar.style.display = 'inline-block';
}

// 5. Cancelar edición
btnCancelar.addEventListener('click', () => {
    limpiarFormulario();
});

function limpiarFormulario() {
    form.reset();
    inputId.value = '';
    tituloFormulario.textContent = 'Registrar Actividad';
    btnGuardar.textContent = 'Registrar';
    btnCancelar.style.display = 'none';
}

// 6. Cambiar estado rápido desde el select de la tabla
async function cambiarEstadoRapido(id, nuevoEstado) {
    if (!nuevoEstado) return;
    try {
        const respuesta = await fetch(`/api/actividades/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await respuesta.json();
        if (data.exito) {
            mostrarMensaje(`Actividad #${id} actualizada a "${nuevoEstado}" en lista y .txt`);
            cargarActividades();
        }
    } catch (e) {
        alert('Error al actualizar estado');
    }
}

// 7. Eliminar
async function eliminarActividad(id) {
    if (!confirm(`¿Eliminar la actividad #${id}?`)) return;

    try {
        const respuesta = await fetch(`/api/actividades/${id}`, { method: 'DELETE' });
        const data = await respuesta.json();
        if (data.exito) {
            mostrarMensaje(`Actividad #${id} eliminada.`);
            cargarActividades();
        }
    } catch (e) {
        alert('Error al eliminar');
    }
}

// 8. Buscar y Filtrar
function filtrar() {
    const texto = buscador.value.toLowerCase().trim();
    const estado = filtroEstado.value;

    const resultado = actividadesActuales.filter(act => {
        const matchTexto = act.nombre.toLowerCase().includes(texto) || act.descripcion.toLowerCase().includes(texto);
        const matchEstado = (estado === 'Todos') || (act.estado === estado);
        return matchTexto && matchEstado;
    });

    renderizarTabla(resultado);
}

buscador.addEventListener('input', filtrar);
filtroEstado.addEventListener('change', filtrar);

// Mostrar mensaje simple
function mostrarMensaje(msg) {
    alerta.textContent = msg;
    alerta.style.display = 'block';
    setTimeout(() => {
        alerta.style.display = 'none';
    }, 3500);
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
