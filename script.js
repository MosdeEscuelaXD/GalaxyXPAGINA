/* ==========================
   🌌 GALAXY X — script.js
   Versión: integración música de fondo + buscador YouTube + mejoras
========================== */

/* ==========================
   🌐 Sistema de secciones
========================== */
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    const el = document.getElementById(sectionId);
    if (el) el.style.display = 'block';
}
showSection('chat');

/* ==========================
   ✨ Fondo galáctico + visualizador
========================== */
const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
if (canvas && ctx) {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
    });
}

const stars = Array.from({ length: 250 }, () => ({
    x: (canvas ? Math.random() * canvas.width : 0),
    y: (canvas ? Math.random() * canvas.height : 0),
    r: Math.random() * 2 + 1,
    alpha: Math.random()
}));

let audioCtx, analyser, dataArray, bufferLength;

function drawGalaxy() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // estrellas
    for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
        s.alpha += (Math.random() - 0.5) * 0.02;
        if (s.alpha < 0.25) s.alpha = Math.random() * 0.6 + 0.4;
    }

    // visualizador circular (si existe analyzer)
    if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.12;
        const bars = Math.min(dataArray.length, 120);

        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2;
            const v = dataArray[i] / 255;
            const barH = v * 120;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const grad = ctx.createLinearGradient(0, 0, x, y);
            grad.addColorStop(0, '#ff69b4');
            grad.addColorStop(1, '#8a2be2');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x * (1.2 + v * 0.8), y * (1.2 + v * 0.8));
            ctx.stroke();
        }
        ctx.restore();
    }

    requestAnimationFrame(drawGalaxy);
}
drawGalaxy();

/* ==========================
   💬 Chat (canal general)
========================== */
function appendChatMsg(text) {
    const chat = document.getElementById('chatBox');
    if (!chat) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'user-message';
    const avatar = localStorage.getItem('avatar') || '';
    msgDiv.innerHTML = `
        ${avatar ? `<img src="${avatar}" class="chatAvatar">` : ''}
        <p>${text}</p>
    `;
    chat.appendChild(msgDiv);
    chat.scrollTop = chat.scrollHeight;
}

function sendChat() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    const user = localStorage.getItem('username') || 'Usuario';
    appendChatMsg(`<b>${user}:</b> ${msg}`);
    input.value = '';
    saveChatHistory();
}

/* botones chat */
const clearChatBtn = document.getElementById('clearChatBtn');
if (clearChatBtn) clearChatBtn.onclick = () => {
    const chat = document.getElementById('chatBox');
    if (chat) chat.innerHTML = '';
    localStorage.removeItem('chatHistory');
};
const saveChatBtn = document.getElementById('saveChatBtn');
if (saveChatBtn) saveChatBtn.onclick = saveChatHistory;
const loadChatBtn = document.getElementById('loadChatBtn');
if (loadChatBtn) loadChatBtn.onclick = loadChatHistory;

function saveChatHistory() {
    const chat = document.getElementById('chatBox');
    if (!chat) return;
    localStorage.setItem('chatHistory', chat.innerHTML);
}
function loadChatHistory() {
    const chat = document.getElementById('chatBox');
    if (!chat) return;
    const saved = localStorage.getItem('chatHistory');
    if (saved) chat.innerHTML = saved;
}
loadChatHistory();

/* ==========================
   🎥 Videos: reproducir por enlace + agregar demo
========================== */
function getYouTubeID(url) {
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
        if (u.searchParams.get('v')) return u.searchParams.get('v');
        // soporta /embed/ y /v/
        const parts = u.pathname.split('/');
        return parts.pop();
    } catch (e) {
        return null;
    }
}

function playYoutubeLink() {
    const input = document.getElementById('youtubeLink');
    if (!input) return alert('Campo no encontrado.');
    const url = input.value.trim();
    if (!url) return alert('Pega un enlace de YouTube.');
    const id = getYouTubeID(url);
    if (!id) return alert('No pude obtener el ID del enlace. Asegúrate de pegar un enlace de YouTube válido.');
    playYoutubeById(id);
}

function playYoutubeById(id) {
    const player = document.getElementById('videoPlayer');
    if (!player) return;
    player.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}`;
    iframe.width = 560;
    iframe.height = 315;
    iframe.allowFullscreen = true;
    player.appendChild(iframe);
}

// boton agregar demo
const addVideoBtn = document.getElementById('addVideoBtn');
if (addVideoBtn) {
    addVideoBtn.onclick = () => {
        const list = document.getElementById('videoList');
        if (!list) return;
        const id = prompt('Pega el ID de YouTube o enlace (demo):', 'dQw4w9WgXcQ') || 'dQw4w9WgXcQ';
        const vid = getYouTubeID(id) || id;
        const card = document.createElement('div');
        card.className = 'videoItem';
        card.innerHTML = `<p><strong>Demo — Nuevo video</strong></p>
            <button onclick="playYoutubeById('${vid}')">Reproducir</button>
            <button onclick="this.parentElement.remove()">✖ Eliminar</button>`;
        list.prepend(card);
    };
}

/* ==========================
   🧵 Foro
========================== */
function postForo() {
    const tituloEl = document.getElementById('foroTitulo');
    const comentarioEl = document.getElementById('foroComentario');
    if (!tituloEl || !comentarioEl) return;
    const titulo = tituloEl.value.trim();
    const comentario = comentarioEl.value.trim();
    if (!titulo || !comentario) return alert('Completa todos los campos.');

    const foroBox = document.getElementById('foroBox');
    if (!foroBox) return;
    const user = localStorage.getItem('username') || 'Usuario';
    const avatar = localStorage.getItem('avatar') || '';

    const post = document.createElement('div');
    post.className = 'foroPost';
    post.innerHTML = `
        ${avatar ? `<img src="${avatar}" class="chatAvatar">` : ''}
        <strong>${user}</strong>
        <h4>${titulo}</h4>
        <p>${comentario}</p>
    `;
    foroBox.prepend(post);
    tituloEl.value = '';
    comentarioEl.value = '';
}

/* ==========================
   👤 Perfil
========================== */
function saveProfile() {
    const usernameEl = document.getElementById('username');
    const emailEl = document.getElementById('userEmail');
    const fileEl = document.getElementById('userAvatarInput');
    if (!usernameEl || !emailEl || !fileEl) return alert('Campos de perfil no encontrados.');

    const username = usernameEl.value.trim();
    const email = emailEl.value.trim();
    const file = fileEl.files[0];

    if (!username) return alert('Ingresa tu nombre.');
    localStorage.setItem('username', username);
    localStorage.setItem('userEmail', email || '');

    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            localStorage.setItem('avatar', e.target.result);
            showProfilePreview();
        };
        reader.readAsDataURL(file);
    } else {
        showProfilePreview();
    }
}
function showProfilePreview() {
    const name = localStorage.getItem('username') || '';
    const avatar = localStorage.getItem('avatar') || '';
    const preview = document.getElementById('profilePreview');
    if (!preview) return;
    preview.innerHTML = avatar
        ? `<img src="${avatar}" class="profileAvatar"><h3>${name}</h3>`
        : `<h3>${name}</h3>`;
    updateHeaderProfile();
}
function updateHeaderProfile() {
    const area = document.getElementById('accountStatusSidebar') || document.getElementById('accountStatus');
    if (!area) return;
    const name = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    if (name) {
        area.innerHTML = avatar
            ? `<img src="${avatar}" class="miniAvatar"><span>${name}</span>`
            : `<span>${name}</span>`;
    } else area.innerHTML = '';
}
function clearProfile() {
    if (!confirm('¿Borrar tu perfil local?')) return;
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('userEmail');
    const preview = document.getElementById('profilePreview');
    if (preview) preview.innerHTML = '';
    updateHeaderProfile();
}
const saveProfileBtn = document.getElementById('saveProfileBtn');
if (saveProfileBtn) saveProfileBtn.onclick = saveProfile;
const clearProfileBtn = document.getElementById('clearProfileBtn');
if (clearProfileBtn) clearProfileBtn.onclick = clearProfile;
showProfilePreview();

/* ==========================
   🤖 ASISTENTE IA (solo en su canal)
========================== */
let aiMemory = JSON.parse(localStorage.getItem('aiMemory') || '[]');

function talkToAssistant() {
    const input = document.getElementById('assistantInput');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    const chat = document.getElementById('assistantChat');
    if (!chat) return;

    appendAIMsg(chat, 'user', msg);
    const reply = aiThink(msg);
    appendAIMsg(chat, 'ai', reply);

    aiMemory.push({ q: msg, a: reply, t: Date.now() });
    localStorage.setItem('aiMemory', JSON.stringify(aiMemory));
    input.value = '';
    chat.scrollTop = chat.scrollHeight;
}

function appendAIMsg(chat, who, text) {
    const div = document.createElement('div');
    div.className = who === 'ai' ? 'ai-message' : 'user-message';
    const avatar = who === 'ai'
        ? (document.getElementById('assistantAvatar') ? document.getElementById('assistantAvatar').src : '')
        : localStorage.getItem('avatar') || '';
    div.innerHTML = `${avatar ? `<img src="${avatar}" class="chatAvatar">` : ''}<p>${text}</p>`;
    chat.appendChild(div);
}

function aiThink(msg) {
    const m = msg.toLowerCase();
    const user = localStorage.getItem('username') || 'amigo';

    // comandos directos
    if (m.includes('hola')) return `¡Hola ${user}! 🌠 ¿En qué puedo ayudarte hoy?`;
    if (m.includes('quién eres') || m.includes('quien eres')) return 'Soy Galaxy IA, tu asistente cósmico 🚀. Puedo recordar temas, abrir secciones y ayudarte a encontrar videos.';
    if (m.includes('nombre')) return `Tu nombre registrado es ${user}.`;
    if (m.includes('video')) { showSection('videos'); return 'Te llevé a Videos. Pega un enlace o busca uno.'; }
    if (m.includes('foro')) { showSection('foro'); return 'Abriendo Foro...'; }
    if (m.includes('gracias')) return '¡De nada! Siempre a tu servicio ✨';
    if (m.includes('adiós') || m.includes('chao')) return 'Hasta pronto 👋';

    // "ir a" comandos
    if (m.includes('ir a')) {
        if (m.includes('chat')) { showSection('chat'); return 'Llevándote al Chat.'; }
        if (m.includes('videos')) { showSection('videos'); return 'Llevándote a Videos.'; }
        if (m.includes('foro')) { showSection('foro'); return 'Llevándote al Foro.'; }
        if (m.includes('perfil')) { showSection('perfil'); return 'Llevándote a Perfil.'; }
    }

    // recordar/guardar (simple)
    if (m.startsWith('recuérdame') || m.startsWith('recordar')) {
        aiMemory.push({ q: msg, a: 'Recordatorio guardado', t: Date.now() });
        localStorage.setItem('aiMemory', JSON.stringify(aiMemory));
        return 'He guardado ese recordatorio en mi memoria local.';
    }

    // respuestas variadas y no repetitivas
    const replies = [
        'Interesante... cuéntame más.',
        'Hmm... eso me hace pensar 🤔',
        'Eso suena genial 🌌',
        'Cuéntame algo más de eso 💭',
        'Buena idea, ¿quieres que lo recuerde?',
        'Anotado en mi memoria cósmica ✨'
    ];
    // intento de evitar repetición consultando memoria
    const lastSimilar = aiMemory.slice().reverse().find(r => r.q && r.q.toLowerCase().includes(msg.toLowerCase().split(' ')[0]));
    if (lastSimilar) return `Ya hablamos antes de algo parecido: "${lastSimilar.q}". ¿Quieres continuar?`;
    return replies[Math.floor(Math.random() * replies.length)];
}

const clearAIBtn = document.getElementById('clearAIBtn');
if (clearAIBtn) clearAIBtn.onclick = () => {
    if (!confirm('¿Borrar memoria de la IA?')) return;
    aiMemory = [];
    localStorage.removeItem('aiMemory');
    const chat = document.getElementById('assistantChat');
    if (chat) chat.innerHTML = '';
};

/* ==========================
   🎵 Música de fondo (integrada + visualizador)
========================== */
const songs = [
    { title: 'Canción 1', src: 'audio/cancion1.mp3' },
    { title: 'Canción 2', src: 'audio/cancion2.mp3' }
];

let current = 0;
const audio = new Audio(songs[current].src);
audio.crossOrigin = "anonymous"; // para audioCtx
let isPlaying = false;

const playPause = document.getElementById('playPause');
const nextSong = document.getElementById('nextSong');
const prevSong = document.getElementById('prevSong');
const volumeControl = document.getElementById('volumeControl');
const titleEl = document.getElementById('songTitle');

const progressBar = document.createElement('input');
progressBar.type = 'range';
progressBar.min = 0;
progressBar.max = 100;
progressBar.value = 0;
progressBar.id = 'progressBar';
const musicPlayer = document.getElementById('musicPlayer');
if (musicPlayer) musicPlayer.appendChild(progressBar);

const timeDisplay = document.createElement('span');
timeDisplay.style.marginLeft = '10px';
if (musicPlayer) musicPlayer.appendChild(timeDisplay);

function setupVisualizer() {
    if (!audioCtx && audio) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
    }
}

function playPauseMusic() {
    setupVisualizer();
    if (!isPlaying) {
        audio.play().catch(()=>{ /* autoplay puede bloquearse; el usuario debe interactuar */ });
        playPause && (playPause.textContent = '⏸️');
        isPlaying = true;
    } else {
        audio.pause();
        playPause && (playPause.textContent = '▶️');
        isPlaying = false;
    }
}
function changeSong(i) {
    current = (i + songs.length) % songs.length;
    audio.src = songs[current].src;
    titleEl && (titleEl.textContent = `Reproduciendo: ${songs[current].title}`);
    audio.play().catch(()=>{});
    playPause && (playPause.textContent = '⏸️');
    isPlaying = true;
}

if (playPause) playPause.onclick = playPauseMusic;
if (nextSong) nextSong.onclick = () => changeSong(current + 1);
if (prevSong) prevSong.onclick = () => changeSong(current - 1);
if (volumeControl) volumeControl.oninput = () => (audio.volume = volumeControl.value);

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const p = (audio.currentTime / audio.duration) * 100;
        progressBar.value = p;
        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
});
progressBar.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
titleEl && (titleEl.textContent = `Reproduciendo: ${songs[current].title}`);

/* ==========================
   🎵 Botón lateral: activar/pausar música de fondo
========================== */
function toggleBackgroundMusic() {
    // si no hay elemento de música, simplemente alterna play/pause
    playPauseMusic();
}

/* ==========================
   🔄 Integración visualizador con drawGalaxy
   (actualiza analyzer cada frame si existe)
========================== */
(function visualizerLoop() {
    // si hay analyzer y canvas, se alimenta drawGalaxy (ya usa analyzer)
    if (!analyser && audio && (audioCtx === undefined || audioCtx === null)) {
        // no hacer nada, setupVisualizer se llama cuando usuario interactúe
    }
    requestAnimationFrame(visualizerLoop);
})();

/* ==========================
   🧾 Inicializaciones finales
========================== */
// Asegurar que elementos opcionales no rompan
document.addEventListener('DOMContentLoaded', () => {
    // show profile if stored
    showProfilePreview();
    // If a saved chat exists load it
    loadChatHistory();
    // Set initial volume
    try { audio.volume = (volumeControl ? volumeControl.value : 0.5); } catch (e) {}
    // Attach youtube play from input if exists
    const ytInput = document.getElementById('youtubeLink');
    if (ytInput) ytInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') playYoutubeLink();
    });
});

console.log('✅ Galaxy X — script.js cargado y listo (música, videos, chat, IA).');
