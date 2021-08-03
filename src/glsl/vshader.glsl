attribute vec4 position; 
attribute vec4 color;
attribute vec4 normal;
uniform mat4 camera;
uniform mat4 model;
uniform mat4 nMatrix;
uniform vec3 light;
uniform vec3 ambientLight;
varying vec4 v_color;
void main() {
  gl_Position = camera * model * position;
  vec4 v_normal = normalize(nMatrix * normal);
  float nDotL = max(dot(light, v_normal.xyz), 0.0);
  vec3 ambient = ambientLight * color.rgb;
  vec3 diffuse = color.rgb * nDotL;
  v_color = vec4(diffuse + ambient, 1.0);
}