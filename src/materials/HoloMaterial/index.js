import { ShaderMaterial, DoubleSide, Color, AdditiveBlending } from 'three'

export const HoloMaterial = new ShaderMaterial({
  vertexShader: require('./vertex.glsl'),
  fragmentShader: require('./fragment.glsl'),
  transparent: true,
  side: DoubleSide,
  blending: AdditiveBlending,
  uniforms: {
    u_Progress1: { value: 0 },
    u_Progress2: { value: 0 },
    u_Progress3: { value: 0 },
    u_TransitionSmoothness: { value: 0.25 },
    u_Color: { value: new Color(0x4feaff) },
    u_Time: { value: 0 },
    u_FresnelFalloff: { value: 2.5 },
    t_AlphaMap: { value: null }
  }
})
