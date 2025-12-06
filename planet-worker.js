// Web Worker for parallel planet generation
// This worker receives generation requests and returns ImageData

self.onmessage = function(event) {
  const { planetId, width, height, seed, settings } = event.data;
  
  try {
    // Generate planet texture in background thread
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Simple procedural generation as placeholder
    // In production, this would call the full renderPlanetTexture function
    generateSimplePlanet(ctx, width, height, seed, settings);
    
    // Get the image data
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Send back to main thread
    self.postMessage({
      planetId: planetId,
      textureData: imageData,
      status: 'complete'
    });
  } catch (e) {
    console.error('Worker error:', e);
    self.postMessage({
      planetId: planetId,
      error: e.message,
      status: 'error'
    });
  }
};

// Simplified planet generation for Web Worker
function generateSimplePlanet(ctx, width, height, seed, settings) {
  // Extract settings
  const { rockColor, oceanColor } = settings;
  
  // Fill base with ocean
  ctx.fillStyle = oceanColor;
  ctx.fillRect(0, 0, width, height);
  
  // Generate simple noise-based terrain
  const octaves = 4;
  const scale = 30;
  const noiseMap = generateNoise(width, height, scale, seed, octaves);
  
  // Draw terrain
  const rockRgb = hexToRgb(rockColor);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const noiseVal = noiseMap[idx] || 0;
      
      // Terrain threshold
      if (noiseVal > 0.4) {
        // Vary rock color slightly
        const brightness = Math.floor((noiseVal - 0.4) * 150);
        const r = Math.max(0, Math.min(255, rockRgb.r + brightness));
        const g = Math.max(0, Math.min(255, rockRgb.g + brightness));
        const b = Math.max(0, Math.min(255, rockRgb.b + brightness));
        
        const imageData = ctx.createImageData(1, 1);
        imageData.data[0] = r;
        imageData.data[1] = g;
        imageData.data[2] = b;
        imageData.data[3] = 255;
        ctx.putImageData(imageData, x, y);
      }
    }
  }
}

// Simple Perlin-like noise generator
function generateNoise(width, height, scale, seed, octaves) {
  const noise = new Array(width * height).fill(0);
  
  function seededRandom(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }
  
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let oct = 0; oct < octaves; oct++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sx = (x / scale) * frequency;
        const sy = (y / scale) * frequency;
        const value = seededRandom(Math.floor(sx), Math.floor(sy)) * amplitude;
        noise[y * width + x] += value;
      }
    }
    amplitude *= 0.5;
    frequency *= 2;
    maxValue += amplitude;
  }
  
  // Normalize
  for (let i = 0; i < noise.length; i++) {
    noise[i] = (noise[i] / maxValue + 1) / 2;
  }
  
  return noise;
}

// Convert hex color to RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

