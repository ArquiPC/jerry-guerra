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
    // Aquí puedes meter la lógica para llenar la tabla de solicitudes
    // y el visor de fotos para borrar que vimos antes.
    console.log("Panel cargado con éxito");
}

async function subirFoto() {
    const fileInput = document.getElementById('archivo-foto');
    const cat = document.getElementById('subir-categoria').value;
    const file = fileInput.files[0];
    
    if (!file) return alert("Selecciona una foto");

    const btn = document.getElementById('btn-subir');
    btn.innerText = "Subiendo...";
    btn.disabled = true;

    const nombreLimpio = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const ruta = `${cat}/${nombreLimpio}`;

    const { error } = await jerry_db.storage.from('jerry-guerra').upload(ruta, file);

    if (error) {
        alert("Error: " + error.message);
        btn.innerText = "Subir a la Web";
        btn.disabled = false;
    } else {
        alert("¡Foto subida con éxito!");
        location.reload();
    }
}

// Hacer funciones globales para que el HTML las vea
window.verificarAcceso = verificarAcceso;
window.cerrarSesion = cerrarSesion;
window.subirFoto = subirFoto;

// Iniciar al cargar
window.onload = mostrarPanel;