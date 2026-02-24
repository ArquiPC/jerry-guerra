// 1. CONFIGURACIÓN (Cambiamos el nombre de la variable a 'supabaseClient' para evitar conflictos)
const supabaseUrl = 'https://lrjsideqdmiekflpught.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

// Usamos el objeto global de la librería cargada en el HTML
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. FUNCIÓN DE WHATSAPP (Disponible globalmente para el onclick)
function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584248437083"; 

    if (nombre.trim() === "") {
        alert("Por favor, ingresa tu nombre.");
        return;
    }

    const texto = `Hola Jerry! 👋%0A%0AMi nombre es *${nombre}*.%0A%0ANecesito una cotización para: *${servicio}*.%0A%0ADetalles: ${mensaje}`;
    const url = `https://wa.me/${telefono}?text=${texto}`;

    window.open(url, '_blank');
}

// 3. FUNCIÓN DE LA GALERÍA
async function cargarTrabajos() {
    const galeria = document.getElementById('galeria');
    const estado = document.getElementById('mensaje-estado');

    // Si no existen los elementos en el HTML, no intentamos cargar nada
    if (!galeria) return;

    try {
        const { data, error } = await supabase.storage.from('jerry-guerra').list();

        if (error) {
            if (estado) estado.innerText = "Error al cargar la galería.";
            return;
        }

        const fotos = data.filter(f => !f.name.startsWith('.'));

        if (fotos.length > 0) {
            if (estado) estado.style.display = 'none';
            galeria.innerHTML = '';
            
            fotos.forEach(foto => {
                const { data: urlData } = supabase.storage.from('jerry-guerra').getPublicUrl(foto.name);
                galeria.innerHTML += `
                    <div class="bg-white rounded-xl overflow-hidden shadow-md">
                        <img src="${urlData.publicUrl}" class="w-full h-56 object-cover" alt="${foto.name}">
                        <div class="p-4">
                            <p class="font-bold text-slate-800 capitalize">${foto.name.split('.')[0]}</p>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error("Error inesperado:", err);
    }
}

// 4. ESPERAR A QUE EL HTML ESTÉ LISTO PARA CARGAR LA GALERÍA
document.addEventListener('DOMContentLoaded', () => {
    cargarTrabajos();
});