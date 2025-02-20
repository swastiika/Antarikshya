
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./start.css"
function Antarikshya() {
      const canvasRef = useRef(null);
    
      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        const fov = 75;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 100;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 50, 0);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 0, 0);
    
        const scene = new THREE.Scene();
        const light = new THREE.PointLight(0xffffff, 3);
        scene.add(light);
    
        const objects = [];
    
        // Creating the Sun
        const radius = 1;
        const widthSegments = 32;
        const heightSegments = 32;
        const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
        const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
        sunMesh.scale.set(5, 5, 5);
        scene.add(sunMesh);
    
        // Creating Earth
        const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233FF, emissive: 0x112244 });
        const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
        earthMesh.position.x = 10;  // Earth's initial position
        scene.add(earthMesh);
        objects.push(earthMesh);
    
        // Creating Mars
        const marsMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff0 });
        const marsMesh = new THREE.Mesh(sphereGeometry, marsMaterial);
        marsMesh.position.x = 15;  // Mars' initial position
        scene.add(marsMesh);
        objects.push(marsMesh);
    
        // Variables to track the orbit of Earth and Mars
        let earthAngle = 0;
        let marsAngle = 0;
        const earthRadius = 10; // Distance from Sun
        const marsRadius = 15;  // Distance from Sun
    
        function animate() {
          requestAnimationFrame(animate);
    
          // Rotate the Sun on its own axis
          sunMesh.rotation.y += 0.01;
    
          // Animate rotation for all planets in the array
          objects.forEach((obj) => {
            obj.rotation.y += 0.005; // Rotate on their own axes
          });
    
          // Update Earth's position along its orbit (circular path around the Sun)
          earthMesh.position.x = earthRadius * Math.cos(earthAngle);
          earthMesh.position.z = earthRadius * Math.sin(earthAngle);
          earthAngle += 0.005;  // Adjust orbit speed
    
          // Update Mars' position along its orbit (circular path around the Sun)
          marsMesh.position.x = marsRadius * Math.cos(marsAngle);
          marsMesh.position.z = marsRadius * Math.sin(marsAngle);
          marsAngle += 0.003;  // Adjust orbit speed
    
          // Render the scene
          renderer.render(scene, camera);
        }
    
        animate();
    
        return () => {
          renderer.dispose();
        };
      }, []);
    
      return <canvas ref={canvasRef} />;
    
    
}

export default Antarikshya;
