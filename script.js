/* ==========================
   🌌 SISTEMA DE SECCIONES
========================== */
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}
showSection('chat');

/* ==========================
   ✨ FONDO GALÁCTICO
========================== */
const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

const stars = Array.from({ length: 250 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    alpha: Math.random()
}));

function drawGalaxy() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
        s.alpha += (Math.random()-0.5)*0.02;
        if(s.alpha < 0.3) s.alpha = 0.8;
    }
    requestAnimationFrame(drawGalaxy);
}
drawGalaxy();

/* ==========================
   💬 CHAT TIPO DISCORD
========================== */
function appendChatMsg(text) {
    const chat = document.getElementById('chatBox');
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
    const msg = input.value.trim();
    if(!msg) return;

    const user = localStorage.getItem('username') || 'Usuario';
    appendChatMsg(`<b>${user}:</b> ${msg}`);
    input.value = '';
    saveChatHistory();
}

document.getElementById('clearChatBtn').onclick = () => {
    document.getElementById('chatBox').innerHTML = '';
    localStorage.removeItem('chatHistory');
};
document.getElementById('saveChatBtn').onclick = saveChatHistory;
document.getElementById('loadChatBtn').onclick = loadChatHistory;
loadChatHistory();

function saveChatHistory() {
    localStorage.setItem('chatHistory', document.getElementById('chatBox').innerHTML);
}
function loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if(saved) document.getElementById('chatBox').innerHTML = saved;
}

/* ==========================
   🎥 VIDEOS
========================== */
function playVideo(name) {
    const player = document.getElementById('videoPlayer');
    player.innerHTML = '';
    const id = name==='video1'?'dQw4w9WgXcQ':'3JZ_D3ELwOQ';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}`;
    iframe.width = 560;
    iframe.height = 315;
    iframe.allowFullscreen = true;
    player.appendChild(iframe);
}

/* ==========================
   🧵 FORO
========================== */
function postForo() {
    const titulo = document.getElementById('foroTitulo').value.trim();
    const comentario = document.getElementById('foroComentario').value.trim();
    if(!titulo||!comentario) return alert('Completa todos los campos.');
    
    const foroBox = document.getElementById('foroBox');
    const user = localStorage.getItem('username') || 'Usuario';
    const avatar = localStorage.getItem('avatar') || '';

    const post = document.createElement('div');
    post.className = 'foroPost';
    post.innerHTML = `
        ${avatar?`<img src="${avatar}" class="chatAvatar">`:''}
        <strong>${user}</strong>
        <h4>${titulo}</h4>
        <p>${comentario}</p>
    `;
    foroBox.appendChild(post);

    document.getElementById('foroTitulo').value = '';
    document.getElementById('foroComentario').value = '';
}

/* ==========================
   👤 PERFIL
========================== */
function saveProfile() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const file = document.getElementById('userAvatarInput').files[0];

    if(!username) return alert('Ingresa tu nombre.');
    localStorage.setItem('username', username);
    localStorage.setItem('userEmail', email);

    if(file){
        const reader = new FileReader();
        reader.onload = e => {
            localStorage.setItem('avatar', e.target.result);
            showProfilePreview();
        };
        reader.readAsDataURL(file);
    } else showProfilePreview();
}
function showProfilePreview() {
    const name = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const preview = document.getElementById('profilePreview');
    preview.innerHTML = avatar
        ? `<img src="${avatar}" class="profileAvatar"><h3>${name}</h3>`
        : `<h3>${name}</h3>`;
    updateHeaderProfile();
}
function updateHeaderProfile() {
    const area = document.getElementById('accountStatus');
    const name = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    if(name) area.innerHTML = avatar
        ? `<img src="${avatar}" class="miniAvatar"><span>${name}</span>`
        : `<span>${name}</span>`;
}
function clearProfile() {
    if(confirm('¿Borrar tu perfil local?')){
        localStorage.removeItem('username');
        localStorage.removeItem('avatar');
        localStorage.removeItem('userEmail');
        document.getElementById('profilePreview').innerHTML = '';
        updateHeaderProfile();
    }
}
document.getElementById('saveProfileBtn').onclick = saveProfile;
document.getElementById('clearProfileBtn').onclick = clearProfile;
showProfilePreview();

/* ==========================
   🤖 ASISTENTE IA (SOLO EN SU CANAL)
========================== */
let aiMemory = JSON.parse(localStorage.getItem('aiMemory')||'[]');

function talkToAssistant() {
    const input = document.getElementById('assistantInput');
    const msg = input.value.trim();
    if(!msg) return;

    const chat = document.getElementById('assistantChat');
    appendAIMsg(chat, 'user', msg);

    const reply = aiThink(msg);
    appendAIMsg(chat, 'ai', reply);

    aiMemory.push({q: msg, a: reply});
    localStorage.setItem('aiMemory', JSON.stringify(aiMemory));
    input.value = '';
    chat.scrollTop = chat.scrollHeight;
}

function appendAIMsg(chat, who, text){
    const div = document.createElement('div');
    div.className = who==='ai' ? 'ai-message' : 'user-message';
    const avatar = who==='ai'
        ? 'https://i.pinimg.com/1200x/7e/56/05/7e5605d304c272bd1c52fd26517f0803.jpg'
        : localStorage.getItem('avatar') || '';
    div.innerHTML = `${avatar ? `<img src="${avatar}" class="chatAvatar">` : ''}<p>${text}</p>`;
    chat.appendChild(div);
}

function aiThink(msg){
    const m = msg.toLowerCase();
    const user = localStorage.getItem('username') || 'amigo';
    if(m.includes('hola')) return `¡Hola ${user}! 🌠`;
    if(m.includes('quién eres')) return 'Soy Galaxy IA, tu asistente cósmico 🚀';
    if(m.includes('nombre')) return `Tu nombre registrado es ${user}.`;
    if(m.includes('video')) return 'Vamos a la sección de Videos 🎥';
    if(m.includes('foro')) return 'Explora el Foro 📜';
    if(m.includes('gracias')) return '¡De nada! 💫';
    if(m.includes('adiós')) return 'Hasta pronto 👋';
    if(m.includes('ir a')){
        if(m.includes('chat')) showSection('chat');
        if(m.includes('videos')) showSection('videos');
        if(m.includes('foro')) showSection('foro');
        if(m.includes('perfil')) showSection('perfil');
        return 'Te llevé a la sección que pediste 😉';
    }
    const replies = [
        'Interesante... cuéntame más.',
        'Hmm... eso me hace pensar 🤔',
        'Eso suena genial 🌌',
        'Cuéntame algo más de eso 💭',
        'Buena idea, ¿quieres que lo recuerde?',
        'Anotado en mi memoria cósmica ✨'
    ];
    return replies[Math.floor(Math.random()*replies.length)];
}

document.getElementById('clearAIBtn').onclick = () => {
    if(confirm('¿Borrar memoria de la IA?')){
        aiMemory=[];
        localStorage.removeItem('aiMemory');
        document.getElementById('assistantChat').innerHTML='';
    }
};

/* ==========================
   🎵 MÚSICA
========================== */
const songs = [{title:'Canción 1',src:'audio/cancion1.mp3'},{title:'Canción 2',src:'audio/cancion2.mp3'}];
let current = 0;
const audio = new Audio(songs[current].src);
const playPause = document.getElementById('playPause');
const nextSong = document.getElementById('nextSong');
const prevSong = document.getElementById('prevSong');
const volumeControl = document.getElementById('volumeControl');
const title = document.getElementById('songTitle');

const progressBar = document.createElement('input');
progressBar.type='range'; progressBar.min=0; progressBar.max=100; progressBar.value=0;
document.getElementById('musicPlayer').appendChild(progressBar);
const timeDisplay=document.createElement('span'); timeDisplay.style.marginLeft='10px';
document.getElementById('musicPlayer').appendChild(timeDisplay);

let isPlaying=false;
function setupVisualizer(){
    if(!audioCtx){
        audioCtx = new (window.AudioContext||window.webkitAudioContext)();
        const src=audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        bufferLength=analyser.frequencyBinCount;
        dataArray=new Uint8Array(bufferLength);
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
    }
}
function playPauseMusic(){
    setupVisualizer();
    if(!isPlaying){audio.play(); playPause.textContent='⏸️'; isPlaying=true;}
    else{audio.pause(); playPause.textContent='▶️'; isPlaying=false;}
}
function changeSong(i){
    current=(i+songs.length)%songs.length;
    audio.src=songs[current].src;
    title.textContent=`Reproduciendo: ${songs[current].title}`;
    audio.play(); playPause.textContent='⏸️'; isPlaying=true;
}
playPause.onclick=playPauseMusic;
nextSong.onclick=()=>changeSong(current+1);
prevSong.onclick=()=>changeSong(current-1);
volumeControl.oninput=()=>audio.volume=volumeControl.value;
audio.addEventListener('timeupdate',()=>{
    if(audio.duration){
        const p=(audio.currentTime/audio.duration)*100;
        progressBar.value=p;
        timeDisplay.textContent=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
});
progressBar.addEventListener('input',()=>{audio.currentTime=(progressBar.value/100)*audio.duration;});
function formatTime(sec){const m=Math.floor(sec/60);const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`;}
title.textContent=`Reproduciendo: ${songs[current].title}`;

console.log('✅ Galaxy X actualizado — Chat normal + IA canal propio + Perfil + Música listo');
