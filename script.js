// Modal para detalle de proyecto
const projectCards = document.querySelectorAll('.project-card');
const modal = document.getElementById('project-modal');
const closeButton = modal.querySelector('.close-button');

projectCards.forEach(card => {
  card.addEventListener('click', function() {
    const title = card.getAttribute('data-title') || "Proyecto";
    const description = card.getAttribute('data-description') || "Presentación del proyecto.";
    const imagesData = card.getAttribute('data-images');
    const videosData = card.getAttribute('data-videos');

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-description').textContent = description;

    // Imágenes con funcionalidad de carrusel
    const imagesContainer = document.getElementById('modal-images');
    imagesContainer.innerHTML = "";
    if (imagesData) {
      const imageUrls = imagesData.split(',').map(url => url.trim());
      imageUrls.forEach((imgUrl, index) => {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = title;
        // Al hacer clic, se abre el carrusel
        img.addEventListener('click', function() {
          openImageCarousel(index, imageUrls);
        });
        imagesContainer.appendChild(img);
      });
    }

    // Videos y comentarios
    const videosContainer = document.getElementById('modal-video-links');
    videosContainer.innerHTML = "";
    const videoCommentsData = card.getAttribute('data-video-comments');
    let videoComments = [];
    if (videoCommentsData) {
      videoComments = videoCommentsData.split('/').map(text => text.trim());
    }
    if (videosData) {
      const videoUrls = videosData.split(',');
      videoUrls.forEach((videoUrl, index) => {
        const videoContainer = document.createElement('div');
        videoContainer.classList.add('video-container');
    
        // Contenedor del video
        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('video-wrapper');
        const iframe = document.createElement('iframe');
        const videoID = getYouTubeVideoID(videoUrl.trim());
        iframe.src = `https://www.youtube.com/embed/${videoID}?rel=0&modestbranding=1&controls=1&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${videoID}`;
        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        videoWrapper.appendChild(iframe);
        videoContainer.appendChild(videoWrapper);
    
        // Si existe comentario para este video, se agrega el botón para mostrarlo
        if (videoComments[index] && videoComments[index] !== "") {
          const toggleComment = document.createElement('div');
          toggleComment.classList.add('toggle-comment');
          toggleComment.innerHTML = "+";
          toggleComment.addEventListener("click", function () {
            showCommentModal(videoComments[index]);
          });
          videoContainer.appendChild(toggleComment);
        }
    
        videosContainer.appendChild(videoContainer);
      });
    }
    

    modal.style.display = 'flex';
  });
});

closeButton.addEventListener('click', function() {
  modal.style.display = 'none';
});

window.addEventListener('click', function(e) {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Función para obtener el ID del video de YouTube desde su URL
function getYouTubeVideoID(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/([a-zA-Z0-9_-]+))|youtu\.be\/([a-zA-Z0-9_-]+))/;
  const match = url.match(regex);
  return match ? (match[1] || match[2]) : null;
}

// Función para abrir el carrusel de imágenes
function openImageCarousel(currentIndex, imagesArray) {
  let overlay = document.createElement('div');
  overlay.id = 'image-carousel-overlay';
  overlay.innerHTML = `
    <span class="carousel-close">&times;</span>
    <span class="carousel-nav carousel-prev">&#10094;</span>
    <img id="carousel-image" src="${imagesArray[currentIndex]}" alt="">
    <span class="carousel-nav carousel-next">&#10095;</span>
  `;
  document.body.appendChild(overlay);

  function updateImage(index) {
    const imgElement = document.getElementById('carousel-image');
    imgElement.src = imagesArray[index];
    currentIndex = index;
  }

  overlay.querySelector('.carousel-close').addEventListener('click', function() {
    document.body.removeChild(overlay);
  });

  overlay.querySelector('.carousel-prev').addEventListener('click', function(e) {
    e.stopPropagation();
    let newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = imagesArray.length - 1;
    updateImage(newIndex);
  });

  overlay.querySelector('.carousel-next').addEventListener('click', function(e) {
    e.stopPropagation();
    let newIndex = currentIndex + 1;
    if (newIndex >= imagesArray.length) newIndex = 0;
    updateImage(newIndex);
  });

  // Cerrar carrusel al hacer clic fuera de la imagen
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

// Función para mostrar el comentario en una ventana flotante centrada
function showCommentModal(text) {
  const overlay = document.createElement('div');
  overlay.id = 'comment-modal-overlay';
  overlay.innerHTML = `
    <div class="comment-modal">
      <span class="comment-modal-close">&times;</span>
      <p>${text}</p>
    </div>
  `;
  document.body.appendChild(overlay);
  // Cerrar el modal al hacer clic en el botón de cerrar o fuera del contenido
  overlay.querySelector('.comment-modal-close').addEventListener('click', function() {
    document.body.removeChild(overlay);
  });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

// Animación en Canvas para fondo geométrico
document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("background-canvas");
  const ctx = canvas.getContext("2d");
  let width, height;
  let hue = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const points = [];
  const numPoints = 150;
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    hue += 0.5;
    if (hue >= 360) hue = 0;
    for (let i = 0; i < numPoints; i++) {
      const p1 = points[i];
      for (let j = i + 1; j < numPoints; j++) {
        const p2 = points[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    points.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
});
