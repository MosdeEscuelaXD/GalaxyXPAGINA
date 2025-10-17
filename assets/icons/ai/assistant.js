/* ==========================
   🤖 GALAXY IA — CANAL ASISTENTE
========================== */

let aiMemory = JSON.parse(localStorage.getItem('aiMemory') || '[]');

/* ===== Función principal de la IA ===== */
function talkToAssistant() {
    const input = document.getElementById('assistantInput');
    const msg = input.value.trim();
    if (!msg) return;

    const chat = document.getElementById('assistantChat');

    // Mostrar mensaje del usuario
    appendAIMsg(chat, 'user', msg);

    // Obtener respuesta de la IA
    const reply = aiThink(msg);
    appendAIMsg(chat, 'ai', reply);

    // Guardar en memoria
    aiMemory.push({ q: msg, a: reply });
    localStorage.setItem('aiMemory', JSON.stringify(aiMemory));

    input.value = '';
    chat.scrollTop = chat.scrollHeight;
}

/* ===== Mostrar mensajes en chat ===== */
function appendAIMsg(chat, who, text) {
    const div = document.createElement('div');
    div.className = who === 'ai' ? 'ai-message' : 'user-message';

    const avatar = who === 'ai'
        ? 'https://i.pinimg.com/1200x/7e/56/05/7e5605d304c272bd1c52fd26517f0803.jpg'
        : localStorage.getItem('avatar') || '';

    div.innerHTML = `
        ${avatar ? `<img src="${avatar}" class="chatAvatar">` : ''}
        <p>${text}</p>
    `;
    chat.appendChild(div);
}

/* ===== Inteligencia de la IA ===== */
function aiThink(msg) {
    const m = msg.toLowerCase();
    const user = localStorage.getItem('username') || 'amigo';

    // Comandos básicos
    if (m.includes('hola')) return `¡Hola ${user}! 🌠 ¿Cómo estás hoy?`;
    if (m.includes('quién eres')) return 'Soy Galaxy IA, tu asistente cósmico 🚀';
    if (m.includes('nombre')) return `Tu nombre registrado es ${user}.`;
    if (m.includes('video')) { showSection('videos'); return 'Vamos a la sección de Videos 🎥'; }
    if (m.includes('foro')) { showSection('foro'); return 'Explora el Foro 📜'; }
    if (m.includes('gracias')) return '¡De nada! 💫';
    if (m.includes('adiós')) return 'Hasta pronto 👋';
    
    // Comando de navegación rápida
    if (m.includes('ir a')) {
        if (m.includes('chat')) showSection('chat');
        if (m.includes('videos')) showSection('videos');
        if (m.includes('foro')) showSection('foro');
        if (m.includes('perfil')) showSection('perfil');
        if (m.includes('info')) showSection('info');
        return 'Te llevé a la sección que pediste 😉';
    }

    // Comando para ver memoria
    if (m.includes('qué guardé') || m.includes('recordatorio')) {
        if (!aiMemory.length) return 'No he guardado nada todavía 🌌';
        let last = aiMemory.slice(-5).map((x, i) => `${i+1}. ${x.q} → ${x.a}`).join('<br>');
        return `Esto es lo que recuerdo:<br>${last}`;
    }

    // Comando para borrar memoria
    if (m.includes('olvida todo') || m.includes('borrar memoria')) {
        aiMemory = [];
        localStorage.removeItem('aiMemory');
        return 'Mi memoria ha sido borrada 🪐';
    }

    // Respuestas aleatorias para conversaciones normales
    const replies = [
        'Interesante... cuéntame más.',
        'Hmm... eso me hace pensar 🤔',
        'Eso suena genial 🌌',
        'Cuéntame algo más de eso 💭',
        'Buena idea, ¿quieres que lo recuerde?',
        'Anotado en mi memoria cósmica ✨'
    ];
    return replies[Math.floor(Math.random() * replies.length)];
}

/* ===== Botón borrar memoria IA ===== */
document.getElementById('clearAIBtn').onclick = () => {
    if (confirm('¿Borrar memoria de la IA?')) {
        aiMemory = [];
        localStorage.removeItem('aiMemory');
        document.getElementById('assistantChat').innerHTML = '';
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
}
loadAIMemory();
