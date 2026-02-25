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

// 1. CARGAR GALERÍA (Se mantiene igual)
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

// 2. MOSTRAR CAMPOS DINÁMICOS
window.actualizarFormulario = function() {
    const servicio = document.getElementById('servicio-cot').value;
    const divRefri = document.getElementById('extra-refrigeracion');
    const divMetraje = document.getElementById('extra-metraje');

    if(divRefri) divRefri.classList.add('hidden');
    if(divMetraje) divMetraje.classList.add('hidden');

    if (servicio === "Refrigeración") {
        divRefri.classList.remove('hidden');
    } else if (["Construcción", "Drywall", "Impermeabilización"].includes(servicio)) {
        divMetraje.classList.remove('hidden');
    }
};

// 3. FUNCIÓN WHATSAPP CON VALIDACIÓN Y RESPALDO DB
window.enviarWhatsApp = async function() {
    // Referencias a inputs para focus
    const inputNombre = document.getElementById('nombre-cot');
    const inputTel = document.getElementById('tel-cot'); // ¡Asegúrate que exista en tu HTML!
    
    // Captura de valores
    const nombre = inputNombre.value.trim();
    const telefono_cliente = inputTel ? inputTel.value.trim() : "";
    const estado = document.getElementById('estado-cot').value;
    const ciudad = document.getElementById('ciudad-cot').value.trim();
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value.trim();
    const telefono_jerry = "584149015630"; 

    // --- VALIDACIONES ---
    if (!nombre || !telefono_cliente || !estado || !ciudad || !servicio) {
        alert("⚠️ Por favor, completa todos los campos obligatorios.");
        return;
    }

    // Validar nombre (Solo letras)
    if (!/^[a-zA-ZÀ-ÿ\s]{3,40}$/.test(nombre)) {
        alert("⚠️ Por favor, ingresa un nombre válido.");
        inputNombre.focus();
        return;
    }

    // Validar teléfono (Solo números 10-15)
    if (!/^[0-9]{10,15}$/.test(telefono_cliente)) {
        alert("⚠️ Ingresa un número de teléfono válido (solo números).");
        inputTel.focus();
        return;
    }

    // --- LÓGICA DE DATOS TÉCNICOS ---
    let extraData = "";
    let camposTecnicos = {};

    if (servicio === "Refrigeración") {
        const equipo = document.getElementById('equipo-tipo').value;
        const capacidad = document.getElementById('capacidad-ref').value.trim();
        if(!capacidad) { alert("Indica la capacidad del equipo."); return; }
        extraData = `\n❄️ *Equipo:* ${equipo}\n📊 *Capacidad:* ${capacidad}`;
        camposTecnicos = { equipo, capacidad };
    } else if (["Construcción", "Drywall", "Impermeabilización"].includes(servicio)) {
        const metros = document.getElementById('metros-cuadrados').value;
        if(!metros || metros <= 0) { alert("Ingresa los metros cuadrados."); return; }
        extraData = `\n📐 *Metraje:* ${metros} m²`;
        camposTecnicos = { metraje: metros };
    }

    try {
        // --- PASO 1: RESPALDO EN SUPABASE ---
        const { error } = await jerry_db
            .from('solicitudes_presupuesto')
            .insert([{ 
                nombre, 
                telefono: telefono_cliente, 
                ubicacion: `${ciudad}, ${estado}`, 
                servicio, 
                detalles_tecnicos: camposTecnicos, 
                mensaje_adicional: mensaje 
            }]);

        if (error) throw error;

        // --- PASO 2: ABRIR WHATSAPP ---
        const texto = encodeURIComponent(
            `¡Hola Jerry Guerra! 👋\n\n` +
            `*SOLICITUD DE COTIZACIÓN*\n` +
            `--------------------------\n` +
            `👤 Cliente: *${nombre}*\n` +
            `📞 Teléfono: *${telefono_cliente}*\n` +
            `📍 Ubicación: *${ciudad}, Edo. ${estado}*\n` +
            `🛠️ Servicio: *${servicio}*${extraData}\n\n` +
            `📝 Detalles: ${mensaje || 'Sin detalles adicionales.'}`
        );
        
        window.open(`https://wa.me/${telefono_jerry}?text=${texto}`, '_blank');

    } catch (err) {
        console.error("Error de respaldo:", err);
        alert("Respaldo fallido, pero abriendo WhatsApp...");
        // Intentamos abrir WhatsApp de todos modos para no perder la venta
        window.open(`https://wa.me/${telefono_jerry}?text=Error en formulario, contactar a ${nombre}`, '_blank');
    }
};

// 4. INICIALIZACIONES (Igual que antes)
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