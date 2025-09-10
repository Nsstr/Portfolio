const projectCards = document.querySelectorAll('.project-card');
const modal = document.getElementById('project-modal');
const closeButton = modal.querySelector('.close-button');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const mainMediaContainer = document.getElementById('modal-main-image');
const gallery = document.getElementById('modal-images');

let autoSlideInterval = null;

projectCards.forEach(card => {
  card.addEventListener('click', () => {
    clearInterval(autoSlideInterval);

    const title = card.getAttribute('data-title') || '';
    const description = card.getAttribute('data-description') || '';
    const images = (card.getAttribute('data-images') || '').split(',').map(s => s.trim()).filter(Boolean);
    const videos = (card.getAttribute('data-videos') || '').split(',').map(v => v.trim()).filter(Boolean);

    modalTitle.textContent = title;
    modalDescription.textContent = description;
    mainMediaContainer.innerHTML = '';
    gallery.innerHTML = '';

    // Mezclamos imágenes y videos en un único array
    const mediaList = [
      ...images.map(url => ({ type: 'image', url })),
      ...videos.map(url => ({ type: 'video', url }))
    ];

    // Crear miniaturas
    mediaList.forEach((media, index) => {
      let thumb;
      if (media.type === 'image') {
        thumb = document.createElement('img');
        thumb.src = media.url;
      } else {
        const videoId = extractYouTubeID(media.url);
        thumb = document.createElement('img');
        thumb.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // miniatura del video
      }

      thumb.classList.add('thumb-media');
      if (index === 0) thumb.classList.add('selected');
      thumb.addEventListener('click', () => setMainMedia(index, mediaList));
      gallery.appendChild(thumb);
    });

    // Mostrar el primero
    setMainMedia(0, mediaList);

    // Carrusel automático
    autoSlideInterval = setInterval(() => {
      const thumbs = Array.from(gallery.children);
      const currentIndex = thumbs.findIndex(el => el.classList.contains('selected'));
      const nextIndex = (currentIndex + 1) % thumbs.length;
      thumbs[nextIndex].click();
    }, 4000);

    modal.style.display = 'flex';
  });
});

closeButton.addEventListener('click', () => {
  clearInterval(autoSlideInterval);
  modal.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === modal) {
    clearInterval(autoSlideInterval);
    modal.style.display = 'none';
  }
});

gallery.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
gallery.addEventListener('mouseleave', () => {
  const selected = gallery.querySelector('.selected');
  if (!selected) return;

  const thumbs = Array.from(gallery.children);
  let currentIndex = thumbs.indexOf(selected);

  autoSlideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % thumbs.length;
    thumbs[currentIndex].click();
  }, 4000);
});

function setMainMedia(index, mediaList) {
  const thumbs = gallery.children;
  [...thumbs].forEach((el, i) => el.classList.toggle('selected', i === index));

  mainMediaContainer.innerHTML = '';

  const media = mediaList[index];
  if (media.type === 'image') {
    const img = document.createElement('img');
    img.src = media.url;
    mainMediaContainer.appendChild(img);
  } else {
    const videoId = extractYouTubeID(media.url);
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;
    iframe.style.width = "100%";
    iframe.style.height = "500px";
    mainMediaContainer.appendChild(iframe);
  }
}

function extractYouTubeID(url) {
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

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
    e.stopPropagation(); // evita abrir modal de imágenes
    const card = btn.closest('.project-card');
    infoTitle.textContent = card.getAttribute('data-title') || "Info";
    infoText.textContent = card.getAttribute('data-info') || "Sin información adicional.";
    infoModal.style.display = 'flex';
  });
});

infoClose.addEventListener('click', () => {
  infoModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === infoModal) {
    infoModal.style.display = 'none';
  }
});
