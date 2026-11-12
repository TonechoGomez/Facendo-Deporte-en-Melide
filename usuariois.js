// ============================================================================
// usuarios.js - Gestión de almacenamiento, perfiles, preferencias y acceso
// ============================================================================

const STORAGE_KEY_USERS = 'melide_deporte_usuarios_v1';
const STORAGE_KEY_SESSION = 'melide_deporte_sesion_activa';

// Obtener lista de usuarios guardados en el navegador
function obtenerUsuarios() {
    const data = localStorage.getItem(STORAGE_KEY_USERS);
    return data ? JSON.parse(data) : [];
}

// Guardar lista completa de usuarios
function guardarUsuarios(lista) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(lista));
}

// Obtener usuario de la sesión actual
function obtenerUsuarioActivo() {
    const dniActivo = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!dniActivo) return null;
    const usuarios = obtenerUsuarios();
    return usuarios.find(u => u.dni === dniActivo) || null;
}

// Navegación entre pantallas principales
function irA(idPantalla) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(idPantalla).classList.add('active');

    const header = document.getElementById('main-header');
    const btnAtras = document.getElementById('btn-atras');

    if (idPantalla === 'scr-inicio') {
        header.style.display = 'none';
    } else {
        header.style.display = 'flex';
        btnAtras.style.display = (idPantalla === 'scr-registro') ? 'block' : 'none';
    }
}

// Cambiar entre pestaña de Actividad y pestaña de Perfil dentro de Zona Usuario
function cambiarPestanaUsuario(pestana) {
    const subActividad = document.getElementById('subvista-actividad');
    const subPerfil = document.getElementById('subvista-perfil');
    const btnActividad = document.getElementById('tab-btn-actividad');
    const btnPerfil = document.getElementById('tab-btn-perfil');

    if (pestana === 'actividad') {
        subActividad.style.display = 'block';
        subPerfil.style.display = 'none';
        btnActividad.classList.add('active');
        btnPerfil.classList.remove('active');
    } else {
        subActividad.style.display = 'none';
        subPerfil.style.display = 'block';
        btnActividad.classList.remove('active');
        btnPerfil.classList.add('active');
        cargarDatosEnFormularioEdicion();
    }
}

// ----------------------------------------------------------------------------
// 1. REGISTRO NUEVO
// ----------------------------------------------------------------------------
function handleRegistro(e) {
    e.preventDefault();
    const errorBox = document.getElementById('reg-error');
    errorBox.style.display = 'none';

    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const emailConfirm = document.getElementById('reg-email-confirm').value.trim().toLowerCase();
    const pass = document.getElementById('reg-password').value;
    const passConfirm = document.getElementById('reg-password-confirm').value;
    const dni = document.getElementById('reg-dni').value.trim().toUpperCase();

    if (email !== emailConfirm) {
        mostrarError('reg-error', '⚠️ Los correos electrónicos no coinciden.');
        return;
    }
    if (pass !== passConfirm) {
        mostrarError('reg-error', '⚠️ Las contraseñas no coinciden.');
        return;
    }

    const usuarios = obtenerUsuarios();

    // Comprobar si ya existe el DNI o el correo
    if (usuarios.some(u => u.dni === dni)) {
        mostrarError('reg-error', '⚠️ Ya existe un usuario registrado con ese DNI.');
        return;
    }
    if (usuarios.some(u => u.email === email)) {
        mostrarError('reg-error', '⚠️ Ya existe una cuenta con ese correo electrónico.');
        return;
    }

    const nuevoUsuario = {
        nombre: document.getElementById('reg-nombre').value.trim(),
        apellidos: document.getElementById('reg-apellidos').value.trim(),
        mote: document.getElementById('reg-mote').value.trim(),
        dni: dni,
        telefono: document.getElementById('reg-tf').value.trim(),
        edad: parseInt(document.getElementById('reg-edad').value, 10),
        direccion: document.getElementById('reg-direccion').value.trim(),
        peso: parseFloat(document.getElementById('reg-peso').value),
        estatura: parseInt(document.getElementById('reg-estatura').value, 10),
        habitos: document.getElementById('reg-habitos').value,
        condicion: document.getElementById('reg-condicion').value,
        email: email,
        password: pass,
        gustos: '',
        preferenciasSesion: {
            instalacion: 'Pabellón Polideportivo Municipal',
            tiempo: '45 minutos',
            material: [],
            objetivo: 'Movilidad y Salud'
        },
        fechaRegistro: new Date().toLocaleDateString('es-ES')
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    // Iniciar sesión automáticamente con el usuario recién creado
    localStorage.setItem(STORAGE_KEY_SESSION, nuevoUsuario.dni);
    iniciarZonaUsuario(nuevoUsuario);
}

// ----------------------------------------------------------------------------
// 2. INICIO DE SESIÓN Y PUERTA TRASERA
// ----------------------------------------------------------------------------
function handleLogin(e) {
    e.preventDefault();
    const errorBox = document.getElementById('login-error');
    errorBox.style.display = 'none';

    const userInput = document.getElementById('login-user').value.trim();
    const passInput = document.getElementById('login-pass').value.trim();

    // PUERTA TRASERA DE ADMINISTRACIÓN / ESTADÍSTICAS
    if (userInput === 'Tonecho' && passInput === '0010') {
        cargarVistaEstadisticas();
        irA('scr-admin');
        return;
    }

    // Búsqueda normal de usuario registrado (por correo, DNI o mote)
    const usuarios = obtenerUsuarios();
    const encontrado = usuarios.find(u => 
        (u.email.toLowerCase() === userInput.toLowerCase() || 
         u.dni.toUpperCase() === userInput.toUpperCase() ||
         u.mote.toLowerCase() === userInput.toLowerCase()) && 
        u.password === passInput
    );

    if (!encontrado) {
        mostrarError('login-error', '⚠️ Usuario o contraseña incorrectos. Si es tu primera vez, pulsa en Registro Nuevo.');
        return;
    }

    localStorage.setItem(STORAGE_KEY_SESSION, encontrado.dni);
    iniciarZonaUsuario(encontrado);
}

// Cargar datos del usuario en la Zona de Usuario
function iniciarZonaUsuario(usuario) {
    document.getElementById('saludo-principal').innerText = `¡Hola, ${usuario.mote || usuario.nombre}!`;
    
    // Cargar preferencias de sesión previas si existen
    if (usuario.preferenciasSesion) {
        document.getElementById('pref-instalacion').value = usuario.preferenciasSesion.instalacion || 'Pabellón Polideportivo Municipal';
        document.getElementById('pref-tiempo').value = usuario.preferenciasSesion.tiempo || '45 minutos';
        document.getElementById('pref-objetivo').value = usuario.preferenciasSesion.objetivo || 'Movilidad y Salud';

        const matsGuardados = usuario.preferenciasSesion.material || [];
        document.querySelectorAll('input[name="pref-mat"]').forEach(cb => {
            cb.checked = matsGuardados.includes(cb.value);
        });
    }

    cambiarPestanaUsuario('actividad');
    irA('scr-dash');
}

// ----------------------------------------------------------------------------
// 3. GUARDAR PREFERENCIAS DE ACTIVIDAD (INSTALACIÓN, MATERIAL, TIEMPO...)
// ----------------------------------------------------------------------------
function guardarPreferenciasSesion(e) {
    e.preventDefault();
    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;

    const materialesSeleccionados = [];
    document.querySelectorAll('input[name="pref-mat"]:checked').forEach(cb => {
        materialesSeleccionados.push(cb.value);
    });

    usuario.preferenciasSesion = {
        instalacion: document.getElementById('pref-instalacion').value,
        tiempo: document.getElementById('pref-tiempo').value,
        material: materialesSeleccionados,
        objetivo: document.getElementById('pref-objetivo').value
    };

    actualizarUsuarioEnStorage(usuario);

    const msg = document.getElementById('actividad-msg');
    msg.innerText = '✅ Preferencias de sesión guardadas correctamente.';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3500);
}

// ----------------------------------------------------------------------------
// 4. EDITAR FICHA DE INSCRIPCIÓN Y GUSTOS
// ----------------------------------------------------------------------------
function cargarDatosEnFormularioEdicion() {
    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;

    document.getElementById('edit-nombre').value = usuario.nombre;
    document.getElementById('edit-apellidos').value = usuario.apellidos;
    document.getElementById('edit-mote').value = usuario.mote;
    document.getElementById('edit-dni').value = usuario.dni;
    document.getElementById('edit-tf').value = usuario.telefono;
    document.getElementById('edit-edad').value = usuario.edad;
    document.getElementById('edit-direccion').value = usuario.direccion;
    document.getElementById('edit-peso').value = usuario.peso;
    document.getElementById('edit-estatura').value = usuario.estatura;
    document.getElementById('edit-habitos').value = usuario.habitos;
    document.getElementById('edit-condicion').value = usuario.condicion;
    document.getElementById('edit-gustos').value = usuario.gustos || '';
}

function actualizarDatosUsuario(e) {
    e.preventDefault();
    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;

    usuario.nombre = document.getElementById('edit-nombre').value.trim();
    usuario.apellidos = document.getElementById('edit-apellidos').value.trim();
    usuario.mote = document.getElementById('edit-mote').value.trim();
    usuario.telefono = document.getElementById('edit-tf').value.trim();
    usuario.edad = parseInt(document.getElementById('edit-edad').value, 10);
    usuario.direccion = document.getElementById('edit-direccion').value.trim();
    usuario.peso = parseFloat(document.getElementById('edit-peso').value);
    usuario.estatura = parseInt(document.getElementById('edit-estatura').value, 10);
    usuario.habitos = document.getElementById('edit-habitos').value;
    usuario.condicion = document.getElementById('edit-condicion').value;
    usuario.gustos = document.getElementById('edit-gustos').value.trim();

    actualizarUsuarioEnStorage(usuario);
    document.getElementById('saludo-principal').innerText = `¡Hola, ${usuario.mote || usuario.nombre}!`;

    const msg = document.getElementById('perfil-msg');
    msg.innerText = '✅ Ficha y gustos actualizados correctamente.';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3500);
}

function actualizarUsuarioEnStorage(usuarioActualizado) {
    const usuarios = obtenerUsuarios();
    const idx = usuarios.findIndex(u => u.dni === usuarioActualizado.dni);
    if (idx !== -1) {
        usuarios[idx] = usuarioActualizado;
        guardarUsuarios(usuarios);
    }
}

// ----------------------------------------------------------------------------
// 5. VISTA PREVIA DE ESTADÍSTICAS (PUERTA TRASERA)
// ----------------------------------------------------------------------------
function cargarVistaEstadisticas() {
    const usuarios = obtenerUsuarios();
    document.getElementById('stat-total-usuarios').innerText = usuarios.length;

    if (usuarios.length > 0) {
        const sumaEdades = usuarios.reduce((acc, u) => acc + (u.edad || 0), 0);
        document.getElementById('stat-edad-media').innerText = Math.round(sumaEdades / usuarios.length) + ' años';

        const listaHtml = usuarios.slice(-5).reverse().map(u => 
            `<div style="padding: 6px 0; border-bottom: 1px solid #cbd5e1;">
                <strong>${u.nombre} ${u.apellidos}</strong> (${u.edad} años) - Condición: <em>${u.condicion}</em>
            </div>`
        ).join('');
        document.getElementById('admin-lista-usuarios').innerHTML = listaHtml;
    } else {
        document.getElementById('stat-edad-media').innerText = '--';
        document.getElementById('admin-lista-usuarios').innerHTML = '<p style="margin:0; color:#64748b;">Aún no hay vecinos registrados en este dispositivo.</p>';
    }
}

// ----------------------------------------------------------------------------
// UTILIDADES GENERALES
// ----------------------------------------------------------------------------
function mostrarError(elementId, texto) {
    const box = document.getElementById(elementId);
    box.innerText = texto;
    box.style.display = 'block';
}

function cerrarSesion() {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-error').style.display = 'none';
    irA('scr-inicio');
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}