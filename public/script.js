const URL_SB = 'https://lrjsideqdmiekflpught.supabase.co';
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

const jerry_db = window.supabase.createClient(URL_SB, KEY_SB);

async function cargarGaleria() {
    const box = document.getElementById('galeria');
    const carpetas = ['construccion', 'drywall', 'refrigeracion'];
    
    try {
        let html = '';
        for (const carpeta of carpetas) {
            // Buscamos dentro de cada carpeta
            const { data } = await jerry_db.storage.from('jerry-guerra').list(carpeta);
            
            if (data) {
                data.filter(f => !f.name.startsWith('.')).forEach(foto => {
                    const { data: url } = jerry_db.storage.from('jerry-guerra').getPublicUrl(`${carpeta}/${foto.name}`);
                    html += `
                        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform transition hover:scale-105">
                            <img src="${url.publicUrl}" class="w-full h-64 object-cover">
                            <div class="p-3 bg-white">
                                <p class="text-[10px] font-bold text-orange-600 uppercase tracking-widest">${carpeta}</p>
                            </div>
                        </div>`;
                });
            }
        }
        box.innerHTML = html || '<p class="col-span-full text-center py-10">Sube fotos a tus carpetas en Supabase.</p>';
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', cargarGaleria);

// Función WhatsApp
function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584248437083"; 

    if (!nombre) return alert("Por favor, ingresa tu nombre.");

    const texto = encodeURIComponent(`Hola Jerry! Mi nombre es ${nombre}. Necesito: ${servicio}. Detalles: ${mensaje}`);
    window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank');
}

document.addEventListener('DOMContentLoaded', cargarTrabajos);