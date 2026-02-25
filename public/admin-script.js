// Configuración de Supabase
const URL_SB = 'https://lrjsideqdmiekflpught.supabase.co';
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28'; 
const jerry_db = supabase.createClient(URL_SB, KEY_SB);

// --- LOGIN ---
async function verificarAcceso() {
    const email = "jayber1990@gmail.com"; // Puedes poner un input para el correo también
    const pass = document.getElementById('admin-pass').value;

    const { data, error } = await jerry_db.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    if (error) {
        alert("Error de acceso: " + error.message);
    } else {
        // Supabase guarda la sesión automáticamente en el navegador
        mostrarPanel();
    }
}

// Para verificar si está logueado al cargar la página
async function mostrarPanel() {
    const { data: { user } } = await jerry_db.auth.getUser();

    if (user) {
        document.getElementById('login-screen')?.classList.add('hidden');
        document.getElementById('admin-panel')?.classList.remove('hidden');
        cargarDatos();
    }
}

async function cerrarSesion() {
    const { error } = await jerry_db.auth.signOut(); // Esto cierra la sesión en el servidor
    if (error) alert("Error al salir: " + error.message);
    location.reload();
}

// --- GESTIÓN DE DATOS ---
async function cargarDatos() {
    console.log("Cargando datos del panel...");

    // --- A. CARGAR SOLICITUDES DE CLIENTES ---
    const tabla = document.getElementById('tabla-clientes');
    // Reemplaza 'solicitudes' por el nombre exacto de tu tabla de mensajes
    const { data: solicitudes, error: errS } = await jerry_db
        .from('solicitudes_presupuesto') 
        .select('*')
        .order('created_at', { ascending: false });

    if (solicitudes && solicitudes.length > 0) {
        let htmlS = `
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 border-b">
                    <tr>
                        <th class="p-4">Fecha</th>
                        <th class="p-4">Cliente</th>
                        <th class="p-4">Servicio</th>
                        <th class="p-4">Mensaje</th>
                    </tr>
                </thead>
                <tbody>`;
        solicitudes.forEach(s => {
            htmlS += `
                <tr class="border-b hover:bg-slate-50">
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

    // --- B. CARGAR VISOR DE FOTOS PARA BORRAR ---
    const visor = document.getElementById('visor-borrar');
    visor.innerHTML = "<p class='text-sm text-blue-500'>Cargando fotos...</p>";
    
    const categorias = ['refrigeracion', 'drywall', 'construccion', 'impermeabilizacion'];
    let htmlF = '';

    for (const cat of categorias) {
        const { data: fotos, error: errF } = await jerry_db.storage.from('jerry-guerra').list(cat);
        
        if (fotos) {
            fotos.filter(f => f.name !== '.emptyFolderPlaceholder').forEach(f => {
                const { data: url } = jerry_db.storage.from('jerry-guerra').getPublicUrl(`${cat}/${f.name}`);
                htmlF += `
                    <div class="relative group border rounded-lg overflow-hidden bg-gray-50">
                        <img src="${url.publicUrl}" class="w-full h-24 object-cover">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onclick="borrarFoto('${cat}/${f.name}')" class="bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-lg hover:bg-red-700">
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

let rutaParaBorrar = ""; // Variable temporal para guardar qué queremos borrar

async function borrarFoto(ruta) {
    // 1. Preguntar si está seguro (Confirmación simple)
    if (!confirm("¿Jerry, estás seguro de borrar esta foto?")) return;

    // 2. Guardar la ruta y mostrar el modal de contraseña
    rutaParaBorrar = ruta;
    document.getElementById('pass-confirmar-borrado').value = ""; // Limpiar campo
    document.getElementById('modal-password').classList.remove('hidden');
    document.getElementById('pass-confirmar-borrado').focus();
}

// ... (funciones anteriores como cargarDatos y borrarFoto)

function cerrarModalPass() {
    document.getElementById('modal-password').classList.add('hidden');
    rutaParaBorrar = "";
}

// ======================================================
// PEGA AQUÍ EL CÓDIGO DEL BOTÓN DE CONFIRMACIÓN
// ======================================================
document.getElementById('btn-confirmar-final').onclick = async () => {
    const passConfirm = document.getElementById('pass-confirmar-borrado').value;
    
    if (!passConfirm) return alert("Debes introducir la contraseña");

    // 1. Validar identidad del usuario actual
    const { data: userData } = await jerry_db.auth.getUser();
    
    // Intentamos re-autenticar para verificar la contraseña
    const { error: authError } = await jerry_db.auth.signInWithPassword({
        email: userData.user.email,
        password: passConfirm,
    });

    if (authError) {
        alert("Contraseña incorrecta. Acción cancelada.");
        return;
    }

    // 2. Proceder al borrado si la clave fue correcta
    cerrarModalPass(); 
    
    const { data, error } = await jerry_db.storage.from('jerry-guerra').remove([rutaParaBorrar]);
    
    if (error) {
        alert("Error técnico: " + error.message);
    } else if (data && data.length === 0) {
        alert("No se pudo encontrar el archivo en la ruta: " + rutaParaBorrar);
    } else {
        alert("¡Foto eliminada con éxito!");
        cargarDatos(); // Esto refresca la lista de fotos para que ya no aparezca la borrada
    }
};

// ... (después pegas el código de inactividad de 5 minutos)

    // Proceder al borrado
    cerrarModalPass(); // Ocultar modal mientras borra
    const { error } = await jerry_db.storage.from('jerry-guerra').remove([rutaParaBorrar]);
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Foto eliminada con éxito.");
        cargarDatos();
    }
};

// Hacer que funcione al presionar "Enter" en el input
document.getElementById('pass-confirmar-borrado').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-confirmar-final').click();
});

// Asegurar funciones globales
window.borrarFoto = borrarFoto;
window.cerrarModalPass = cerrarModalPass;
// Asegúrate de que borrarFoto sea global
window.borrarFoto = borrarFoto;