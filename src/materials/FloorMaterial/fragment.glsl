uniform sampler2D t_aoMap;
uniform float u_aoMapIntensity;
uniform vec3 u_Color;
uniform float u_SpotlightRadius;
uniform float u_SpotlightBlur;

varying vec2 vUv;

#pragma glslify: Circle = require(../../shaders/modules/circle.glsl)

void main() {
  float spotlight = Circle((vUv - 0.5)*2.0, u_SpotlightRadius, u_SpotlightBlur);

  float ambientOcclusion = (texture2D(t_aoMap, vUv).r - 1.0) * u_aoMapIntensity + 1.0;

  vec3 color = u_Color * ambientOcclusion * spotlight;

  gl_FragColor = vec4(color, 1.0)*spotlight;
}
