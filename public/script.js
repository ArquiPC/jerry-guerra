const URL_SB = 'https://lrjsideqdmiekflpught.supabase.co';
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

const jerry_db = window.supabase.createClient(URL_SB, KEY_SB);
let swiperInstance = null;

async function cargarGaleria(filtro = 'todos') {
    const box = document.getElementById('galeria');
    const carpetas = (filtro === 'todos') 
        ? ['construccion', 'drywall', 'refrigeracion', 'impermeabilizacion'] 
        : [filtro];
    
    try {
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
        
        box.innerHTML = '<div class="swiper-slide text-center py-10">Cargando trabajos...</div>';

        let html = '';
        for (const carpeta of carpetas) {
            const { data } = await jerry_db.storage.from('jerry-guerra').list(carpeta);
            
            if (data) {
                data.filter(f => !f.name.startsWith('.')).forEach(foto => {
                    const { data: url } = jerry_db.storage.from('jerry-guerra').getPublicUrl(`${carpeta}/${foto.name}`);
                    html += `
                        <div class="swiper-slide">
                            <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mx-2 mb-10 transform transition hover:scale-105">
                                <img src="${url.publicUrl}" class="w-full h-72 object-cover" loading="lazy">
                                <div class="p-4 bg-white text-center">
                                    <span class="text-[10px] font-bold text-orange-600 uppercase tracking-widest">${carpeta}</span>
                                </div>
                            </div>
                        </div>`;
                });
            }
        }
        
        box.innerHTML = html || '<div class="swiper-slide text-center py-10">No hay fotos en esta categoría aún.</div>';

        swiperInstance = new Swiper(".mySwiper", {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: (html !== ''),
            observer: true,
            observeParents: true,
            autoplay: { delay: 3000, disableOnInteraction: false },
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            },
        });

    } catch (e) { console.error("Error en la galería:", e); }
}

// Función global para filtrar
window.filtrarTrabajos = function(categoria) {
    const seccionTrabajos = document.getElementById('trabajos');
    if (seccionTrabajos) seccionTrabajos.scrollIntoView({ behavior: 'smooth' });
    cargarGaleria(categoria);
};

// Carga inicial
document.addEventListener('DOMContentLoaded', () => cargarGaleria('todos'));

// Función WhatsApp Global
window.enviarWhatsApp = function() {
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584248437083"; 

    if (!nombre) return alert("Por favor, ingresa tu nombre.");

    const texto = encodeURIComponent(`Hola Jerry! Mi nombre es ${nombre}. Necesito: ${servicio}. Detalles: ${mensaje}`);
    window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank');
};