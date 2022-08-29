float fresnel(vec3 cameraPosition, vec3 worldPosition, vec3 worldNormal, float falloff) {
  vec3 viewDirection = normalize(cameraPosition - worldPosition);

  float effect = dot(viewDirection, worldNormal);
  effect = clamp(1.0 - effect, 0., 1.0);
  effect = pow(effect, falloff);

  return effect;
}

#pragma glslify: export(fresnel)
