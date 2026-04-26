// ==================================================
// Inventario Cabuyas JD - script.js
// Secciones principales:
//  - Config / constantes (paleta y keys)
//  - Clase Inventario (carga/guarda/operaciones)
//  - Funciones auxiliares (UI: abrir/cerrar modales, validar fechas)
//  - Login / Registro (validación, búsqueda por cédula, authMode)
//  - Operaciones de inventario (agregar, retirar, listar, eliminar)
//  - Modales y utilidades (cantidad, búsqueda, etc.)
//
// Valores guardados en localStorage:
//  - 'cabuyas_users' : objeto { cedula: {nombres,apellidos,fnac,last_login} }
//  - 'cabuyas_inventario' : objeto { 'Producto': cantidad }
//
// Las funciones están etiquetadas con comentarios para facilitar maquetación y lectura.
// ==================================================

// ========== Paleta de colores ==========
const PALETTE = {
    PRIMARY: "#3399FF",
    ACCENT: "#FFD700",
    NEUTRAL: "#F5F7FA"
};

const COLORES = {
    AZUL: PALETTE.PRIMARY,
    AMARILLO: PALETTE.ACCENT,
    VERDE: "#33CC33",
    ROJO: "#FF3333"
};

const USERS_KEY = "cabuyas_users";
const INVENTARIO_KEY = "cabuyas_inventario";

// ========== Clase Inventario ==========
class Inventario {
    constructor() {
        this.productos = this.cargarDelStorage();
    }

    cargarDelStorage() {
        const datos = localStorage.getItem(INVENTARIO_KEY);
        if (!datos) return {};
        try {
            return JSON.parse(datos) || {};
        } catch (error) {
            console.warn('Inventario inválido en localStorage, se reinicia.', error);
            localStorage.removeItem(INVENTARIO_KEY);
            return {};
        }
    }

    guardarEnStorage() {
        localStorage.setItem(INVENTARIO_KEY, JSON.stringify(this.productos));
    }

    listarInventario() {
        return Object.entries(this.productos).map(([nombre, cantidad]) => [nombre, cantidad]);
    }

    agregarProducto(nombre, cantidad) {
        cantidad = parseInt(cantidad);
        if (nombre in this.productos) {
            this.productos[nombre] += cantidad;
        } else {
            this.productos[nombre] = cantidad;
        }
        this.guardarEnStorage();
    }

    retirarProducto(nombre, cantidad) {
        cantidad = parseInt(cantidad);
        if (nombre in this.productos && this.productos[nombre] >= cantidad) {
            this.productos[nombre] -= cantidad;
            this.guardarEnStorage();
            return true;
        }
        return false;
    }

    productosBajoStock(umbral) {
        return this.listarInventario().filter(([prod, cant]) => cant < umbral);
    }

    buscarPorNombre(texto) {
        texto = texto.toLowerCase();
        return this.listarInventario().filter(([p, c]) => p.toLowerCase().includes(texto));
    }
}



// ========== Funciones auxiliares ==========

function cargarUsuarios() {
    const datos = localStorage.getItem(USERS_KEY);
    if (!datos) return {};
    try {
        return JSON.parse(datos) || {};
    } catch (error) {
        console.warn('Usuarios inválidos en localStorage, se reinician.', error);
        localStorage.removeItem(USERS_KEY);
        return {};
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
}

function abrirPantalla(pantalla) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(pantalla).classList.add('active');
}

function abrirModal(modal) {
    document.getElementById(modal).classList.add('active');
}

function cerrarModal(modal) {
    document.getElementById(modal).classList.remove('active');
    // Limpiar modales específicos
    if (modal === 'agregarModal') {
        document.getElementById('mensajeAgregar').textContent = '';
        document.getElementById('mensajeAgregar').className = 'mensaje';
    }
    if (modal === 'retirarModal') {
        document.getElementById('mensajeRetirar').textContent = '';
        document.getElementById('mensajeRetirar').className = 'mensaje';
    }
}

function mostrarInfo(titulo, texto) {
    document.getElementById('infoModalTitle').textContent = titulo;
    document.getElementById('infoModalText').textContent = texto;
    abrirModal('infoModal');
}

function mostrarErrores(errores) {
    const lista = document.getElementById('errorList');
    lista.innerHTML = '';
    errores.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        lista.appendChild(li);
    });
    abrirModal('errorModal');
}

function validarFecha(fechaStr) {
    // Acepta tanto 'DD/MM/AAAA' como 'AAAA-MM-DD' (ISO date).
    if (!fechaStr) return false;
    if (fechaStr.includes('-')) {
        // formato ISO -> convertir a DD/MM/AAAA
        const parts = fechaStr.split('-');
        if (parts.length !== 3) return false;
        fechaStr = `${parts[2].padStart(2,'0')}/${parts[1].padStart(2,'0')}/${parts[0]}`;
    }
    const [dia, mes, año] = fechaStr.split('/').map(Number);

    if (!dia || !mes || !año) return false;
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;

    const fecha = new Date(año, mes - 1, dia);
    if (fecha.getDate() !== dia) return false;

    const hoy = new Date();
    let edad = hoy.getFullYear() - año;
    // Ajuste sencillo por mes/día
    const m = hoy.getMonth() + 1;
    const d = hoy.getDate();
    if (m < mes || (m === mes && d < dia)) edad -= 1;

    if (edad < 0 || edad > 120) return false;

    return true;
}

// ========== Login ==========

function mostrarManualIngreso() {
    const texto = `Manual breve de ingreso:

- Completa Nombres y Apellidos (obligatorio).
- Cédula: solo números, sin puntos ni espacios (ej: 12345678).
- Fecha de nacimiento: formato DD/MM/AAAA.

Si hay errores se mostrará una ventana explicativa.

Puedes Buscar por cédula para autocompletar datos si ya existen.`;
    mostrarInfo('Manual de ingreso', texto);
}

// Modo de autenticación: 'register' (por defecto) o 'login'
let authMode = 'register';

function actualizarCamposAuth() {
    const camposRegistro = document.querySelectorAll('.registro-only');
    const registerPanel = document.getElementById('register-panel');
    const loginPanel = document.getElementById('login-panel');
    const cedulaInput = document.getElementById('cedula');
    const cedulaLoginInput = document.getElementById('cedula-login');

    camposRegistro.forEach(campo => {
        campo.classList.toggle('hidden', authMode === 'login');
    });

    if (authMode === 'login') {
        registerPanel.classList.add('hidden');
        loginPanel.classList.remove('hidden');
        // Sync cedula values
        if (cedulaLoginInput && cedulaInput) {
            cedulaLoginInput.value = cedulaInput.value;
        }
    } else {
        registerPanel.classList.remove('hidden');
        loginPanel.classList.add('hidden');
        // Sync cedula values
        if (cedulaInput && cedulaLoginInput) {
            cedulaInput.value = cedulaLoginInput.value;
        }
    }
}

function switchAuthMode(mode) {
    console.log('switchAuthMode called with mode:', mode);
    authMode = mode === 'login' ? 'login' : 'register';
    console.log('authMode set to:', authMode);
    const registerBtn = document.getElementById('modeRegister');
    const loginBtn = document.getElementById('modeLogin');
    const primaryBtn = document.getElementById('primaryActionBtn');
    const infoText = document.getElementById('infoText');
    const headerTitle = document.getElementById('headerLoginTitle');

    if (authMode === 'login') {
        registerBtn.classList.remove('active');
        loginBtn.classList.add('active');
        primaryBtn.textContent = 'Iniciar sesión';
        infoText.textContent = 'Introduce tu cédula y pulsa "Iniciar sesión" o usa "Buscar (cédula)" para autocompletar.';
        headerTitle.textContent = 'Iniciar sesión - Inventario Cabuyas JD';
    } else {
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
        primaryBtn.textContent = 'Registrar';
        infoText.textContent = 'Por favor completa el formulario de registro o usa la opción "Iniciar sesión" si ya te registraste.';
        headerTitle.textContent = 'Bienvenido - Inventario Cabuyas JD';
    }

    actualizarCamposAuth();
}

// Abre el formulario de autenticación y selecciona el modo (register/login)
function openAuth(mode) {
    try { switchAuthMode(mode); } catch (e) {}
    // limpiar formulario antes de mostrar
    try { 
        document.getElementById('loginForm').reset();
        const cedulaLoginInput = document.getElementById('cedula-login');
        if (cedulaLoginInput) cedulaLoginInput.value = '';
    } catch(e) {}
    abrirPantalla('loginScreen');
    // Enfocar el campo apropiado según el modo
    setTimeout(() => {
        if (mode === 'login') {
            const cedulaLoginInput = document.getElementById('cedula-login');
            if (cedulaLoginInput) cedulaLoginInput.focus();
        } else {
            const nombresInput = document.getElementById('nombres');
            if (nombresInput) nombresInput.focus();
        }
    }, 120);
}

function iniciarSesionPorCedula(cedula) {
    const usuarios = cargarUsuarios();
    const usuario = usuarios[cedula];
    if (usuario) {
        usuarioActual = usuario;
        document.getElementById('headerNombre').textContent =
            `Inventario Cabuyas JD - Usuario: ${usuario.nombres} ${usuario.apellidos}`;
        abrirPantalla('menuScreen');
        return true;
    } else {
        mostrarInfo('No encontrado', `No existe un usuario registrado con la cédula ${cedula}.`);
        return false;
    }
}

function buscarPorCedula() {
    const cedulaInput = authMode === 'login' ? document.getElementById('cedula-login') : document.getElementById('cedula');
    const cedula = cedulaInput.value.trim();
    if (!cedula) {
        mostrarInfo('Buscar usuario', 'Ingresa la cédula en el campo correspondiente y pulsa Buscar.');
        return;
    }

    const usuarios = cargarUsuarios();
    const usuario = usuarios[cedula];

    if (usuario) {
        if (authMode === 'register') {
            document.getElementById('nombres').value = usuario.nombres;
            document.getElementById('apellidos').value = usuario.apellidos;
            // usuario.fnac está guardado como DD/MM/AAAA -> convertir a ISO (AAAA-MM-DD) para input type=date
            try {
                const parts = usuario.fnac.split('/');
                if (parts.length === 3) {
                    document.getElementById('fnac').value = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                } else {
                    document.getElementById('fnac').value = usuario.fnac;
                }
            } catch (e) {
                document.getElementById('fnac').value = usuario.fnac;
            }
        }
        mostrarInfo('Usuario encontrado', `Datos cargados para cédula ${cedula}.`);
    } else {
        mostrarInfo('No encontrado', `No hay usuario guardado con cédula ${cedula}.`);
    }
}

function validarYProceder() {
    const errores = []; // Declarar errores al inicio
    const cedulaInput = authMode === 'login' ? document.getElementById('cedula-login') : document.getElementById('cedula');
    const cedula = cedulaInput.value.trim();

    if (!cedula) {
        errores.push('La cédula es obligatoria.');
    } else if (!/^\d+$/.test(cedula) || cedula.length < 7 || cedula.length > 12) {
        errores.push('La cédula debe contener entre 7 y 12 dígitos numéricos.');
    }

    if (authMode === 'login') {
        if (errores.length > 0) {
            mostrarErrores(errores);
            return;
        }

        const ok = iniciarSesionPorCedula(cedula);
        if (ok) {
            const usuarios = cargarUsuarios();
            usuarios[cedula].last_login = new Date().toISOString();
            guardarUsuarios(usuarios);
        }
        return;
    }

    // Registration mode - ya no declarar errores aquí
    const nombres = document.getElementById('nombres').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    let fnac_raw = document.getElementById('fnac').value.trim();
    let fnac = fnac_raw;
    if (fnac_raw && fnac_raw.includes('-')) {
        const p = fnac_raw.split('-');
        if (p.length === 3) fnac = `${p[2].padStart(2,'0')}/${p[1].padStart(2,'0')}/${p[0]}`;
    }

    if (!nombres) errores.push('Los nombres son obligatorios.');
    if (!apellidos) errores.push('Los apellidos son obligatorios.');
    if (!fnac) {
        errores.push('La fecha de nacimiento es obligatoria.');
    } else if (!validarFecha(fnac)) {
        errores.push('La fecha de nacimiento no es válida (formato DD/MM/AAAA o edad fuera de rango).');
    }

    if (errores.length > 0) {
        mostrarErrores(errores);
        return;
    }

    // Guardar usuario (modo registro)
    const usuarios = cargarUsuarios();
    usuarios[cedula] = {
        nombres: nombres,
        apellidos: apellidos,
        cedula: cedula,
        // Guardamos como DD/MM/AAAA para compatibilidad con la versión original
        fnac: fnac,
        last_login: new Date().toISOString()
    };
    guardarUsuarios(usuarios);

    // Proceder al menú
    usuarioActual = usuarios[cedula];
    document.getElementById('headerNombre').textContent = 
        `Inventario Cabuyas JD - Usuario: ${nombres} ${apellidos}`;
    abrirPantalla('menuScreen');
}

function cancelarLogin() {
    document.getElementById('loginForm').reset();
    const cedulaLoginInput = document.getElementById('cedula-login');
    if (cedulaLoginInput) cedulaLoginInput.value = '';
    document.getElementById('nombres').focus();
}

// ========== Menú Principal ==========

function mostrarManualUsuario() {
    const texto = `Manual de usuario rápido:

➕ Agregar producto: selecciona un producto existente o escribe uno nuevo y añade cantidad.

➖ Retirar producto: selecciona producto con flechas, indica cantidad a retirar.

📋 Listar inventario: muestra todos los productos y cantidades.

🔎 Buscar / Bajo stock: busca por nombre o muestra productos por debajo de un umbral.

Tus datos de usuario se guardan en el navegador (localStorage).`;
    mostrarInfo('Manual de Usuario', texto);
}

function salirSesion() {
    usuarioActual = null;
    document.getElementById('loginForm').reset();
    document.getElementById('nombres').focus();
    abrirPantalla('loginScreen');
}

// ========== Agregar Producto ==========

function abrirAgregarProducto() {
    const items = inventario.listarInventario();
    
    // Llenar tabla
    const tbody = document.querySelector('#tableInventarioAgregar tbody');
    tbody.innerHTML = '';
    items.forEach(([prod, cant]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prod}</td>
            <td>${cant}</td>
        `;
        tbody.appendChild(tr);
    });

    // Llenar select
    const select = document.getElementById('selectProductoAgregar');
    select.innerHTML = '';
    items.forEach(([prod, cant]) => {
        const option = document.createElement('option');
        option.value = prod;
        option.textContent = prod;
        select.appendChild(option);
    });

    document.getElementById('inputProductoAgregar').value = '';
    document.getElementById('mensajeAgregar').textContent = '';
    document.getElementById('mensajeAgregar').className = 'mensaje';

    select.onchange = function() {
        if (this.selectedIndex >= 0) {
            document.getElementById('inputProductoAgregar').value = this.options[this.selectedIndex].value;
            const mensaje = document.getElementById('mensajeAgregar');
            mensaje.textContent = `Producto seleccionado: ${this.options[this.selectedIndex].value}`;
            mensaje.className = 'mensaje visible mensaje-verde';
        }
    };

    abrirModal('agregarModal');
}

function mostrarAyudaAgregar() {
    mostrarInfo('Ayuda - Agregar', 'Selecciona o escribe producto, luego pulsa Agregar y especifica la cantidad.');
}

function confirmarAgregarProducto() {
    const nombre = document.getElementById('inputProductoAgregar').value.trim();
    const mensaje = document.getElementById('mensajeAgregar');

    if (!nombre) {
        mensaje.textContent = 'Debes seleccionar o escribir un producto.';
        mensaje.className = 'mensaje visible mensaje-rojo';
        return;
    }

    operacionCantidad = {
        tipo: 'agregar',
        producto: nombre
    };

    document.getElementById('cantidadModalTitle').textContent = 
        `¿Cuántas unidades añadir a '${nombre}'?`;
    document.getElementById('inputCantidad').value = '';
    document.getElementById('inputCantidad').focus();

    cerrarModal('agregarModal');
    abrirModal('cantidadModal');
}

// ========== Retirar Producto ==========

function abrirRetirarProducto() {
    const items = inventario.listarInventario();
    if (items.length === 0) {
        mostrarInfo('Inventario vacío', 'No hay productos en el inventario para retirar.');
        return;
    }
    
    // Llenar tabla
    const tbody = document.querySelector('#tableInventarioRetirar tbody');
    tbody.innerHTML = '';
    items.forEach(([prod, cant]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prod}</td>
            <td>${cant}</td>
        `;
        tbody.appendChild(tr);
    });

    // Llenar select
    const select = document.getElementById('selectProductoRetirar');
    select.innerHTML = '';
    items.forEach(([prod, cant]) => {
        const option = document.createElement('option');
        option.value = prod;
        option.textContent = prod;
        select.appendChild(option);
    });

    document.getElementById('inputProductoRetirar').value = '';
    document.getElementById('mensajeRetirar').textContent = '';
    document.getElementById('mensajeRetirar').className = 'mensaje';

    select.onchange = function() {
        if (this.selectedIndex >= 0) {
            document.getElementById('inputProductoRetirar').value = this.options[this.selectedIndex].value;
            const mensaje = document.getElementById('mensajeRetirar');
            mensaje.textContent = `Producto seleccionado: ${this.options[this.selectedIndex].value}`;
            mensaje.className = 'mensaje visible mensaje-verde';
        }
    };

    abrirModal('retirarModal');
}

// ========== Eliminar Producto (completo) ==========

function abrirEliminarProducto() {
    const items = inventario.listarInventario();
    const select = document.getElementById('selectProductoEliminar');
    select.innerHTML = '';

    if (items.length === 0) {
        mostrarInfo('Inventario vacío', 'No hay productos en el inventario para eliminar.');
        return;
    }

    items.forEach(([prod, cant]) => {
        const option = document.createElement('option');
        option.value = prod;
        option.textContent = `${prod} — ${cant} unidades`;
        select.appendChild(option);
    });

    abrirModal('eliminarModal');
}

function confirmarEliminarProducto() {
    const select = document.getElementById('selectProductoEliminar');
    if (!select || select.selectedIndex < 0) {
        mostrarInfo('Selecciona producto', 'Debes seleccionar un producto para eliminar.');
        return;
    }

    const nombre = select.options[select.selectedIndex].value;
    if (!confirm(`¿Estás seguro de eliminar completamente el producto '${nombre}' del inventario?`)) return;

    // Eliminar del inventario persistente
    const datos = inventario.cargarDelStorage();
    if (datos && datos.hasOwnProperty(nombre)) {
        delete datos[nombre];
        localStorage.setItem(INVENTARIO_KEY, JSON.stringify(datos));
        // Actualizar instancia en memoria
        inventario.productos = datos;
        mostrarInfo('Eliminado', `El producto '${nombre}' fue eliminado del inventario.`);
        cerrarModal('eliminarModal');
    } else {
        mostrarInfo('Error', 'No se encontró el producto seleccionado en el inventario.');
    }
}

function mostrarAyudaRetirar() {
    mostrarInfo('Ayuda - Retirar', 'Selecciona producto y pulsa Retirar, luego indica la cantidad.');
}

function confirmarRetirarProducto() {
    const nombre = document.getElementById('inputProductoRetirar').value.trim();
    const mensaje = document.getElementById('mensajeRetirar');

    if (!nombre) {
        mensaje.textContent = 'Debes seleccionar o escribir un producto.';
        mensaje.className = 'mensaje visible mensaje-rojo';
        return;
    }

    operacionCantidad = {
        tipo: 'retirar',
        producto: nombre
    };

    document.getElementById('cantidadModalTitle').textContent = 
        `¿Cuántas unidades retirar de '${nombre}'?`;
    document.getElementById('inputCantidad').value = '';
    document.getElementById('inputCantidad').focus();

    cerrarModal('retirarModal');
    abrirModal('cantidadModal');
}

// ========== Modal de Cantidad ==========

function confirmarCantidad() {
    const cantidad = document.getElementById('inputCantidad').value.trim();

    if (!cantidad || isNaN(cantidad) || parseInt(cantidad) < 1) {
        mostrarInfo('Error', 'Debes ingresa una cantidad válida (número mayor a 0).');
        return;
    }

    const op = operacionCantidad;

    if (op.tipo === 'agregar') {
        inventario.agregarProducto(op.producto, cantidad);
        mostrarInfo('Éxito', `Se agregaron ${cantidad} unidades a '${op.producto}'.`);
        cerrarModal('cantidadModal');
    } else if (op.tipo === 'retirar') {
        const ok = inventario.retirarProducto(op.producto, cantidad);
        if (ok) {
            mostrarInfo('Éxito', `Se retiraron ${cantidad} unidades de '${op.producto}'.`);
            cerrarModal('cantidadModal');
        } else {
            mostrarInfo('Error', 'Stock insuficiente o producto inexistente.');
        }
    }

    operacionCantidad = null;
}

// Permitir Enter en modal de cantidad
// ========== Listar Inventario ==========

function abrirListarInventario() {
    const items = inventario.listarInventario();
    const tbody = document.querySelector('#tableListarInventario tbody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2" style="text-align: center; color: ${COLORES.ROJO};">Inventario vacío.</td>`;
        tbody.appendChild(tr);
    } else {
        items.forEach(([prod, cant]) => {
            const tr = document.createElement('tr');
            const colorCant = cant === 0 ? COLORES.ROJO : COLORES.VERDE;
            tr.innerHTML = `
                <td>${prod}</td>
                <td style="color: ${colorCant};">${cant}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    abrirModal('listarModal');
}

// ========== Buscar / Bajo Stock ==========

function abrirBuscarOBajoStock() {
    document.getElementById('inputBusqueda').value = '';
    document.getElementById('inputUmbral').value = '';
    limpiarResultadosBusqueda();
    abrirModal('buscarModal');
}

function limpiarResultadosBusqueda() {
    const tbody = document.querySelector('#tableResultadoBusqueda tbody');
    tbody.innerHTML = '';
}

function mostrarAyudaBuscar() {
    mostrarInfo('Ayuda - Buscar', 'Escribe parte del nombre para buscar coincidencias, o ingresa un umbral para ver productos con menos unidades.');
}

function ejecutarBusqueda() {
    const busqueda = document.getElementById('inputBusqueda').value.trim();
    const umbral = document.getElementById('inputUmbral').value.trim();
    let resultados = [];

    if (busqueda) {
        resultados = inventario.buscarPorNombre(busqueda);
    } else if (umbral) {
        if (isNaN(umbral) || parseInt(umbral) < 1) {
            mostrarInfo('Error', 'El umbral debe ser un número entero.');
            return;
        }
        resultados = inventario.productosBajoStock(parseInt(umbral));
    } else {
        mostrarInfo('Info', 'Escribe algo para buscar o especifica un umbral.');
        return;
    }

    const tbody = document.querySelector('#tableResultadoBusqueda tbody');
    tbody.innerHTML = '';

    if (resultados.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2" style="text-align: center; color: ${COLORES.ROJO};">No se encontraron resultados.</td>`;
        tbody.appendChild(tr);
    } else {
        resultados.forEach(([prod, cant]) => {
            const tr = document.createElement('tr');
            const colorCant = cant < 1 ? COLORES.ROJO : COLORES.VERDE;
            tr.innerHTML = `
                <td>${prod}</td>
                <td style="color: ${colorCant};">${cant}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// ========== Event Listeners ==========

document.addEventListener('DOMContentLoaded', function() {
    // Enter en formulario de login
    document.getElementById('loginForm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validarYProceder();
        }
    });

    // Enter en búsqueda
    document.getElementById('inputBusqueda').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            ejecutarBusqueda();
        }
    });

    document.getElementById('inputUmbral').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            ejecutarBusqueda();
        }
    });

    // Enfocar campo apropiado al cargar
    const nombresInput = document.getElementById('nombres');
    if (nombresInput) nombresInput.focus();

    // Configurar input date (si existe) para no permitir fecha futura
    const fnacEl = document.getElementById('fnac');
    if (fnacEl) {
        fnacEl.max = new Date().toISOString().split('T')[0];
    }

    // Cargar inventario inicial
    inventario = new Inventario();
    // Asegurar modo por defecto en la UI
    try { switchAuthMode('register'); } catch(e) {}

    // Event listeners para cantidad
    const inputCantidad = document.getElementById('inputCantidad');
    if (inputCantidad) {
        inputCantidad.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmarCantidad();
            }
        });
    }

    // Cerrar modales al hacer clic fuera
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
        }
    });

    // Keyboard navigation for mode toggle
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const currentIndex = Array.from(modeButtons).indexOf(this);
                const nextIndex = e.key === 'ArrowLeft' 
                    ? (currentIndex - 1 + modeButtons.length) % modeButtons.length
                    : (currentIndex + 1) % modeButtons.length;
                modeButtons[nextIndex].click();
                modeButtons[nextIndex].focus();
            }
        });
    });

    // Add loading states to buttons
    const actionButtons = document.querySelectorAll('.btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                // Add loading state temporarily for better UX
                this.classList.add('loading');
                setTimeout(() => this.classList.remove('loading'), 1000);
            }
        });
    });
});

// Cerrar modales al hacer clic fuera
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Error handling for missing elements
function safeGetElement(id) {
    try {
        return document.getElementById(id);
    } catch (e) {
        console.warn(`Element with id '${id}' not found:`, e);
        return null;
    }
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could show user-friendly error message here
});

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Could register a service worker here for offline capabilities
        // navigator.serviceWorker.register('/sw.js');
    });
}
