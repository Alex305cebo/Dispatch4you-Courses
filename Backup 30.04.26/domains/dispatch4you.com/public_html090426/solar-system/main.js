// Three.js Solar System - Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Starfield
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}
createStarfield();


// Celestial bodies data
const celestialBodies = [
    { name: 'Sun', radius: 10, color: 0xfdb813, distance: 0, speed: 0, info: 'Звезда в центре Солнечной системы' },
    { name: 'Mercury', radius: 1.5, color: 0x8c7853, distance: 20, speed: 0.04, info: 'Ближайшая к Солнцу планета' },
    { name: 'Venus', radius: 2.5, color: 0xffc649, distance: 30, speed: 0.015, info: 'Вторая планета от Солнца' },
    { name: 'Earth', radius: 2.5, color: 0x4169e1, distance: 40, speed: 0.01, info: 'Наш дом' },
    { name: 'Mars', radius: 2, color: 0xcd5c5c, distance: 50, speed: 0.008, info: 'Красная планета' },
    { name: 'Jupiter', radius: 8, color: 0xdaa520, distance: 70, speed: 0.002, info: 'Самая большая планета' },
    { name: 'Saturn', radius: 7, color: 0xf4a460, distance: 90, speed: 0.0009, info: 'Планета с кольцами', hasRings: true },
    { name: 'Uranus', radius: 4, color: 0x4fd0e0, distance: 110, speed: 0.0004, info: 'Ледяной гигант' },
    { name: 'Neptune', radius: 4, color: 0x4169e1, distance: 130, speed: 0.0001, info: 'Самая дальняя планета' }
];

const planets = [];
const orbits = [];


// Create celestial objects
celestialBodies.forEach((body, index) => {
    const geometry = new THREE.SphereGeometry(body.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: body.color,
        emissive: index === 0 ? body.color : 0x000000,
        emissiveIntensity: index === 0 ? 0.5 : 0
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = body.distance;
    sphere.userData = {
        name: body.name,
        distance: body.distance,
        speed: body.speed,
        angle: Math.random() * Math.PI * 2,
        info: body.info
    };
    scene.add(sphere);
    planets.push(sphere);
    
    if (body.distance > 0) {
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitPoints = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            orbitPoints.push(Math.cos(angle) * body.distance, 0, Math.sin(angle) * body.distance);
        }
        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbitLine);
        orbits.push(orbitLine);
    }
    
    if (body.hasRings) {
        const ringGeometry = new THREE.RingGeometry(body.radius * 1.5, body.radius * 2.5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xc9b181, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        sphere.add(ring);
    }
});


// Controls
let orbitSpeed = 1;
let showOrbits = true;
let isPaused = false;

const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const toggleOrbitsBtn = document.getElementById('toggle-orbits');
const planetInfo = document.getElementById('planet-info');
const planetName = document.getElementById('planet-name');
const planetDetails = document.getElementById('planet-details');

speedSlider.addEventListener('input', (e) => {
    orbitSpeed = parseFloat(e.target.value);
    speedValue.textContent = orbitSpeed.toFixed(1) + 'x';
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
});

resetBtn.addEventListener('click', () => {
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
});

toggleOrbitsBtn.addEventListener('click', () => {
    showOrbits = !showOrbits;
    orbits.forEach(orbit => orbit.visible = showOrbits);
    toggleOrbitsBtn.textContent = showOrbits ? 'Hide Orbits' : 'Show Orbits';
});


// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);
    if (intersects.length > 0) {
        const planet = intersects[0].object;
        planetName.textContent = planet.userData.name;
        planetDetails.textContent = planet.userData.info;
        planetInfo.style.display = 'block';
    } else {
        planetInfo.style.display = 'none';
    }
});

// Camera controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        const rotationSpeed = 0.005;
        const radius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
        const theta = Math.atan2(camera.position.z, camera.position.x);
        const phi = Math.atan2(camera.position.y, radius);
        const newTheta = theta - deltaX * rotationSpeed;
        const newPhi = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, phi - deltaY * rotationSpeed));
        const newRadius = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2);
        camera.position.x = newRadius * Math.cos(newPhi) * Math.cos(newTheta);
        camera.position.y = newRadius * Math.sin(newPhi);
        camera.position.z = newRadius * Math.cos(newPhi) * Math.sin(newTheta);
        camera.lookAt(0, 0, 0);
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener('mouseup', () => { isDragging = false; });


// Zoom
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const direction = e.deltaY > 0 ? 1 : -1;
    const distance = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2);
    const newDistance = Math.max(20, Math.min(500, distance + direction * zoomSpeed * distance));
    const scale = newDistance / distance;
    camera.position.multiplyScalar(scale);
}, { passive: false });

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    if (!isPaused) {
        planets.forEach((planet) => {
            if (planet.userData.distance > 0) {
                planet.userData.angle += planet.userData.speed * orbitSpeed;
                planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
                planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
            }
            planet.rotation.y += 0.01;
        });
    }
    renderer.render(scene, camera);
}

animate();
console.log('Solar System initialized successfully!');
