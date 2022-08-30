varying vec2 vUv;

uniform float u_Time;
uniform vec3 u_Color;
uniform sampler2D t_AlphaMap;

#pragma glslify: noise = require(../../shaders/modules/noise.glsl)
#pragma glslify: remap = require(../../shaders/modules/remap.glsl)
#pragma glslify: random = require(../../shaders/modules/random.glsl)

void main() {
  // Alpha map
  float alphaMapB = texture2D(t_AlphaMap, vUv * vec2(0.0, 0.8) + vec2(0.0, u_Time*0.03)).b;

  // Noise
  float noisy = noise(floor(vUv*700.) + floor(random(u_Time)*100.0));

  // Layer 1: colored noise
  vec4 l1 = vec4(u_Color, 0.15);
  l1 *= noisy;

  // Layer 2: big bands
  vec4 l2 = vec4(u_Color, 0.6);
  l2 *= alphaMapB;

  vec4 mix2 = mix(l1, l2, l2.a);

  // Layer 3: small bands
  vec4 l3 = vec4(u_Color, 0.85);
  l3 *= step(0.98, fract(vUv.y*7.5+u_Time*0.3));

  vec4 mix3 = mix(mix2, l3, l3.a);

  // Layer 4: small bands
  vec4 l4 = vec4(u_Color, 1.0);
  l4 *= step(0.99, fract(vUv.y*3.43-u_Time*0.08));

  vec4 mix4 = mix(mix3, l4, l4.a);

  gl_FragColor = mix4;
}
