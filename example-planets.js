// Example Planet Configurations
// Copy these configurations into localStorage to test different planet types
// In browser console: localStorage.setItem('savedPlanets', JSON.stringify(examplePlanets))

const examplePlanets = [
  {
    id: 1000001,
    name: "Earth-Like",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#8B7355",
      surfaceDensity: 45,
      oceanColor: "#1E90FF",
      oceanCoverage: 70,
      iceColor: "#FFFFFF",
      iceCoverage: 15,
      atmosphereColor: "#87CEEB",
      atmosphereDensity: 60,
      cloudColor: "#FFFFFF",
      cloudCoverage: 40,
      lavaColor: "#FF4500",
      volcanoCoverage: 0,
      roughness: 50,
      ringPresence: 0,
      ringColor: "#DAA520"
    },
    thumbnail: "" // Will be filled with actual image data
  },
  {
    id: 1000002,
    name: "Mars-Red Planet",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#CD5C5C",
      surfaceDensity: 75,
      oceanColor: "#8B4513",
      oceanCoverage: 5,
      iceColor: "#E0FFFF",
      iceCoverage: 20,
      atmosphereColor: "#FFB6C1",
      atmosphereDensity: 30,
      cloudColor: "#DEB887",
      cloudCoverage: 10,
      lavaColor: "#DC143C",
      volcanoCoverage: 15,
      roughness: 70,
      ringPresence: 0,
      ringColor: "#DAA520"
    },
    thumbnail: ""
  },
  {
    id: 1000003,
    name: "Venus-Yellow",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#DAA520",
      surfaceDensity: 60,
      oceanColor: "#F0E68C",
      oceanCoverage: 20,
      iceColor: "#FFFACD",
      iceCoverage: 0,
      atmosphereColor: "#FFFFE0",
      atmosphereDensity: 95,
      cloudColor: "#FFFACD",
      cloudCoverage: 90,
      lavaColor: "#FF6347",
      volcanoCoverage: 25,
      roughness: 40,
      ringPresence: 0,
      ringColor: "#DAA520"
    },
    thumbnail: ""
  },
  {
    id: 1000004,
    name: "Saturn-With Rings",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#F4A460",
      surfaceDensity: 50,
      oceanColor: "#FFD700",
      oceanCoverage: 30,
      iceColor: "#FAFAF0",
      iceCoverage: 8,
      atmosphereColor: "#FFDAB9",
      atmosphereDensity: 70,
      cloudColor: "#FFEFD5",
      cloudCoverage: 60,
      lavaColor: "#FF4500",
      volcanoCoverage: 0,
      roughness: 35,
      ringPresence: 85,
      ringColor: "#DAA520"
    },
    thumbnail: ""
  },
  {
    id: 1000005,
    name: "Ice World",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#B0C4DE",
      surfaceDensity: 40,
      oceanColor: "#4169E1",
      oceanCoverage: 50,
      iceColor: "#FFFFFF",
      iceCoverage: 80,
      atmosphereColor: "#B0E0E6",
      atmosphereDensity: 85,
      cloudColor: "#F0FFFF",
      cloudCoverage: 70,
      lavaColor: "#FF4500",
      volcanoCoverage: 0,
      roughness: 60,
      ringPresence: 0,
      ringColor: "#DAA520"
    },
    thumbnail: ""
  },
  {
    id: 1000006,
    name: "Volcanic Hellscape",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#2F4F4F",
      surfaceDensity: 90,
      oceanColor: "#8B0000",
      oceanCoverage: 40,
      iceColor: "#696969",
      iceCoverage: 0,
      atmosphereColor: "#FF6347",
      atmosphereDensity: 80,
      cloudColor: "#DC143C",
      cloudCoverage: 50,
      lavaColor: "#FFD700",
      volcanoCoverage: 70,
      roughness: 85,
      ringPresence: 30,
      ringColor: "#FF4500"
    },
    thumbnail: ""
  },
  {
    id: 1000007,
    name: "Desert Planet",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#DAA520",
      surfaceDensity: 95,
      oceanColor: "#F0E68C",
      oceanCoverage: 0,
      iceColor: "#FFFACD",
      iceCoverage: 2,
      atmosphereColor: "#FFB347",
      atmosphereDensity: 40,
      cloudColor: "#FFFACD",
      cloudCoverage: 5,
      lavaColor: "#CD853F",
      volcanoCoverage: 10,
      roughness: 75,
      ringPresence: 20,
      ringColor: "#D2B48C"
    },
    thumbnail: ""
  },
  {
    id: 1000008,
    name: "Ocean Paradise",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#228B22",
      surfaceDensity: 25,
      oceanColor: "#00CED1",
      oceanCoverage: 85,
      iceColor: "#F8F8FF",
      iceCoverage: 5,
      atmosphereColor: "#87CEEB",
      atmosphereDensity: 65,
      cloudColor: "#FFFFFF",
      cloudCoverage: 35,
      lavaColor: "#FF4500",
      volcanoCoverage: 0,
      roughness: 25,
      ringPresence: 0,
      ringColor: "#DAA520"
    },
    thumbnail: ""
  },
  {
    id: 1000009,
    name: "Gas Giant Blue",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#1E90FF",
      surfaceDensity: 50,
      oceanColor: "#0066CC",
      oceanCoverage: 100,
      iceColor: "#E0F6FF",
      iceCoverage: 0,
      atmosphereColor: "#4169E1",
      atmosphereDensity: 90,
      cloudColor: "#87CEEB",
      cloudCoverage: 75,
      lavaColor: "#FF4500",
      volcanoCoverage: 0,
      roughness: 40,
      ringPresence: 60,
      ringColor: "#ADD8E6"
    },
    thumbnail: ""
  },
  {
    id: 1000010,
    name: "Alien Purple",
    created: "2025-12-02T10:00:00Z",
    config: {
      rockColor: "#9932CC",
      surfaceDensity: 65,
      oceanColor: "#8B008B",
      oceanCoverage: 50,
      iceColor: "#DDA0DD",
      iceCoverage: 25,
      atmosphereColor: "#EE82EE",
      atmosphereDensity: 75,
      cloudColor: "#DDA0DD",
      cloudCoverage: 55,
      lavaColor: "#FF1493",
      volcanoCoverage: 20,
      roughness: 65,
      ringPresence: 40,
      ringColor: "#9932CC"
    },
    thumbnail: ""
  }
];

// Instructions for testing:
// 1. Open the browser console (F12)
// 2. Copy the examplePlanets array above
// 3. Run this in console:
//    localStorage.setItem('savedPlanets', JSON.stringify(examplePlanets))
// 4. Navigate to "Saved Planets" page
// 5. You'll see all example planets (thumbnails will be empty but configs are there)

// To load with proper thumbnails, save planets in the creator first!
