import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const Sphere = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Camera setup
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1, 10);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background

    // Light setup
    const light = new THREE.DirectionalLight(0xFFFFFF, 3);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // Add ambient light to better see the spheres
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

// Orbit Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 1;
controls.enableZoom = true; // Enable zooming
controls.minDistance = 2; // Set a reasonable minimum zoom distance
controls.maxDistance = 50; // Set a reasonable maximum zoom distance
controls.enablePan = false;
controls.update();


    function makeInstance({ radius = 1, widthSegments = 32, heightSegments = 32, color, position, rotationSpeed = 0.001 }) {
      const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      const material = new THREE.MeshPhongMaterial({ color, shininess: 30 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position.x, position.y, position.z);
      mesh.rotationSpeed = rotationSpeed;

      scene.add(mesh);
      return mesh;
    }

    // Define planets with their properties
    const planetsData = [
      { radius: 0.8, color: 0xC0C0C0, position: { x: -16, y: 0, z: 0 }, rotationSpeed: 0.005 },
      { radius: 1.2, color: 0xFFD700, position: { x: -12, y: 0, z: 0 }, rotationSpeed: 0.004 },
      { radius: 1.3, color: 0x4169E1, position: { x: -8, y: 0, z: 0 }, rotationSpeed: 0.003 },
      { radius: 1.1, color: 0xFF4500, position: { x: -4, y: 0, z: 0 }, rotationSpeed: 0.0035 },
      { radius: 2.5, color: 0xFFA500, position: { x: 0, y: 0, z: 0 }, rotationSpeed: 0.002 },
      { radius: 1.5, color: 0xDAA520, position: { x: 4, y: 0, z: 0 }, rotationSpeed: 0.0025 },
      { radius: 1.8, color: 0x40E0D0, position: { x: 8, y: 0, z: 0 }, rotationSpeed: 0.003 },
      { radius: 1.7, color: 0x0000CD, position: { x: 12, y: 0, z: 0 }, rotationSpeed: 0.0035 },
      { radius: 0.7, color: 0x8B4513, position: { x: 16, y: 0, z: 0 }, rotationSpeed: 0.004 }
    ];

    const planets = planetsData.map(makeInstance);

    // Animation loop
    function animate(time) {
      time *= 0.001; // convert time to seconds

      planets.forEach((planet) => {
        planet.rotation.y += planet.rotationSpeed;
      });

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Resize handler
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener("resize", handleResize);
    controls.addEventListener("change", () => requestAnimationFrame(animate));

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      planets.forEach(planet => {
        planet.geometry.dispose();
        planet.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

const Antarikshya = () => {
  return <Sphere />;
};

export default Antarikshya;
