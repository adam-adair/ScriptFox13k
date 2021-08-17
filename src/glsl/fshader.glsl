precision mediump float;
uniform vec2 u_FogDist;
uniform vec3 u_FogColor;
varying vec4 v_color;
varying float v_dist;
varying vec3 v_position;
void main() {
  float fogFactor = (u_FogDist.y - v_dist) / (u_FogDist.y - u_FogDist.x);
  vec3 color = mix(u_FogColor, vec3(v_color), clamp(fogFactor, 0.0, 1.0));
  if ( v_position.z > 0.0 &&  v_position.z < 0.1) {
  gl_FragColor = vec4(1,0,0, v_color.a);

  } else {

  gl_FragColor = vec4(color, v_color.a);
  }
}