const supabaseUrl = 'https://lrjsideqdmiekflpught.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanNpZGVxZG1pZWtmbHB1Z2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjE5NTUsImV4cCI6MjA4NzQzNzk1NX0.fVk9OMKOpV25DMNra-Q5-6iRk3u3ZH6Ye2G-EuBlu28';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function cargarTrabajos() {
    const { data, error } = await supabase.storage.from('jerry-guerra').list();
    const galeria = document.getElementById('galeria');
    const estado = document.getElementById('mensaje-estado');

    if (error) {
        estado.innerText = "Error al cargar la galería.";
        return;
    }

    const fotos = data.filter(f => !f.name.startsWith('.'));

    if (fotos.length > 0) {
        estado.style.display = 'none';
        galeria.innerHTML = '';
        fotos.forEach(foto => {
            const { data: url } = supabase.storage.from('jerry-guerra').getPublicUrl(foto.name);
            galeria.innerHTML += `
                <div class="bg-white rounded-xl overflow-hidden shadow-md">
                    <img src="${url.publicUrl}" class="w-full h-56 object-cover">
                    <div class="p-4">
                        <p class="font-bold text-slate-800 capitalize">${foto.name.split('.')[0]}</p>
                    </div>
                </div>
            `;
        });
    }
}

cargarTrabajos();

function enviarWhatsApp() {
    // 1. Obtenemos los valores de los campos
    const nombre = document.getElementById('nombre-cot').value;
    const servicio = document.getElementById('servicio-cot').value;
    const mensaje = document.getElementById('mensaje-cot').value;
    
    // Tu número de teléfono (sin el símbolo +)
    const telefono = "584248437083"; 

    // 2. Validamos que el nombre no esté vacío
    if (nombre.trim() === "") {
        alert("Por favor, ingresa tu nombre para que Jerry sepa con quién habla.");
        return;
    }

    // 3. Creamos el mensaje formateado
    const texto = `Hola Jerry! 👋%0A%0AMi nombre es *${nombre}*.%0A%0ANecesito una cotización para: *${servicio}*.%0A%0ADetalles: ${mensaje}`;

    // 4. Construimos la URL de WhatsApp
    const url = `https://wa.me/${584248437083}?text=${texto}`;

    // 5. Abrimos en una nueva pestaña
    window.open(url, '_blank');
}