varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

uniform float u_Progress1;
uniform float u_Progress2;
uniform float u_Progress3;
uniform float u_TransitionSmoothness;
uniform float u_Time;
uniform vec3 u_Color;
uniform float u_FresnelFalloff;
uniform sampler2D t_AlphaMap;

#pragma glslify: noise = require(../../shaders/modules/noise.glsl)
#pragma glslify: remap = require(../../shaders/modules/remap.glsl)
#pragma glslify: fresnel = require(../../shaders/modules/fresnel.glsl)
#pragma glslify: random = require(../../shaders/modules/random.glsl)

void main() {
  vec2 gv = floor(vUv * 35.0 - vec2(0.0, u_Time*1.5));
  float pattern = noise(gv);

  // alpha map
  float alphaMapB = texture2D(t_AlphaMap, vUv * vec2(0.0, 0.8) + vec2(0.0, u_Time*0.03)).b;

  // Noise
  float noisy = noise(floor(vUv*1300.) + floor(random(u_Time)*100.0));
  noisy *= alphaMapB;

  // Fresnel
  float frn = fresnel(cameraPosition, vWorldPosition, vWorldNormal, u_FresnelFalloff);

  /*
   * Colors
   */
  vec4 l1 = vec4(u_Color, 0.5);

  vec4 l2 = vec4(u_Color, 1.0);
  l2 = l2 * clamp(alphaMapB, 0.1, 0.85);
  l2.a = clamp(noisy, 0.0, 0.35);

  #if !defined(FLIP_SIDED)
    l2 = mix(l2, l1, frn);
  #endif

  vec4 l3 = vec4(u_Color, 1.0);
  l3 = l3 * step(0.99, fract(vUv.y*4.6+u_Time*0.3));

  // 01. Base layer
  float p1 = u_Progress1;
  p1 = remap(p1, 0.0, 1.0, -u_TransitionSmoothness, 1.0);
  p1 = smoothstep(p1, p1 + u_TransitionSmoothness, 1.0 - vUv.y);

  float mix1 = 2.0*p1 - pattern;
  mix1 = clamp(mix1, 0.0, 1.0);

  // 02. Wide bands layer
  float p2 = u_Progress2;
  p2 = remap(p2, 0.0, 1.0, -u_TransitionSmoothness, 1.0);
  p2 = smoothstep(p2, p2 + u_TransitionSmoothness, 1.0 - vUv.y);

  float mix2 = 2.0*p2 - pattern;
  mix2 = clamp(mix2, 0.0, 1.0);

  // 03. Thin bands layer
  float p3 = u_Progress3;
  p3 = remap(p3, 0.0, 1.0, -u_TransitionSmoothness, 1.0);
  p3 = smoothstep(p3, p3 + u_TransitionSmoothness, 1.0 - vUv.y);

  float mix3 = 2.0*p3 - pattern;
  mix3 = clamp(mix3, 0.0, 1.0);

  // Mix layers
  vec4 layer1 = mix(vec4(0.0), l1, 1.0 - mix1);
  vec4 layer2 = mix(layer1, l2, 1.0 - mix2);
  vec4 layer3 = mix(layer2, l3, l3.a*(1.0 - mix3));

  vec4 color = layer3;

  gl_FragColor = color;

  // cool colors
  // gl_FragColor = vec4(vWorldPosition*vWorldNormal, 1.0);
}
