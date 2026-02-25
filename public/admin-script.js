// ==========================================
// 1. CONFIGURACIÓN INICIAL
// ==========================================
const URL_SB = 'https://lrjsideqdmiekflpught.supabase.co';
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28'; 
const jerry_db = supabase.createClient(URL_SB, KEY_SB);

let rutaParaBorrar = ""; // Aquí guardamos temporalmente qué foto borrar
let timerInactividad;

// ==========================================
// 2. SISTEMA DE LOGIN Y SESIÓN
// ==========================================

async function verificarAcceso() {
    const email = "jayber1990@gmail.com";
    const pass = document.getElementById('admin-pass').value;

    const { data, error } = await jerry_db.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    if (error) {
        alert("Error de acceso: " + error.message);
    } else {
        mostrarPanel();
    }
}

async function mostrarPanel() {
    const { data: { user } } = await jerry_db.auth.getUser();

    if (user) {
        document.getElementById('login-screen')?.classList.add('hidden');
        document.getElementById('admin-panel')?.classList.remove('hidden');
        cargarDatos();
        reiniciarContador(); // Activa el protector de 5 minutos
    }
}

async function cerrarSesion() {
    await jerry_db.auth.signOut();
    location.reload();
}

// ==========================================
// 3. CARGA DE DATOS (SOLICITUDES Y FOTOS)
// ==========================================

async function cargarDatos() {
    console.log("Cargando datos del panel...");

    // A. Cargar Solicitudes de la Tabla
    const tabla = document.getElementById('tabla-clientes');
    const { data: solicitudes } = await jerry_db
        .from('solicitudes_presupuesto') 
        .select('*')
        .order('created_at', { ascending: false });

    if (solicitudes && solicitudes.length > 0) {
        let htmlS = `<table class="w-full text-left text-sm"><thead class="bg-slate-50 border-b"><tr><th class="p-4">Fecha</th><th class="p-4">Cliente</th><th class="p-4">Servicio</th><th class="p-4">Mensaje</th></tr></thead><tbody>`;
        solicitudes.forEach(s => {
            htmlS += `<tr class="border-b hover:bg-slate-50">
                <td class="p-4">${new Date(s.created_at).toLocaleDateString()}</td>
                <td class="p-4"><b>${s.nombre}</b><br><a href="https://wa.me/${s.telefono}" target="_blank" class="text-green-600 font-bold">${s.telefono}</a></td>
                <td class="p-4">${s.servicio}</td>
                <td class="p-4 text-gray-500">${s.mensaje_adicional || ''}</td>
            </tr>`;
        });
        htmlS += `</tbody></table>`;
        tabla.innerHTML = htmlS;
    } else {
        tabla.innerHTML = "<p class='p-4 text-gray-400'>No hay solicitudes nuevas.</p>";
    }

    // B. Cargar Visor de Fotos del Storage
    const visor = document.getElementById('visor-borrar');
    visor.innerHTML = "<p class='text-sm text-blue-500'>Cargando fotos...</p>";
    
    const categorias = ['refrigeracion', 'drywall', 'construccion', 'impermeabilizacion'];
    let htmlF = '';

    for (const cat of categorias) {
        const { data: fotos } = await jerry_db.storage.from('jerry-guerra').list(cat);
        
        if (fotos) {
            fotos.filter(f => f.name !== '.emptyFolderPlaceholder').forEach(f => {
                const { data: url } = jerry_db.storage.from('jerry-guerra').getPublicUrl(`${cat}/${f.name}`);
                htmlF += `
                    <div class="relative group border rounded-lg overflow-hidden bg-gray-50">
                        <img src="${url.publicUrl}" class="w-full h-24 object-cover">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onclick="borrarFoto('${cat}/${f.name}')" class="bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow">
                                BORRAR
                            </button>
                        </div>
                        <p class="text-[8px] p-1 truncate text-gray-400">${f.name}</p>
                    </div>`;
            });
        }
    }
    visor.innerHTML = htmlF || "<p class='text-gray-400'>No hay fotos en la galería.</p>";
}

// ==========================================
// 4. LÓGICA DE BORRADO SEGURO (MODAL)
// ==========================================

async function borrarFoto(ruta) {
    // 1. Pregunta inicial
    if (!confirm("¿Jerry, estás seguro de borrar esta foto?")) return;

    // 2. Prepara el modal de contraseña
    rutaParaBorrar = ruta.trim(); 
    document.getElementById('pass-confirmar-borrado').value = "";
    document.getElementById('modal-password').classList.remove('hidden');
    document.getElementById('pass-confirmar-borrado').focus();
}

function cerrarModalPass() {
    document.getElementById('modal-password').classList.add('hidden');
    rutaParaBorrar = "";
}

// Acción del botón "Eliminar" dentro del modal
document.getElementById('btn-confirmar-final').onclick = async () => {
    const passConfirm = document.getElementById('pass-confirmar-borrado').value;
    if (!passConfirm) return alert("Introduce la contraseña");

    // Re-autenticar para validar la clave
    const { data: userData } = await jerry_db.auth.getUser();
    const { error: authError } = await jerry_db.auth.signInWithPassword({
        email: userData.user.email,
        password: passConfirm,
    });

    if (authError) {
        alert("Contraseña incorrecta. Acción cancelada.");
        return;
    }

    // Si la clave es correcta, cerramos modal y borramos
    cerrarModalPass(); 
    const { data, error } = await jerry_db.storage.from('jerry-guerra').remove([rutaParaBorrar]);
    
    if (error) {
        alert("Error técnico: " + error.message);
    } else if (data && data.length === 0) {
        alert("Error: No se encontró el archivo en: " + rutaParaBorrar);
    } else {
        alert("¡Foto eliminada con éxito!");
        cargarDatos();
    }
};

// ==========================================
// 5. SEGURIDAD: TEMPORIZADOR DE INACTIVIDAD
// ==========================================

const reiniciarContador = () => {
    clearTimeout(timerInactividad);
    timerInactividad = setTimeout(async () => {
        const { data: { user } } = await jerry_db.auth.getUser();
        if (user) {
            await jerry_db.auth.signOut();
            alert("Sesión cerrada por inactividad (5 min).");
            location.reload();
        }
    }, 300000); // 5 minutos
};

// Detectar movimiento o clics
document.onmousemove = reiniciarContador;
document.onkeydown = reiniciarContador;
document.onclick = reiniciarContador;

// Permitir dar "Enter" en el modal de clave
document.getElementById('pass-confirmar-borrado')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-confirmar-final').click();
});

// ==========================================
// 6. INICIALIZACIÓN GLOBAL
// ==========================================

window.verificarAcceso = verificarAcceso;
window.cerrarSesion = cerrarSesion;
window.borrarFoto = borrarFoto;
window.cerrarModalPass = cerrarModalPass;

// Al cargar la página, verificar si ya estaba logueado
window.onload = mostrarPanel;