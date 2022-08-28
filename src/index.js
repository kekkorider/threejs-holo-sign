
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Clock,
  LoadingManager,
  Vector2,
  TextureLoader,
  RepeatWrapping
} from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Remove this if you don't need to load any 3D model
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { MetalMaterial } from './materials/MetalMaterial'
import { PipesMaterial } from './materials/PipesMaterial'
import { LightsMaterial } from './materials/LightsMaterial'
import { HoloMaterial } from './materials/HoloMaterial'
import { SignMaterial } from './materials/SignMaterial'
import { NeonMaterial } from './materials/NeonMaterial'

import { Debugger } from './Debugger'

class App {
  #resizeCallback = () => this.#onResize()

  constructor(container) {
    this.container = document.querySelector(container)
    this.screen = new Vector2(this.container.clientWidth, this.container.clientHeight)
  }

  async init() {
    this.#createScene()
    this.#createCamera()
    this.#createRenderer()
    this.#createClock()
    this.#addListeners()
    this.#createControls()
    this.#createLoaders()

    await this.#loadTextures()
    await this.#loadModel()

    this.debug = new Debugger(this)

    this.renderer.setAnimationLoop(() => {
      this.#update()
      this.#render()
    })

    console.log(this)
  }

  destroy() {
    this.renderer.dispose()
    this.#removeListeners()
  }

  #update() {
    const elapsed = this.clock.getElapsedTime()

    this.controls.update()

    this.sign.rotation.y = elapsed*0.35
    this.sign.position.y = this.sign.userData.defaultPosY + 0.2 + Math.sin(elapsed*1.4)*0.1

    this.holo.material.uniforms.u_Time.value = elapsed
  }

  #render() {
    this.renderer.render(this.scene, this.camera)
  }

  #createScene() {
    this.scene = new Scene()
  }

  #createCamera() {
    this.camera = new PerspectiveCamera(75, this.screen.x / this.screen.y, 0.1, 100)
    this.camera.position.set(0, 1.3, 3)
  }

  #createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio === 1
    })

    this.container.appendChild(this.renderer.domElement)

    this.renderer.setSize(this.screen.x, this.screen.y)
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio))
    this.renderer.setClearColor(0x42404d)
    this.renderer.physicallyCorrectLights = true
  }

  #createLoaders() {
    this.loadingManager = new LoadingManager()

    this.loadingManager.onProgress = (url, loaded, total) => {
      // In case the progress count is not correct, see this:
      // https://discourse.threejs.org/t/gltf-file-loaded-twice-when-loading-is-initiated-in-loadingmanager-inside-onprogress-callback/27799/2
      console.log(`Loaded ${loaded} resources out of ${total} -> ${url}`)
    }

    this.loadingManager.onLoad = () => {
      console.log('All resources loaded')
    }

    this.gltfLoader = new GLTFLoader(this.loadingManager)

    this.textureLoader = new TextureLoader(this.loadingManager)
  }

  async #loadTextures() {
    this.textures = {}

    const loadTexture = (name, url) => {
      return this.textureLoader.load(url, texture => {
        this.textures[name] = texture
      })
    }

    const urls = [
      { name: 'Base_AO', url: '/Base_AO.png' },
      { name: 'Holo_Alpha', url: '/Holo_Alpha.png' }
    ]

    const promises = urls.map(({ name, url }) => {
      return loadTexture(name, url)
    })

    await Promise.all(promises)
  }

  /**
   * Load a 3D model and append it to the scene
   */
  #loadModel() {
    return new Promise(resolve => {
      this.gltfLoader.load('./model.glb', gltf => {
        this.mesh = gltf.scene.children[0]
        this.mesh.translateY(-1.3)
        this.mesh.material = MetalMaterial

        this.textures.Base_AO.flipY = false
        this.mesh.geometry.setAttribute('uv2', this.mesh.geometry.getAttribute('uv').clone())
        this.mesh.material.aoMap = this.textures.Base_AO

        this.mesh.getObjectByName('Base_Pipes').material = PipesMaterial
        this.mesh.getObjectByName('Base_PointLights').material = LightsMaterial
        this.mesh.getObjectByName('Base_RoundLight').material = NeonMaterial

        this.holo = this.mesh.getObjectByName('Holo')
        this.holo.material = HoloMaterial
        this.textures.Holo_Alpha.wrapT = RepeatWrapping
        this.holo.material.uniforms.t_AlphaMap.value = this.textures.Holo_Alpha

        this.sign = this.mesh.getObjectByName('Sign')
        this.sign.material = SignMaterial
        this.sign.userData.defaultPosY = this.sign.position.y

        this.scene.add(this.mesh)

        resolve()
      })
    })
  }

  #createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
  }

  #createClock() {
    this.clock = new Clock()
  }

  #addListeners() {
    window.addEventListener('resize', this.#resizeCallback, { passive: true })
  }

  #removeListeners() {
    window.removeEventListener('resize', this.#resizeCallback, { passive: true })
  }

  #onResize() {
    this.screen.set(this.container.clientWidth, this.container.clientHeight)

    this.camera.aspect = this.screen.x / this.screen.y
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.screen.x, this.screen.y)
  }
}

const app = new App('#app')
app.init()
