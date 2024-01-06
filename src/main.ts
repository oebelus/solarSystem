import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const width = window.innerWidth
const height = window.innerHeight

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('app') as HTMLCanvasElement,
  alpha: true,
})

renderer.setSize(width, height)
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(30, width/height, 0.5, 1000)
camera.position.z = 200
camera.position.y = -100
camera.position.x = -120

const scene = new THREE.Scene()

let controls = new OrbitControls( camera, renderer.domElement );
controls.listenToKeyEvents( window ); // optional

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;

controls.screenSpacePanning = false;

controls.minDistance = 50;
controls.maxDistance = 500;

controls.maxPolarAngle = Math.PI / 2;

class Planet {
  geometry: any
  material: THREE.MeshStandardMaterial
  emissive: boolean | true
  element: any
  position: {x: number, y: number, z: number}

  constructor(radius: number, texturePath: string, x: number, y: number, z: number, emissive?: boolean, opacity?: number) {
    this.position = {x: x, y: y, z: z}
    this.emissive = false
    this.geometry = new THREE.SphereGeometry(radius, 64, 32)

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath); 
    
    
    this.material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, opacity: opacity?opacity:1 });
    if (emissive) {
      this.material.emissive = new THREE.Color(0xffffff); 
      this.material.emissiveMap = texture;
    } 
    this.element = new THREE.Mesh(this.geometry, this.material)
    this.element.receiveShadow = true;
    if (emissive) this.element.receiveShadow = false;
  }

  draw() {
    scene.add(this.element)
    this.element.position.x = this.position.x
    this.element.position.y = this.position.y
    this.element.position.z = this.position.z
    this.element.rotation.x += 0.01
    this.element.rotation.y += 0.01
  }
}

// 1AU = 149,597,870.7 km

let data: Record<string, (string|number)[]> = {
  "sun": ["https://i.imgur.com/NT8Vd4p.jpg", 274, 696340/80000],
  "mercury": ["https://i.imgur.com/UQQRIZg.jpg", 3.7, 2439.7/2000, 0.39 * 32, 47.9],
  "venus": ["https://i.imgur.com/Wa8lpF6.jpg", 8.87, 6051.8/2000, 0.72 * 26, 35],
  "earth": ["https://i.imgur.com/Tajyxwl.jpg", 9.807, 6371/2000, 1 * 28, 29.8],
  "moon": ["https://i.imgur.com/OjvY5Pv.jpg", 1.62, 1737.4],
  "mars": ["https://i.imgur.com/U2QZveA.jpg", 3.71, 3389.5/2000, 1.524 * 25, 24],
  "jupiter": ["https://i.imgur.com/ZUVwSv5.jpg", 24.79, 69911/11000, 5.2 * 9.5, 13.1],
  "saturn": ["https://i.imgur.com/ITtPqGy.jpg", 10.44, 58232/11000, 9.54 * 7.5, 9.69],
  "uranus": ["https://i.imgur.com/wj611Q1.jpg", 8.87, 25362/11000, 19.22 * 5, 6.81],
  "neptune": ["https://i.imgur.com/KU2X0rf.jpg", 11.15, 24622/11000, 30.06 * 4, 5.43]
}

let radiusxplanet: Record<number, string> = {
  8.704250382774285: "Sun",
  1.2198500559833017: "Mercury",
  3.0259001459638144: "Venus",
  3.5259001478875116: "Venus",
  3.185500130233892: "Earth",
  3.6855001540113403: "Earth",
  1.1582667182536956: "Moon",
  1.6947500694595914: "Mars",
  6.355545774894747: "Jupiter",
  5.293818418589687: "Saturn",
  2.3056364758058585: "Uranus",
  2.2383637533349194: "Neptune",
  11.000000358397052: "Saturn",
  10.000000433298103: "Saturn",
  6.293818370685831: "Saturn",
  8.000000200741537: "Saturn",
  9.000000457952705: "Saturn",
  0.5000000163760792: "Deimos",
  0.8000000368848014: "Phobos"
}

// Create an elliptical curve representing the orbit
function orbit(xRadius: number, yRadius: number, ax = 0, ay = 0, opacity?: number): THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial> {
  let orbitPath = new THREE.EllipseCurve(
    ax, ay,           // ax, aY
    xRadius, yRadius,       // xRadius, yRadius
    0, 2 * Math.PI,  // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  );
  
  // Create a geometry from the path
  let points = orbitPath.getPoints(200);
  let geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  let material = new THREE.LineBasicMaterial({ color : "grey", transparent: true, opacity: opacity != undefined?opacity:0.5 });
  
  let ellipse = new THREE.Line(geometry, material);

  return ellipse;
}

function drawPlanet(planet: Planet, orbit: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial>) {
  planet.draw()
  orbit.add(planet.element)
  scene.add(orbit)
}

function rotate(planet: Planet) {
  planet.element.rotation.x += 0.01
  planet.element.rotation.y += 0.01
}

function saturnRing(plusInner: number, outer: number, color: string) {
  const geometry = new THREE.RingGeometry(data["saturn"][2] as number + plusInner, outer, 100);
  const material = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(geometry, material)
  ring.position.x = data["saturn"][3] as number
  ring.position.y = 2
  saturnOrbit.add(ring)
}

function phobdeim(color: string, radius: number, position:number): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> {
  const geometry = new THREE.SphereGeometry(radius, 60, 60); 
  const material = new THREE.MeshBasicMaterial({ color: color }); 
  const sphere = new THREE.Mesh( geometry, material ); 
  sphere.position.x = position
  sphere.position.y = 2
  return sphere
}

let sun = new Planet(data["sun"][2] as number, data["sun"][0] as string, 0, 0, 0, true);

// Mercury
let mercury = new Planet(data["mercury"][2] as number, data["mercury"][0] as string, data["mercury"][3] as number, 0, 0)
let mercuryOrbit = orbit(data["mercury"][3] as number, data["mercury"][3] as number)
drawPlanet(mercury, mercuryOrbit)

// Venus & its atmosphere
let venus = new Planet(data["venus"][2] as number, data["venus"][0] as string, data["venus"][3] as number, 0, 0)
let venusAtmosphere = new Planet(data["venus"][2] as number + 0.5, "https://i.imgur.com/UEoSeyB.jpg", data["venus"][3] as number, 0, 0, false, 0.7)
let venusOrbit = orbit(data["venus"][3] as number, data["venus"][3] as number)

venusAtmosphere.draw()
venusOrbit.add(venusAtmosphere.element)
drawPlanet(venus, venusOrbit)

// Earth, its moon & clouds
let earth = new Planet(data["earth"][2] as number, data["earth"][0] as string, data["earth"][3] as number, 0, 0)
let earthOrbit = orbit(data["earth"][3] as number, data["earth"][3] as number)
let moon = new Planet(data["moon"][2] as number as number/1500, data["moon"][0] as string, 7, 0, 0)
let moonOrbit = orbit(7, 7, 0, 0, 0)
let earthClouds = new Planet(data["earth"][2] as number + 0.5, "https://i.imgur.com/ZUDQ4Fd.jpg", data["earth"][3] as number, 0, 0, false, 0.8)

moon.draw()
earthClouds.draw()
moonOrbit.add(moon.element)
earth.element.add(moonOrbit)
earthOrbit.add(earthClouds.element)
drawPlanet(earth, earthOrbit)

// Mars
let mars = new Planet(data["mars"][2] as number, data["mars"][0] as string, data["mars"][3] as number, 0, 0)
let marsOrbit = orbit(data["mars"][3] as number, data["mars"][3] as number)
let deimos = phobdeim("#786D5D", 0.5, 4)
let deimosOrbit = orbit(4, 4, 0, 0, 0)
let phobos = phobdeim("#836953", 0.8, -data["mars"][2] as number - 1)
let phobosOrbit = orbit(1, 1, 0, 0, 0)

deimosOrbit.add(deimos)
phobosOrbit.add(phobos)
mars.element.add(phobosOrbit)
mars.element.add(deimosOrbit)
drawPlanet(mars, marsOrbit)

/*scene.add(deimosOrbit)
scene.add(phobosOrbit)
marsOrbit.add(deimos)
marsOrbit.add(phobos)*/

// Jupiter
let jupiter = new Planet(data["jupiter"][2] as number, data["jupiter"][0] as string, data["jupiter"][3] as number, 2, 0)
let jupiterOrbit = orbit(data["jupiter"][3] as number, data["jupiter"][3] as number)
drawPlanet(jupiter, jupiterOrbit)

// Saturn
let saturn = new Planet(data["saturn"][2] as number, data["saturn"][0] as string, data["saturn"][3] as number, 2, 0)
let saturnOrbit = orbit(data["saturn"][3] as number, data["saturn"][3] as number)
drawPlanet(saturn, saturnOrbit)

// Ring
saturnRing(1, 6, "#655f45")
saturnRing(1.2, 8, "#d8ae6d")
saturnRing(2, 9, "#ffe1ab")
saturnRing(3, 10, "#dbb57c")
saturnRing(4, 11, "#b89c72")

// Uranus
let uranus = new Planet(data["uranus"][2] as number, data["uranus"][0] as string, data["uranus"][3] as number, 3, 0)
let uranusOrbit = orbit(data["uranus"][3] as number, data["uranus"][3] as number)
drawPlanet(uranus, uranusOrbit)

// Neptune
let neptune = new Planet(data["neptune"][2] as number, data["neptune"][0] as string, data["neptune"][3] as number, 3, 0)
let neptuneOrbit = orbit(data["neptune"][3] as number, data["neptune"][3] as number)
drawPlanet(neptune, neptuneOrbit)

// LIGHTS
const light = new THREE.DirectionalLight(0xFFFFFF, 2)
light.position.set(-1, 0, -1)
scene.add(light)

const al = new THREE.AmbientLight(0xFFFFFF, 0.2)
scene.add(al)

let t:number;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const originalCameraPosition = new THREE.Vector3();
originalCameraPosition.copy(camera.position);

function onPointerMove( event:MouseEvent ) {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
var info = document.querySelector('.information');

function hover() {

	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );

	for ( let i = 0; i < intersects.length; i ++ ) {
    if (intersects[i].object instanceof THREE.Mesh) {
      if (intersects[i].object instanceof THREE.Mesh) {
        let mesh = intersects[i].object as THREE.Mesh
        if (info) {
          if (mesh.geometry.boundingSphere) {
            info.innerHTML = `${radiusxplanet[mesh.geometry.boundingSphere.radius]}`
          }
        }
      }
    }
	}
	renderer.render(scene, camera);
}

window.addEventListener('pointermove', onPointerMove);

window.addEventListener('resize', onWindowResize);

function animate() {
  requestAnimationFrame(animate)
  t += 0.01;
  sun.draw()

  mercuryOrbit.rotation.z -= data["mercury"][4] as number / 4000
  rotate(mercury)

  venusOrbit.rotation.z -= data["venus"][4] as number / 4000
  rotate(venus)

  earthOrbit.rotation.z -= data["earth"][4] as number / 4000
  rotate(earth)

  moonOrbit.rotation.y -= 0.002
  moonOrbit.rotation.z -= 0.002

  marsOrbit.rotation.z -= data["mars"][4] as number / 4000
  rotate(mars)

  jupiterOrbit.rotation.z -= data["jupiter"][4] as number / 4000
  rotate(jupiter)

  saturnOrbit.rotation.z -= data["saturn"][4] as number / 4000
  rotate(saturn)

  uranusOrbit.rotation.z -= data["uranus"][4] as number / 4000
  rotate(uranus)

  neptuneOrbit.rotation.z -= data["neptune"][4] as number / 4000
  rotate(neptune)
  hover()
  renderer.render(scene, camera)
}

animate()

/*
Intersects: Objects that intersect with the picking ray
Array(3) [ {…}, {…}, {…} ]
  0: Object { distance: 271.6933738170547, point: {…}, index: 5, … }
  1: Object { distance: 272.1663346294801, point: {…}, index: 6, … }
  2: Object { distance: 272.7581893127376, point: {…}, index: 7, … }
  length: 3
*/