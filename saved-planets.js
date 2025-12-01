// Load and display saved planets
function loadSavedPlanets() {
  const savedPlanets = JSON.parse(localStorage.getItem('savedPlanets') || '[]');
  const planetsGrid = document.getElementById('planetsGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (savedPlanets.length === 0) {
    planetsGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  planetsGrid.style.display = 'grid';
  emptyState.style.display = 'none';
  planetsGrid.innerHTML = '';
  
  savedPlanets.forEach(planet => {
    const card = document.createElement('div');
    card.className = 'planet-card';
    
    const date = new Date(planet.created);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    card.innerHTML = `
      <div class="planet-thumbnail-wrapper">
        <img src="${planet.thumbnail}" alt="${planet.name}" class="planet-thumbnail">
      </div>
      <div class="planet-info">
        <h3>${escapeHtml(planet.name)}</h3>
        <p class="planet-date">${formattedDate}</p>
      </div>
      <div class="planet-actions">
        <button class="btn btn-small btn-view" data-id="${planet.id}">View</button>
        <button class="btn btn-small btn-delete" data-id="${planet.id}">Delete</button>
      </div>
    `;
    
    planetsGrid.appendChild(card);
  });
  
  // Add event listeners
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const planetId = e.target.dataset.id;
      showPlanetDetails(planetId);
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const planetId = e.target.dataset.id;
      if (confirm('Are you sure you want to delete this planet?')) {
        deletePlanet(planetId);
      }
    });
  });
}

// Show planet details in modal
function showPlanetDetails(planetId) {
  const savedPlanets = JSON.parse(localStorage.getItem('savedPlanets') || '[]');
  const planet = savedPlanets.find(p => p.id == planetId);
  
  if (!planet) return;
  
  document.getElementById('modalTitle').textContent = escapeHtml(planet.name);
  document.getElementById('modalThumbnail').src = planet.thumbnail;
  
  const date = new Date(planet.created);
  document.getElementById('modalCreated').textContent = date.toLocaleString();
  
  // Fill in config
  document.getElementById('configSurfaceDensity').textContent = planet.config.surfaceDensity || 0;
  document.getElementById('configOceanCoverage').textContent = planet.config.oceanCoverage || 0;
  document.getElementById('configIceCoverage').textContent = planet.config.iceCoverage || 0;
  document.getElementById('configCloudCoverage').textContent = planet.config.cloudCoverage || 0;
  document.getElementById('configAtmosphereDensity').textContent = planet.config.atmosphereDensity || 0;
  document.getElementById('configVolcanoCoverage').textContent = planet.config.volcanoCoverage || 0;
  document.getElementById('configRingPresence').textContent = planet.config.ringPresence || 0;
  document.getElementById('configRoughness').textContent = planet.config.roughness || 0;
  
  // Store current planet ID for download
  document.getElementById('downloadPlanetBtn').dataset.planetId = planetId;
  document.getElementById('downloadPlanetBtn').dataset.planetName = planet.name;
  
  document.getElementById('detailsModal').classList.remove('hidden');
}

// Delete planet from local storage
function deletePlanet(planetId) {
  let savedPlanets = JSON.parse(localStorage.getItem('savedPlanets') || '[]');
  savedPlanets = savedPlanets.filter(p => p.id != planetId);
  localStorage.setItem('savedPlanets', JSON.stringify(savedPlanets));
  
  // Close modal if open
  document.getElementById('detailsModal').classList.add('hidden');
  
  // Reload the grid
  loadSavedPlanets();
}

// Download planet image
function downloadPlanetImage() {
  const planetId = this.dataset.planetId;
  const planetName = this.dataset.planetName;
  const savedPlanets = JSON.parse(localStorage.getItem('savedPlanets') || '[]');
  const planet = savedPlanets.find(p => p.id == planetId);
  
  if (!planet) return;
  
  const link = document.createElement('a');
  link.href = planet.thumbnail;
  link.download = `${escapeHtml(planetName)}_${planet.id}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Utility to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Modal controls
document.addEventListener('DOMContentLoaded', () => {
  loadSavedPlanets();
  
  const modal = document.getElementById('detailsModal');
  
  document.getElementById('closeDetailsBtn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  document.querySelector('.modal-close').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  document.getElementById('downloadPlanetBtn').addEventListener('click', downloadPlanetImage);
  
  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});