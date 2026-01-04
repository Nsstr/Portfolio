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

function setMainMedia(index, mediaList) {
  const thumbs = gallery.children;
  [...thumbs].forEach((el, i) => el.classList.toggle('selected', i === index));

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

    autoSlideTimeout = setTimeout(() => goNext(index, mediaList), 4000);

  } else {
    const ytId = extractYouTubeID(media.url);

    if (ytId) {
      const playerDiv = document.createElement('div');
      const playerId = `yt-player-${Date.now()}`;
      playerDiv.id = playerId;
      playerDiv.style.width = "100%";
      playerDiv.style.height = "100%";
      mainMediaContainer.appendChild(playerDiv);

      loadYouTubeAPI().then(() => {
        console.log("YouTube API lista, creando player...");
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
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (e) => {
              console.log("Player listo, reproduciendo...");
              try { e.target.mute(); } catch {}
              try { e.target.playVideo(); } catch {}
            },
            onStateChange: (e) => {
              console.log("Cambio de estado YT:", e.data);
              if (e.data === YT.PlayerState.ENDED) {
                console.log("Video terminado, pasando al siguiente...");
                goNext(index, mediaList);
              }
            }
          }
        });
      });

    } else {
      // videos propios
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
      vid.addEventListener('error', () => {
        console.warn("Error al reproducir video, paso al siguiente");
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

// ===========================
// Animaciones y efectos
// ===========================
const sections = document.querySelectorAll('.section');
const normalCards = document.querySelectorAll('.project-card:not(.featured-card)');
const taglineItems = document.querySelectorAll('.tagline-item');

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observar secciones y tarjetas normales
sections.forEach(section => observer.observe(section));
normalCards.forEach(card => observer.observe(card));

// Animación para elementos del tagline
taglineItems.forEach((item, index) => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(20px)';
  item.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
  
  setTimeout(() => {
    item.style.opacity = '1';
    item.style.transform = 'translateY(0)';
  }, 300 + (index * 200));
});

// Efecto de partículas para el hero (opcional)
function createParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  // Limpiar partículas existentes
  const existingParticles = hero.querySelectorAll('.floating-particle');
  existingParticles.forEach(p => p.remove());
  
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    particle.style.position = 'absolute';
    particle.style.width = Math.random() * 4 + 1 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = 'rgba(255, 255, 255, 0.5)';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animation = `float ${Math.random() * 20 + 10}s infinite linear`;
    particle.style.zIndex = '1';
    hero.appendChild(particle);
  }
}

// Función para animación de entrada del glass-card
function animateGlassCard() {
  const glassCard = document.querySelector('.glass-card');
  if (glassCard) {
    glassCard.style.opacity = '0';
    glassCard.style.transform = 'scale(0.9) translateY(30px)';
    glassCard.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
    setTimeout(() => {
      glassCard.style.opacity = '1';
      glassCard.style.transform = 'scale(1) translateY(0)';
    }, 300);
  }
}

// Función para animar el scroll indicator
function animateScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (indicator) {
    indicator.style.opacity = '0';
    indicator.style.transform = 'translateX(-50%) translateY(20px)';
    indicator.style.transition = 'opacity 0.6s ease 1s, transform 0.6s ease 1s';
    
    setTimeout(() => {
      indicator.style.opacity = '0.8';
      indicator.style.transform = 'translateX(-50%) translateY(0)';
    }, 1300);
  }
}

// Iniciar efectos cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
  // Crear partículas (descomenta si quieres el efecto)
  // createParticles();
  
  // Animar elementos del hero
  animateGlassCard();
  animateScrollIndicator();
  
  // Añadir clase visible al hero inmediatamente
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transition = 'opacity 1s ease';
    
    setTimeout(() => {
      hero.style.opacity = '1';
    }, 100);
  }
});

// Smooth scroll para el indicador
document.querySelector('.scroll-indicator')?.addEventListener('click', function(e) {
  e.preventDefault();
  const aboutSection = document.querySelector('#sobre-mi');
  if (aboutSection) {
    aboutSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
});

// Efecto de hover mejorado para tarjetas
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.zIndex = '10';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.zIndex = '';
  });
});

// Añade esto a tu script.js
function adjustHeroBackground() {
  const hero = document.querySelector('header.hero');
  if (!hero) return;
  
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Ajusta este valor hasta que veas bien tu rostro
    hero.style.backgroundPosition = '30% center';
  } else {
    hero.style.backgroundPosition = 'left center';
  }
}

// Ejecutar al cargar y al redimensionar
window.addEventListener('DOMContentLoaded', adjustHeroBackground);
window.addEventListener('resize', adjustHeroBackground);