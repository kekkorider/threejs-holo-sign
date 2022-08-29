float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

#pragma glslify: export(random)
