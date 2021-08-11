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
  
  vec3 v_normal = vec3(nMatrix * normalize(normal));
  vec3 lightDirection = normalize(light - vec3(model * position));
  float nDotL = max(dot(lightDirection, v_normal), 0.0);

  // vec4 v_normal = normalize(nMatrix * vec4(normal, 0.0));
  // float nDotL = max(dot(light, v_normal.xyz), 0.0);
  // float nDotL = max(dot(light, v_normal), 0.0);
  vec3 ambient = ambientLight * color.rgb;
  vec3 diffuse = color.rgb * nDotL;
  v_color = vec4(diffuse + ambient, 1.0);
  v_dist = gl_Position.w;
}