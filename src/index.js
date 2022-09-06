
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Clock,
  LoadingManager,
  Vector2,
  TextureLoader,
  RepeatWrapping,
  DoubleSide,
  Vector3
} from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Remove this if you don't need to load any 3D model
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { gsap } from 'gsap'

import { MetalMaterial } from './materials/MetalMaterial'
import { PipesMaterial } from './materials/PipesMaterial'
import { LightsMaterial } from './materials/LightsMaterial'
import { HoloMaterial } from './materials/HoloMaterial'
import { NeonMaterial } from './materials/NeonMaterial'
import { ScreenMaterial } from './materials/ScreenMaterial'

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
    this.#createPostprocess()

    await this.#loadTextures()

    this.textures.Holo_Alpha.wrapT = RepeatWrapping

    await this.#loadModel()
    this.#createHoloAnimation()

    this.debugger = new Debugger(this)

    gsap.ticker.add(() => {
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
    this.signScreen.material.uniforms.u_Time.value = elapsed
  }

  #render() {
    this.composer.render()
  }

  #createScene() {
    this.scene = new Scene()
  }

  #createCamera() {
    this.camera = new PerspectiveCamera(75, this.screen.x / this.screen.y, 0.1, 100)
    this.camera.position.set(0, 0.8, 3)
  }

  #createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio === 1
    })

    this.container.appendChild(this.renderer.domElement)

    this.renderer.setSize(this.screen.x, this.screen.y)
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio))
    this.renderer.setClearColor(0x000000)
    this.renderer.physicallyCorrectLights = true
  }

  #createPostprocess() {
    this.renderPass = new RenderPass(this.scene, this.camera)

    this.bloomPass = new UnrealBloomPass(this.screen, 0.95, 0.64, 0.27)

    this.fxaaPass = new ShaderPass(FXAAShader)

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(this.renderPass)
    this.composer.addPass(this.fxaaPass)
    this.composer.addPass(this.bloomPass)
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
      return new Promise(resolve => {
        this.textureLoader.load(url, texture => {
          this.textures[name] = texture
          resolve()
        })
      })
    }

    const urls = [
      { name: 'Base_AO', url: '/Base_AO.png' },
      { name: 'Holo_Alpha', url: '/Holo_Alpha.png' }
    ]

    const promises = urls.map(async ({ name, url }) => {
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
        this.holo.material.uniforms.t_AlphaMap.value = this.textures.Holo_Alpha

        this.sign = this.mesh.getObjectByName('Sign')
        this.sign.material = NeonMaterial.clone()
        this.sign.material.side = DoubleSide
        this.sign.material.transparent = true
        this.sign.material.color.setHex(0x146caf)
        this.sign.material.emissiveIntensity = 0.91
        this.sign.userData.defaultPosY = this.sign.position.y

        this.signScreen = this.mesh.getObjectByName('Sign_Screen')
        this.signScreen.material = ScreenMaterial
        this.signScreen.material.uniforms.t_AlphaMap.value = this.textures.Holo_Alpha

        this.scene.add(this.mesh)

        resolve()
      })
    })
  }

  #createHoloAnimation() {
    this.holoAnimation = new gsap.timeline({
      paused: true,
      onUpdate: () => {
        this.debugger.pane.refresh()
      }
    })

    this.holoAnimation
      .addLabel('start')

      .fromTo(this.holo.material.uniforms.u_Progress1, { value: 0 }, { value: 1, duration: 1.25, overwrite: true }, 'start')
      .fromTo(this.holo.material.uniforms.u_Progress2, { value: 0 }, { value: 1, duration: 1.25, overwrite: true }, 'start+=0.13')
      .fromTo(this.holo.material.uniforms.u_Progress3, { value: 0 }, { value: 1, duration: 1.25, overwrite: true }, 'start+=0.28')

      .addLabel('animateInSign', 'start+=1')

      .fromTo(this.sign.material, { opacity: 0 }, { opacity: 1, duration: 1.8 }, 'animateInSign')
      .fromTo(this.signScreen.material.uniforms.u_Opacity, { value: 0 }, { value: 1, duration: 1.8 }, 'animateInSign')
  }

  #createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.autoRotate = true
    this.controls.maxPolarAngle = Math.PI / 1.6
    this.controls.target = new Vector3(0, 0.4, 0)
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
    this.composer.setSize(this.screen.x, this.screen.y)
  }
}

const app = new App('#app')
app.init()
