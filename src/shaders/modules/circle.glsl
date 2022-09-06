float Circle(in vec2 st, in float radius, in float blur){
  return 1. - smoothstep(radius - (radius*blur), radius+(radius*blur), dot(st,st) * 4.0);
}

#pragma glslify: export(Circle)
