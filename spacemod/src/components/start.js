// Previous imports remain the same...
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// Since we don't have actual textures, let's create procedural textures for each planet
const generatePlanetTexture = (baseColor) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Fill background with slightly brighter base color
  const color = new THREE.Color(baseColor);
  color.offsetHSL(0, 0, 0.1); // Slightly brighten
  ctx.fillStyle = color.getStyle();
  ctx.fillRect(0, 0, 256, 256);

  // Add noise/variation for texture
  for (let i = 0; i < 2000; i++) { // Increased noise density
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const brightness = (Math.random() - 0.5) * 0.3; // Higher contrast
    const spotSize = Math.random() * 3 + 1; // Vary spot size

    const noiseColor = new THREE.Color(baseColor);
    noiseColor.offsetHSL(0, 0, brightness);
    ctx.fillStyle = noiseColor.getStyle();

    ctx.beginPath();
    ctx.arc(x, y, spotSize, 0, 2 * Math.PI);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};


const planetsData = [
  { 
    name: "Mercury", 
    radius: 0.38, 
    baseColor: "#A67C52",  // Brighter brown
    orbitRadius: 8, 
    rotationSpeed: 0.0001, 
    revolutionSpeed: 0.0004,
    tilt: 0.034
  },
  { 
    name: "Venus", 
    radius: 0.95, 
    baseColor: "#FFAA33",  // Brighter orange
    orbitRadius: 14, 
    rotationSpeed: -0.00004, 
    revolutionSpeed: 0.0003,
    tilt: 177.3
  },
  { 
    name: "Earth", 
    radius: 1, 
    baseColor: "#3C9EFF",  // Brighter blue
    orbitRadius: 20, 
    rotationSpeed: 0.0001, 
    revolutionSpeed: 0.00025,
    tilt: 23.5,
    moon: {
      radius: 0.27,
      baseColor: "#DDDDDD", // Brighter gray
      orbitRadius: 1.5,
      rotationSpeed: 0.01,
      revolutionSpeed: 0.001
    }
  },
  { 
    name: "Mars", 
    radius: 0.53, 
    baseColor: "#FF5733",  // Brighter red-orange
    orbitRadius: 26, 
    rotationSpeed: 0.0001, 
    revolutionSpeed: 0.0002,
    tilt: 25.2
  },
  { 
    name: "Jupiter", 
    radius: 2.2, 
    baseColor: "#E0A96D",  // Warmer tan
    orbitRadius: 36, 
    rotationSpeed: 0.00024, 
    revolutionSpeed: 0.0001,
    tilt: 3.13
  },
  { 
    name: "Saturn", 
    radius: 2.0, 
    baseColor: "#E7B74B",  // Brighter gold
    orbitRadius: 46, 
    rotationSpeed: 0.00022, 
    revolutionSpeed: 0.00008,
    tilt: 26.7,
    hasRings: true
  },
  { 
    name: "Uranus", 
    radius: 1.5, 
    baseColor: "#5FD8E0",  // Brighter cyan
    orbitRadius: 56, 
    rotationSpeed: -0.015, 
    revolutionSpeed: 0.00006,
    tilt: 97.8
  },
  { 
    name: "Neptune", 
    radius: 1.4, 
    baseColor: "#4B7CFF",  // More vibrant blue
    orbitRadius: 64, 
    rotationSpeed: 0.017, 
    revolutionSpeed: 0.00005,
    tilt: 28.3
  }
];

// ORBIT_COLORS and createOrbitLine remain the same...
const ORBIT_COLORS = {
  Mercury: 0x8B7355,
  Venus: 0xFFA500,
  Earth: 0x4169E1,
  Mars: 0xFF4500,
  Jupiter: 0xDEB887,
  Saturn: 0xFFD700,
  Uranus: 0x40E0D0,
  Neptune: 0x4169E1
};

const createOrbitLine = (radius, color) => {
  const segments = 128;
  const points = [];
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(theta) * radius,
      0,
      Math.sin(theta) * radius
    ));
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  
  return new THREE.Line(geometry, material);
};

const setupRenderer = (canvas) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    logarithmicDepthBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  return renderer;
};

const setupScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  return scene;
};

const setupCamera = () => {
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(-50, 100, 250); // Adjusted position for better initial view
  return camera;
};

const setupControls = (camera, canvas) => {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 1000;
  controls.minDistance = 20; // Increased minimum distance to prevent getting too close to sun
  controls.target.set(0, 0, 0); // Set orbit center to sun position
  
  // Optional: Limit vertical orbit to prevent extreme angles
  controls.minPolarAngle = Math.PI * 0.1; // Limit how high user can orbit
  controls.maxPolarAngle = Math.PI * 0.9; // Limit how low user can orbit
  return controls;
};


function createSun() {
  // Create sun geometry and material
  const geometry = new THREE.SphereGeometry(4, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    emissive: 0xFFD700,
        emissiveIntensity: 2,
        roughness: 0.5,
    metalness: 0,
  });
  
  // Create sun mesh
  const sunMesh = new THREE.Mesh(geometry, material);
  sunMesh.position.set(0, 0, 0); // Ensure sun is at center
  
  // Create point light
  const sunLight = new THREE.PointLight(0xFFFFFF, 3, 1000);
  sunLight.position.set(0, 0, 0);
  
  // Add light to sun mesh
  sunMesh.add(sunLight);
  
  // Enhanced glow effect
  const glowGeometry = new THREE.SphereGeometry(4.5, 32, 32); // Slightly larger glow
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFD700,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  sunMesh.add(glow);
  
  return {
    mesh: sunMesh,
    light: sunLight,
    glow: glow
  };
}




const setupLighting = () => {
  const lights = {
    sunLight: new THREE.PointLight(0xffffff, 2, 1000, 1),
    ambientLight: new THREE.AmbientLight(0x333333)
  };
  
  lights.sunLight.position.set(0, 0, 0);
  return lights;
};

const createStarField = () => {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8
  });

  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starVertices, 3)
  );
  return new THREE.Points(starGeometry, starMaterial);
};

const createPlanetMoon = (planetData) => {
  if (!planetData.moon) return null;

  const moonTexture = generatePlanetTexture(planetData.moon.baseColor);
  const moonGeometry = new THREE.SphereGeometry(
    planetData.moon.radius,
    32,
    32
  );
  const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,
    roughness: 0.7,
    metalness: 0.3
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  
  const moonPivot = new THREE.Object3D();
  moon.position.x = planetData.moon.orbitRadius;
  
  moonPivot.add(moon);
  return { moon, moonPivot };
};

const createPlanetRings = (planetRadius) => {
  const ringGeometry = new THREE.RingGeometry(
    planetRadius * 1.4,
    planetRadius * 2.4,
    64
  );
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xAA9977,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    roughness: 0.7
  });
  const rings = new THREE.Mesh(ringGeometry, ringMaterial);
  rings.rotation.x = Math.PI / 2;
  return rings;
};

const createPlanet = (planetData) => {
  const texture = generatePlanetTexture(planetData.baseColor);
  
  const geometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.7,
    metalness: 0.3
  });
  
  const planet = new THREE.Mesh(geometry, material);
  planet.castShadow = true;
  planet.receiveShadow = true;
  
  // Create orbit
  const orbit = createOrbitLine(
    planetData.orbitRadius,
    ORBIT_COLORS[planetData.name]
  );

  // Create pivot for revolution
  const pivot = new THREE.Object3D();
  pivot.add(planet);
  planet.position.x = planetData.orbitRadius;

  // Apply planet tilt
  planet.rotation.x = THREE.MathUtils.degToRad(planetData.tilt);

  // Add moon if planet has one
  let moon, moonPivot;
  if (planetData.moon) {
    const moonSystem = createPlanetMoon(planetData);
    moon = moonSystem.moon;
    moonPivot = moonSystem.moonPivot;
    planet.add(moonPivot);
  }

  // Add rings if planet has them
  if (planetData.hasRings) {
    const rings = createPlanetRings(planetData.radius);
    planet.add(rings);
  }

  return {
    mesh: planet,
    pivot,
    moon,
    moonPivot,
    orbit,
    data: planetData
  };
};

const setupPostProcessing = (renderer, scene, camera) => {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.5,    // Increased intensity
    0.5,    // Radius
    0.1     // Lower threshold for more glow
  );
  
  bloomPass.threshold = 0.1;
  bloomPass.strength = 3.0;
  bloomPass.radius = 0.8;
  
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  return composer;
};

const Sphere = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup basic components
    const renderer = setupRenderer(canvas);
    const scene = setupScene();
    const camera = setupCamera();
    const controls = setupControls(camera, canvas);

    // Add sun
    const sun = createSun();
     scene.add(sun.mesh);
     
    // Add lighting
    const lights = setupLighting();
    Object.values(lights).forEach(light => scene.add(light));

    // Add stars
    const stars = createStarField();
    scene.add(stars);

    // Create planets
    const planets = planetsData.map(planetData => {
      const planet = createPlanet(planetData);
      scene.add(planet.pivot);
      scene.add(planet.orbit);
      return planet;
    });

    // Setup post-processing
    const composer = setupPostProcessing(renderer, scene, camera);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();


      // Update planets
      planets.forEach(planet => {
        planet.mesh.rotation.y += planet.data.rotationSpeed;
        planet.pivot.rotation.y += planet.data.revolutionSpeed;

        if (planet.moon && planet.moonPivot) {
          planet.moon.rotation.y += planet.data.moon.rotationSpeed;
          planet.moonPivot.rotation.y += planet.data.moon.revolutionSpeed;
        }
      });

      composer.render();
    }

    // Handle window resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />;
};


const Antarikshya = () => <Sphere />;
export default Antarikshya;