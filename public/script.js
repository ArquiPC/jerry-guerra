// 1. CONFIGURACIÓN (Usamos un nombre único: dbJerry)
const supabaseUrl = 'https://lrjsideqdmiekflpught.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

// Inicializamos el cliente usando la librería global
const dbJerry = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. FUNCIÓN DE LA GALERÍA
async function cargarTrabajos() {
    const galeria = document.getElementById('galeria');
    const estado = document.getElementById('mensaje-estado');

    if (!galeria) return;

    try {
        // Usamos dbJerry aquí
        const { data, error } = await dbJerry.storage.from('jerry-guerra').list();

        if (error) throw error;

        const fotos = data.filter(f => !f.name.startsWith('.'));

        if (fotos.length > 0) {
            if (estado) estado.style.display = 'none';
            galeria.innerHTML = '';
            
            fotos.forEach(foto => {
                const { data: urlData } = dbJerry.storage.from('jerry-guerra').getPublicUrl(foto.name);
                galeria.innerHTML += `
                    <div class="bg-white rounded-xl overflow-hidden shadow-md">
                        <img src="${urlData.publicUrl}" class="w-full h-56 object-cover">
                        <div class="p-4">
                            <p class="font-bold text-slate-800 capitalize">${foto.name.split('.')[0]}</p>
                        </div>
                    </div>`;
            });
        }
    } catch (err) {
        console.error("Error en galería:", err);
    }
}

// 3. FUNCIÓN WHATSAPP
function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584248437083"; 

    if (nombre.trim() === "") {
        alert("Por favor, ingresa tu nombre.");
        return;
    }

    const texto = `Hola Jerry! 👋%0AMi nombre es *${nombre}*.%0ANecesito: *${servicio}*.%0ADetalles: ${mensaje}`;
    window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank');
}

// 4. EJECUTAR AL CARGAR
document.addEventListener('DOMContentLoaded', cargarTrabajos);