attribute vec4 position; 
attribute vec4 color;
attribute vec4 normal;
uniform mat4 camera;
uniform mat4 model;
uniform vec4 light;
varying vec4 v_color;
void main() {
  gl_Position = camera * model * position;
  vec4 normalPosition = normal;//model * normal;
  float nDotL = max(dot(light, normalize(normalPosition)), 0.0);
  v_color = color * nDotL;
}