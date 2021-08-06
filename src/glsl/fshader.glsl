precision mediump float;
uniform vec2 u_FogDist;
uniform vec3 u_FogColor;
varying vec4 v_color;
varying float v_dist;
void main() {
  float fogFactor = (u_FogDist.y - v_dist) / (u_FogDist.y - u_FogDist.x);
  vec3 color = mix(u_FogColor, vec3(v_color), clamp(fogFactor, 0.0, 1.0));
  gl_FragColor = vec4(color, v_color.a);
}