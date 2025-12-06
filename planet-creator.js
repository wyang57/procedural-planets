// Three.js Planet Creator
let scene, camera, renderer, globe, atmosphereGlow, rings;
let planetState = {};
let isMouseDown = false;
let targetRotationX = 0;
let targetRotationY = 0;

// Initialize Three.js scene
function initThreeJS() {
  const container = document.getElementById('canvas-container');
  
  if (!container) {
    console.error('Canvas container not found');
    return;
  }
  
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);
  scene.fog = new THREE.Fog(0x000011, 10, 100);
  
  // Camera
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 3;
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowShadowMap;
  container.appendChild(renderer.domElement);
  
  // Lighting Setup
  // Main sun light
  const sunLight = new THREE.PointLight(0xffffff, 2.5, 100);
  sunLight.position.set(5, 5, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);
  
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  // Rim light for atmosphere glow
  const rimLight = new THREE.PointLight(0x00ffff, 1, 50);
  rimLight.position.set(-5, -5, 5);
  scene.add(rimLight);
  
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
  if (globe) {
    scene.remove(globe);
    globe.geometry.dispose();
    globe.material.dispose();
  }
  if (atmosphereGlow) {
    scene.remove(atmosphereGlow);
    atmosphereGlow.geometry.dispose();
    atmosphereGlow.material.dispose();
  }
  if (rings) {
    scene.remove(rings);
    rings.geometry.dispose();
    rings.material.dispose();
  }
  
  // Create geometry with good detail
  const geometry = new THREE.IcosahedronGeometry(1.5, 64);
  
  // Generate texture with current settings
  const canvas = generatePlanetTexture();
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  
  // Create material with proper shading
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    shininess: 10,
    flatShading: false,
    side: THREE.FrontSide,
    castShadow: true,
    receiveShadow: true
  });
  
  globe = new THREE.Mesh(geometry, material);
  globe.castShadow = true;
  globe.receiveShadow = true;
  scene.add(globe);
  
  // Add atmosphere glow
  createAtmosphere();
  
  // Add rings if enabled
  if (planetState.ringPresence > 0) {
    createRings();
  }
}

// Generate planet texture using canvas with improved noise
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
  const roughness = parseInt(document.getElementById('roughness').value);
  
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
    roughness,
    ringPresence: parseInt(document.getElementById('ringPresence').value),
    ringColor: document.getElementById('ringColor').value
  };
  
  // Generate multi-octave noise for realistic continents
  const noiseScale = (100 - roughness) / 30; // Better scale for variety
  const baseNoise = generatePerlinNoise(canvas.width, canvas.height, noiseScale);
  
  // ===== STEP 1: BASE OCEAN COLOR =====
  ctx.fillStyle = oceanColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // ===== STEP 2: LAND/CONTINENT LAYER (surfaceDensity controls coverage) =====
  const landThreshold = (100 - surfaceDensity) / 100; // Higher density = more land
  const stepX = 4;
  const stepY = 2;
  
  // Draw landmasses with varied rock colors based on height
  for (let y = 0; y < canvas.height; y += stepY) {
    for (let x = 0; x < canvas.width; x += stepX) {
      const noiseIdx = Math.floor(y / stepY) * Math.ceil(canvas.width / stepX) + Math.floor(x / stepX);
      const noiseValue = baseNoise[noiseIdx] || 0;
      
      // If noise is above threshold, draw land
      if (noiseValue > landThreshold) {
        // Vary rock color slightly based on noise for more natural look
        const brightness = Math.floor((noiseValue - landThreshold) * 80);
        const rgb = hexToRgb(rockColor);
        const r = Math.max(0, Math.min(255, rgb.r + brightness / 2));
        const g = Math.max(0, Math.min(255, rgb.g + brightness / 2));
        const b = Math.max(0, Math.min(255, rgb.b + brightness / 2));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, stepX, stepY);
      }
    }
  }
  
  // ===== STEP 3: OCEAN DEPTH VARIATION (oceanCoverage affects depth coloring and visibility) =====
  // IMPORTANT: Only apply ocean effects where there is actually ocean (noiseValue <= landThreshold)
  if (oceanCoverage > 0) {
    const oceanRgb = hexToRgb(oceanColor);
    
    // Layer 1: Dark deep ocean trenches (adds depth to ocean only, not terrain)
    if (oceanCoverage > 20) {
      const deepOceanIntensity = Math.min(oceanCoverage / 100, 0.6);
      const deepColor = `rgba(${Math.floor(oceanRgb.r * 0.5)},${Math.floor(oceanRgb.g * 0.5)},${Math.floor(oceanRgb.b * 0.9)},${deepOceanIntensity * 0.3})`;
      ctx.fillStyle = deepColor;
      
      for (let y = 0; y < canvas.height; y += stepY) {
        for (let x = 0; x < canvas.width; x += stepX) {
          const noiseIdx = Math.floor(y / stepY) * Math.ceil(canvas.width / stepX) + Math.floor(x / stepX);
          const noiseValue = baseNoise[noiseIdx] || 0;
          
          // ONLY render ocean depth where there is ocean (below landThreshold)
          if (noiseValue <= landThreshold) {
            // Use noise for ocean depth variation - creates swirling patterns
            const depthVariation = (1 - noiseValue) * 0.4;
            if (Math.random() < depthVariation) {
              ctx.fillRect(x, y, stepX, stepY);
            }
          }
        }
      }
    }
    
    // Layer 2: Smooth ocean with subtle sheen (rounded water appearance)
    if (oceanCoverage > 30) {
      const mediumOceanIntensity = Math.min((oceanCoverage - 30) / 70, 0.4);
      const shineColor = `rgba(200,230,255,${mediumOceanIntensity * 0.2})`;
      ctx.fillStyle = shineColor;
      
      // Smoother, larger patches for rounder water effect
      for (let y = 0; y < canvas.height; y += stepY * 4) {
        for (let x = 0; x < canvas.width; x += stepX * 4) {
          const noiseIdx = Math.floor(y / stepY) * Math.ceil(canvas.width / stepX) + Math.floor(x / stepX);
          const noiseValue = baseNoise[noiseIdx] || 0;
          
          // ONLY shine where there's ocean, and create flowing patterns
          if (noiseValue <= landThreshold && (x + y) % 8 === 0) {
            // Draw larger, rounder patches (2x2 instead of 1x1) for smoother water
            ctx.fillRect(x, y, stepX * 2, stepY * 2);
          }
        }
      }
      
      // Layer 3: Swirling ocean currents using sine/cos for flowing patterns
      const swirl = `rgba(150,200,255,${mediumOceanIntensity * 0.1})`;
      ctx.fillStyle = swirl;
      
      for (let y = 0; y < canvas.height; y += stepY * 6) {
        for (let x = 0; x < canvas.width; x += stepX * 6) {
          const noiseIdx = Math.floor(y / stepY) * Math.ceil(canvas.width / stepX) + Math.floor(x / stepX);
          const noiseValue = baseNoise[noiseIdx] || 0;
          
          if (noiseValue <= landThreshold) {
            // Create swirling pattern around terrain
            const swirlPattern = Math.sin(x / 20) * Math.cos(y / 20);
            if (swirlPattern > 0.3) {
              ctx.fillRect(x, y, stepX * 3, stepY * 3);
            }
          }
        }
      }
    }
  }
  
  // ===== STEP 4: ICE CAPS (latitude-based masking with gradient) =====
  if (iceCoverage > 0) {
    ctx.globalAlpha = (iceCoverage / 100) * 0.9;
    ctx.fillStyle = iceColor;
    
    // Northern ice cap (pole at top)
    const iceCoveragePixels = Math.floor((canvas.height / 100) * (iceCoverage * 1.2));
    const northGradient = ctx.createLinearGradient(0, 0, 0, iceCoveragePixels);
    northGradient.addColorStop(0, iceColor);
    northGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = northGradient;
    ctx.fillRect(0, 0, canvas.width, iceCoveragePixels);
    
    // Southern ice cap (pole at bottom)
    const southGradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - iceCoveragePixels);
    southGradient.addColorStop(0, iceColor);
    southGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = southGradient;
    ctx.fillRect(0, canvas.height - iceCoveragePixels, canvas.width, iceCoveragePixels);
    
    ctx.globalAlpha = 1.0;
  }
  
  // ===== STEP 5: VOLCANIC REGIONS (lava with emissive glow) =====
  if (volcanoCoverage > 0) {
    const volcanicSpots = Math.floor((volcanoCoverage / 100) * 100); // More volcanoes at high coverage
    for (let i = 0; i < volcanicSpots; i++) {
      const x = Math.random() * canvas.width;
      const y = (Math.random() * 0.6 + 0.2) * canvas.height; // Avoid poles
      const size = 8 + Math.random() * 40;
      
      // Radial gradient for lava glow
      const vgradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      vgradient.addColorStop(0, lavaColor);
      vgradient.addColorStop(0.5, 'rgba(255,165,0,0.6)');
      vgradient.addColorStop(1, 'rgba(255,69,0,0)');
      ctx.fillStyle = vgradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
  }
  
  // ===== STEP 6: CLOUDS LAYER (semi-transparent overlay with wind patterns) =====
  if (cloudCoverage > 0) {
    ctx.globalAlpha = (cloudCoverage / 100) * 0.6;
    ctx.fillStyle = cloudColor;
    const cloudCount = Math.floor((cloudCoverage / 100) * 80);
    for (let i = 0; i < cloudCount; i++) {
      const x = (Math.random() * 1.2 * canvas.width - canvas.width * 0.1) % canvas.width;
      const y = Math.random() * canvas.height;
      const size = 15 + Math.random() * 50;
      drawCloud(ctx, x, y, size);
    }
    ctx.globalAlpha = 1.0;
  }
  
  // ===== STEP 7: TERRAIN ROUGHNESS (fine detail noise) =====
  if (roughness > 0) {
    addNoise(ctx, canvas.width, canvas.height, roughness / 6);
  }
  
  // ===== STEP 8: WEATHER STRIPES (atmospheric bands with blur effect) =====
  // Create horizontal weather/atmospheric stripes for dynamic appearance
  if (atmosphereDensity > 20 || cloudCoverage > 10) {
    const stripeIntensity = Math.min((atmosphereDensity + cloudCoverage) / 200, 0.3);
    
    if (stripeIntensity > 0) {
      // Multiple stripe bands at different heights with varying intensity
      const stripeCount = Math.floor((atmosphereDensity + cloudCoverage) / 30);
      
      for (let s = 0; s < stripeCount; s++) {
        const yPos = (canvas.height / (stripeCount + 1)) * (s + 1);
        const stripeHeight = Math.max(2, Math.floor(canvas.height / (stripeCount * 3)));
        const stripeColor = cloudColor || '#FFFFFF';
        const stripeAlpha = (stripeIntensity * (1 - Math.abs(s - stripeCount / 2) / stripeCount)) * 0.2;
        
        ctx.fillStyle = hexToRgba(stripeColor, stripeAlpha);
        
        // Add subtle blur-like effect with gradient
        const stripeGradient = ctx.createLinearGradient(0, yPos - stripeHeight, 0, yPos + stripeHeight);
        stripeGradient.addColorStop(0, hexToRgba(stripeColor, 0));
        stripeGradient.addColorStop(0.5, hexToRgba(stripeColor, stripeAlpha));
        stripeGradient.addColorStop(1, hexToRgba(stripeColor, 0));
        ctx.fillStyle = stripeGradient;
        
        ctx.fillRect(0, yPos - stripeHeight, canvas.width, stripeHeight * 2);
      }
      
      // Apply directional blur effect by layering semi-transparent horizontal lines
      ctx.globalAlpha = stripeIntensity * 0.15;
      for (let y = 0; y < canvas.height; y += 8) {
        ctx.strokeStyle = cloudColor || '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    }
  }
  
  return canvas;
}

// Enhanced multi-octave Perlin-like noise generation for realistic terrain
function generatePerlinNoise(width, height, scale) {
  const noise = [];
  const stepX = 4;
  const stepY = 2;
  const sampledWidth = Math.ceil(width / stepX);
  const sampledHeight = Math.ceil(height / stepY);
  
  // Create gradient permutation table for better randomness
  const gradients = [];
  for (let i = 0; i < sampledWidth * sampledHeight; i++) {
    gradients[i] = {
      x: Math.cos(Math.random() * Math.PI * 2),
      y: Math.sin(Math.random() * Math.PI * 2)
    };
  }
  
  // Multi-octave noise (Fractional Brownian Motion)
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      let value = 0;
      let amplitude = 1;
      let frequency = 1;
      let maxValue = 0;
      
      // Layer 4 octaves of noise for natural variation
      for (let octave = 0; octave < 4; octave++) {
        const xi = Math.floor((x * frequency) / (stepX * scale)) % (sampledWidth - 1);
        const yi = Math.floor((y * frequency) / (stepY * scale)) % (sampledHeight - 1);
        
        // Interpolate between gradient vectors
        const xf = ((x * frequency) / (stepX * scale)) - Math.floor((x * frequency) / (stepX * scale));
        const yf = ((y * frequency) / (stepY * scale)) - Math.floor((y * frequency) / (stepY * scale));
        
        // Smooth interpolation (Perlin smoothstep)
        const u = xf * xf * (3 - 2 * xf);
        const v = yf * yf * (3 - 2 * yf);
        
        // Get gradients and interpolate
        const idx1 = yi * sampledWidth + xi;
        const idx2 = yi * sampledWidth + ((xi + 1) % sampledWidth);
        const idx3 = ((yi + 1) % sampledHeight) * sampledWidth + xi;
        const idx4 = ((yi + 1) % sampledHeight) * sampledWidth + ((xi + 1) % sampledWidth);
        
        const g1 = gradients[idx1 % gradients.length];
        const g2 = gradients[idx2 % gradients.length];
        const g3 = gradients[idx3 % gradients.length];
        const g4 = gradients[idx4 % gradients.length];
        
        // Dot products
        const d1 = g1.x * xf + g1.y * yf;
        const d2 = g2.x * (xf - 1) + g2.y * yf;
        const d3 = g3.x * xf + g3.y * (yf - 1);
        const d4 = g4.x * (xf - 1) + g4.y * (yf - 1);
        
        // Interpolate
        const i1 = d1 * (1 - u) + d2 * u;
        const i2 = d3 * (1 - u) + d4 * u;
        const i = i1 * (1 - v) + i2 * v;
        
        value += i * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      
      noise.push((value / maxValue + 1) / 2); // Normalize to 0-1
    }
  }
  
  return noise;
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

// Create atmosphere glow with proper shader-like effect
function createAtmosphere() {
  const atmosphereColor = document.getElementById('atmosphereColor').value;
  const atmosphereDensity = parseInt(document.getElementById('atmosphereDensity').value);
  
  // Create custom atmosphere with multiple layers
  const atmosphereGeometry = new THREE.IcosahedronGeometry(1.52, 64);
  
  // Use canvas texture for atmosphere with gradient
  const atmosphereCanvas = document.createElement('canvas');
  atmosphereCanvas.width = 512;
  atmosphereCanvas.height = 512;
  const atmCtx = atmosphereCanvas.getContext('2d');
  
  // Create radial gradient for atmosphere
  const gradient = atmCtx.createRadialGradient(256, 256, 100, 256, 256, 256);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.5, hexToRgba(atmosphereColor, atmosphereDensity / 200));
  gradient.addColorStop(1, hexToRgba(atmosphereColor, atmosphereDensity / 100));
  atmCtx.fillStyle = gradient;
  atmCtx.fillRect(0, 0, 512, 512);
  
  const atmosphereTexture = new THREE.CanvasTexture(atmosphereCanvas);
  
  const atmosphereMaterial = new THREE.MeshPhongMaterial({
    map: atmosphereTexture,
    emissive: atmosphereColor,
    emissiveIntensity: atmosphereDensity / 200,
    transparent: true,
    opacity: atmosphereDensity / 150,
    side: THREE.BackSide,
    depthWrite: false
  });
  
  atmosphereGlow = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphereGlow);
}

// Helper function to convert hex to rgba
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Helper function to convert hex to RGB object
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Create planet rings
function createRings() {
  const ringColor = document.getElementById('ringColor').value;
  const ringPresence = parseInt(document.getElementById('ringPresence').value);
  
  // Create ring geometry using a torus
  const ringGeometry = new THREE.TorusGeometry(2.2, 0.4, 2, 256);
  
  // Create ring material with transparency
  const ringMaterial = new THREE.MeshPhongMaterial({
    color: ringColor,
    transparent: true,
    opacity: ringPresence / 150,
    emissive: ringColor,
    emissiveIntensity: ringPresence / 300,
    side: THREE.DoubleSide,
    flatShading: false
  });
  
  rings = new THREE.Mesh(ringGeometry, ringMaterial);
  rings.castShadow = true;
  rings.receiveShadow = true;
  
  // Tilt the rings slightly for visual interest
  rings.rotation.x = Math.PI / 6;
  
  scene.add(rings);
}

// Mouse controls for rotation and zoom
function setupMouseControls() {
  let mouseX = 0;
  let mouseY = 0;
  
  const container = document.getElementById('canvas-container');
  if (!container) return;
  
  // Mouse down
  container.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Mouse move
  container.addEventListener('mousemove', (e) => {
    if (isMouseDown && globe) {
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      
      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;
      
      // Clamp X rotation to prevent flipping
      targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));
      
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  });
  
  // Mouse up
  container.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
  
  // Mouse leave
  container.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });
  
  // Touch controls for mobile
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isMouseDown = true;
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  });
  
  container.addEventListener('touchmove', (e) => {
    if (isMouseDown && e.touches.length === 1 && globe) {
      const deltaX = e.touches[0].clientX - mouseX;
      const deltaY = e.touches[0].clientY - mouseY;
      
      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;
      
      targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));
      
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  });
  
  container.addEventListener('touchend', () => {
    isMouseDown = false;
  });
  
  // Zoom with scroll
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.3;
    if (e.deltaY < 0) {
      camera.position.z = Math.max(camera.position.z - zoomSpeed, 1);
    } else {
      camera.position.z = Math.min(camera.position.z + zoomSpeed, 8);
    }
  }, { passive: false });
}

// Animation loop with smooth rotation
function animate() {
  requestAnimationFrame(animate);
  
  if (globe) {
    // Smooth rotation easing
    const easing = 0.08;
    globe.rotation.y += (targetRotationY - globe.rotation.y) * easing;
    globe.rotation.x += (targetRotationX - globe.rotation.x) * easing;
    
    // Slight auto-rotation when not being dragged
    if (!isMouseDown) {
      targetRotationY += 0.0001;
    }
    
    // Update atmosphere and rings to match globe rotation
    if (atmosphereGlow) {
      atmosphereGlow.rotation.copy(globe.rotation);
    }
    
    if (rings) {
      rings.rotation.x = Math.PI / 6 + globe.rotation.x * 0.3;
      rings.rotation.y = globe.rotation.y;
      rings.rotation.z = globe.rotation.z * 0.1;
    }
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
  
  // Debounce function to avoid too many texture regenerations
  let debounceTimer;
  const regenerateGlobe = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      createGlobe();
    }, 50);
  };
  
  // Slider input listeners
  sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      // Update display value immediately for feedback
      const valueSpan = document.getElementById(e.target.id + 'Value');
      if (valueSpan) {
        valueSpan.textContent = e.target.value;
      }
      // Regenerate globe with debouncing
      regenerateGlobe();
    });
  });
  
  // Color picker change listeners
  colorPickers.forEach(picker => {
    picker.addEventListener('change', () => {
      regenerateGlobe();
    });
  });
  
  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetPlanetDefaults);
  }
}

// Reset planet to default values
function resetPlanetDefaults() {
  const defaults = {
    rockColor: '#8B7355',
    surfaceDensity: '50',
    oceanColor: '#1E90FF',
    oceanCoverage: '30',
    iceColor: '#FFFFFF',
    iceCoverage: '10',
    atmosphereColor: '#87CEEB',
    atmosphereDensity: '50',
    cloudColor: '#FFFFFF',
    cloudCoverage: '20',
    lavaColor: '#FF4500',
    volcanoCoverage: '0',
    ringColor: '#DAA520',
    ringPresence: '0',
    roughness: '30'
  };
  
  Object.entries(defaults).forEach(([key, value]) => {
    const element = document.getElementById(key);
    if (element) {
      element.value = value;
      
      // Update display values
      const valueSpan = document.getElementById(key + 'Value');
      if (valueSpan) {
        valueSpan.textContent = value;
      }
    }
  });
  
  createGlobe();
}

// Save planet to local storage with error handling
function setupSaveButton() {
  const savePlanetBtn = document.getElementById('savePlanetBtn');
  const saveModal = document.getElementById('saveModal');
  const confirmSaveBtn = document.getElementById('confirmSaveBtn');
  const cancelSaveBtn = document.getElementById('cancelSaveBtn');
  const planetNameInput = document.getElementById('planetName');
  
  if (!savePlanetBtn || !saveModal) return;
  
  // Open modal
  savePlanetBtn.addEventListener('click', () => {
    saveModal.classList.remove('hidden');
    planetNameInput.focus();
    planetNameInput.value = '';
  });
  
  // Close modal
  cancelSaveBtn.addEventListener('click', () => {
    saveModal.classList.add('hidden');
  });
  
  // Confirm save
  confirmSaveBtn.addEventListener('click', savePlanetToStorage);
  
  // Save on Enter key
  planetNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      savePlanetToStorage();
    }
  });
  
  // Close on background click
  saveModal.addEventListener('click', (e) => {
    if (e.target === saveModal) {
      saveModal.classList.add('hidden');
    }
  });
}

// Save planet data to local storage
function savePlanetToStorage() {
  const planetName = document.getElementById('planetName').value.trim();
  
  if (!planetName) {
    alert('Please enter a planet name');
    return;
  }
  
  if (planetName.length > 50) {
    alert('Planet name must be 50 characters or less');
    return;
  }
  
  try {
    // Get canvas as high-quality image
    const canvas = renderer.domElement;
    const imageData = canvas.toDataURL('image/png');
    
    // Create planet object
    const planet = {
      id: Date.now(),
      name: planetName,
      created: new Date().toISOString(),
      config: { ...planetState },
      thumbnail: imageData
    };
    
    // Retrieve and update saved planets
    let savedPlanets = JSON.parse(localStorage.getItem('savedPlanets') || '[]');
    
    // Check storage limit (browser typically allows 5-10MB)
    const storageSize = new Blob([JSON.stringify(planet)]).size;
    const totalSize = savedPlanets.reduce((sum, p) => sum + new Blob([JSON.stringify(p)]).size, 0);
    
    if (totalSize + storageSize > 9 * 1024 * 1024) {
      alert('Storage limit reached. Please delete some planets to save new ones.');
      return;
    }
    
    savedPlanets.push(planet);
    localStorage.setItem('savedPlanets', JSON.stringify(savedPlanets));
    
    // Success feedback
    alert(`🌍 Planet "${planetName}" saved successfully!\nVisit "Saved Planets" to view your creation.`);
    document.getElementById('planetName').value = '';
    document.getElementById('saveModal').classList.add('hidden');
    
  } catch (error) {
    console.error('Error saving planet:', error);
    alert('Failed to save planet. Storage may be full.');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    initThreeJS();
    setupControlListeners();
    setupSaveButton();
    console.log('Planet Creator initialized successfully');
  } catch (error) {
    console.error('Error initializing Planet Creator:', error);
    document.getElementById('canvas-container').innerHTML = 
      '<div style="color: #ff4444; padding: 20px; text-align: center;">Error initializing 3D viewer. Please refresh the page.</div>';
  }
});

// Handle any uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});