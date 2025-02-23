import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const Sphere = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer setup with better shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 100);

    // Scene setup
    const scene = new THREE.Scene();

    // Enhanced lighting setup
    const sunLight = new THREE.PointLight(0xFFFFFF, 3, 1000);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Add multiple ambient lights for better overall illumination
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambientLight);

    // Add hemispheric light for better top-down illumination
    const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 1);
    scene.add(hemisphereLight);

    // Create a clock for timing
    const clock = new THREE.Clock();
    clock.start(); // Explicitly start the clock

    // Orbit Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.enablePan = true;

    // Create Sun with stronger emission
    const createSun = () => {
      const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
      const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xFDB813,
        emissive: 0xFDB813,
        emissiveIntensity: 2
      });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      scene.add(sun);
      return sun;
    };

    // Function to create an orbit line with better visibility
    function createOrbit(radius) {
      const orbitPoints = [];
      const segments = 128;

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(
          Math.cos(theta) * radius,
          0,
          Math.sin(theta) * radius
        ));
      }

      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        opacity: 0.5,
        transparent: true
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);
    }

    function makeInstance({ radius, color, orbitRadius, rotationSpeed, revolutionSpeed }) {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7,
        emissive: color,
        emissiveIntensity: 0.1
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      const pivot = new THREE.Object3D();
      scene.add(pivot);
      pivot.add(mesh);
      mesh.position.x = orbitRadius;
      
      return { mesh, pivot, rotationSpeed, revolutionSpeed };
    }

    const planetsData = [
      { 
        name: "Mercury",
        radius: 0.38,
        color: 0xC0C0C0,
        orbitRadius: 8,
        rotationSpeed: 0.05,
        revolutionSpeed: 0.04
      },
      { 
        name: "Venus",
        radius: 0.95,
        color: 0xFFC649,
        orbitRadius: 14,
        rotationSpeed: -0.04,
        revolutionSpeed: 0.03
      },
      { 
        name: "Earth",
        radius: 1,
        color: 0x4169E1,
        orbitRadius: 20,
        rotationSpeed: 0.035,
        revolutionSpeed: 0.025
      },
      { 
        name: "Mars",
        radius: 0.53,
        color: 0xFF4500,
        orbitRadius: 26,
        rotationSpeed: 0.03,
        revolutionSpeed: 0.02
      },
      { 
        name: "Jupiter",
        radius: 2.2,
        color: 0xD2691E,
        orbitRadius: 36,
        rotationSpeed: 0.065,
        revolutionSpeed: 0.01
      },
      { 
        name: "Saturn",
        radius: 2.0,
        color: 0xDAA520,
        orbitRadius: 46,
        rotationSpeed: 0.06,
        revolutionSpeed: 0.008
      },
      { 
        name: "Uranus",
        radius: 1.5,
        color: 0x40E0D0,
        orbitRadius: 56,
        rotationSpeed: -0.05,
        revolutionSpeed: 0.006
      },
      { 
        name: "Neptune",
        radius: 1.4,
        color: 0x191970,
        orbitRadius: 64,
        rotationSpeed: 0.045,
        revolutionSpeed: 0.005
      }
    ];

    const sun = createSun();
    const planets = planetsData.map(makeInstance);
    planetsData.forEach(planet => createOrbit(planet.orbitRadius));

    // Create stars in random positions
    function createStar() {
      const starGeometry = new THREE.SphereGeometry(0.2, 9, 9);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const star = new THREE.Mesh(starGeometry, starMaterial);

      // Random position for stars within a range
      star.position.set(
        Math.random() * 200 - 100, // X position in the range [-100, 100]
        Math.random() * 200 - 100, // Y position in the range [-100, 100]
        Math.random() * 200 - 100  // Z position in the range [-100, 100]
      );
      scene.add(star);
    }

    // Create 10-15 stars
    for (let i = 0; i < 100; i++) {
      createStar();
    }

    let lastTime = 0;
    function animate(currentTime) {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      sun.rotation.y += 0.005;

      planets.forEach((planet) => {
        planet.mesh.rotation.y += planet.rotationSpeed;
        planet.pivot.rotation.y += planet.revolutionSpeed;
      });

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

const Antarikshya = () => {
  return (
    <Sphere />
  );
};

export default Antarikshya;
