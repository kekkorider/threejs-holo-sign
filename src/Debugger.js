import { Pane } from 'tweakpane'
import { Color } from 'three'

export class Debugger {
  constructor(app) {
    this.app = app

    this.#createPanel()
    this.#createSceneConfig()
    this.#createBaseConfig()
    this.#createPipesConfig()
    this.#createPointLightsConfig()
    this.#createRoundLightConfig()
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
    const params = { background: { r: 66, g: 64, b: 77 } }

    folder.addInput(params, 'background', { label: 'Background Color' }).on('change', e => {
      this.app.renderer.setClearColor(new Color(e.value.r / 255, e.value.g / 255, e.value.b / 255))
    })
  }

  #createBaseConfig() {
    const folder = this.pane.addFolder({ title: 'Base' })

    this.#createColorControl('Base', folder)
    folder.addInput(this.app.scene.getObjectByName('Base').material, 'aoMapIntensity', { label: 'AO Map Intensity', min: 0, max: 1 })
  }

  #createPipesConfig() {
    const folder = this.pane.addFolder({ title: 'Pipes' })

    this.#createColorControl('Base_Pipes', folder)
  }

  #createPointLightsConfig() {
    const folder = this.pane.addFolder({ title: 'Point Lights' })

    this.#createColorControl('Base_PointLights', folder)
    this.#createEmissiveControl('Base_PointLights', folder)
    this.#createEmissiveIntensityControl('Base_PointLights', folder)
  }

  #createRoundLightConfig() {
    const folder = this.pane.addFolder({ title: 'Round Light' })

    this.#createColorControl('Base_RoundLight', folder)
    this.#createEmissiveControl('Base_RoundLight', folder)
    this.#createEmissiveIntensityControl('Base_RoundLight', folder)
  }

  #createColorControl(meshName, folder) {
    const mesh = this.app.scene.getObjectByName(meshName)
    const baseColor255 = mesh.material.clone().color.multiplyScalar(255)
    const params = { color: { r: baseColor255.r, g: baseColor255.g, b: baseColor255.b } }

    folder.addInput(params, 'color', { label: 'Color' }).on('change', e => {
      mesh.material.color.setRGB(e.value.r, e.value.g, e.value.b).multiplyScalar(1 / 255)
    })
  }

  #createEmissiveControl(meshName, folder) {
    const mesh = this.app.scene.getObjectByName(meshName)
    const baseColor255 = mesh.material.clone().emissive.multiplyScalar(255)
    const params = { emissive: { r: baseColor255.r, g: baseColor255.g, b: baseColor255.b } }

    folder.addInput(params, 'emissive', { label: 'Emissive' }).on('change', e => {
      mesh.material.emissive.setRGB(e.value.r, e.value.g, e.value.b).multiplyScalar(1 / 255)
    })
  }

  #createEmissiveIntensityControl(meshName, folder) {
    const mesh = this.app.scene.getObjectByName(meshName)

    folder.addInput(mesh.material, 'emissiveIntensity', { label: 'Emissive Intensity', min: 0, max: 3 })
  }
}
