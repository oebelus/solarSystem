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

const camera = new THREE.PerspectiveCamera(45, width/height, 0.5, 1000)
camera.position.z = 120

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
  radius: number
  position: {x: number, y: number, z: number}

  constructor(radius: number, texturePath: string, x: number, y: number, z: number, emissive?: boolean) {
    this.radius = radius
    this.position = {x: x, y: y, z: z}
    this.emissive = false
    this.geometry = new THREE.SphereGeometry(radius, 64, 32)

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath); 
    
    
    this.material = new THREE.MeshStandardMaterial({ map: texture });
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
    //this.element.position.y = this.position.y
    this.element.position.z = this.position.z
    this.element.rotation.x += 0.01
    this.element.rotation.y += 0.01
  }

  remove() {
    scene.remove(this.element);
  }

  rotate(angle: number) {
    const radius = Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z);
    const newAngle = Math.atan2(this.position.z, this.position.x) + angle;

    this.position.x = radius * Math.cos(newAngle);
    this.position.z = radius * Math.sin(newAngle);
  }
}

class Ring {
  geometry: THREE.RingGeometry
  material: THREE.Material
  element: THREE.Mesh
  radius: number
  position: {x: number, y: number, z: number}

  constructor(radius: number, x: number, y: number, z: number, texturePath?: string, inner?: number, outer?: number) {
    this.radius = radius
    this.position = {x: x, y: y, z: z}
    this.geometry = new THREE.RingGeometry(radius - 0.9, radius, 64);

    if (texturePath != undefined) {
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(texturePath); 
      this.material = new THREE.MeshStandardMaterial({ map: texture });
    }
    
    else this.material = new THREE.MeshBasicMaterial({ color: "white" });
    
    this.element = new THREE.Mesh(this.geometry, this.material)
  }

  draw() {
    scene.add(this.element)
    this.element.position.x = this.position.x
    this.element.position.y = this.position.y
    this.element.position.z = this.position.z
  }
}

// 1AU = 149,597,870.7 km

let data: Record<string, (string|number)[]> = {
  "sun": ["https://i.imgur.com/NT8Vd4p.jpg", 274, 696340],
  "mercury": ["https://i.imgur.com/UQQRIZg.jpg", 3.7, 2439.7, 0.39 * 27, 47.9],
  "venus": ["https://i.imgur.com/Wa8lpF6.jpg", 8.87, 6051.8, 0.72 * 26, 35],
  "earth": ["https://i.imgur.com/Tajyxwl.jpg", 9.807, 6371, 1 * 28, 29.8],
  "moon": ["https://i.imgur.com/OjvY5Pv.jpg", 1.62],
  "mars": ["https://i.imgur.com/U2QZveA.jpg", 3.71, 3389.5, 1.524, 24],
  "jupiter": ["https://i.imgur.com/ZUVwSv5.jpg", 24.79, 69911, 5.2, 13.1],
  "saturn": ["https://i.imgur.com/ITtPqGy.jpg", 10.44, 58232, 9.54, 9.69],
  "uranus": ["https://i.imgur.com/wj611Q1.jpg", 8.87, 25362, 19.22, 6.81],
  "neptune": ["https://i.imgur.com/KU2X0rf.jpg", 11.15, 24622, 30.06, 5.43]
}

// Create an elliptical curve representing the orbit

function orbit(xRadius: number, yRadius: number): THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial> {
  let orbitPath = new THREE.EllipseCurve(
    0, 0,           // ax, aY
    xRadius, yRadius,       // xRadius, yRadius
    0, 2 * Math.PI,  // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  );
  
  // Create a geometry from the path
  let points = orbitPath.getPoints(50);
  let geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  let material = new THREE.LineBasicMaterial({ color : "grey" });
  
  let ellipse = new THREE.Line(geometry, material);

  return ellipse;
}

function drawPlanet(planet: Planet, orbit: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial>) {
  planet.draw()
  orbit.add(planet.element)
  scene.add(orbit)
}

let sun = new Planet(data["sun"][2] as number / 80000, data["sun"][0] as string, 0, 0, 0, true);

// Mercury
let mercury = new Planet(data["mercury"][2] as number / 2000, data["mercury"][0] as string, data["mercury"][3] as number, 0, 0)
let mercuryOrbit = orbit(data["mercury"][3] as number, data["mercury"][3] as number)
drawPlanet(mercury, mercuryOrbit)

// Venus
let venus = new Planet(data["venus"][2] as number / 2000, data["venus"][0] as string, data["venus"][3] as number, 0, 0)
let venusOrbit = orbit(data["venus"][3] as number, data["venus"][3] as number)
drawPlanet(venus, venusOrbit)

// Earth
let earth = new Planet(data["earth"][2] as number / 2000, data["earth"][0] as string, data["earth"][3] as number, 0, 0)
let earthOrbit = orbit(data["earth"][3] as number, data["earth"][3] as number)
drawPlanet(earth, earthOrbit)
/*let moon = new Planet(earthRadius - 5, data["moon"][0] as string)*/

let mars = new Planet(data["mars"][2] as number / 2000, data["mars"][0] as string, data["mars"][3] as number * 25, 0, 0)
let marsOrbit = orbit(data["mars"][3] as number * 25, data["mars"][3] as number * 25)
drawPlanet(mars, marsOrbit)

// Jupiter
let jupiter = new Planet(data["jupiter"][2] as number / 11000, data["jupiter"][0] as string, data["jupiter"][3] as number * 10, 2, 0)
let jupiterOrbit = orbit(data["jupiter"][3] as number * 10, data["jupiter"][3] as number * 10)
drawPlanet(jupiter, jupiterOrbit)

// Saturn
let saturn = new Planet(data["saturn"][2] as number / 11000, data["saturn"][0] as string, data["saturn"][3] as number * 8, 2, 0)
let saturnOrbit = orbit(data["saturn"][3] as number * 8, data["saturn"][3] as number * 8)
drawPlanet(saturn, saturnOrbit)

// Uranus
let uranus = new Planet(data["uranus"][2] as number / 11000, data["uranus"][0] as string, data["uranus"][3] as number * 5, 3, 0)
let uranusOrbit = orbit(data["uranus"][3] as number * 5, data["uranus"][3] as number * 5)
drawPlanet(uranus, uranusOrbit)

// Neptune
let neptune = new Planet(data["neptune"][2] as number / 11000, data["neptune"][0] as string, data["neptune"][3] as number*4, 3, 0)
let neptuneOrbit = orbit(data["neptune"][3] as number*4, data["neptune"][3] as number*4)
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

window.addEventListener( 'resize', onWindowResize );

function animate() {
  requestAnimationFrame(animate)
  t += 0.01;
  sun.draw()

  mercuryOrbit.rotation.z -= data["mercury"][4] as number / 4000
  venusOrbit.rotation.z -= data["venus"][4] as number / 4000
  earthOrbit.rotation.z -= data["earth"][4] as number / 4000
  marsOrbit.rotation.z -= data["mars"][4] as number / 4000
  jupiterOrbit.rotation.z -= data["jupiter"][4] as number / 4000
  saturnOrbit.rotation.z -= data["saturn"][4] as number / 4000
  uranusOrbit.rotation.z -= data["uranus"][4] as number / 4000
  neptuneOrbit.rotation.z -= data["neptune"][4] as number / 4000

  renderer.render(scene, camera)
}

animate()