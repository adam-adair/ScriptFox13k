attribute vec4 position; 
attribute vec4 color;
attribute vec4 normal;
uniform mat4 camera;
uniform mat4 model;
uniform mat4 nMatrix;
uniform vec3 light;
uniform vec3 ambientLight;
varying vec4 v_color;
varying float v_dist;
void main() {
  gl_Position = camera * model * position;
  vec3 wNormal = normalize(mat3(nMatrix) * normal.xyz);
  vec3 lightDirection = normalize(light - vec3(model * position));
  float nDotL = dot(wNormal, lightDirection);
  vec3 ambient = ambientLight * color.rgb;
  vec3 diffuse = color.rgb * nDotL;
  v_color = vec4(diffuse + ambient, 1.0);
  v_dist = gl_Position.w;
}