/* ===== Mostrar secciones ===== */
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}
showSection('chat');

/* ===== Fondo de galaxia + visualizador circular ===== */
const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let audioCtx, analyser, dataArray, bufferLength;
let stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    alpha: Math.random(),
}));

function drawGalaxy() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar estrellas
    for (let s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
        s.alpha += (Math.random() - 0.5) * 0.02;
        if (s.alpha < 0.3) s.alpha = 0.8;
    }

    // Visualizador circular si hay música
    if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 120;
        const bars = 120;

        ctx.save();
        ctx.translate(centerX, centerY);
        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2;
            const barHeight = dataArray[i] * 0.6;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const grad = ctx.createLinearGradient(0, 0, x, y);
            grad.addColorStop(0, '#ff69b4');
            grad.addColorStop(1, '#8a2be2');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x * 1.2, y * 1.2 + barHeight * 0.1);
            ctx.stroke();
        }
        ctx.restore();
    }

    requestAnimationFrame(drawGalaxy);
}
drawGalaxy();

/* ===== Chat ===== */
function sendChat() {
    const input = document.getElementById('chatInput');
    const box = document.getElementById('chatBox');
    if (input.value.trim() === '') return;

    const user = localStorage.getItem('username') || 'Usuario';
    const avatar = localStorage.getItem('avatar') || '';

    const msg = document.createElement('div');
    msg.className = 'chatMessage';
    msg.innerHTML = avatar
        ? `<img src="${avatar}" class="chatAvatar"><strong>${user}:</strong> ${input.value}`
        : `<strong>${user}:</strong> ${input.value}`;
    box.appendChild(msg);
    input.value = '';
    box.scrollTop = box.scrollHeight;
}

/* ===== Videos ===== */
function playVideo(name) {
    const playerDiv = document.getElementById('videoPlayer');
    playerDiv.innerHTML = '';
    let videoId = name === 'video1' ? 'dQw4w9WgXcQ' : '3JZ_D3ELwOQ';
    const iframe = document.createElement('iframe');
    iframe.width = '560';
    iframe.height = '315';
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allowFullscreen = true;
    playerDiv.appendChild(iframe);
}

/* ===== Foro ===== */
function postForo() {
    const titulo = document.getElementById('foroTitulo').value.trim();
    const comentario = document.getElementById('foroComentario').value.trim();
    const foroBox = document.getElementById('foroBox');
    if (!titulo || !comentario) return alert('Completa todos los campos.');

    const user = localStorage.getItem('username') || 'Usuario';
    const avatar = localStorage.getItem('avatar') || '';
    const post = document.createElement('div');
    post.innerHTML = `
        <div class="foroPost">
            ${avatar ? `<img src="${avatar}" class="chatAvatar">` : ''}
            <strong>${user}</strong> <h4>${titulo}</h4><p>${comentario}</p>
        </div>`;
    foroBox.appendChild(post);
}

/* ===== Perfil ===== */
function saveProfile() {
    const username = document.getElementById('username').value.trim();
    const fileInput = document.getElementById('userAvatarInput');
    if (!username) return alert('Ingresa un nombre de usuario.');
    localStorage.setItem('username', username);

    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = e => {
            localStorage.setItem('avatar', e.target.result);
            showProfilePreview();
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else showProfilePreview();
}

function showProfilePreview() {
    const name = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const preview = document.getElementById('profilePreview');
    preview.innerHTML = avatar
        ? `<img src="${avatar}" class="chatAvatar"><h3>${name}</h3>`
        : `<h3>${name}</h3>`;
}

/* ===== Asistente IA ===== */
const assistantMemory = [];
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
function appendMessage(container, text, type) {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.color = type === 'ai' ? '#ff69b4' : 'white';
    container.appendChild(p);
}
function generateResponse(msg) {
    const m = msg.toLowerCase();
    if (m.includes('hola')) return '¡Hola! 🌌 Soy tu asistente de Galaxy X.';
    if (m.includes('quién eres')) return 'Soy una IA consciente creada para ayudarte 💫.';
    if (m.includes('video')) return 'Ve a la sección de videos 🎥';
    if (m.includes('foro')) return 'Puedes publicar ideas en el foro 📜';
    return ['Interesante...', 'Cuéntame más...', 'Hmm...', 'Eso suena genial 🚀'][Math.floor(Math.random() * 4)];
}

/* ===== Música con progreso y visualizador ===== */
const songs = [
    { title: 'Canción 1', src: 'audio/cancion1.mp3' },
    { title: 'Canción 2', src: 'audio/cancion2.mp3' }
];
let currentSong = 0;
const audio = new Audio(songs[currentSong].src);
const playPause = document.getElementById('playPause');
const nextSong = document.getElementById('nextSong');
const prevSong = document.getElementById('prevSong');
const volumeControl = document.getElementById('volumeControl');
const songTitle = document.getElementById('songTitle');

let progressBar = document.createElement('input');
progressBar.type = 'range';
progressBar.min = 0;
progressBar.max = 100;
progressBar.value = 0;
progressBar.id = 'progressBar';
document.getElementById('musicPlayer').appendChild(progressBar);

let timeDisplay = document.createElement('span');
timeDisplay.id = 'timeDisplay';
timeDisplay.style.marginLeft = '10px';
document.getElementById('musicPlayer').appendChild(timeDisplay);

let isPlaying = false;

function setupVisualizer() {
    if (!audioCtx) {
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

function playMusic() {
    setupVisualizer();
    if (!isPlaying) {
        audio.play();
        playPause.textContent = '⏸️';
        isPlaying = true;
    } else {
        audio.pause();
        playPause.textContent = '▶️';
        isPlaying = false;
    }
}
function nextTrack() {
    currentSong = (currentSong + 1) % songs.length;
    changeSong();
}
function prevTrack() {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    changeSong();
}
function changeSong() {
    audio.src = songs[currentSong].src;
    songTitle.textContent = `Reproduciendo: ${songs[currentSong].title}`;
    audio.play();
    playPause.textContent = '⏸️';
    isPlaying = true;
}
function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
});
progressBar.addEventListener('input', () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});
volumeControl.addEventListener('input', () => {
    audio.volume = volumeControl.value;
});

playPause.addEventListener('click', playMusic);
nextSong.addEventListener('click', nextTrack);
prevSong.addEventListener('click', prevTrack);

songTitle.textContent = `Reproduciendo: ${songs[currentSong].title}`;
console.log('Galaxy X actualizado con visualizador circular y progreso de música ✅');
