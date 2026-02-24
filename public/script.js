// 1. USAMOS UN NOMBRE QUE NO EXISTE EN NINGÚN OTRO LADO
const miConexionSupabase = window.supabase.createClient(
    'https://lrjsideqdmiekflpught.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28'
);

async function cargarTrabajos() {
    const galeria = document.getElementById('galeria');
    const carpetas = ['construccion', 'drywall', 'refrigeracion'];

    if (!galeria) return;
    galeria.innerHTML = '<p class="text-center col-span-full">Buscando imágenes...</p>';

    try {
        let contenidoHtml = '';

        for (const carpeta of carpetas) {
            const { data, error } = await miConexionSupabase.storage.from('jerry-guerra').list(carpeta);

            if (error) continue;

            const fotos = data.filter(f => !f.name.startsWith('.'));

            fotos.forEach(foto => {
                const { data: urlData } = miConexionSupabase.storage.from('jerry-guerra').getPublicUrl(`${carpeta}/${foto.name}`);
                
                contenidoHtml += `
                    <div class="bg-white rounded-xl shadow-md overflow-hidden">
                        <img src="${urlData.publicUrl}" class="w-full h-56 object-cover" onerror="this.parentElement.style.display='none'">
                        <div class="p-4 text-center">
                            <span class="text-xs font-bold text-orange-500 uppercase">${carpeta}</span>
                            <p class="font-bold text-slate-800">${foto.name.split('.')[0]}</p>
                        </div>
                    </div>`;
            });
        }

        galeria.innerHTML = contenidoHtml || '<p class="text-center col-span-full">No se encontraron imágenes en las carpetas.</p>';

    } catch (e) {
        galeria.innerHTML = '<p class="text-center col-span-full text-red-500">Error al cargar.</p>';
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