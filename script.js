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

    // Imágenes
    const imagesContainer = document.getElementById('modal-images');
    imagesContainer.innerHTML = "";
    if (imagesData) {
      imagesData.split(',').forEach(imgUrl => {
        const img = document.createElement('img');
        img.src = imgUrl.trim();
        img.alt = title;
        imagesContainer.appendChild(img);
      });
    }

    // Videos
    const videosContainer = document.getElementById('modal-video-links');
    videosContainer.innerHTML = "";
    if (videosData) {
      const videoUrls = videosData.split(',');
      videoUrls.forEach(videoUrl => {
        const iframe = document.createElement('iframe');
        const videoID = getYouTubeVideoID(videoUrl.trim());
        iframe.src = `https://www.youtube.com/embed/${videoID}?rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${videoID}`;


        iframe.frameBorder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.style.width = "100%";
        iframe.style.height = "300px";
        videosContainer.appendChild(iframe);
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


// Animación en Canvas para fondo geométrico
document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("background-canvas");
  const ctx = canvas.getContext("2d");
  let width, height;
  let hue = 0; // Variable para controlar el cambio de color

  // Ajustar tamaño del canvas
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Crear puntos para la red geométrica
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

  // Dibujar líneas entre puntos cercanos
  function draw() {
    ctx.clearRect(0, 0, width, height); // Limpiar el canvas en cada cuadro

    // Incrementar el valor de hue para cambiar el color
    hue += 0.5; // Controlar la velocidad del cambio de color
    if (hue >= 360) hue = 0; // Reseteamos el valor de hue si llega a 360

    for (let i = 0; i < numPoints; i++) {
      const p1 = points[i];
      for (let j = i + 1; j < numPoints; j++) {
        const p2 = points[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {  // Dibuja las líneas si los puntos están suficientemente cerca
          // Establecer el color dinámico en función de hue
          ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Actualizar posición de los puntos
    points.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });

    requestAnimationFrame(draw); // Llamar a la siguiente animación
  }

  draw();
});
