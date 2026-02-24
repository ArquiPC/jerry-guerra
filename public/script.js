// 1. CONFIGURACIÓN
const supabaseUrl = 'https://lrjsideqdmiekflpught.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

// Usamos window.supabase para evitar conflictos de declaración
const jerryApp = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarTrabajos() {
    console.log("Iniciando búsqueda profunda en el bucket 'jerry-guerra'...");
    const galeria = document.getElementById('galeria');
    const carpetas = ['construccion', 'drywall', 'refrigeracion'];

    if (!galeria) return;

    try {
        let contenidoHtml = '';
        let totalFotos = 0;

        for (const carpeta of carpetas) {
            console.log(`Explorando carpeta: ${carpeta}`);
            
            // Listamos el contenido de la subcarpeta
            const { data, error } = await jerryApp.storage.from('jerry-guerra').list(carpeta);

            if (error) {
                console.error(`Error en carpeta ${carpeta}:`, error.message);
                continue;
            }

            // Filtramos archivos reales (que no empiecen con punto)
            const fotosValidas = data.filter(archivo => !archivo.name.startsWith('.'));

            fotosValidas.forEach(foto => {
                totalFotos++;
                // Construimos la ruta exacta carpeta/nombre-del-archivo
                const rutaFull = `${carpeta}/${foto.name}`;
                const { data: urlData } = jerryApp.storage.from('jerry-guerra').getPublicUrl(rutaFull);
                
                console.log(`Foto encontrada: ${rutaFull}`);

                contenidoHtml += `
                    <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 group">
                        <div class="h-64 overflow-hidden">
                            <img src="${urlData.publicUrl}" 
                                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                 alt="Trabajo de Jerry"
                                 onerror="this.src='https://via.placeholder.com/400x300?text=Error+al+Cargar'">
                        </div>
                        <div class="p-4">
                            <span class="inline-block px-2 py-1 text-[10px] font-bold bg-orange-100 text-orange-600 rounded uppercase mb-2">
                                ${carpeta}
                            </span>
                            <p class="text-slate-700 font-medium text-sm truncate">
                                ${foto.name.split('.')[0]}
                            </p>
                        </div>
                    </div>`;
            });
        }

        // Si después de revisar todas las carpetas el total es 0
        if (totalFotos === 0) {
            galeria.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <p class="text-gray-400 italic">No se encontraron archivos en las carpetas.</p>
                    <p class="text-xs text-gray-400 mt-2">Ruta revisada: jerry-guerra/[subcarpetas]</p>
                </div>`;
        } else {
            galeria.innerHTML = contenidoHtml;
            console.log(`¡Éxito! Se inyectaron ${totalFotos} imágenes.`);
        }

    } catch (err) {
        console.error("Error general:", err);
    }
}

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