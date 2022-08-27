import { MeshStandardMaterial } from 'three'

export const LightsMaterial = new MeshStandardMaterial({
  emissive: 0xE23027,
  color: 0xffffff,
  emissiveIntensity: 2,
  flatShading: false
})
