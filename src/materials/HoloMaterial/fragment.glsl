varying vec2 vUv;

void main() {
  vec3 color = vec3(sin(vUv.x * 3.14), cos(vUv.y * 3.14), 0.);

  gl_FragColor = vec4(color, 1.0);
}
