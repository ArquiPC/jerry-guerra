// 1. CONFIGURACIÓN
const supabaseUrl = 'https://lrjsideqdmiekflpught.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

// Usamos window.supabase para asegurar que usemos la librería externa
const dbJerry = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarTrabajos() {
    const galeria = document.getElementById('galeria');
    const estado = document.getElementById('mensaje-estado');
    
    // Lista de tus carpetas en Supabase
    const carpetas = ['construccion', 'drywall', 'refrigeracion'];

    try {
        if (estado) estado.style.display = 'block';
        galeria.innerHTML = ''; 

        for (const carpeta of carpetas) {
            // Entramos a cada carpeta específica
            const { data, error } = await dbJerry.storage.from('jerry-guerra').list(carpeta);

            if (error) {
                console.error(`Error en carpeta ${carpeta}:`, error.message);
                continue;
            }

            const fotos = data.filter(f => !f.name.startsWith('.'));

            fotos.forEach(foto => {
                // Importante: La ruta ahora incluye el nombre de la carpeta
                const { data: urlData } = dbJerry.storage.from('jerry-guerra').getPublicUrl(`${carpeta}/${foto.name}`);
                
                galeria.innerHTML += `
                    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        <img src="${urlData.publicUrl}" class="w-full h-56 object-cover">
                        <div class="p-4">
                            <p class="text-sm text-orange-600 font-bold uppercase">${carpeta}</p>
                            <p class="font-bold text-slate-800">${foto.name.split('.')[0]}</p>
                        </div>
                    </div>`;
            });
        }

        if (galeria.innerHTML === '') {
            if (estado) estado.innerText = "No se encontraron fotos dentro de las carpetas.";
        } else {
            if (estado) estado.style.display = 'none';
        }

    } catch (err) {
        console.error("Error crítico:", err.message);
    }
}

// Función WhatsApp (Se mantiene igual)
function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584248437083"; 
    const texto = `Hola Jerry! Mi nombre es ${nombre}. Necesito: ${servicio}. Detalles: ${mensaje}`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', cargarTrabajos);