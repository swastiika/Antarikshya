import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

const Sphere = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);

    const scene = new THREE.Scene();

    const sunLight = new THREE.PointLight(0xFFFFFF, 3, 1000);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 1);
    scene.add(hemisphereLight);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.enablePan = true;

    function createSun() {
      const geometry = new THREE.SphereGeometry(4, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        emissive: 0xFFD700,
        emissiveIntensity: 2,
        roughness: 0.5,
      });
      const sun = new THREE.Mesh(geometry, material);
      scene.add(sun);
      return sun;
    }

    function createOrbit(radius) {
      const points = [];
      for (let i = 0; i <= 128; i++) {
        const theta = (i / 128) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x666666, opacity: 0.5, transparent: true });
      scene.add(new THREE.Line(geometry, material));
    }

    function makeInstance({ radius, color, orbitRadius, rotationSpeed, revolutionSpeed }) {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.7, emissive: color, emissiveIntensity: 0.1 });
      const mesh = new THREE.Mesh(geometry, material);
      const pivot = new THREE.Object3D();
      scene.add(pivot);
      pivot.add(mesh);
      mesh.position.x = orbitRadius;
      return { mesh, pivot, rotationSpeed, revolutionSpeed };
    }

    const planetsData = [
      { name: "Mercury", radius: 0.38, color: 0xC0C0C0, orbitRadius: 8, rotationSpeed: 0.05, revolutionSpeed: 0.04 },
      { name: "Venus", radius: 0.95, color: 0xFFC649, orbitRadius: 14, rotationSpeed: -0.04, revolutionSpeed: 0.03 },
      { name: "Earth", radius: 1, color: 0x4169E1, orbitRadius: 20, rotationSpeed: 0.035, revolutionSpeed: 0.025 },
      { name: "Mars", radius: 0.53, color: 0xFF4500, orbitRadius: 26, rotationSpeed: 0.03, revolutionSpeed: 0.02 },
      { name: "Jupiter", radius: 2.2, color: 0xD2691E, orbitRadius: 36, rotationSpeed: 0.065, revolutionSpeed: 0.01 },
      { name: "Saturn", radius: 2.0, color: 0xDAA520, orbitRadius: 46, rotationSpeed: 0.06, revolutionSpeed: 0.008 },
      { name: "Uranus", radius: 1.5, color: 0x40E0D0, orbitRadius: 56, rotationSpeed: -0.05, revolutionSpeed: 0.006 },
      { name: "Neptune", radius: 1.4, color: 0x191970, orbitRadius: 64, rotationSpeed: 0.045, revolutionSpeed: 0.005 }
    ];

    const sun = createSun();
    const planets = planetsData.map(makeInstance);
    planetsData.forEach(planet => createOrbit(planet.orbitRadius));

    function createStars() {
      for (let i = 0; i < 100; i++) {
        const star = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
        star.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100);
        scene.add(star);
      }
    }
    createStars();

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloomPass);

    let lastTime = 0;
    function animate(currentTime) {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      sun.rotation.y += 0.005;
      planets.forEach(planet => {
        planet.mesh.rotation.y += planet.rotationSpeed;
        planet.pivot.rotation.y += planet.revolutionSpeed;
      });

      controls.update();
      composer.render();
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
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

const Antarikshya = () => <Sphere />;
export default Antarikshya;
