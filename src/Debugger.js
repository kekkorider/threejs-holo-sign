import { Pane } from 'tweakpane'
import { Color } from 'three'

export class Debugger {
  constructor(app) {
    this.app = app

    this.#createPanel()
    this.#createSceneConfig()
    this.#createBloomConfig()
    this.#createFXAAPassConfig()
    this.#createBaseConfig()
    this.#createPipesConfig()
    this.#createPointLightsConfig()
    this.#createRoundLightConfig()
    this.#createHoloConfig()
    this.#createScreenConfig()
  }

  refresh() {
    this.pane.refresh()
  }

  #createPanel() {
    this.pane = new Pane({
      container: document.querySelector('#debug')
    })
  }

  #createSceneConfig() {
    const folder = this.pane.addFolder({ title: 'Scene' })
    const params = {
      background: { r: 0, g: 0, b: 0 },
      holoAnimation: 0
    }

    folder.addInput(params, 'background', { label: 'Background Color' }).on('change', e => {
      this.app.renderer.setClearColor(new Color(e.value.r / 255, e.value.g / 255, e.value.b / 255))
    })

    folder.addInput(params, 'holoAnimation', { label: 'Holo Animation Progress', min: 0, max: 1 }).on('change', e => {
      this.app.holoAnimation.pause()
      this.app.holoAnimation.progress(e.value)
    })

    folder.addButton({ title: 'Animate holo' }).on('click', () => {
      this.app.holoAnimation.restart()
    })
  }

  #createBloomConfig() {
    const folder = this.pane.addFolder({ title: 'Postprocess - Bloom' })

    folder.addInput(this.app.bloomPass, 'enabled', { label: 'Enabled' })
    folder.addInput(this.app.bloomPass, 'threshold', { label: 'Threshold', min: 0, max: 1 })
    folder.addInput(this.app.bloomPass, 'strength', { label: 'Strength', min: 0, max: 3 })
    folder.addInput(this.app.bloomPass, 'radius', { label: 'Radius', min: 0, max: 1 })
  }

  #createFXAAPassConfig() {
    const folder = this.pane.addFolder({ title: 'Postprocess - FXAA' })

    folder.addInput(this.app.fxaaPass, 'enabled', { label: 'Enabled' })
  }

  #createBaseConfig() {
    const folder = this.pane.addFolder({ title: 'Base', expanded: false })
    const mesh = this.app.scene.getObjectByName('Base')

    this.#createColorControl(mesh, folder)
    folder.addInput(mesh.material, 'aoMapIntensity', { label: 'AO Map Intensity', min: 0, max: 1 })
  }

  #createPipesConfig() {
    const folder = this.pane.addFolder({ title: 'Pipes', expanded: false })
    const mesh = this.app.scene.getObjectByName('Base_Pipes')

    this.#createColorControl(mesh, folder)
  }

  #createPointLightsConfig() {
    const folder = this.pane.addFolder({ title: 'Point Lights', expanded: false })
    const mesh = this.app.scene.getObjectByName('Base_PointLights')

    this.#createEmissiveControl(mesh, folder)
    this.#createEmissiveIntensityControl(mesh, folder)
  }

  #createRoundLightConfig() {
    const folder = this.pane.addFolder({ title: 'Round Light', expanded: false })
    const mesh = this.app.scene.getObjectByName('Base_RoundLight')

    this.#createEmissiveControl(mesh, folder)
    this.#createEmissiveIntensityControl(mesh, folder)
  }

  #createHoloConfig() {
    const folder = this.pane.addFolder({ title: 'Holo', expanded: false })
    const mesh = this.app.scene.getObjectByName('Holo')

    folder.addInput(mesh.material.uniforms.u_Progress1, 'value', { label: 'Progress 1', min: 0, max: 1 })
    folder.addInput(mesh.material.uniforms.u_Progress2, 'value', { label: 'Progress 2', min: 0, max: 1 })
    folder.addInput(mesh.material.uniforms.u_Progress3, 'value', { label: 'Progress 3', min: 0, max: 1 })
    folder.addInput(mesh.material.uniforms.u_TransitionSmoothness, 'value', { label: 'Transition smoothness', min: 0, max: 1 })

    const color = mesh.material.uniforms.u_Color.value.clone().multiplyScalar(255)
    const params = { color: { r: color.r, g: color.g, b: color.b } }
    folder.addInput(params, 'color', { label: 'Color' }).on('change', e => {
      mesh.material.uniforms.u_Color.value.setRGB(e.value.r, e.value.g, e.value.b).multiplyScalar(1 / 255)
    })

    folder.addInput(mesh.material.uniforms.u_FresnelFalloff, 'value', { label: 'Fresnel falloff', min: 0.1, max: 6 })
  }

  #createScreenConfig() {
    const folder = this.pane.addFolder({ title: 'Screen', expanded: false })
    const border = this.app.scene.getObjectByName('Sign')

    this.#createEmissiveControl(border, folder, 'Border color')
    this.#createEmissiveIntensityControl(border, folder, 'Border intensity')

    const screen = this.app.scene.getObjectByName('Sign_Screen')
    const screenColor = screen.material.uniforms.u_Color.value.clone().multiplyScalar(255)
    const params = { color: { r: screenColor.r, g: screenColor.g, b: screenColor.b } }
    folder.addInput(params, 'color', { label: 'Color' }).on('change', e => {
      screen.material.uniforms.u_Color.value.setRGB(e.value.r, e.value.g, e.value.b).multiplyScalar(1 / 255)
    })
  }

  #createColorControl(mesh, folder) {
    const baseColor255 = mesh.material.color.clone().multiplyScalar(255)
    const params = { color: { r: baseColor255.r, g: baseColor255.g, b: baseColor255.b } }

    folder.addInput(params, 'color', { label: 'Color' }).on('change', e => {
      mesh.material.color.setRGB(e.value.r, e.value.g, e.value.b).multiplyScalar(1 / 255)
    })
  }

  #createEmissiveControl(mesh, folder, label = 'Emissive') {
    const baseColor255 = mesh.material.emissive.clone().multiplyScalar(255)
    const params = { emissive: { r: baseColor255.r, g: baseColor255.g, b: baseColor255.b } }

    folder.addInput(params, 'emissive', { label }).on('change', e => {
      mesh.material.emissive.setRGB(e.value.r, e.value.g, e.value.b).multiplyScalar(1 / 255)
    })
  }

  #createEmissiveIntensityControl(mesh, folder, label = 'Emissive Intensity') {
    folder.addInput(mesh.material, 'emissiveIntensity', { label, min: 0, max: 3 })
  }
}
