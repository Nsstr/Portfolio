const projectCards = document.querySelectorAll('.project-card');
const modal = document.getElementById('project-modal');
const closeButton = modal.querySelector('.close-button');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const mainMediaContainer = document.getElementById('modal-main-image');
const gallery = document.getElementById('modal-images');

let autoSlideTimeout = null;
let ytPlayer = null;               // instancia actual del reproductor YT
let ytApiReadyPromise = null;      // promesa para cargar la API una sola vez

// ---- Carga dinámica de la API de YouTube (una sola vez) ----
function loadYouTubeAPI() {
  if (ytApiReadyPromise) return ytApiReadyPromise;
  ytApiReadyPromise = new Promise((resolve) => {
    if (window.YT && typeof YT.Player === 'function') return resolve();
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
  return ytApiReadyPromise;
}

// ---- Utils ----
function extractYouTubeID(url) {
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function clearTimersAndPlayers() {
  clearTimeout(autoSlideTimeout);
  autoSlideTimeout = null;
  if (ytPlayer && typeof ytPlayer.destroy === 'function') {
    try { ytPlayer.destroy(); } catch {}
  }
  ytPlayer = null;
}

function goNext(index, list) {
  const nextIndex = (index + 1) % list.length;
  setMainMedia(nextIndex, list);
}

// ---- Core ----
function setMainMedia(index, mediaList) {
  // UI: marcar miniatura seleccionada
  const thumbs = gallery.children;
  [...thumbs].forEach((el, i) => el.classList.toggle('selected', i === index));

  // reset
  clearTimersAndPlayers();
  mainMediaContainer.innerHTML = '';

  const media = mediaList[index];

  if (media.type === 'image') {
    const img = document.createElement('img');
    img.src = media.url;
    img.alt = `media ${index + 1}`;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    mainMediaContainer.appendChild(img);

    // esperar 4s y pasar
    autoSlideTimeout = setTimeout(() => goNext(index, mediaList), 4000);

  } else {
    const ytId = extractYouTubeID(media.url);

    // ---- Caso YouTube ----
    if (ytId) {
      const playerDiv = document.createElement('div');
      const playerId = `yt-player-${Date.now()}`;
      playerDiv.id = playerId;
      playerDiv.style.width = "100%";
      playerDiv.style.height = "100%";
      mainMediaContainer.appendChild(playerDiv);

      loadYouTubeAPI().then(() => {
        ytPlayer = new YT.Player(playerId, {
          videoId: ytId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            disablekb: 1,
            playsinline: 1
          },
          events: {
            onReady: (e) => {
              try { e.target.mute(); } catch {}
              try { e.target.playVideo(); } catch {}
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.ENDED) {
                goNext(index, mediaList);
              }
            }
          }
        });
      });

    } else {
      // ---- Caso video no-YouTube (archivo propio, etc.) ----
      const vid = document.createElement('video');
      vid.src = media.url;
      vid.muted = true;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.controls = false;
      vid.style.width = "100%";
      vid.style.height = "100%";
      vid.style.objectFit = "contain";
      mainMediaContainer.appendChild(vid);

      vid.addEventListener('ended', () => goNext(index, mediaList));
      // fallback: si no puede reproducir, pasar al siguiente tras 6s
      vid.addEventListener('error', () => {
        autoSlideTimeout = setTimeout(() => goNext(index, mediaList), 6000);
      });
    }
  }
}

// ---- Apertura de modal y armado de lista ----
projectCards.forEach(card => {
  card.addEventListener('click', () => {
    clearTimersAndPlayers();

    const title = card.getAttribute('data-title') || '';
    const description = card.getAttribute('data-description') || '';
    const images = (card.getAttribute('data-images') || '').split(',').map(s => s.trim()).filter(Boolean);
    const videos = (card.getAttribute('data-videos') || '').split(',').map(v => v.trim()).filter(Boolean);

    modalTitle.textContent = title;
    modalDescription.textContent = description;
    mainMediaContainer.innerHTML = '';
    gallery.innerHTML = '';

    // Mezclar imágenes y videos
    const mediaList = [
      ...images.map(url => ({ type: 'image', url })),
      ...videos.map(url => ({ type: 'video', url }))
    ];

    // Miniaturas
    mediaList.forEach((media, idx) => {
      let thumb;
      if (media.type === 'image') {
        thumb = document.createElement('img');
        thumb.src = media.url;
        thumb.alt = `${title} img ${idx + 1}`;
      } else {
        const id = extractYouTubeID(media.url);
        thumb = document.createElement('img');
        thumb.src = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
        thumb.alt = `${title} video ${idx + 1}`;
      }
      thumb.classList.add('thumb-media');
      if (idx === 0) thumb.classList.add('selected');
      thumb.addEventListener('click', () => setMainMedia(idx, mediaList));
      gallery.appendChild(thumb);
    });

    // Mostrar primero
    if (mediaList.length > 0) setMainMedia(0, mediaList);
    modal.style.display = 'flex';
  });
});

// ---- Cierre modal y limpieza ----
closeButton.addEventListener('click', () => {
  clearTimersAndPlayers();
  modal.style.display = 'none';
});
window.addEventListener('click', e => {
  if (e.target === modal) {
    clearTimersAndPlayers();
    modal.style.display = 'none';
  }
});

// ===========================
// Modal de INFO
// ===========================
const infoButtons = document.querySelectorAll('.info-btn');
const infoModal = document.getElementById('info-modal');
const infoTitle = document.getElementById('info-modal-title');
const infoText = document.getElementById('info-modal-text');
const infoClose = document.querySelector('.close-info');

infoButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // evitar abrir modal de imágenes
    const card = btn.closest('.project-card');
    infoTitle.textContent = card.getAttribute('data-title') || "Info";
    infoText.textContent = card.getAttribute('data-info') || "Sin información adicional.";
    infoModal.style.display = 'flex';
  });
});
infoClose.addEventListener('click', () => { infoModal.style.display = 'none'; });
window.addEventListener('click', (e) => {
  if (e.target === infoModal) infoModal.style.display = 'none';
});
