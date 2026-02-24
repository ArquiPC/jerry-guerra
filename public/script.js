const URL_SB = 'https://lrjsideqdmiekflpught.supabase.co';
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

const jerry_db = window.supabase.createClient(URL_SB, KEY_SB);

// Cambiamos el nombre a cargarGaleria para que coincida con tu llamado original
async function cargarGaleria() {
    const box = document.getElementById('galeria');
    // Añadida 'impermeabilizacion' como pediste
    const carpetas = ['construccion', 'drywall', 'refrigeracion', 'impermeabilizacion'];
    
    try {
        console.log("Iniciando carga de carrusel...");
        let html = '';
        
        for (const carpeta of carpetas) {
            const { data, error } = await jerry_db.storage.from('jerry-guerra').list(carpeta);
            
            if (error) {
                console.error(`Error en carpeta ${carpeta}:`, error.message);
                continue;
            }

            if (data) {
                data.filter(f => !f.name.startsWith('.')).forEach(foto => {
                    const { data: url } = jerry_db.storage.from('jerry-guerra').getPublicUrl(`${carpeta}/${foto.name}`);
                    
                    // IMPORTANTE: Cada foto ahora tiene la clase 'swiper-slide'
                    html += `
                        <div class="swiper-slide">
                            <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mx-2 mb-10 transform transition hover:scale-105">
                                <img src="${url.publicUrl}" class="w-full h-72 object-cover" loading="lazy">
                                <div class="p-4 bg-white text-center border-t border-gray-50">
                                    <p class="text-[10px] font-bold text-orange-600 uppercase tracking-widest">${carpeta}</p>
                                </div>
                            </div>
                        </div>`;
                });
            }
        }
        
        // Inyectamos los slides en el contenedor
        box.innerHTML = html || '<div class="swiper-slide text-center py-10">Sube fotos a Supabase para verlas aquí.</div>';

        // INICIALIZACIÓN DE SWIPER (El motor del carrusel)
        new Swiper(".mySwiper", {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
            },
        });

    } catch (e) { 
        console.error("Error crítico en la galería:", e); 
    }
}

// Función WhatsApp (Se mantiene igual)
function enviarWhatsApp() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584149015630"; 

    if (!nombre) return alert("Por favor, ingresa tu nombre.");

    const texto = encodeURIComponent(`Hola Jerry! Mi nombre es ${nombre}. Necesito: ${servicio}. Detalles: ${mensaje}`);
    window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank');
}

// Ejecución única al cargar la página
document.addEventListener('DOMContentLoaded', cargarGaleria);