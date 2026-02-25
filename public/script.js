// CONFIGURACIÓN SUPABASE
const URL_SB = 'https://lrjsideqdmiekflpught.supabase.co';
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';
const jerry_db = window.supabase.createClient(URL_SB, KEY_SB);

let swiperInstance = null;

const estadosVZLA = [
    "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", 
    "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón", 
    "Guárico", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta", 
    "Portuguesa", "Sucre", "Táchira", "Trujillo", "Vargas", "Yaracuy", "Zulia"
];

// 1. CARGAR GALERÍA (Sin cambios)
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
        let totalFotos = 0;

        for (const carpeta of carpetas) {
            const { data } = await jerry_db.storage.from('jerry-guerra').list(carpeta);
            if (data) {
                const fotosValidas = data.filter(f => !f.name.startsWith('.'));
                totalFotos += fotosValidas.length;
                fotosValidas.forEach(foto => {
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
            loop: totalFotos > 3, 
            observer: true,
            observeParents: true,
            autoplay: totalFotos > 1 ? { delay: 3000, disableOnInteraction: false } : false,
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
        });
    } catch (e) { console.error("Error en la galería:", e); }
}

// 2. FUNCIÓN PARA MOSTRAR CAMPOS DINÁMICOS (NUEVA)
window.actualizarFormulario = function() {
    const servicio = document.getElementById('servicio-cot').value;
    const divRefri = document.getElementById('extra-refrigeracion');
    const divMetraje = document.getElementById('extra-metraje');

    // Ocultar todo primero
    if(divRefri) divRefri.classList.add('hidden');
    if(divMetraje) divMetraje.classList.add('hidden');

    // Mostrar según el servicio
    if (servicio === "Refrigeración") {
        divRefri.classList.remove('hidden');
    } else if (["Construcción", "Drywall", "Impermeabilización"].includes(servicio)) {
        divMetraje.classList.remove('hidden');
    }
};

// 3. FUNCIÓN WHATSAPP (ACTUALIZADA)
window.enviarWhatsApp = function() {
    const nombre = document.getElementById('nombre-cot').value;
    const estado = document.getElementById('estado-cot').value;
    const ciudad = document.getElementById('ciudad-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    const telefono = "584149015630"; 

    if (!nombre || !estado || !ciudad || !servicio) {
        return alert("Por favor, completa los campos básicos (Nombre, Ubicación y Servicio).");
    }

    // --- Lógica de campos dinámicos ---
    let extraData = "";
    if (servicio === "Refrigeración") {
        const equipo = document.getElementById('equipo-tipo').value;
        const capacidad = document.getElementById('capacidad-ref').value;
        extraData = `\n❄️ *Equipo:* ${equipo}\n📊 *Capacidad:* ${capacidad}`;
    } else if (["Construcción", "Drywall", "Impermeabilización"].includes(servicio)) {
        const metros = document.getElementById('metros-cuadrados').value;
        extraData = `\n📐 *Metraje:* ${metros} m²`;
    }

    const texto = encodeURIComponent(
        `¡Hola Jerry! 👋\n\n` +
        `*SOLICITUD DE COTIZACIÓN*\n` +
        `--------------------------\n` +
        `👤 Cliente: *${nombre}*\n` +
        `📍 Ubicación: *${ciudad}, Edo. ${estado}*\n` +
        `🛠️ Servicio: *${servicio}*${extraData}\n` +
        `📝 Detalles: ${mensaje}`
    );
    
    window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank');
};

// 4. INICIALIZACIONES
window.filtrarTrabajos = function(categoria) {
    const seccionTrabajos = document.getElementById('trabajos');
    if (seccionTrabajos) seccionTrabajos.scrollIntoView({ behavior: 'smooth' });
    cargarGaleria(categoria);
};

function inicializarEstados() {
    const estadoSelect = document.getElementById('estado-cot');
    if(!estadoSelect) return;
    estadosVZLA.forEach(estado => {
        let opt = document.createElement('option');
        opt.value = estado;
        opt.innerHTML = estado;
        estadoSelect.appendChild(opt);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarEstados();
    cargarGaleria('todos');
});