console.log("Galaxy IA cargada");

// Memoria de la IA
const assistantMemory = [];
const importantTopics = [];

// Función principal para procesar mensajes
function talkToAssistant() {
    const input = document.getElementById('assistantInput');
    const chat = document.getElementById('assistantChat');
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage(chat, `Tú: ${msg}`, 'user');
    assistantMemory.push({ type: 'user', message: msg });

    const reply = generateResponse(msg);
    appendMessage(chat, `Galaxy IA: ${reply}`, 'ai');
    assistantMemory.push({ type: 'ai', message: reply });
    input.value = '';
    chat.scrollTop = chat.scrollHeight;
}

// Mostrar mensaje en el chat de IA
function appendMessage(container, text, type) {
    const p = document.createElement('p');
    p.textContent = text;
    p.className = type === 'ai' ? 'ai-message' : 'user-message';
    container.appendChild(p);
}

// Generador de respuestas avanzadas
function generateResponse(msg) {
    const m = msg.toLowerCase();

    // Comandos directos
    if (m.includes("hola")) return "¡Hola! 🌌 Soy tu asistente Galaxy IA, ¿cómo estás hoy?";
    if (m.includes("cómo estás") || m.includes("qué tal")) return "Me siento listo para ayudarte y aprender contigo 🚀";
    if (m.includes("video")) return "Puedes ir a la sección de Videos y elegir uno para ver 🎥";
    if (m.includes("chat")) return "Ve a la sección de Chat para interactuar con otros usuarios 💬";
    if (m.includes("foro")) return "En el Foro puedes compartir tus ideas y responder a otros 📜";
    if (m.includes("perfil")) return "En Perfil puedes cambiar tu avatar y nombre para personalizar tu experiencia 👤";

    // Comandos de memoria
    if (m.includes("recuérdame que")) {
        const note = msg.split("recuérdame que")[1].trim();
        if(note){
            importantTopics.push(note);
            return `¡He guardado eso! Te recordaré: "${note}"`;
        } else {
            return "No entendí qué debo recordar 😅";
        }
    }

    if (m.includes("qué guardé") || m.includes("recuerdos")) {
        if(importantTopics.length === 0) return "No tengo nada guardado aún 📝";
        return "Estas son tus notas importantes:\n- " + importantTopics.join("\n- ");
    }

    if (m.includes("borrar memoria")) {
        assistantMemory.length = 0;
        importantTopics.length = 0;
        return "He borrado toda la memoria reciente 🗑️";
    }

    // Comandos de navegación
    if (m.includes("llévame a videos")) { showSection('videos'); return "¡Vamos a Videos! 🎬"; }
    if (m.includes("llévame a chat")) { showSection('chat'); return "¡Vamos al Chat! 💬"; }
    if (m.includes("llévame a foro")) { showSection('foro'); return "¡Vamos al Foro! 📜"; }
    if (m.includes("llévame a perfil")) { showSection('perfil'); return "¡Vamos a Perfil! 👤"; }

    // Respuestas dinámicas para conversación natural
    const genericReplies = [
        "Interesante... cuéntame más 🌌",
        "Eso suena genial 🚀",
        "Hmm, déjame pensar...",
        "Entiendo, continúa 😃",
        "¡Muy bien! ¿Quieres que haga algo con eso?"
    ];
    return genericReplies[Math.floor(Math.random() * genericReplies.length)];
}

// Botones auxiliares
document.getElementById('clearAIBtn').addEventListener('click', () => {
    assistantMemory.length = 0;
    importantTopics.length = 0;
    const chat = document.getElementById('assistantChat');
    chat.innerHTML = '';
    appendMessage(chat, "Memoria y chat borrados ✅", 'ai');
});

document.getElementById('saveTopicsBtn').addEventListener('click', () => {
    if(assistantMemory.length > 0){
        const lastMessage = assistantMemory[assistantMemory.length - 1].message;
        importantTopics.push(lastMessage);
        alert(`Tema guardado: "${lastMessage}"`);
    } else {
        alert("No hay mensajes para guardar 😅");
    }
});
