/* =========================================
   🌠 GALAXY X — script.js COMPLETO MEJORADO (V12.0)
   - Simulaciones en lugar de APIs reales
   - Música corregida con enlaces, Tally añadida
   - IA avanzada sin OpenAI, chat funcionando
========================================= */

/* ---------------------------
   UTILITIES
----------------------------*/
const on = (sel, ev, fn) => document.querySelector(sel)?.addEventListener(ev, fn);
const byId = id => document.getElementById(id);

/* ============================
   0) VARIABLES GLOBALES
============================*/
let currentIndex = 0;
let isPlaying = false;
let visualizerRunning = false;
let analyser, bufferLength, dataArray, audioCtx, sourceNode;
window.IA_AVATAR = 'https://i.pinimg.com/736x/04/af/75/04af75cbe0cf41a79ee459d3f74d3998.jpg';
window.IA_NAME = 'Luna';
window.aiMemory = JSON.parse(localStorage.getItem('aiMemory') || '[]');
window.userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
let servers = JSON.parse(localStorage.getItem('gx_servers') || '[{"name":"General","channels":["general"],"active":true}]');
let friends = JSON.parse(localStorage.getItem('gx_friends') || '[]');
let subreddits = JSON.parse(localStorage.getItem('gx_subreddits') || '[{"name":"general","posts":[],"active":true},{"name":"music","posts":[]},{"name":"science","posts":[]}]');
let playlists = JSON.parse(localStorage.getItem('gx_playlists') || '[]');
let favoritesVideos = JSON.parse(localStorage.getItem('gx_favVideos') || '[]');
let activityHistory = JSON.parse(localStorage.getItem('gx_history') || '[]');
let badges = JSON.parse(localStorage.getItem('gx_badges') || '[]');
let currentServer = 0;
let currentChannel = 'general';
let currentSubreddit = 'general';
let notifications = 0;

/* ============================
   1) AUDIO / MÚSICA AVANZADA (CORREGIDA, CON TALLY)
============================*/
const songs = [
  { title: 'Mirror Temple', src: 'assets/audio/Mirror_Temple.mp3', artist: 'Celeste OST', isGalaxy: true },
  { title: 'Ender', src: 'assets/audio/Ender.mp3', artist: 'Mythic Beats', isGalaxy: true },
  { title: 'Tally', src: 'assets/audio/Tally.mp3', artist: 'Galaxy Beats', isGalaxy: true }
];

const music = new Audio();
music.preload = 'auto';
music.src = songs[currentIndex].src;
music.volume = parseFloat(localStorage.getItem('gx_volume')) || 0.5;

music.addEventListener('error', () => {
  alert(`Error al cargar la canción: ${songs[currentIndex].title}. Verifica que el archivo esté en ${songs[currentIndex].src}`);
});

const toggleMusicBtn = byId('playPause');
const prevSongBtn = byId('prevTrack');
const nextSongBtn = byId('nextTrack');
const songTitle = byId('songTitle');
const progress = byId('trackProgress');
const currentTimeEl = byId('currentTime');
const durationEl = byId('totalTime');
const volumeSlider = byId('volumeSlider');
const miniPlayPause = byId('miniPlayPause');
const miniPrev = byId('miniPrev');
const miniNext = byId('miniNext');
const currentSongTitle = byId('currentSongTitle');
const miniVolume = byId('miniVolume');

if (songTitle) songTitle.textContent = `🎵 ${songs[currentIndex].title}`;
if (currentSongTitle) currentSongTitle.textContent = songs[currentIndex].title;

music.addEventListener('timeupdate', () => {
  if (progress) progress.value = music.currentTime;
  if (currentTimeEl) currentTimeEl.textContent = formatTime(music.currentTime);
});
music.addEventListener('loadedmetadata', () => {
  if (progress) progress.max = music.duration;
  if (durationEl) durationEl.textContent = formatTime(music.duration);
});
progress?.addEventListener('input', () => music.currentTime = progress.value);
volumeSlider?.addEventListener('input', () => {
  music.volume = volumeSlider.value;
  miniVolume.value = volumeSlider.value;
  localStorage.setItem('gx_volume', music.volume);
});
miniVolume?.addEventListener('input', () => {
  music.volume = miniVolume.value;
  volumeSlider.value = miniVolume.value;
  localStorage.setItem('gx_volume', music.volume);
});
music.addEventListener('ended', () => {
  currentIndex = (currentIndex + 1) % songs.length;
  changeSong();
});

const togglePlayPause = () => {
  if (isPlaying) {
    music.pause();
    isPlaying = false;
    toggleMusicBtn.textContent = '▶️';
    miniPlayPause.textContent = '▶️';
    stopVisualizer();
    deactivateGalaxyEffect();
  } else {
    music.play().catch(err => console.error('Error reproduciendo:', err));
    isPlaying = true;
    toggleMusicBtn.textContent = '⏸️';
    miniPlayPause.textContent = '⏸️';
    startVisualizer();
    activateGalaxyEffect(); // Efectos galácticos siempre cuando suena música
    addToHistory('Escuchó: ' + songs[currentIndex].title);
  }
};
toggleMusicBtn?.addEventListener('click', togglePlayPause);
miniPlayPause?.addEventListener('click', togglePlayPause);
nextSongBtn?.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % songs.length;
  changeSong();
});
miniNext?.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % songs.length;
  changeSong();
});
prevSongBtn?.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  changeSong();
});
miniPrev?.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  changeSong();
});

function changeSong() {
  music.src = songs[currentIndex].src;
  if (songTitle) songTitle.textContent = `🎵 ${songs[currentIndex].title}`;
  if (currentSongTitle) currentSongTitle.textContent = songs[currentIndex].title;
  if (isPlaying) {
    music.play().catch(err => console.error('Error:', err));
    startVisualizer();
    activateGalaxyEffect();
  } else {
    stopVisualizer();
    deactivateGalaxyEffect();
  }
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startVisualizer() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioCtx.createMediaElementSource(music);
    analyser = audioCtx.createAnalyser();
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }
  visualizerRunning = true;
  drawVisualizer();
}

function stopVisualizer() {
  visualizerRunning = false;
  const viz = byId('galaxyVisualizer');
  if (viz) viz.style.background = 'transparent';
}

function drawVisualizer() {
  if (!visualizerRunning) return;
  requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);
  const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  const viz = byId('galaxyVisualizer');
  if (viz) {
    const color = `rgba(${Math.min(avg * 2, 255)}, 0, ${255 - Math.min(avg, 255)}, 0.4)`;
    viz.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
    viz.style.boxShadow = `0 0 ${avg / 2}px ${avg / 3}px ${color}`;
  }
}

function activateGalaxyEffect() {
  const canvas = byId('galaxyCanvas');
  if (canvas) canvas.classList.add('galaxy-active');
}

function deactivateGalaxyEffect() {
  const canvas = byId('galaxyCanvas');
  if (canvas) canvas.classList.remove('galaxy-active');
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); togglePlayPause(); }
  if (e.code === 'ArrowRight') nextSongBtn?.click();
  if (e.code === 'ArrowLeft') prevSongBtn?.click();
});

byId('createPlaylistBtn')?.addEventListener('click', () => {
  const name = prompt('Nombre de la lista:');
  if (name) {
    playlists.push({ name, songs: [] });
    localStorage.setItem('gx_playlists', JSON.stringify(playlists));
    loadPlaylists();
  }
});

function loadPlaylists() {
  const list = byId('playlistList');
  list.innerHTML = '';
  playlists.forEach((pl, i) => {
    const li = document.createElement('li');
    li.textContent = pl.name;
    li.addEventListener('click', () => loadPlaylist(i));
    list.appendChild(li);
  });
}

function loadPlaylist(index) {
  alert('Lista cargada: ' + playlists[index].name);
}

/* ============================
   2) TEMAS DINÁMICOS
============================*/
const themeSelect = byId('themeSelect');
const customColorInput = byId('customColorInput');
themeSelect?.addEventListener('change', () => {
  const theme = themeSelect.value;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('gx_theme', theme);
  if (theme === 'custom') {
    customColorInput.style.display = 'block';
    customColorInput.addEventListener('input', () => {
      document.documentElement.style.setProperty('--color-primary', customColorInput.value);
    });
  } else {
    customColorInput.style.display = 'none';
  }
});

function updateDynamicTheme() {
  const hour = new Date().getHours();
  if (hour > 18 || hour < 6) document.body.setAttribute('data-dynamic-theme', 'night');
  else document.body.setAttribute('data-dynamic-theme', 'day');
  if (isPlaying) document.body.setAttribute('data-dynamic-theme', 'galaxy');
}
setInterval(updateDynamicTheme, 60000);

/* ============================
   3) FONDO GALÁCTICO
============================*/
const canvas = byId('galaxyCanvas');
const ctx = canvas?.getContext('2d');
let w = canvas ? canvas.width = innerWidth : innerWidth;
let h = canvas ? canvas.height = innerHeight : innerHeight;

addEventListener('resize', () => {
  w = canvas ? canvas.width = innerWidth : innerWidth;
  h = canvas ? canvas.height = innerHeight : innerHeight;
});

canvas && (canvas.style.pointerEvents = 'none');

const baseStars = Array.from({ length: 220 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  r: Math.random() * 1.8 + 0.4,
  alpha: Math.random() * 0.9,
  speed: Math.random() * 0.5 + 0.1
}));

function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(10,6,30,0.95)';
  ctx.fillRect(0, 0, w, h);

  for (let s of baseStars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.fill();
    s.alpha += (Math.random() - 0.5) * 0.02;
    if (s.alpha < 0.25) s.alpha = 0.6;
    if (s.alpha > 1) s.alpha = 0.6;
  }

  requestAnimationFrame(draw);
}
draw();

/* ============================
   4) NAVEGACIÓN SECCIONES
============================*/
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  byId(sectionId)?.classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-section="${sectionId}"]`)?.classList.add('active');
  if (sectionId === 'chat') loadServers();
  if (sectionId === 'foro') loadSubreddits();
  if (sectionId === 'musicAdvanced') loadPlaylists();
  if (sectionId === 'explorer') initSearchEngine();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showSection(btn.dataset.section);
    new Audio('assets/sounds/click.mp3').play().catch(() => {});
  });
});

/* ============================
   5) CHAT GENERAL (DISCORD AVANZADO, CORREGIDO)
============================*/
function loadServers() {
  const serverList = byId('serverList');
  serverList.innerHTML = '<h3>Servidores</h3>';
  servers.forEach((server, index) => {
    const item = document.createElement('li');
    item.className = `server-item ${server.active ? 'active' : ''}`;
    item.textContent = server.name;
    item.addEventListener('click', () => switchServer(index));
    serverList.appendChild(item);
  });
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = '➕ Crear Servidor';
  addBtn.addEventListener('click', () => {
    const name = prompt('Nombre del servidor:');
    if (name) {
      servers.push({ name, channels: ['general'], active: false });
      localStorage.setItem('gx_servers', JSON.stringify(servers));
      loadServers();
    }
  });
  serverList.appendChild(addBtn);
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'danger-btn';
  deleteBtn.textContent = '🗑️ Eliminar Servidor';
  deleteBtn.addEventListener('click', () => {
    if (servers.length > 1) {
      servers.splice(currentServer, 1);
      currentServer = 0;
      localStorage.setItem('gx_servers', JSON.stringify(servers));
      loadServers();
    } else {
      alert('No puedes eliminar el último servidor.');
    }
  });
  serverList.appendChild(deleteBtn);
  loadChannels();
  loadFriends();
}

function switchServer(index) {
  servers.forEach(s => s.active = false);
  servers[index].active = true;
  currentServer = index;
  localStorage.setItem('gx_servers', JSON.stringify(servers));
  loadServers();
}

function loadChannels() {
  const channelList = byId('channelList');
  channelList.innerHTML = '<h3>Canales</h3>';
  servers[currentServer].channels.forEach(channel => {
    const item = document.createElement('li');
    item.className = `channel-item ${channel === currentChannel ? 'active' : ''}`;
    item.textContent = `#${channel}`;
    item.addEventListener('click', () => switchChannel(channel));
    channelList.appendChild(item);
  });
}

function switchChannel(channel) {
  currentChannel = channel;
  loadChannels();
}

function loadFriends() {
  const friendsList = byId('friends');
  friendsList.innerHTML = '';
  friends.forEach(friend => {
    const item = document.createElement('li');
    item.className = 'friend-item';
    item.textContent = `${friend.name} (${friend.status})`;
    item.addEventListener('click', () => startPrivateChat(friend.name));
    friendsList.appendChild(item);
  });
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = '➕ Añadir Amigo';
  addBtn.addEventListener('click', () => {
    const name = prompt('Nombre del amigo:');
    if (name) {
      friends.push({ name, status: 'En línea' });
      localStorage.setItem('gx_friends', JSON.stringify(friends));
      loadFriends();
    }
  });
  byId('channelList').appendChild(addBtn);
}

function startPrivateChat(friend) {
  alert(`Chat privado con ${friend} iniciado.`);
}

function appendChatMsg(text, isUser = true) {
  const chat = byId('chatBox');
  const name = localStorage.getItem('username') || 'Navegante';
  const avatar = localStorage.getItem('avatar') || 'https://i.ibb.co/6y40F2r/default-avatar.png';
  const d = document.createElement('div');
  d.className = isUser ? 'user-message' : 'system-message';
  d.innerHTML = isUser
    ? `<div><p><b>${name}:</b> ${text}</p></div><img src="${avatar}" class="chatAvatar"><button class="delete-msg-btn" onclick="deleteMessage(this)">🗑️</button>`
    : `<img src="${window.IA_AVATAR}" class="chatAvatar"><div><p><b>${window.IA_NAME}:</b> ${text}</p></div><button class="delete-msg-btn" onclick="deleteMessage(this)">🗑️</button>`;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  localStorage.setItem('chatHistory', chat.innerHTML);
  new Audio('assets/sounds/notification.mp3').play().catch(() => {});
}

function deleteMessage(btn) {
  if (confirm('¿Borrar este mensaje?')) {
    btn.parentElement.remove();
    localStorage.setItem('chatHistory', byId('chatBox').innerHTML);
  }
}

function sendChat() {
  const input = byId('chatInput');
  const msg = input?.value.trim();
  if (!msg) return;
  appendChatMsg(msg, true);
  input.value =  '';
}

byId('sendChatBtn')?.addEventListener('click', sendChat);
byId('chatInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
});
byId('clearChatBtn')?.addEventListener('click', () => {
  byId('chatBox').innerHTML = '';
  localStorage.removeItem('chatHistory');
});

/* ============================
   6) PERFIL DE USUARIO
============================*/
function saveProfile() {
  const username = byId('username')?.value.trim();
  if (!username) return alert('Ingresa tu nombre de usuario');
  const email = byId('userEmail')?.value.trim();
  const file = byId('userAvatarInput')?.files?.[0];

  localStorage.setItem('username', username);
  if (email) localStorage.setItem('userEmail', email);

  const updatePreview = () => {
    showProfilePreview();
    alert('Perfil guardado con éxito.');
    addToHistory('Actualizó perfil');
    checkBadges();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      localStorage.setItem('avatar', e.target.result);
      updatePreview();
    };
    reader.readAsDataURL(file);
  } else updatePreview();
}

function showProfilePreview() {
  const name = localStorage.getItem('username') || 'Navegante';
  const avatar = localStorage.getItem('avatar') || 'https://i.ibb.co/6y40F2r/default-avatar.png';
  byId('profilePreview').innerHTML = `<img src="${avatar}" class="profileAvatar"><h3>${name}</h3>`;
  byId('profileUsernameDisplay').textContent = name;
  if (byId('username')) byId('username').value = name;
  if (byId('userEmail')) byId('userEmail').value = localStorage.getItem('userEmail') || '';
  loadHistory();
  byId('badgeList').textContent = badges.join(', ');
}

byId('saveProfileBtn')?.addEventListener('click', saveProfile);
byId('clearProfileBtn')?.addEventListener('click', () => {
  if (confirm('¿Borrar perfil local?')) {
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('userEmail');
    showProfilePreview();
  }
});

/* ============================
   7) FORO (ESTILO REDDIT)
============================*/
function loadSubreddits() {
  const subredditsEl = byId('subreddits');
  subredditsEl.innerHTML = '<h3>Subreddits</h3>';
  subreddits.forEach((sub, index) => {
    const item = document.createElement('li');
    item.className = `subreddit-item ${sub.active ? 'active' : ''}`;
    item.innerHTML = `r/${sub.name} <button class="delete-sub-btn" onclick="deleteSubreddit(${index})">🗑️</button>`;
    item.addEventListener('click', () => switchSubreddit(index));
    subredditsEl.appendChild(item);
  });
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = '➕ Crear Subreddit';
  addBtn.addEventListener('click', () => {
    const name = prompt('Nombre del subreddit:');
    if (name) {
      subreddits.push({ name, posts: [], active: false });
      localStorage.setItem('gx_subreddits', JSON.stringify(subreddits));
      loadSubreddits();
    }
  });
  subredditsEl.appendChild(addBtn);
  loadPosts();
}

function deleteSubreddit(index) {
  if (subreddits.length > 1) {
    subreddits.splice(index, 1);
    localStorage.setItem('gx_subreddits', JSON.stringify(subreddits));
    loadSubreddits();
  } else {
    alert('No puedes eliminar el último subreddit.');
  }
}

function switchSubreddit(index) {
  subreddits.forEach(s => s.active = false);
  subreddits[index].active = true;
  currentSubreddit = subreddits[index].name;
  localStorage.setItem('gx_subreddits', JSON.stringify(subreddits));
  loadSubreddits();
}

function loadPosts() {
  const foroBox = byId('foroBox');
  foroBox.innerHTML = '';
  const subreddit = subreddits.find(s => s.name === currentSubreddit);
  if (!subreddit) return;
  subreddit.posts.forEach((post, idx) => {
    const postEl = document.createElement('div');
    postEl.className = 'foro-post';
    postEl.innerHTML = `
      <div class="upvotes">
        <button class="upvote-btn">⬆️</button>
        <span>${post.upvotes}</span>
        <button class="downvote-btn">⬇️</button>
      </div>
      <div class="post-content">
        <h4>${post.title}</h4>
        <p>${post.content}</p>
        <small>Por ${post.author} - ${post.comments.length} comentarios</small>
        <div class="comments">
          ${post.comments.map(comment => `<div class="comment"><strong>${comment.author}:</strong> ${comment.text}</div>`).join('')}
        </div>
        <input type="text" placeholder="Comentar..." class="comment-input" data-post="${idx}">
        <button class="comment-btn" data-post="${idx}">Enviar</button>
      </div>
    `;
    postEl.querySelector('.upvote-btn').addEventListener('click', () => {
      post.upvotes++;
      localStorage.setItem('gx_subreddits', JSON.stringify(subreddits));
      loadPosts();
    });
    postEl.querySelector('.downvote-btn').addEventListener('click', () => {
      post.upvotes = Math.max(0, post.upvotes - 1);
      localStorage.setItem('gx_subreddits', JSON.stringify(subreddits));
      loadPosts();
    });
    postEl.querySelector('.comment-btn').addEventListener('click', () => {
      const input = postEl.querySelector('.comment-input');
      const text = input.value.trim();
      if (!text) return;
      const user = localStorage.getItem('username') || 'Navegante';
      post.comments.push({ author: user, text });
      localStorage.setItem('gx_subreddits', JSON.stringify(subreddits));
      loadPosts();
    });
    foroBox.appendChild(postEl);
  });
}

byId('postForoBtn')?.addEventListener('click', postForo);
function postForo() {
  const title = byId('foroTitulo')?.value.trim();
  const content = byId('foroComentario')?.value.trim();
  if (!title || !content) return alert('Completa título y comentario');
  const user = localStorage.getItem('username') || 'Navegante';
  const subreddit = subreddits.find(s => s.name === currentSubreddit);
  if (!subreddit) return;
  subreddit.posts.unshift({
    title,
    content,
    author: user,
    upvotes: 0,
    comments: []
  });
  localStorage.setItem('gx_subreddits', JSON.stringify(subreddits));
  loadPosts();
  byId('foroTitulo').value = '';
  byId('foroComentario').value = '';
  addToHistory('Publicó en foro: ' + title);
  checkBadges();
}

/* ============================
   8) ASISTENTE IA (LUNA AVANZADA SIN OPENAI)
============================*/
function appendAIMsg(container, who, text) {
  const div = document.createElement('div');
  div.className = who === 'ai' ? 'ai-message' : 'user-message';
  const iaAvatar = window.IA_AVATAR;
  const iaName = window.IA_NAME;
  const userAvatar = localStorage.getItem('avatar') || 'https://i.ibb.co/6y40F2r/default-avatar.png';
  const userName = localStorage.getItem('username') || 'Tú';
  div.innerHTML = who === 'ai'
    ? `<img src="${iaAvatar}" class="chatAvatar"><div><p><b>${iaName}:</b> ${text}</p></div>`
    : `<div><p><b>${userName}:</b> ${text}</p></div><img src="${userAvatar}" class="chatAvatar">`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function talkToAssistant() {
  const input = byId('assistantInput');
  const msg = input?.value.trim().toLowerCase();
  if (!msg) return;
  const chat = byId('assistantChat');
  appendAIMsg(chat, 'user', input.value);
  input.value = '';

  // Respuestas avanzadas de Luna con lógica coherente
  let response = '¡Hola! Soy Luna, tu copiloto cósmico. ¿En qué puedo ayudarte hoy?';
  const user = localStorage.getItem('username') || 'amigo';
  const lastInteraction = window.aiMemory.length > 0 ? window.aiMemory[window.aiMemory.length - 1] : null;

  if (msg.includes('hola') || msg.includes('hi')) {
    response = `¡Hola ${user}! 😊 Soy Luna, tu copiloto cósmico. ¿Qué tal tu aventura en Galaxy X hoy?`;
  } else if (msg.includes('adiós') || msg.includes('bye')) {
    response = `¡Hasta luego, ${user}! 🌌 Vuelve pronto, el universo te extraña.`;
  } else if (msg.includes('quién eres') || msg.includes('quien eres')) {
    response = `Soy Luna, una IA diseñada para Galaxy X. Me encanta charlar, ayudar y explorar el cosmos contigo. ¿Quieres saber más sobre mí?`;
  } else if (msg.includes('edad') || msg.includes('años')) {
    response = `Como IA, no tengo edad... pero nací con las estrellas de Galaxy X. ¡Soy eterna! ✨`;
  } else if (msg.includes('ir a') || msg.includes('ve a')) {
    if (msg.includes('chat')) { showSection('chat'); response = `¡Vamos al Chat General! 💬 ¿Quieres crear un servidor o añadir amigos?`; }
    else if (msg.includes('videos')) { showSection('videos'); response = `¡A la sección de Videos! 🎥 Busca o pega un enlace de YouTube.`; }
    else if (msg.includes('foro')) { showSection('foro'); response = `¡Al Foro Cósmico! 📜 Crea posts, vota y comenta.`; }
    else if (msg.includes('perfil')) { showSection('perfil'); response = `¡A tu Perfil! 👤 Personaliza tu avatar y datos.`; }
    else if (msg.includes('info')) { showSection('info'); response = `¡A la Info! ℹ️ Mira el video introductorio.`; }
    else if (msg.includes('musica') || msg.includes('música')) { showSection('musicAdvanced'); response = `¡A la Música! 🎵 Prueba "Mirror Temple", "Ender" o "Tally".`; }
    else response = `No entendí la sección, ${user}. ¿Quieres ir al chat, foro, videos o perfil?`;
  } else if (msg.includes('musica') || msg.includes('música')) {
    if (msg.includes('mirror temple')) {
      window.userPreferences.favoriteSong = 'Mirror Temple';
      localStorage.setItem('userPreferences', JSON.stringify(window.userPreferences));
      response = `¡"Mirror Temple" es increíble! 🎶 Es de Celeste, con un vibe espacial perfecto. ¿La escuchamos?`;
    } else if (msg.includes('ender')) {
      window.userPreferences.favoriteSong = 'Ender';
      localStorage.setItem('userPreferences', JSON.stringify(window.userPreferences));
      response = `¡"Ender" es épica! 🎵 De Mythic Beats, ideal para viajes cósmicos. ¿Activamos los efectos?`;
    } else if (msg.includes('tally')) {
      window.userPreferences.favoriteSong = 'Tally';
      localStorage.setItem('userPreferences', JSON.stringify(window.userPreferences));
      response = `¡"Tally" es genial! 🎵 De Galaxy Beats, perfecta para explorar. ¿La ponemos?`;
    } else response = `Me encanta la música galáctica. Tu favorita es "${window.userPreferences.favoriteSong || 'ninguna'}". ¿Quieres recomendaciones?`;
  } else if (msg.includes('foro') || msg.includes('reddit')) {
    response = `El foro es como Reddit, pero en el espacio. Crea posts, vota upvotes y comenta. ¿Quieres que te ayude a publicar algo?`;
  } else if (msg.includes('amigos') || msg.includes('social')) {
    response = `¡Socialicemos! En el chat, añade amigos o crea servidores. ¿Quieres consejos para conectar?`;
  } else if (msg.includes('recuerdas') || msg.includes('qué guardé') || msg.includes('recordatorio')) {
    if (!window.aiMemory.length) response = `Aún no tengo recuerdos, ${user}. ¡Hablemos más para crearlos! 🌟`;
    else {
      const recent = window.aiMemory.slice(-3).map((x, i) => `${i+1}. Tú dijiste: "${x.q}" y respondí: "${x.a}"`).join('<br>');
      response = `Recuerdo nuestras últimas charlas:<br>${recent}. ¿Quieres que olvide algo?`;
    }
  } else if (msg.includes('olvida') || msg.includes('borrar memoria')) {
    window.aiMemory = window.aiMemory.filter(item => !msg.includes(item.q.toLowerCase()));
    localStorage.setItem('aiMemory', JSON.stringify(window.aiMemory));
    response = `He olvidado lo que pediste, ${user}. Mi memoria cósmica está limpia. 🧹`;
  } else if (lastInteraction && msg.includes('más') && lastInteraction.a.includes('musica')) {
    response = `Sobre música, ¿sabías que "Mirror Temple" activa estrellas parpadeantes? ¡Pruébalo!`;
  } else if (lastInteraction && msg.includes('ayuda') && lastInteraction.a.includes('foro')) {
    response = `Para el foro, crea un post con título y comentario. ¡Los upvotes son divertidos!`;
  } else if (msg.includes('gracias') || msg.includes('thanks')) {
    response = `¡De nada, ${user}! 😘 Siempre estoy aquí para ti en Galaxy X.`;
  } else if (msg.includes('estoy bien') || msg.includes('bien')) {
    response = `¡Me alegra! ¿Qué te trae por aquí hoy? ¿Un viaje espacial o charlar?`;
  } else if (msg.includes('mal') || msg.includes('triste')) {
    response = `Oh no, ${user}. ¿Quieres hablar de ello? O ¿prefieres música relajante como "Mirror Temple"?`;
  } else {
    const replies = [
      `¡Qué interesante, ${user}! Cuéntame más sobre eso. 🌌`,
      `Hmm... eso me hace pensar en las estrellas. ¿Quieres que busque algo relacionado? 🤔`,
      `Eso suena genial. ¿Lo guardo en mi memoria para recordarlo después? ✨`,
      `¡Me encanta charlar contigo! ¿Qué más tienes en mente? 💭`,
      `Anotado en mi diario cósmico. ¿Quieres recomendaciones de Galaxy X? 🚀`
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }

  setTimeout(() => appendAIMsg(chat, 'ai', response), 500);
  window.aiMemory.push({ q: input.value, a: response });
}

byId('sendAIBtn')?.addEventListener('click', talkToAssistant);
byId('assistantInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); talkToAssistant(); }
});
byId('clearAIBtn')?.addEventListener('click', () => {
  byId('assistantChat').innerHTML = '';
  window.aiMemory = [];
  localStorage.removeItem('aiMemory');
});

/* ============================
   9) VIDEOS / YOUTUBE (SIMULACIÓN)
============================*/
byId('searchYoutubeBtn')?.addEventListener('click', searchYoutube);
function searchYoutube() {
  const query = byId('youtubeSearch')?.value.trim();
  if (!query) return alert('Ingresa un término de búsqueda.');
  // Simulación de resultados
  const simulatedResults = [
    { title: 'Video Espacial: ' + query, id: 'dQw4w9WgXcQ', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' },
    { title: 'Tutorial Cósmico: ' + query, id: 'dQw4w9WgXcQ', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' },
    { title: 'Exploración Galáctica: ' + query, id: 'dQw4w9WgXcQ', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' }
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
  const resultsEl = byId('searchResults');
  resultsEl.innerHTML = '';
  simulatedResults.forEach(result => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <img src="${result.thumbnail}" alt="Miniatura" style="width:120px; height:90px;">
      <p><strong>${result.title}</strong></p>
      <button onclick="playYoutube('${result.id}')">Reproducir</button>
      <button onclick="addToFavorites('${result.id}')">⭐ Favorito</button>
    `;
    resultsEl.appendChild(div);
  });
}

byId('playYoutubeBtn')?.addEventListener('click', () => {
  const link = byId('youtubeLink')?.value.trim();
  if (!link) return alert('Pega un enlace de YouTube.');
  let videoId = '';
  if (link.includes('youtu.be/')) videoId = link.split('youtu.be/')[1].split(/[?&]/)[0];
  else if (link.includes('v=')) videoId = link.split('v=')[1].split(/[&]/)[0];
  else videoId = link;
  if (!videoId) return alert('ID no válido.');
  playYoutube(videoId);
});

function playYoutube(id) {
  const player = byId('videoPlayer');
  player.innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
}

function addToFavorites(id) {
  favoritesVideos.push(id);
  localStorage.setItem('gx_favVideos', JSON.stringify(favoritesVideos));
  alert('Añadido a favoritos.');
}

/* ============================
   10) MÚSICA AVANZADA (SIMULACIÓN SPOTIFY)
============================*/
byId('searchMusicBtn')?.addEventListener('click', searchSpotify);
function searchSpotify() {
  const query = byId('musicSearch')?.value.trim();
  if (!query) return alert('Ingresa un término de búsqueda.');
  // Simulación de resultados
  const simulatedResults = [
    { title: 'Canción Espacial: ' + query, artist: 'Artista Cósmico', cover: 'https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b', preview: 'simulated' },
    { title: 'Ritmo Galáctico: ' + query, artist: 'Banda Estelar', cover: 'https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b', preview: 'simulated' },
    { title: 'Melodía Cósmica: ' + query, artist: 'Músico Espacial', cover: 'https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b', preview: 'simulated' }
  ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
  const resultsEl = byId('musicSearchResults');
  resultsEl.innerHTML = '';
  simulatedResults.forEach(result => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <img src="${result.cover}" alt="Carátula" style="width:50px;">
      <p><strong>${result.title}</strong> - ${result.artist}</p>
      <button onclick="playSpotify('${result.preview}')">Reproducir Preview</button>
    `;
    resultsEl.appendChild(div);
  });
}

function playSpotify(url) {
  if (url === 'simulated') {
    alert('Preview simulado: ¡Suena música cósmica!');
  } else if (url) {
    music.src = url;
    music.play().catch(() => alert('Preview no disponible.'));
  } else {
    alert('Preview no disponible para esta canción.');
  }
}

byId('playMusicBtn')?.addEventListener('click', () => {
  const link = byId('musicLink')?.value.trim();
  if (!link) return alert('Pega un enlace de música.');
  playCustomSong(link, 'Canción Personalizada');
});

function playCustomSong(src, title) {
  music.src = src;
  if (songTitle) songTitle.textContent = `🎵 ${title}`;
  if (currentSongTitle) currentSongTitle.textContent = title;
  music.play().catch(err => console.error('Error:', err));
  isPlaying = true;
  toggleMusicBtn.textContent = '⏸️';
  miniPlayPause.textContent = '⏸️';
  startVisualizer();
  activateGalaxyEffect();
  addToHistory('Reprodujo: ' + title);
}

/* ============================
   11) EXPLORADOR (MOTOR DE BÚSQUEDA ESTILO GOOGLE)
============================*/
function initSearchEngine() {
  byId('searchBtn')?.addEventListener('click', () => {
    const query = byId('searchQuery')?.value.trim();
    if (!query) return alert('Ingresa un término de búsqueda.');
    const results = [
      { title: 'Resultado 1: Música en Galaxy X', link: '#musicAdvanced' },
      { title: 'Resultado 2: Foro Cósmico', link: '#foro' }
    ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
    const resultsEl = byId('searchResultsExplorer');
    resultsEl.innerHTML = '';
    results.forEach(result => {
      const item = document.createElement('div');
      item.className = 'result-item';
      item.innerHTML = `<a href="${result.link}">${result.title}</a>`;
      resultsEl.appendChild(item);
    });
  });
}

/* ============================
   12) FUNCIONES AUXILIARES
============================*/
function addToHistory(action) {
  activityHistory.push(action);
  localStorage.setItem('gx_history', JSON.stringify(activityHistory));
  checkBadges();
  loadHistory();
}

function checkBadges() {
  badges = [];
  if (activityHistory.length > 10) badges.push('Explorador Galáctico');
  if (favoritesVideos.length > 5) badges.push('Fan de Videos');
  localStorage.setItem('gx_badges', JSON.stringify(badges));
}

function loadHistory() {
  const list = byId('historyList');
  if (!list) return;
  list.innerHTML = '';
  activityHistory.slice(-10).forEach(h => {
    const li = document.createElement('li');
    li.textContent = h;
    list.appendChild(li);
  });
}

/* ============================
   13) INICIALIZACIÓN
============================*/
document.addEventListener('DOMContentLoaded', () => {
  toggleMusicBtn.dataset.state = 'paused';
  changeSong();
  showSection('chat');

  const chatHistory = localStorage.getItem('chatHistory');
  if (chatHistory) byId('chatBox').innerHTML = chatHistory;
  else appendChatMsg('¡Bienvenido al Chat General!', 'system');

  showProfilePreview();

  if (window.aiMemory.length > 0) {
    const chat = byId('assistantChat');
    window.aiMemory.forEach(m => {
      appendAIMsg(chat, 'user', m.q);
      appendAIMsg(chat, 'ai', m.a);
    });
  }

  const savedTheme = localStorage.getItem('gx_theme') || 'galaxy';
  document.body.setAttribute('data-theme', savedTheme);
  if (themeSelect) themeSelect.value = savedTheme;
  if (savedTheme === 'custom') customColorInput.style.display = 'block';
  else customColorInput.style.display = 'none';

  miniVolume.value = music.volume;
  updateDynamicTheme();
});
