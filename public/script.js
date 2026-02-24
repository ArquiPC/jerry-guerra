// 1. CONFIGURACIÓN CON NOMBRE ÚNICO
const supabaseUrl = 'https://lrjsideqdmiekflpught.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

// Usamos window.supabase para llamar a la librería y lo guardamos en clienteSupabase
const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. FUNCIÓN PARA BUSCAR EN CARPETAS
async function cargarTrabajos() {
    console.log("Iniciando búsqueda en carpetas...");
    const galeria = document.getElementById('galeria');
    const estado = document.getElementById('mensaje-estado');
    const carpetas = ['construccion', 'drywall', 'refrigeracion'];

    if (!galeria) return;

    try {
        galeria.innerHTML = ''; 
        let fotosEncontradas = 0;

        for (const carpeta of carpetas) {
            // Buscamos dentro de cada subcarpeta
            const { data, error } = await clienteSupabase.storage.from('jerry-guerra').list(carpeta);

            if (error) {
                console.error("Error en " + carpeta, error.message);
                continue;
            }

            // Filtramos archivos reales
            const fotos = data.filter(f => !f.name.startsWith('.'));
            fotosEncontradas += fotos.length;

            fotos.forEach(foto => {
                const { data: urlData } = clienteSupabase.storage.from('jerry-guerra').getPublicUrl(`${carpeta}/${foto.name}`);
                
                galeria.innerHTML += `
                    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        <img src="${urlData.publicUrl}" class="w-full h-56 object-cover">
                        <div class="p-4">
                            <span class="text-xs font-bold text-orange-500 uppercase">${carpeta}</span>
                            <p class="font-bold text-slate-800">${foto.name.split('.')[0]}</p>
                        </div>
                    </div>`;
            });
        }

        if (fotosEncontradas === 0) {
            if (estado) estado.innerText = "No se encontraron fotos en las subcarpetas.";
        } else {
            if (estado) estado.style.display = 'none';
        }

    } catch (err) {
        console.error("Error crítico:", err.message);
    }
}

// 3. WHATSAPP
function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584248437083"; 
    const texto = `Hola Jerry! Mi nombre es ${nombre}. Necesito: ${servicio}. Detalles: ${mensaje}`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
}

// 4. ARRANCAR
document.addEventListener('DOMContentLoaded', cargarTrabajos);