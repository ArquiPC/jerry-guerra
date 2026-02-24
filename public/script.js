// 1. CONFIGURACIÓN
const supabaseUrl = 'https://lrjsideqdmiekflpught.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';

// Usamos window.supabase para asegurar que usemos la librería externa
const dbJerry = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarTrabajos() {
    console.log("--- INICIANDO TEST DE GALERÍA ---");
    const galeria = document.getElementById('galeria');
    
    if (!galeria) {
        alert("❌ ERROR: No se encontró el elemento 'galeria' en el HTML.");
        return;
    }

    try {
        // Intento de conexión
        const { data, error } = await dbJerry.storage.from('jerry-guerra').list();

        if (error) {
            alert("❌ ERROR DE SUPABASE: " + error.message);
            return;
        }

        console.log("Datos recibidos de Supabase:", data);

        if (!data || data.length === 0) {
            alert("⚠️ AVISO: La conexión funciona, pero la carpeta 'jerry-guerra' está VACÍA.");
            return;
        }

        const fotos = data.filter(f => !f.name.startsWith('.'));
        galeria.innerHTML = ''; // Limpiar mensaje de carga

        fotos.forEach(foto => {
            const { data: urlData } = dbJerry.storage.from('jerry-guerra').getPublicUrl(foto.name);
            console.log("Generando URL para:", foto.name);
            
            galeria.innerHTML += `
                <div class="bg-white rounded-xl shadow-md p-2">
                    <img src="${urlData.publicUrl}" class="w-full h-56 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/300?text=Error+al+Cargar+Imagen'">
                    <p class="text-center font-bold mt-2">${foto.name}</p>
                </div>`;
        });

        alert("✅ TEST COMPLETADO: Se intentaron cargar " + fotos.length + " fotos.");

    } catch (err) {
        alert("❌ ERROR CRÍTICO DE JS: " + err.message);
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