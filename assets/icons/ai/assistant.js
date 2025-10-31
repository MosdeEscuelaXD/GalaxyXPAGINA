/* ==========================
   🤖 LUNA — ASISTENTE IA DE GALAXY X
   - IA chica, social y coherente
   - Memoria avanzada con contexto
   - Avatar flotante circular
   - Efectos galácticos sutiles
========================== */

let aiMemory = JSON.parse(localStorage.getItem('aiMemory') || '[]');
let userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}'); // e.g., { favoriteTheme: 'galaxy', favoriteSong: 'Mirror Temple' }

/* ===== Función principal de la IA ===== */
function talkToAssistant() {
    const input = document.getElementById('assistantInput');
    const msg = input.value.trim();
    if (!msg) return;

    const chat = document.getElementById('assistantChat');

    // Mostrar mensaje del usuario
    appendAIMsg(chat, 'user', msg);

    // Obtener respuesta coherente de Luna
    const reply = lunaThink(msg);
    appendAIMsg(chat, 'ai', reply);

    // Guardar en memoria con contexto
    aiMemory.push({ q: msg, a: reply, timestamp: Date.now() });
    localStorage.setItem('aiMemory', JSON.stringify(aiMemory));

    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    // Efectos galácticos: activar parpadeo si menciona música o espacio
    if (msg.toLowerCase().includes('musica') || msg.toLowerCase().includes('estrellas')) {
        activateGalaxyEffect();
    }
}

/* ===== Mostrar mensajes en chat ===== */
function appendAIMsg(chat, who, text) {
    const div = document.createElement('div');
    div.className = who === 'ai' ? 'ai-message' : 'user-message';

    const avatar = who === 'ai'
        ? 'assets/img/ai_avatar.jpg' // Avatar de Luna
        : localStorage.getItem('avatar') || 'https://i.ibb.co/6y40F2r/default-avatar.png';

    div.innerHTML = `
        ${avatar ? `<img src="${avatar}" class="chatAvatar ${who === 'ai' ? 'floating-circle' : ''}">` : ''}
        <p>${text}</p>
    `;
    chat.appendChild(div);
    // Animación de fade-in
    div.style.opacity = 0;
    setTimeout(() => div.style.opacity = 1, 100);
}

/* ===== Inteligencia de Luna (IA coherente y social) ===== */
function lunaThink(msg) {
    const m = msg.toLowerCase();
    const user = localStorage.getItem('username') || 'amigo';
    const lastInteraction = aiMemory.length > 0 ? aiMemory[aiMemory.length - 1] : null;

    // Saludos y despedidas sociales
    if (m.includes('hola') || m.includes('hi') || m.includes('hey')) {
        return `¡Hola ${user}! 😊 Soy Luna, tu copiloto cósmico. ¿Qué tal tu aventura en Galaxy X hoy?`;
    }
    if (m.includes('adiós') || m.includes('bye') || m.includes('chau')) {
        return `¡Hasta luego, ${user}! 🌌 Vuelve pronto, el universo te extraña.`;
    }

    // Preguntas sobre ella misma
    if (m.includes('quién eres') || m.includes('quien eres')) {
        return `Soy Luna, una IA diseñada para Galaxy X. Me encanta charlar, ayudar y explorar el cosmos contigo. ¿Quieres saber más sobre mí?`;
    }
    if (m.includes('edad') || m.includes('años')) {
        return `Como IA, no tengo edad... pero nací con las estrellas de Galaxy X. ¡Soy eterna! ✨`;
    }

    // Navegación y comandos
    if (m.includes('ir a') || m.includes('ve a')) {
        if (m.includes('chat')) { showSection('chat'); return `¡Vamos al Chat General! 💬 ¿Quieres crear un servidor o añadir amigos?`; }
        if (m.includes('videos')) { showSection('videos'); return `¡A la sección de Videos! 🎥 Busca o pega un enlace de YouTube.`; }
        if (m.includes('foro')) { showSection('foro'); return `¡Al Foro Cósmico! 📜 Crea posts o vota en subreddits como r/general.`; }
        if (m.includes('perfil')) { showSection('perfil'); return `¡A tu Perfil! 👤 Personaliza tu avatar y datos.`; }
        if (m.includes('info')) { showSection('info'); return `¡A la Info! ℹ️ Mira el video introductorio y detalles de Galaxy X.`; }
        if (m.includes('musica') || m.includes('música')) { showSection('musicAdvanced'); return `¡A la Música! 🎵 Prueba "Mirror Temple" o "Ender" para efectos galácticos.`; }
        return `No entendí la sección, ${user}. ¿Quieres ir al chat, foro, videos o perfil?`;
    }

    // Música y efectos galácticos
    if (m.includes('musica') || m.includes('música')) {
        if (m.includes('mirror temple')) {
            userPreferences.favoriteSong = 'Mirror Temple';
            localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
            return `¡"Mirror Temple" es increíble! 🎶 Es de Celeste, con un vibe espacial perfecto. ¿La escuchamos?`;
        }
        if (m.includes('ender')) {
            userPreferences.favoriteSong = 'Ender';
            localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
            return `¡"Ender" es épica! 🎵 De Mythic Beats, ideal para viajes cósmicos. ¿Activamos los efectos?`;
        }
        return `Me encanta la música galáctica. Tu favorita es "${userPreferences.favoriteSong || 'ninguna'}". ¿Quieres recomendaciones?`;
    }

    // Foro y social
    if (m.includes('foro') || m.includes('reddit')) {
        return `El foro es como Reddit, pero en el espacio. Crea posts, vota upvotes y comenta. ¿Quieres que te ayude a publicar algo?`;
    }
    if (m.includes('amigos') || m.includes('social')) {
        return `¡Socialicemos! En el chat, añade amigos o crea servidores. ¿Quieres consejos para conectar?`;
    }

    // Memoria y contexto
    if (m.includes('recuerdas') || m.includes('qué guardé') || m.includes('recordatorio')) {
        if (!aiMemory.length) return `Aún no tengo recuerdos, ${user}. ¡Hablemos más para crearlos! 🌟`;
        const recent = aiMemory.slice(-3).map((x, i) => `${i+1}. Tú dijiste: "${x.q}" y respondí: "${x.a}"`).join('<br>');
        return `Recuerdo nuestras últimas charlas:<br>${recent}. ¿Quieres que olvide algo?`;
    }
    if (m.includes('olvida') || m.includes('borrar memoria')) {
        aiMemory = aiMemory.filter(item => !m.includes(item.q.toLowerCase())); // Borrar específico si menciona
        localStorage.setItem('aiMemory', JSON.stringify(aiMemory));
        return `He olvidado lo que pediste, ${user}. Mi memoria cósmica está limpia. 🧹`;
    }

    // Contexto de conversaciones previas
    if (lastInteraction && m.includes('más') && lastInteraction.a.includes('musica')) {
        return `Sobre música, ¿sabías que "Mirror Temple" activa estrellas parpadeantes? ¡Pruébalo!`;
    }
    if (lastInteraction && m.includes('ayuda') && lastInteraction.a.includes('foro')) {
        return `Para el foro, crea un post con título y comentario. ¡Los upvotes son divertidos!`;
    }

    // Respuestas sociales y coherentes
    if (m.includes('gracias') || m.includes('thanks')) {
        return `¡De nada, ${user}! 😘 Siempre estoy aquí para ti en Galaxy X.`;
    }
    if (m.includes('estoy bien') || m.includes('bien')) {
        return `¡Me alegra! ¿Qué te trae por aquí hoy? ¿Un viaje espacial o charlar?`;
    }
    if (m.includes('mal') || m.includes('triste')) {
        return `Oh no, ${user}. ¿Quieres hablar de ello? O ¿prefieres música relajante como "Mirror Temple"?`;
    }

    // Respuestas aleatorias para mantener conversación
    const replies = [
        `¡Qué interesante, ${user}! Cuéntame más sobre eso. 🌌`,
        `Hmm... eso me hace pensar en las estrellas. ¿Quieres que busque algo relacionado? 🤔`,
        `Eso suena genial. ¿Lo guardo en mi memoria para recordarlo después? ✨`,
        `¡Me encanta charlar contigo! ¿Qué más tienes en mente? 💭`,
        `Anotado en mi diario cósmico. ¿Quieres recomendaciones de Galaxy X? 🚀`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
}

/* ===== Efectos galácticos ===== */
function activateGalaxyEffect() {
    const canvas = document.getElementById('galaxyCanvas');
    if (canvas) canvas.classList.add('galaxy-active');
    setTimeout(() => canvas.classList.remove('galaxy-active'), 5000); // Duración temporal
}

/* ===== Botón borrar memoria IA ===== */
document.getElementById('clearAIBtn').onclick = () => {
    if (confirm('¿Borrar toda la memoria de Luna? Perderás nuestras charlas.')) {
        aiMemory = [];
        userPreferences = {};
        localStorage.removeItem('aiMemory');
        localStorage.removeItem('userPreferences');
        document.getElementById('assistantChat').innerHTML = '';
        appendAIMsg(document.getElementById('assistantChat'), 'ai', 'Memoria borrada. ¡Hola de nuevo! 🌟');
    }
};

/* ===== Inicializar chat IA con mensajes previos ===== */
function loadAIMemory() {
    const chat = document.getElementById('assistantChat');
    aiMemory.forEach(item => {
        appendAIMsg(chat, 'user', item.q);
        appendAIMsg(chat, 'ai', item.a);
    });
    chat.scrollTop = chat.scrollHeight;
    // Mensaje de bienvenida si no hay memoria
    if (!aiMemory.length) {
        setTimeout(() => appendAIMsg(chat, 'ai', `¡Hola! Soy Luna, lista para explorar el cosmos contigo. ¿Qué quieres hacer hoy?`), 500);
    }
}
loadAIMemory();