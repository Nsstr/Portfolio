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
        iframe.src = `https://www.youtube.com/embed/${videoID}`;
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
