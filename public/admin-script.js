// ==========================================
// 1. CONFIGURACIÓN
// ==========================================
const URL_SB = 'https://lrjsideqdmiekflpught.supabase.co';
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28'; 
const jerry_db = supabase.createClient(URL_SB, KEY_SB);

let rutaParaBorrar = ""; 
let timerInactividad;

// --- FUNCIÓN PARA EL OJITO (VISIBILIDAD) ---
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.add("text-orange-500");
    } else {
        input.type = "password";
        icon.classList.remove("text-orange-500");
    }
}

// ==========================================
// 2. ACCESO Y PANEL
// ==========================================

async function verificarAcceso() {
    // CORRECCIÓN AQUÍ: Leemos el valor del input de email del HTML
    const emailInput = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();

    if (!emailInput || !pass) return alert("Por favor, ingresa correo y clave.");

    // Intentamos iniciar sesión con los datos que escribiste
    const { data, error } = await jerry_db.auth.signInWithPassword({ 
        email: emailInput, 
        password: pass 
    });

    if (error) {
        alert("Acceso denegado: " + error.message);
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
        reiniciarContador();
    }
}

async function cerrarSesion() {
    await jerry_db.auth.signOut();
    location.reload();
}

// ==========================================
// 3. GESTIÓN DE FOTOS Y DATOS
// ==========================================

async function cargarDatos() {
    const tabla = document.getElementById('tabla-clientes');
    const { data: solicitudes } = await jerry_db.from('solicitudes_presupuesto').select('*').order('created_at', { ascending: false });

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
    } else { tabla.innerHTML = "<p class='p-4 text-gray-400'>No hay solicitudes.</p>"; }

    const visor = document.getElementById('visor-borrar');
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
                            <button onclick="borrarFoto('${cat}/${f.name}')" class="bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow">ELIMINAR</button>
                        </div>
                    </div>`;
            });
        }
    }
    visor.innerHTML = htmlF || "<p class='text-gray-400'>Vacío.</p>";
}

async function subirFoto() {
    const fileInput = document.getElementById('archivo-foto');
    const categoria = document.getElementById('subir-categoria').value;
    const btn = document.getElementById('btn-subir');

    if (fileInput.files.length === 0) return alert("Selecciona una foto primero.");

    const archivo = fileInput.files[0];
    const extension = archivo.name.split('.').pop();
    const nuevoNombre = `foto-${categoria}-${Date.now()}.${extension}`;
    const rutaDestino = `${categoria}/${nuevoNombre}`;

    btn.innerText = "Subiendo...";
    btn.disabled = true;

    const { error } = await jerry_db.storage.from('jerry-guerra').upload(rutaDestino, archivo);

    if (error) {
        alert("Error al subir: " + error.message);
    } else {
        alert("¡Listo Jerry! Foto guardada.");
        fileInput.value = "";
        cargarDatos();
    }
    btn.innerText = "Subir a la Web";
    btn.disabled = false;
}

// ==========================================
// 4. BORRADO CON CONTRASEÑA
// ==========================================

function borrarFoto(ruta) {
    if (!confirm("¿Seguro Jerry?")) return;
    rutaParaBorrar = ruta; 
    document.getElementById('modal-password').classList.remove('hidden');
    document.getElementById('pass-confirmar-borrado').focus();
}

function cerrarModalPass() {
    document.getElementById('modal-password').classList.add('hidden');
    document.getElementById('pass-confirmar-borrado').value = "";
}

document.getElementById('btn-confirmar-final').onclick = async () => {
    const clave = document.getElementById('pass-confirmar-borrado').value;
    const { data: { user } } = await jerry_db.auth.getUser();

    // Validamos con el usuario que está actualmente logueado
    const { error: authError } = await jerry_db.auth.signInWithPassword({
        email: user.email,
        password: clave
    });

    if (authError) return alert("Clave incorrecta.");

    cerrarModalPass();

    const { data, error } = await jerry_db.storage.from('jerry-guerra').remove([rutaParaBorrar]);

    if (error || (data && data.length === 0)) {
        alert("No se pudo borrar. Intenta de nuevo.");
    } else {
        alert("¡Eliminado correctamente!");
        cargarDatos();
    }
};

// ==========================================
// 5. SEGURIDAD INACTIVIDAD
// ==========================================

const reiniciarContador = () => {
    clearTimeout(timerInactividad);
    timerInactividad = setTimeout(async () => {
        const { data: { user } } = await jerry_db.auth.getUser();
        if (user) { await jerry_db.auth.signOut(); location.reload(); }
    }, 300000);
};

document.onmousemove = reiniciarContador;
document.onkeydown = reiniciarContador;

window.verificarAcceso = verificarAcceso;
window.cerrarSesion = cerrarSesion;
window.subirFoto = subirFoto;
window.borrarFoto = borrarFoto;
window.cerrarModalPass = cerrarModalPass;
window.togglePassword = togglePassword; // Exportamos la función del ojito
window.onload = mostrarPanel;