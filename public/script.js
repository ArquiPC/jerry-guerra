// 1. USAMOS UN NOMBRE QUE NO EXISTE EN NINGÚN OTRO LADO
const miConexionSupabase = window.supabase.createClient(
    'https://lrjsideqdmiekflpught.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28'
);

async function cargarTrabajos() {
    console.log("Iniciando búsqueda en carpetas...");
    const galeria = document.getElementById('galeria');
    const carpetas = ['construccion', 'drywall', 'refrigeracion'];

    if (!galeria) return;

    try {
        let fotosHtml = '';
        let fotosTotales = 0;

        for (const carpeta of carpetas) {
            const { data, error } = await clienteSupabase.storage.from('jerry-guerra').list(carpeta);

            if (error) {
                console.error("Error al listar " + carpeta, error);
                continue;
            }

            const fotos = data.filter(f => !f.name.startsWith('.'));
            
            fotos.forEach(foto => {
                fotosTotales++;
                // Usamos encodeURIComponent para que los espacios del nombre funcionen bien
                const nombreSeguro = encodeURIComponent(foto.name);
                const { data: urlData } = clienteSupabase.storage.from('jerry-guerra').getPublicUrl(`${carpeta}/${foto.name}`);
                
                fotosHtml += `
                    <div class="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-300">
                        <img src="${urlData.publicUrl}" 
                             class="w-full h-56 object-cover" 
                             alt="${foto.name}"
                             onerror="this.src='https://via.placeholder.com/400x300?text=Error+de+Carga'">
                        <div class="p-4 bg-white">
                            <span class="text-xs font-bold text-orange-500 uppercase tracking-wider">${carpeta}</span>
                            <p class="font-bold text-slate-800 text-sm mt-1">${foto.name.split('.')[0]}</p>
                        </div>
                    </div>`;
            });
        }

        if (fotosTotales === 0) {
            galeria.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">No se encontraron imágenes en las carpetas de Supabase.</p>';
        } else {
            galeria.innerHTML = fotosHtml;
            console.log("¡Se cargaron " + fotosTotales + " fotos con éxito!");
        }

    } catch (e) {
        console.error("Error crítico en la carga:", e);
        galeria.innerHTML = '<p class="col-span-full text-center text-red-500">Error al conectar con la galería.</p>';
    }
}

function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584248437083"; 
    
    if (!nombre) return alert("Escribe tu nombre");

    const texto = `Hola Jerry! Mi nombre es ${nombre}. Necesito: ${servicio}. Detalles: ${mensaje}`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
}

document.addEventListener('DOMContentLoaded', cargarTrabajos);