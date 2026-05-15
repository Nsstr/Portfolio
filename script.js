// ===========================
// FUNCIÓN PRINCIPAL - EJECUTAR CUANDO EL DOM ESTÉ LISTO
// ===========================
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== PORTFOLIO INICIALIZANDO ===');

  // Restaurar posición de scroll si se viene de la presentación Soul Cafè
  const savedY = sessionStorage.getItem('portfolioScrollY');
  if (savedY !== null) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: parseInt(savedY, 10), behavior: 'instant' });
    });
    sessionStorage.removeItem('portfolioScrollY');
  }
  
  // ===========================
  // VARIABLES GLOBALES
  // ===========================
  const projectCards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const mainMediaContainer = document.getElementById('modal-main-image');
  const gallery = document.getElementById('modal-images');

  const infoButtons = document.querySelectorAll('.info-btn');
  const infoModal = document.getElementById('info-modal');
  const infoTitle = document.getElementById('info-modal-title');
  const infoText = document.getElementById('info-modal-text');

  let autoSlideTimeout = null;
  let ytPlayer = null;
  let ytApiReadyPromise = null;

  // ===========================
  // FUNCIONES AUXILIARES
  // ===========================
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
          autoSlideTimeout = setTimeout(() => goNext(index, mediaList), 6000);
        });
      }
    }
  }

  // ===========================
  // APERTURA DE MODALES
  // ===========================
  projectCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Tarjetas con enlace propio (ej: Soul Cafè case study) — no abrir modal
      if (this.classList.contains('soul-cafe-card')) {
        sessionStorage.setItem('portfolioScrollY', window.scrollY);
        window.location.href = 'soul-cafe-presentation.html';
        return;
      }

      // Solo abrir si no se hizo clic en el botón de info
      if (e.target.closest('.info-btn') && !this.classList.contains('inbox-trigger')) {
        return; // Dejar que el evento de info-btn maneje esto
      }
      
      if (this.classList.contains('inbox-trigger')) {
        document.getElementById('inbox-modal').classList.add('active');
        document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
        return;
      }
      
      console.log('Abriendo modal de imágenes para:', this.getAttribute('data-title'));
      clearTimersAndPlayers();

      const title = this.getAttribute('data-title') || '';
      const description = this.getAttribute('data-description') || '';
      const images = (this.getAttribute('data-images') || '').split(',').map(s => s.trim()).filter(Boolean);
      const videos = (this.getAttribute('data-videos') || '').split(',').map(v => v.trim()).filter(Boolean);

      modalTitle.textContent = title;
      modalDescription.textContent = description;
      mainMediaContainer.innerHTML = '';
      gallery.innerHTML = '';

      const mediaList = [
        ...images.map(url => ({ type: 'image', url })),
        ...videos.map(url => ({ type: 'video', url }))
      ];

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

      if (mediaList.length > 0) setMainMedia(0, mediaList);
      modal.style.display = 'flex';
    });
  });

  // Modal de información
  infoButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // Si el botón pertenece a la tarjeta Soul Cafè, abrir el Case Study en lugar del modal
      const card = this.closest('.project-card');
      if (card && card.classList.contains('soul-cafe-card')) {
        sessionStorage.setItem('portfolioScrollY', window.scrollY);
        window.location.href = 'soul-cafe-presentation.html';
        return;
      }
      console.log('Abriendo modal de info');
      infoTitle.textContent = card.getAttribute('data-title') || "Info";
      infoText.textContent = card.getAttribute('data-info') || "Sin información adicional.";
      infoModal.style.display = 'flex';
    });
  });

  // ===========================
  // CIERRE DE MODALES
  // ===========================
  function closeAllModals() {
    console.log('Cerrando todos los modales');
    
    // Detener reproducciones
    clearTimersAndPlayers();
    
    // Cerrar modal de imágenes si está abierto
    if (modal && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
    
    // Cerrar modal de info si está abierto
    if (infoModal && infoModal.style.display === 'flex') {
      infoModal.style.display = 'none';
    }
    
    // Cerrar modal de Inbox si está abierto
    const inboxModal = document.getElementById('inbox-modal');
    if (inboxModal && inboxModal.classList.contains('active')) {
      inboxModal.classList.remove('active');
      document.body.style.overflow = ''; // Restaurar scroll
    }
  }

  // Botones de cerrar (X)
  const closeButtons = document.querySelectorAll('.close-button, .close-info, .close-inbox-modal, .mac-buttons .close');
  console.log('Botones de cerrar encontrados:', closeButtons.length);
  
  closeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Botón X clickeado');
      closeAllModals();
    });
  });
  
  // Cerrar haciendo clic fuera del contenido
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal') || e.target.classList.contains('inbox-modal-overlay')) {
      console.log('Clic fuera del contenido modal');
      closeAllModals();
    }
  });
  
  // Cerrar con tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      console.log('Tecla ESC presionada');
      closeAllModals();
    }
  });

  // ===========================
  // ANIMACIONES Y EFECTOS
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

  sections.forEach(section => observer.observe(section));
  normalCards.forEach(card => observer.observe(card));

  // Animación tagline
  taglineItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
    
    setTimeout(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 300 + (index * 200));
  });

  // Animación glass card
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

  // Animación scroll indicator
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

  // Hero fade in
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transition = 'opacity 1s ease';
    setTimeout(() => {
      hero.style.opacity = '1';
    }, 100);
  }

  // Smooth scroll
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

  // Hover para tarjetas
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '';
    });
  });

  // Ajuste de fondo del hero
  function adjustHeroBackground() {
    const hero = document.querySelector('header.hero');
    if (!hero) return;
    
    const isMobile = window.innerWidth <= 768;
    hero.style.backgroundPosition = isMobile ? '30% center' : 'left center';
  }

  window.addEventListener('resize', adjustHeroBackground);
  adjustHeroBackground();

  // ===========================
  // INBOX SHOWCASE
  // ===========================
  const inboxItems = document.querySelectorAll('.inbox-item');
  const emailContents = document.querySelectorAll('.email-content');

  inboxItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevenir propagación
      
      // Quitar clase active de todos
      inboxItems.forEach(el => el.classList.remove('active'));
      emailContents.forEach(el => el.classList.remove('active'));
      
      // Añadir clase active al clickeado
      this.classList.add('active');
      
      // Mostrar email correspondiente
      const targetId = this.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  console.log('=== PORTFOLIO INICIALIZADO CORRECTAMENTE ===');
});