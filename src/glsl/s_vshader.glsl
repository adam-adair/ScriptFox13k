  attribute vec4 position;
  uniform mat4 model;
  uniform mat4 lightMatrix;
  void main() {
    gl_Position = lightMatrix * model * position;
  }