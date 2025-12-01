// Three.js Planet Creator
let scene, camera, renderer, globe, atmosphereGlow, rings;
let planetState = {};

// Initialize Three.js scene
function initThreeJS() {
  const container = document.getElementById('canvas-container');
  
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);
  
  // Camera
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 3;
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  
  // Lighting
  const sunLight = new THREE.PointLight(0xffffff, 2);
  sunLight.position.set(5, 5, 5);
  scene.add(sunLight);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Create initial globe
  createGlobe();
  
  // Mouse controls
  setupMouseControls();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Start animation loop
  animate();
}

// Create the planet globe
function createGlobe() {
  // Remove old globe if exists
  if (globe) scene.remove(globe);
  if (atmosphereGlow) scene.remove(atmosphereGlow);
  if (rings) scene.remove(rings);
  
  // Create geometry
  const geometry = new THREE.IcosahedronGeometry(1.5, 64);
  
  // Generate texture with current settings
  const canvas = generatePlanetTexture();
  const texture = new THREE.CanvasTexture(canvas);
  
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    shininess: 5
  });
  
  globe = new THREE.Mesh(geometry, material);
  scene.add(globe);
  
  // Add atmosphere glow
  createAtmosphere();
  
  // Add rings if enabled
  if (planetState.ringPresence > 0) {
    createRings();
  }
}

// Generate planet texture using canvas
function generatePlanetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Get current control values
  const rockColor = document.getElementById('rockColor').value;
  const oceanColor = document.getElementById('oceanColor').value;
  const iceColor = document.getElementById('iceColor').value;
  const cloudColor = document.getElementById('cloudColor').value;
  const lavaColor = document.getElementById('lavaColor').value;
  
  const surfaceDensity = parseInt(document.getElementById('surfaceDensity').value);
  const oceanCoverage = parseInt(document.getElementById('oceanCoverage').value);
  const iceCoverage = parseInt(document.getElementById('iceCoverage').value);
  const cloudCoverage = parseInt(document.getElementById('cloudCoverage').value);
  const volcanoCoverage = parseInt(document.getElementById('volcanoCoverage').value);
  
  // Store state
  planetState = {
    rockColor,
    oceanColor,
    iceColor,
    cloudColor,
    lavaColor,
    surfaceDensity,
    oceanCoverage,
    iceCoverage,
    cloudCoverage,
    volcanoCoverage,
    atmosphereColor: document.getElementById('atmosphereColor').value,
    atmosphereDensity: parseInt(document.getElementById('atmosphereDensity').value),
    roughness: parseInt(document.getElementById('roughness').value),
    ringPresence: parseInt(document.getElementById('ringPresence').value),
    ringColor: document.getElementById('ringColor').value
  };
  
  // Base color (ocean)
  ctx.fillStyle = oceanColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add continents (rock/soil)
  ctx.fillStyle = rockColor;
  for (let y = 0; y < canvas.height; y += 20) {
    for (let x = 0; x < canvas.width; x += 20) {
      if (Math.random() * 100 < surfaceDensity) {
        // Create landmass patterns
        const size = 15 + Math.random() * 30;
        ctx.fillRect(x + Math.random() * 10, y + Math.random() * 10, size, size);
      }
    }
  }
  
  // Add ice caps at poles
  const iceCoveragePixels = (canvas.height / 100) * (iceCoverage / 2);
  ctx.fillStyle = iceColor;
  // North pole
  ctx.fillRect(0, 0, canvas.width, iceCoveragePixels);
  // South pole
  ctx.fillRect(0, canvas.height - iceCoveragePixels, canvas.width, iceCoveragePixels);
  
  // Add volcanic regions if enabled
  if (volcanoCoverage > 0) {
    ctx.fillStyle = lavaColor;
    const volcanicRegions = Math.ceil((volcanoCoverage / 100) * 50);
    for (let i = 0; i < volcanicRegions; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 20 + Math.random() * 40;
      
      // Draw volcanic spots
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Add clouds
  if (cloudCoverage > 0) {
    ctx.fillStyle = cloudColor;
    ctx.globalAlpha = 0.4;
    const cloudRegions = Math.ceil((cloudCoverage / 100) * 40);
    for (let i = 0; i < cloudRegions; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      drawCloud(ctx, x, y, 30 + Math.random() * 50);
    }
    ctx.globalAlpha = 1.0;
  }
  
  // Add noise/roughness
  const roughness = parseInt(document.getElementById('roughness').value);
  if (roughness > 0) {
    addNoise(ctx, canvas.width, canvas.height, roughness / 10);
  }
  
  return canvas;
}

// Helper function to draw clouds
function drawCloud(ctx, x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
  ctx.arc(x + size * 0.3, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// Add noise to texture for realism
function addNoise(ctx, width, height, intensity) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 255;
    data[i] += noise;     // R
    data[i + 1] += noise; // G
    data[i + 2] += noise; // B
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// Create atmosphere glow
function createAtmosphere() {
  const atmosphereColor = document.getElementById('atmosphereColor').value;
  const atmosphereDensity = parseInt(document.getElementById('atmosphereDensity').value);
  
  const atmosphereGeometry = new THREE.IcosahedronGeometry(1.55, 64);
  const atmosphereMaterial = new THREE.MeshPhongMaterial({
    color: atmosphereColor,
    transparent: true,
    opacity: atmosphereDensity / 200,
    emissive: atmosphereColor,
    emissiveIntensity: 0.2,
    side: THREE.BackSide
  });
  
  atmosphereGlow = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphereGlow);
}

// Create planet rings
function createRings() {
  const ringColor = document.getElementById('ringColor').value;
  const ringPresence = parseInt(document.getElementById('ringPresence').value);
  
  const ringGeometry = new THREE.BufferGeometry();
  const ringCount = 2000;
  const positions = new Float32Array(ringCount * 3);
  
  for (let i = 0; i < ringCount * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 2 + Math.random() * 1;
    positions[i] = Math.cos(angle) * distance;
    positions[i + 1] = (Math.random() - 0.5) * 0.1;
    positions[i + 2] = Math.sin(angle) * distance;
  }
  
  ringGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const ringMaterial = new THREE.PointsMaterial({
    color: ringColor,
    size: 0.02,
    transparent: true,
    opacity: ringPresence / 100
  });
  
  rings = new THREE.Points(ringGeometry, ringMaterial);
  scene.add(rings);
}

// Mouse controls for rotation and zoom
function setupMouseControls() {
  let isMouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  
  const container = document.getElementById('canvas-container');
  
  container.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  container.addEventListener('mousemove', (e) => {
    if (isMouseDown && globe) {
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      
      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;
      
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  });
  
  container.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
  
  container.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });
  
  // Smooth rotation
  function updateRotation() {
    if (globe) {
      globe.rotation.y += (targetRotationY - globe.rotation.y) * 0.1;
      globe.rotation.x += (targetRotationX - globe.rotation.x) * 0.1;
      
      if (atmosphereGlow) {
        atmosphereGlow.rotation.copy(globe.rotation);
      }
      
      if (rings) {
        rings.rotation.copy(globe.rotation);
      }
    }
    requestAnimationFrame(updateRotation);
  }
  updateRotation();
  
  // Zoom with scroll
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.2;
    if (e.deltaY < 0) {
      camera.position.z = Math.max(camera.position.z - zoomSpeed, 1);
    } else {
      camera.position.z = Math.min(camera.position.z + zoomSpeed, 10);
    }
  }, { passive: false });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Slight auto-rotation
  if (globe && !isMouseDown) {
    globe.rotation.y += 0.0001;
    if (atmosphereGlow) atmosphereGlow.rotation.copy(globe.rotation);
    if (rings) rings.rotation.copy(globe.rotation);
  }
  
  renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Update globe when sliders change
function setupControlListeners() {
  const sliders = document.querySelectorAll('.slider');
  const colorPickers = document.querySelectorAll('.color-picker');
  
  sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      // Update display value
      const valueSpan = document.getElementById(e.target.id + 'Value');
      if (valueSpan) {
        valueSpan.textContent = e.target.value;
      }
      // Regenerate globe
      createGlobe();
    });
  });
  
  colorPickers.forEach(picker => {
    picker.addEventListener('change', () => {
      createGlobe();
    });
  });
  
  // Reset button
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('rockColor').value = '#8B7355';
    document.getElementById('surfaceDensity').value = '50';
    document.getElementById('oceanColor').value = '#1E90FF';
    document.getElementById('oceanCoverage').value = '30';
    document.getElementById('iceColor').value = '#FFFFFF';
    document.getElementById('iceCoverage').value = '10';
    document.getElementById('atmosphereColor').value = '#87CEEB';
    document.getElementById('atmosphereDensity').value = '50';
    document.getElementById('cloudColor').value = '#FFFFFF';
    document.getElementById('cloudCoverage').value = '20';
    document.getElementById('lavaColor').value = '#FF4500';
    document.getElementById('volcanoCoverage').value = '0';
    document.getElementById('ringColor').value = '#DAA520';
    document.getElementById('ringPresence').value = '0';
    document.getElementById('roughness').value = '30';
    
    // Update all display values
    document.getElementById('surfaceDensityValue').textContent = '50';
    document.getElementById('oceanCoverageValue').textContent = '30';
    document.getElementById('iceCoverageValue').textContent = '10';
    document.getElementById('atmosphereDensityValue').textContent = '50';
    document.getElementById('cloudCoverageValue').textContent = '20';
    document.getElementById('volcanoCoverageValue').textContent = '0';
    document.getElementById('ringPresenceValue').textContent = '0';
    document.getElementById('roughnessValue').textContent = '30';
    
    createGlobe();
  });
}

// Save planet to local storage
function setupSaveButton() {
  document.getElementById('savePlanetBtn').addEventListener('click', () => {
    document.getElementById('saveModal').classList.remove('hidden');
    document.getElementById('planetName').focus();
  });
  
  document.getElementById('cancelSaveBtn').addEventListener('click', () => {
    document.getElementById('saveModal').classList.add('hidden');
  });
  
  document.getElementById('confirmSaveBtn').addEventListener('click', () => {
    const planetName = document.getElementById('planetName').value.trim();
    if (!planetName) {
      alert('Please enter a planet name');
      return;
    }
    
    // Get canvas as image data
    const canvas = renderer.domElement;
    const imageData = canvas.toDataURL('image/png');
    
    // Create planet object
    const planet = {
      id: Date.now(),
      name: planetName,
      created: new Date().toLocaleString(),
      config: planetState,
      thumbnail: imageData
    };
    
    // Save to local storage
    let savedPlanets = JSON.parse(localStorage.getItem('savedPlanets') || '[]');
    savedPlanets.push(planet);
    localStorage.setItem('savedPlanets', JSON.stringify(savedPlanets));
    
    // Show confirmation
    alert(`Planet "${planetName}" saved successfully!`);
    document.getElementById('planetName').value = '';
    document.getElementById('saveModal').classList.add('hidden');
  });
  
  // Close modal on Enter key
  document.getElementById('planetName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('confirmSaveBtn').click();
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initThreeJS();
  setupControlListeners();
  setupSaveButton();
});