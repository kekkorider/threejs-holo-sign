import { ShaderMaterial, Color } from 'three'

export const FloorMaterial = new ShaderMaterial({
  vertexShader: require('./vertex.glsl'),
  fragmentShader: require('./fragment.glsl'),
  transparent: true,
  uniforms: {
    u_Color: { value: new Color(0x141d26) },
    u_SpotlightRadius: { value: 1 },
    u_SpotlightBlur: { value: 0.6 },
    t_aoMap: { value: null },
    u_aoMapIntensity: { value: 1 }
  }
})
