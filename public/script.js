// 1. CONFIGURACIÓN INICIAL
const supabaseUrl = 'https://lrjsideqdmiekflpught.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

// Usamos un nombre de variable único para evitar el SyntaxError de "already declared"
const jerrySupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. FUNCIÓN PARA CARGAR TRABAJOS DESDE LAS CARPETAS
async function cargarTrabajos() {
    console.log("Iniciando búsqueda en el bucket: jerry-guerra...");
    const galeria = document.getElementById('galeria');
    const estado = document.getElementById('mensaje-estado');
    
    // Estas deben coincidir exactamente con tus carpetas en Supabase
    const carpetas = ['construccion', 'drywall', 'refrigeracion'];

    if (!galeria) return;

    try {
        let htmlFinal = '';
        let contadorFotos = 0;

        // Recorremos cada carpeta interna del bucket
        for (const carpeta of carpetas) {
            const { data, error } = await jerrySupabase
                .storage
                .from('jerry-guerra') // Bucket principal
                .list(carpeta);       // Carpeta específica

            if (error) {
                console.error(`Error al leer carpeta ${carpeta}:`, error.message);
                continue;
            }

            // Filtramos archivos ocultos o vacíos
            const fotos = data.filter(f => !f.name.startsWith('.') && f.name !== '.emptyFolderPlaceholder');

            fotos.forEach(foto => {
                contadorFotos++;
                // Construimos la ruta completa para la URL pública
                const rutaArchivo = `${carpeta}/${foto.name}`;
                const { data: urlData } = jerrySupabase.storage.from('jerry-guerra').getPublicUrl(rutaArchivo);
                
                // Generamos el HTML de la tarjeta
                htmlFinal += `
                    <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div class="relative group">
                            <img src="${urlData.publicUrl}" 
                                 class="w-full h-64 object-cover" 
                                 alt="${foto.name}"
                                 onerror="this.src='https://via.placeholder.com/400x300?text=Imagen+No+Encontrada'">
                            <div class="absolute top-3 left-3">
                                <span class="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                    ${carpeta}
                                </span>
                            </div>
                        </div>
                        <div class="p-4">
                            <p class="font-bold text-slate-800 truncate">${foto.name.split('.')[0]}</p>
                        </div>
                    </div>`;
            });
        }

        // Actualizamos la interfaz
        if (contadorFotos === 0) {
            galeria.innerHTML = '<p class="col-span-full text-center text-gray-500 italic py-10">Aún no hay fotos en las carpetas de trabajo.</p>';
        } else {
            if (estado) estado.style.display = 'none';
            galeria.innerHTML = htmlFinal;
            console.log(`¡Éxito! Se cargaron ${contadorFotos} imágenes.`);
        }

    } catch (err) {
        console.error("Error crítico de ejecución:", err);
    }
}

// 3. FUNCIÓN PARA EL FORMULARIO DE WHATSAPP
function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584248437083"; 

    if (!nombre || nombre.trim() === "") {
        alert("Por favor, ingresa tu nombre para continuar.");
        return;
    }

    // Codificamos el texto para que los espacios y emojis no rompan el link
    const texto = encodeURIComponent(`Hola Jerry! 👋 Mi nombre es *${nombre}*. Necesito ayuda con: *${servicio}*. Detalles: ${mensaje}`);
    window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank');
}

// 4. INICIALIZACIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', cargarTrabajos);