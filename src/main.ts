import * as THREE from 'three'

const width = window.innerWidth
const height = window.innerHeight

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('app') as HTMLCanvasElement,
  alpha: true,
})

renderer.setSize(width, height)
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(80, width/height, 0.5, 1000)
camera.position.z = 80
camera.lookAt(0, 0, 0)

//camera.rotation.z = Math.PI * 0.1;

//camera.position.x = -20

const scene = new THREE.Scene()

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
    this.geometry = new THREE.SphereGeometry(radius, 40, 30)

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
    this.element.position.y = this.position.y
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

// 1AU = 149,597,870.7 km

let data: Record<string, (string|number)[]> = {
  "sun": ["https://i.imgur.com/NT8Vd4p.jpg", 274, 696340],
  "mercury": ["https://i.imgur.com/UQQRIZg.jpg", 3.7, 2439.7, 0.39, 47.9],
  "venus": ["https://i.imgur.com/Wa8lpF6.jpg", 8.87, 6051.8, 0.72, 35],
  "earth": ["https://i.imgur.com/Tajyxwl.jpg", 9.807, 6371, 1, 29.8],
  "moon": ["https://i.imgur.com/OjvY5Pv.jpg", 1.62],
  "mars": ["https://i.imgur.com/U2QZveA.jpg", 3.71, 3389.5, 152, 24],
  "jupiter": ["https://i.imgur.com/ZUVwSv5.jpg", 24.79, 69911, 5.2, 13.1],
  "saturn": ["https://i.imgur.com/ITtPqGy.jpg", 10.44, 58232, 9.54, 9.69],
  "uranus": ["https://i.imgur.com/wj611Q1.jpg", 8.87, 25362, 19.22, 6.81],
  "neptune": ["https://i.imgur.com/KU2X0rf.jpg", 11.15, 24622, 30.06, 5.43]
}

let sun = new Planet(data["sun"][2] as number / 170000, data["sun"][0] as string, 0, 0, 0, true);
let mercury = new Planet(data["mercury"][2] as number / 3000, data["mercury"][0] as string, data["mercury"][3] as number * 18, 2, 0)
let earth = new Planet(data["earth"][2] as number / 6000, data["earth"][0] as string, data["earth"][3] as number * 18, 2, 0)
/*let moon = new Planet(earthRadius - 5, data["moon"][0] as string)*/
let venus = new Planet(data["venus"][2] as number / 6000, data["venus"][0] as string, data["venus"][3] as number * 18, 2, 0)
let mars = new Planet(data["mars"][2] as number / 3000, data["mars"][0] as string, data["mars"][3] as number * 18, 2, 0)
let jupiter = new Planet(data["jupiter"][2] as number / 11000, data["jupiter"][0] as string, data["jupiter"][3] as number * 4.8, 2, 0)
let saturn = new Planet(data["saturn"][2] as number / 11000, data["saturn"][0] as string, data["saturn"][3] as number * 4.5, 2, 0)
let uranus = new Planet(data["uranus"][2] as number / 11000, data["uranus"][0] as string, data["uranus"][3] as number * 3, 3, 0)
let neptune = new Planet(data["neptune"][2] as number / 11000, data["neptune"][0] as string, data["neptune"][3] as number*2.2, 3, 0)

/*const geometry = new THREE.RingGeometry( sunRadius * 2, sunRadius * 2, 32 ); 
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("https://i.imgur.com/wQvlmId.png"); 
const material = new THREE.MeshStandardMaterial({ map: texture });
const ring = new THREE.Mesh( geometry, material );

saturn.element.add(ring)
*/

let t:number;

const light = new THREE.DirectionalLight(0xFFFFFF, 2)
light.position.set(-1, 0, -1)
scene.add(light)

const al = new THREE.AmbientLight(0xFFFFFF, 0.2)
scene.add(al)

function animate() {
  requestAnimationFrame(animate)
  t += 0.01;
  sun.draw()
  mercury.draw()
  venus.draw()
  earth.draw()
  mars.draw()
  jupiter.draw()
  saturn.draw()
  uranus.draw()
  neptune.draw()
  
  mercury.rotate(data["mercury"][4] as number / 5000)
  venus.rotate(data["venus"][4] as number / 5000)
  earth.rotate(data["earth"][4] as number / 5000)
  mars.rotate(data["mars"][4] as number / 5000)
  jupiter.rotate(data["jupiter"][4] as number / 5000)
  saturn.rotate(data["saturn"][4] as number / 5000)
  uranus.rotate(data["uranus"][4] as number / 5000)
  neptune.rotate(data["neptune"][4] as number / 5000)
  renderer.render(scene, camera)
}

animate()