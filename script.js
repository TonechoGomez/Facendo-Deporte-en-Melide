const STORAGE_KEY_USERS = 'melide_deporte_usuarios_v1';
const STORAGE_KEY_SESSION = 'melide_deporte_sesion_activa';
let sesionGeneradaActual = null;
let cacheTodasLasSesionesAdmin = [];

function generarRutinaDinamica(instalacion, material, tiempo, objetivo, usuario) {
    const mins = parseInt(tiempo, 10) || 45;
    const edad = usuario.edad || 40;
    const esAdaptado = edad >= 65 || usuario.habitos === 'Persona Mayor' || usuario.condicion === 'Mala' || usuario.condicion === 'Muy mala';
    const dosificacion = esAdaptado ? '2 series de 8-10 reps (ritmo pausado, descanso 60s)' : '3 series de 12 reps (ritmo controlado, descanso 45s)';

    const soporteEntorno = {
        'Gimnasio municipal': { apoyo: 'máquina guiada o banco', resistencia: 'carga ligera regulable', entorno: 'sala' },
        'Exterior': { apoyo: 'banco urbano o barandilla', resistencia: 'peso corporal e inclinación', entorno: 'parque' },
        'Ruta': { apoyo: 'banco del camino o tronco firme', resistencia: 'desnivel y empuje', entorno: 'sendero' },
        'En Casa': { apoyo: 'silla firme o pared', resistencia: material === 'Sin material' ? 'peso corporal' : material.toLowerCase(), entorno: 'hogar' }
    }[instalacion];

    const motoresCalentamiento = [
        { zona: 'Cervical y escapular', accion: 'Rotaciones circulares lentas en ambos sentidos (8 reps por lado)', foco: 'movilidad cuello y hombros' },
        { zona: 'Cadera y cintura pélvica', accion: 'Círculos amplios con manos en cintura para lubricar articulación (10 reps)', foco: 'movilidad de cadera calentamiento' },
        { zona: 'Activación cardiorrespiratoria', accion: `Desplazamiento suave en ${soporteEntorno.entorno} elevando rodillas alternas durante 3 min`, foco: 'marcha calentamiento articular' }
    ];

    const calentamiento = motoresCalentamiento.map((m, idx) => ({
        titulo: `🔄 ${idx + 1}. Movilidad: ${m.zona}`,
        resumen: m.accion,
        detalle: `Mantén la espalda erguida y respira de forma fluida. Ejecuta: ${m.accion}. Evita movimientos bruscos o rebotes.`,
        query: m.foco
    }));

    const patronesMotores = [
        { patron: 'Dominante de rodilla (Sentadilla)', ejecucion: `Flexión controlada de piernas utilizando ${soporteEntorno.apoyo} como referencia de seguridad`, busqueda: 'sentadilla tecnica correcta' },
        { patron: 'Tracción horizontal (Remo)', ejecucion: `Tracción de brazos llevando codos atrás con ${soporteEntorno.resistencia}`, busqueda: 'remo espalda tecnica' },
        { patron: 'Empuje horizontal (Flexión)', ejecucion: `Empuje controlado de torso apoyando manos en ${soporteEntorno.apoyo}`, busqueda: 'flexiones inclinadas tecnica' },
        { patron: 'Unilateral de tren inferior (Zancada/Paso)', ejecucion: `Paso alterno controlado manteniendo estabilidad con ${soporteEntorno.apoyo}`, busqueda: 'zancadas tecnica correcta' },
        { patron: objetivo === 'Cardio y Resistencia' ? 'Bloque aeróbico continuo' : 'Empuje vertical / Elevación', ejecucion: objetivo === 'Cardio y Resistencia' ? `Ritmo vivo sostenido de marcha o desplazamiento en ${soporteEntorno.entorno} (4 min)` : `Elevación controlada de brazos sobre hombros usando ${soporteEntorno.resistencia}`, busqueda: objetivo === 'Cardio y Resistencia' ? 'caminata aerobica tecnica' : 'press hombros tecnica' },
        { patron: 'Estabilidad central (Core)', ejecucion: `Activación profunda de abdomen y glúteos manteniendo postura alineada en ${soporteEntorno.apoyo} (25-30 seg)`, busqueda: 'plancha abdominal tecnica' }
    ];

    const principal = patronesMotores.map((p, idx) => ({
        titulo: `💪 ${idx + 1}. ${p.patron}`,
        resumen: `${p.ejecucion}.`,
        detalle: `Configuración personalizada (${objetivo}): ${p.ejecucion}. Dosificación recomendada: ${dosificacion}. Mantén el abdomen activo en todo momento.`,
        query: p.busqueda
    }));

    const motoresCalma = [
        { titulo: '🌬️ 1. Regulación respiratoria diafragmática', resumen: 'Inhalación nasal profunda (4s) y exhalación lenta (6s).', detalle: 'Coloca una mano en el abdomen, toma aire despacio por la nariz notando cómo sube y suéltalo muy lento por la boca. Repite 6 ciclos.', query: 'respiracion diafragmatica relajacion' },
        { titulo: '🧘 2. Estiramiento global de descarga', resumen: `Alargamiento suave de piernas y espalda apoyado en ${soporteEntorno.apoyo}.`, detalle: `Utiliza ${soporteEntorno.apoyo} para mantener el equilibrio mientras estiras cuádriceps, gemelos y columna durante 20 segundos por lado sin rebotes.`, query: 'estiramientos suaves post entrenamiento' }
    ];

    return {
        tiempoCalentamiento: '8 min',
        tiempoPrincipal: (mins - 15) + ' min',
        tiempoCalma: '7 min',
        calentamiento,
        principal,
        calma: motoresCalma
    };
}

function renderEjercicioInteractivo(titulo, resumen, explicacionDetallada, queryBusqueda) {
    const idUnico = 'ex_' + Math.random().toString(36).substring(2, 9);
    const urlVideo = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryBusqueda)}`;

    return `
        <div class="interactive-exercise-card" onclick="toggleDetalleEjercicio('${idUnico}')">
            <div class="ex-title-row">
                <span>${titulo}</span>
                <span class="ex-hint">🔍 Ver detalle</span>
            </div>
            <p class="ex-brief">${resumen}</p>
        </div>
        <div id="${idUnico}" class="exercise-detail-panel">
            <h5>📖 Guía de ejecución paso a paso:</h5>
            <p>${explicacionDetallada}</p>
            <a href="${urlVideo}" target="_blank" rel="noopener noreferrer" class="video-btn" onclick="event.stopPropagation();">
                🎥 Buscar vídeo demostrativo
            </a>
        </div>
    `;
}

function toggleDetalleEjercicio(id) {
    const panel = document.getElementById(id);
    if (panel) {
        panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
    }
}

function obtenerUsuarios() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_USERS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function guardarUsuarios(lista) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(lista));
}

function obtenerUsuarioActivo() {
    const dniActivo = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!dniActivo) return null;
    return obtenerUsuarios().find(u => u.dni === dniActivo) || null;
}

function irA(idPantalla) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(idPantalla).classList.add('active');

    const header = document.getElementById('main-header');
    const btnAtras = document.getElementById('btn-atras');

    if (idPantalla === 'scr-inicio') {
        header.style.display = 'none';
    } else {
        header.style.display = 'flex';
        if (idPantalla === 'scr-registro') {
            btnAtras.style.display = 'block';
            btnAtras.style.visibility = 'visible';
        } else {
            btnAtras.style.display = 'none';
        }
    }
}

function abrirRegistro() {
    const form = document.getElementById('form-registro');
    if (form) form.reset();
    const errorBox = document.getElementById('reg-error');
    if (errorBox) errorBox.style.display = 'none';
    irA('scr-registro');
}

function cambiarPestanaUsuario(pestana) {
    const subActividad = document.getElementById('subvista-actividad');
    const subHistorial = document.getElementById('subvista-historial');
    const subPerfil = document.getElementById('subvista-perfil');
    
    const btnActividad = document.getElementById('tab-btn-actividad');
    const btnHistorial = document.getElementById('tab-btn-historial');
    const btnPerfil = document.getElementById('tab-btn-perfil');

    subActividad.style.display = 'none';
    subHistorial.style.display = 'none';
    subPerfil.style.display = 'none';
    btnActividad.classList.remove('active');
    btnHistorial.classList.remove('active');
    btnPerfil.classList.remove('active');

    if (pestana === 'actividad') {
        subActividad.style.display = 'block';
        btnActividad.classList.add('active');
    } else if (pestana === 'historial') {
        subHistorial.style.display = 'block';
        btnHistorial.classList.add('active');
        cargarHistorialSesiones();
    } else {
        subPerfil.style.display = 'block';
        btnPerfil.classList.add('active');
        cargarDatosEnFormularioEdicion();
    }
}

function handleRegistro(e) {
    e.preventDefault();
    const errorBox = document.getElementById('reg-error');
    errorBox.style.display = 'none';

    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const emailConfirm = document.getElementById('reg-email-confirm').value.trim().toLowerCase();
    const pass = document.getElementById('reg-password').value;
    const passConfirm = document.getElementById('reg-password-confirm').value;
    const dni = document.getElementById('reg-dni').value.trim().toUpperCase();

    if (email !== emailConfirm) { mostrarError('reg-error', '⚠️ Los correos no coinciden.'); return; }
    if (pass !== passConfirm) { mostrarError('reg-error', '⚠️ Las contraseñas no coinciden.'); return; }

    const usuarios = obtenerUsuarios();
    if (usuarios.some(u => u.dni === dni)) { mostrarError('reg-error', '⚠️ Ya existe un usuario con ese DNI.'); return; }

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
        preferenciasSesion: { instalacion: 'Gimnasio municipal', material: 'Sin material', tiempo: '45 minutos', objetivo: 'Movilidad y Salud' },
        historialSesiones: []
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    localStorage.setItem(STORAGE_KEY_SESSION, nuevoUsuario.dni);
    iniciarZonaUsuario(nuevoUsuario);
}

function handleLogin(e) {
    e.preventDefault();
    const errorBox = document.getElementById('login-error');
    errorBox.style.display = 'none';

    const userInput = document.getElementById('login-user').value.trim();
    const passInput = document.getElementById('login-pass').value.trim();

    if (userInput.toLowerCase() === 'tonecho' && passInput === '0010') {
        cargarPanelAdministracion();
        irA('scr-admin');
        return;
    }

    const usuarios = obtenerUsuarios();
    const encontrado = usuarios.find(u => 
        (u.email && u.email.toLowerCase() === userInput.toLowerCase() || 
         u.dni && u.dni.toUpperCase() === userInput.toUpperCase() ||
         u.mote && u.mote.toLowerCase() === userInput.toLowerCase()) && 
        u.password === passInput
    );

    if (!encontrado) {
        mostrarError('login-error', '⚠️ Usuario o contraseña incorrectos.');
        return;
    }

    localStorage.setItem(STORAGE_KEY_SESSION, encontrado.dni);
    iniciarZonaUsuario(encontrado);
}

function iniciarZonaUsuario(usuario) {
    document.getElementById('saludo-principal').innerText = `¡Hola, ${usuario.mote || usuario.nombre}!`;
    document.getElementById('resultado-sesion-container').style.display = 'none';
    sesionGeneradaActual = null;
    
    const prefs = usuario.preferenciasSesion || {
        instalacion: 'Gimnasio municipal',
        material: 'Sin material',
        tiempo: '45 minutos',
        objetivo: 'Movilidad y Salud'
    };

    document.getElementById('pref-instalacion').value = prefs.instalacion;
    document.getElementById('pref-material').value = prefs.material;
    document.getElementById('pref-tiempo').value = prefs.tiempo;
    document.getElementById('pref-objetivo').value = prefs.objetivo;

    cambiarPestanaUsuario('actividad');
    irA('scr-dash');
}

function generarSesionEntrenamiento(e) {
    e.preventDefault();
    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;

    const instalacion = document.getElementById('pref-instalacion').value;
    const material = document.getElementById('pref-material').value;
    const tiempo = document.getElementById('pref-tiempo').value;
    const objetivo = document.getElementById('pref-objetivo').value;

    usuario.preferenciasSesion = { instalacion, material, tiempo, objetivo };
    actualizarUsuarioEnStorage(usuario);

    const rutina = generarRutinaDinamica(instalacion, material, tiempo, objetivo, usuario);
    sesionGeneradaActual = {
        id: 'ses_' + Date.now(),
        fecha: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
        timestamp: Date.now(),
        usuarioDni: usuario.dni,
        usuarioNombre: `${usuario.nombre} ${usuario.apellidos} (${usuario.mote})`,
        instalacion,
        material,
        tiempo,
        objetivo,
        ...rutina
    };

    const contenedor = document.getElementById('resultado-sesion-container');
    contenedor.innerHTML = `
        <div class="routine-card">
            <div class="routine-header">
                <strong>📍 Lugar:</strong> ${instalacion}<br>
                <strong>🛠️ Material:</strong> ${material}<br>
                <strong>⏱️ Duración:</strong> ${tiempo} &nbsp;|&nbsp; <strong>🎯 Objetivo:</strong> ${objetivo}
            </div>

            <div class="routine-block">
                <h4>🔥 1. Calentamiento (${rutina.tiempoCalentamiento})</h4>
                <div>${rutina.calentamiento.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
            </div>

            <div class="routine-block">
                <h4>💪 2. Parte Principal (${rutina.tiempoPrincipal})</h4>
                <div>${rutina.principal.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
            </div>

            <div class="routine-block">
                <h4>🧘 3. Vuelta a la Calma (${rutina.tiempoCalma})</h4>
                <div>${rutina.calma.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
            </div>

            <button type="button" class="btn-main btn-gold" style="margin-top: 14px;" onclick="guardarSesionEnHistorial()">
                💾 GUARDAR ESTA SESIÓN EN MI HISTORIAL
            </button>
        </div>
    `;
    contenedor.style.display = 'block';
    contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function guardarSesionEnHistorial() {
    const usuario = obtenerUsuarioActivo();
    if (!usuario || !sesionGeneradaActual) return;

    if (!usuario.historialSesiones) usuario.historialSesiones = [];
    usuario.historialSesiones.unshift(sesionGeneradaActual);
    actualizarUsuarioEnStorage(usuario);

    const msg = document.getElementById('actividad-msg');
    msg.innerText = '✅ ¡Sesión guardada en tu pestaña "Sesiones"!';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3500);
}

function cargarHistorialSesiones() {
    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;

    const contenedor = document.getElementById('lista-sesiones-hechas');
    const historial = usuario.historialSesiones || [];

    if (historial.length === 0) {
        contenedor.innerHTML = '<p style="margin:0; color:var(--text-muted);">Aún no has guardado ninguna sesión. Genera una en la pestaña "Actividad" y guárdala aquí.</p>';
        return;
    }

    contenedor.innerHTML = historial.map((s, index) => {
        const bodyId = 'hist_body_' + index;
        return `
            <div class="history-item-card">
                <div class="history-top-bar">
                    <div>
                        <div class="history-title">📅 ${s.fecha} — ${s.instalacion}</div>
                        <div class="history-meta">⏱️ ${s.tiempo} &nbsp;|&nbsp; 🎯 ${s.objetivo} &nbsp;|&nbsp; 🛠️ ${s.material}</div>
                    </div>
                </div>
                <div class="history-actions">
                    <button type="button" class="btn-small btn-open-session" onclick="toggleSesionHistorial('${bodyId}', this)">
                        📂 Abrir sesión
                    </button>
                    <button type="button" class="btn-small btn-delete-session" onclick="eliminarSesionHistorial(${index})">
                        🗑️ Eliminar
                    </button>
                </div>
                <div id="${bodyId}" class="history-expanded-body">
                    ${s.calentamiento ? `
                        <p style="margin: 0 0 6px 0; color: var(--navy-primary); font-weight: 800;">🔥 Calentamiento (${s.tiempoCalentamiento || '8 min'}):</p>
                        <div style="margin-bottom: 12px;">${s.calentamiento.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
                        <p style="margin: 0 0 6px 0; color: var(--navy-primary); font-weight: 800;">💪 Parte Principal (${s.tiempoPrincipal || '30 min'}):</p>
                        <div style="margin-bottom: 12px;">${s.principal.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
                        <p style="margin: 0 0 6px 0; color: var(--navy-primary); font-weight: 800;">🧘 Vuelta a la Calma (${s.tiempoCalma || '7 min'}):</p>
                        <div>${s.calma.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
                    ` : '<p>Detalles no disponibles.</p>'}
                </div>
            </div>
        `;
    }).join('');
}

function toggleSesionHistorial(bodyId, btn) {
    const body = document.getElementById(bodyId);
    if (!body) return;
    const isOpen = body.style.display === 'block';
    body.style.display = isOpen ? 'none' : 'block';
    btn.innerHTML = isOpen ? '📂 Abrir sesión' : '🔼 Cerrar sesión';
}

function eliminarSesionHistorial(index) {
    const usuario = obtenerUsuarioActivo();
    if (!usuario || !usuario.historialSesiones) return;

    usuario.historialSesiones.splice(index, 1);
    actualizarUsuarioEnStorage(usuario);
    cargarHistorialSesiones();
}

// --- LÓGICA DEL PANEL DE ADMINISTRACIÓN (Tonecho / 0010) ---
function toggleAdminDrawer(drawerId) {
    const body = document.getElementById(drawerId);
    const icon = document.getElementById('icon-' + drawerId);
    if (!body) return;
    const isOpen = body.style.display === 'block';
    body.style.display = isOpen ? 'none' : 'block';
    if (icon) icon.innerText = isOpen ? '▼' : '▲';
}

function cargarPanelAdministracion() {
    const usuarios = obtenerUsuarios();
    
    // 1. CAJÓN DE USUARIOS (Ordenados alfabéticamente)
    usuarios.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    const contenedorUsuarios = document.getElementById('admin-lista-usuarios-completa');
    
    if (usuarios.length === 0) {
        contenedorUsuarios.innerHTML = '<p style="color:var(--text-muted);">No hay vecinos registrados todavía.</p>';
    } else {
        contenedorUsuarios.innerHTML = usuarios.map(u => {
            const sesionesCount = (u.historialSesiones || []).length;
            return `
                <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <strong style="color: var(--navy-primary); font-size: 0.95rem;">${u.nombre} ${u.apellidos}</strong> (${u.mote || 'Sin alias'})<br>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">DNI: ${u.dni} | Edad: ${u.edad} años | Tel: ${u.telefono}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">${sesionesCount} sesiones</span>
                        ${sesionesCount > 0 ? `<button class="btn-small btn-open-session" onclick="verSesionesDeUsuario('${u.dni}')">Ver sesiones</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. CAJÓN DE TODAS LAS SESIONES (Globales de todos los usuarios)
    const contenedorSesiones = document.getElementById('admin-lista-todas-sesiones');
    cacheTodasLasSesionesAdmin = [];
    usuarios.forEach(u => {
        if (u.historialSesiones) {
            u.historialSesiones.forEach(s => {
                cacheTodasLasSesionesAdmin.push({ ...s, propietario: `${u.nombre} ${u.apellidos} (${u.mote})` });
            });
        }
    });

    cacheTodasLasSesionesAdmin.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (cacheTodasLasSesionesAdmin.length === 0) {
        contenedorSesiones.innerHTML = '<p style="color:var(--text-muted);">No se ha generado ninguna sesión en la aplicación todavía.</p>';
    } else {
        contenedorSesiones.innerHTML = cacheTodasLasSesionesAdmin.map((s, idx) => `
            <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <strong style="color: var(--navy-primary); font-size: 0.9rem;">${s.propietario}</strong><br>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">📅 ${s.fecha} | 📍 ${s.instalacion} (${s.tiempo})</span>
                </div>
                <button class="btn-small btn-open-session" onclick="abrirModalSesionGlobal(${idx})">Ver rutina completa</button>
            </div>
        `).join('');
    }

    // 3. CAJÓN DE ESTADÍSTICAS, GRÁFICAS Y USOS
    const contenedorStats = document.getElementById('admin-estadisticas-contenido');
    const totalUsuarios = usuarios.length;
    const totalSesiones = cacheTodasLasSesionesAdmin.length;
    const edadSuma = usuarios.reduce((acc, u) => acc + (u.edad || 0), 0);
    const edadMedia = totalUsuarios > 0 ? Math.round(edadSuma / totalUsuarios) : 0;

    const ahora = Date.now();
    const unDia = 24 * 60 * 60 * 1000;
    const unaSemana = 7 * unDia;
    const unMes = 30 * unDia;

    const sesionesHoy = cacheTodasLasSesionesAdmin.filter(s => {
        const ts = s.timestamp || ahora;
        return (ahora - ts) < unDia;
    }).length;

    const sesionesSemana = cacheTodasLasSesionesAdmin.filter(s => {
        const ts = s.timestamp || ahora;
        return (ahora - ts) < unaSemana;
    }).length;

    const sesionesMes = cacheTodasLasSesionesAdmin.filter(s => {
        const ts = s.timestamp || ahora;
        return (ahora - ts) < unMes;
    }).length;

    const maxRef = Math.max(totalSesiones, 1);
    const pctHoy = Math.min(Math.round((sesionesHoy / maxRef) * 100), 100);
    const pctSemana = Math.min(Math.round((sesionesSemana / maxRef) * 100), 100);
    const pctMes = Math.min(Math.round((sesionesMes / maxRef) * 100), 100);

    // Cálculos para Gráfica por Instalación
    let instGimnasio = 0, instExterior = 0, instRuta = 0, instCasa = 0;
    cacheTodasLasSesionesAdmin.forEach(s => {
        if (s.instalacion === 'Gimnasio municipal') instGimnasio++;
        else if (s.instalacion === 'Exterior') instExterior++;
        else if (s.instalacion === 'Ruta') instRuta++;
        else if (s.instalacion === 'En Casa') instCasa++;
    });
    const maxInst = Math.max(totalSesiones, 1);
    const pctGimnasio = Math.round((instGimnasio / maxInst) * 100);
    const pctExterior = Math.round((instExterior / maxInst) * 100);
    const pctRuta = Math.round((instRuta / maxInst) * 100);
    const pctCasa = Math.round((instCasa / maxInst) * 100);

    // Cálculos para Gráfica por Edad de Usuarios
    let edadJoven = 0, edadAdulto = 0, edadSenior = 0, edadMayor = 0;
    usuarios.forEach(u => {
        const e = u.edad || 0;
        if (e < 30) edadJoven++;
        else if (e <= 50) edadAdulto++;
        else if (e <= 65) edadSenior++;
        else edadMayor++;
    });
    const maxUser = Math.max(totalUsuarios, 1);
    const pctJoven = Math.round((edadJoven / maxUser) * 100);
    const pctAdulto = Math.round((edadAdulto / maxUser) * 100);
    const pctSenior = Math.round((edadSenior / maxUser) * 100);
    const pctMayor = Math.round((edadMayor / maxUser) * 100);

    contenedorStats.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 16px;">
            <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); text-align: center;">
                <span style="font-size: 1.5rem; font-weight: 800; color: var(--navy-primary); display: block;">${totalUsuarios}</span>
                <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted);">USUARIOS TOTALES</span>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); text-align: center;">
                <span style="font-size: 1.5rem; font-weight: 800; color: var(--navy-primary); display: block;">${totalSesiones}</span>
                <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted);">SESIONES CREADAS</span>
            </div>
            <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); text-align: center;">
                <span style="font-size: 1.5rem; font-weight: 800; color: var(--navy-primary); display: block;">${edadMedia} años</span>
                <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted);">EDAD MEDIA VECINAL</span>
            </div>
        </div>

        <!-- GRÁFICA TEMPORAL -->
        <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 16px;">
            <h5 style="margin: 0 0 14px 0; color: var(--navy-primary);">📈 Gráficas de Usos Temporales</h5>
            
            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>Últimas 24 horas (Día)</span><span>${sesionesHoy} sesiones</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctHoy}%;"></div></div>
            </div>

            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>Últimos 7 días (Semana)</span><span>${sesionesSemana} sesiones</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctSemana}%;"></div></div>
            </div>

            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>Últimos 30 días (Mes)</span><span>${sesionesMes} sesiones</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctMes}%;"></div></div>
            </div>

            <div class="stat-bar-container" style="margin-bottom: 0;">
                <div class="stat-bar-label"><span>Histórico completo (Años)</span><span>${totalSesiones} sesiones</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: 100%; background: var(--navy-primary);"></div></div>
            </div>
        </div>

        <!-- GRÁFICA POR INSTALACIÓN -->
        <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 16px;">
            <h5 style="margin: 0 0 14px 0; color: var(--navy-primary);">📍 Uso por Tipo de Instalación</h5>
            
            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>Gimnasio municipal</span><span>${instGimnasio} sesiones</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctGimnasio}%; background: #0369a1;"></div></div>
            </div>

            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>Exterior (Parques / Calle)</span><span>${instExterior} sesiones</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctExterior}%; background: #0d9488;"></div></div>
            </div>

            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>Ruta (Caminos / Senderos)</span><span>${instRuta} sesiones</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctRuta}%; background: #16a34a;"></div></div>
            </div>

            <div class="stat-bar-container" style="margin-bottom: 0;">
                <div class="stat-bar-label"><span>En Casa</span><span>${instCasa} sesiones</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctCasa}%; background: #ca8a04;"></div></div>
            </div>
        </div>

        <!-- GRÁFICA POR EDAD DE USUARIOS -->
        <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <h5 style="margin: 0 0 14px 0; color: var(--navy-primary);">👥 Distribución de Usuarios por Edad</h5>
            
            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>Menores de 30 años</span><span>${edadJoven} usuarios</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctJoven}%; background: #6366f1;"></div></div>
            </div>

            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>De 30 a 50 años</span><span>${edadAdulto} usuarios</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctAdulto}%; background: #3b82f6;"></div></div>
            </div>

            <div class="stat-bar-container">
                <div class="stat-bar-label"><span>De 51 a 65 años</span><span>${edadSenior} usuarios</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctSenior}%; background: #0284c7;"></div></div>
            </div>

            <div class="stat-bar-container" style="margin-bottom: 0;">
                <div class="stat-bar-label"><span>Mayores de 65 años</span><span>${edadMayor} usuarios</span></div>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${pctMayor}%; background: #d97706;"></div></div>
            </div>
        </div>
    `;
}

function verSesionesDeUsuario(dni) {
    const usuarios = obtenerUsuarios();
    const u = usuarios.find(x => x.dni === dni);
    if (!u || !u.historialSesiones) return;

    let html = `<h4 style="color:var(--navy-primary); margin-top:0;">Sesiones de ${u.nombre} ${u.apellidos} (${u.mote})</h4>`;
    u.historialSesiones.forEach((s, idx) => {
        html += `
            <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:8px; padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <span>📅 ${s.fecha} — 📍 ${s.instalacion} (${s.tiempo})</span>
                <button class="btn-small btn-open-session" onclick="abrirModalSesionUsuario('${u.dni}', ${idx})">Ver</button>
            </div>
        `;
    });

    document.getElementById('admin-modal-body').innerHTML = html;
    document.getElementById('admin-modal-sesion').style.display = 'flex';
}

function abrirModalSesionGlobal(idx) {
    const s = cacheTodasLasSesionesAdmin[idx];
    if (s) mostrarDetalleSesionEnModal(s);
}

function abrirModalSesionUsuario(dni, idx) {
    const u = obtenerUsuarios().find(x => x.dni === dni);
    if (u && u.historialSesiones && u.historialSesiones[idx]) {
        mostrarDetalleSesionEnModal(u.historialSesiones[idx]);
    }
}

function mostrarDetalleSesionEnModal(s) {
    let html = `
        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">
            <strong>Propietario:</strong> ${s.usuarioNombre || 'Usuario municipal'}<br>
            <strong>Fecha:</strong> ${s.fecha} | <strong>Lugar:</strong> ${s.instalacion} | <strong>Duración:</strong> ${s.tiempo} | <strong>Objetivo:</strong> ${s.objetivo}
        </div>
    `;

    if (s.calentamiento) {
        html += `
            <p style="margin: 0 0 4px 0; color: var(--navy-primary); font-weight: 800;">🔥 Calentamiento (${s.tiempoCalentamiento}):</p>
            <div style="margin-bottom: 10px;">${s.calentamiento.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
            <p style="margin: 0 0 4px 0; color: var(--navy-primary); font-weight: 800;">💪 Parte Principal (${s.tiempoPrincipal}):</p>
            <div style="margin-bottom: 10px;">${s.principal.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
            <p style="margin: 0 0 4px 0; color: var(--navy-primary); font-weight: 800;">🧘 Vuelta a la Calma (${s.tiempoCalma}):</p>
            <div>${s.calma.map(i => renderEjercicioInteractivo(i.titulo, i.resumen, i.detalle, i.query)).join('')}</div>
        `;
    } else {
        html += `<p>Información detallada no disponible.</p>`;
    }

    document.getElementById('admin-modal-body').innerHTML = html;
    document.getElementById('admin-modal-sesion').style.display = 'flex';
}

function cerrarModalAdmin() {
    document.getElementById('admin-modal-sesion').style.display = 'none';
}

function cargarDatosEnFormularioEdicion() {
    const usuario = obtenerUsuarioActivo();
    if (!usuario) return;
    document.getElementById('edit-nombre').value = usuario.nombre || '';
    document.getElementById('edit-apellidos').value = usuario.apellidos || '';
    document.getElementById('edit-mote').value = usuario.mote || '';
    document.getElementById('edit-dni').value = usuario.dni || '';
    document.getElementById('edit-tf').value = usuario.telefono || '';
    document.getElementById('edit-edad').value = usuario.edad || '';
    document.getElementById('edit-direccion').value = usuario.direccion || '';
    document.getElementById('edit-peso').value = usuario.peso || '';
    document.getElementById('edit-estatura').value = usuario.estatura || '';
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
    usuario.gustos = document.getElementById('edit-gustos').value.trim();

    actualizarUsuarioEnStorage(usuario);
    document.getElementById('saludo-principal').innerText = `¡Hola, ${usuario.mote || usuario.nombre}!`;

    const msg = document.getElementById('perfil-msg');
    msg.innerText = '✅ Ficha actualizada correctamente.';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
}

function actualizarUsuarioEnStorage(usuarioActualizado) {
    const usuarios = obtenerUsuarios();
    const idx = usuarios.findIndex(u => u.dni === usuarioActualizado.dni);
    if (idx !== -1) {
        usuarios[idx] = usuarioActualizado;
        guardarUsuarios(usuarios);
    }
}

function mostrarError(id, texto) {
    const box = document.getElementById(id);
    box.innerText = texto;
    box.style.display = 'block';
}

function cerrarSesion() {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    irA('scr-inicio');
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}
