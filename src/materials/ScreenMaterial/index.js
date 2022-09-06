import { ShaderMaterial, DoubleSide, Color } from 'three'

export const ScreenMaterial = new ShaderMaterial({
  vertexShader: require('./vertex.glsl'),
  fragmentShader: require('./fragment.glsl'),
  transparent: true,
  side: DoubleSide,
  uniforms: {
    u_Color: { value: new Color(0x4feaff) },
    u_Opacity: { value: 0 },
    u_Time: { value: 0 },
    t_AlphaMap: { value: null }
  }
})
