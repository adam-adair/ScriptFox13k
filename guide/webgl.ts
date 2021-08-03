// Compile a WebGL program from a vertex shader and a fragment shader
export const compile = (
  gl: WebGLRenderingContext,
  vshader: string,
  fshader: string
) => {
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vshader);
  gl.compileShader(vs);
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fshader);
  gl.compileShader(fs);
  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);
  console.log("vertex shader:", gl.getShaderInfoLog(vs) || "OK");
  console.log("fragment shader:", gl.getShaderInfoLog(fs) || "OK");
  console.log("program:", gl.getProgramInfoLog(program) || "OK");
  return program;
};

// Bind a data buffer to an attribute, fill it with data and enable it
export const buffer = (
  gl: WebGLRenderingContext,
  data: Float32Array,
  program: WebGLProgram,
  attribute: string,
  size: number,
  type: number
) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  var a = gl.getAttribLocation(program, attribute);
  gl.vertexAttribPointer(a, size, type, false, 0, 0);
  gl.enableVertexAttribArray(a);
};

// Draw a box
export const drawBox = (gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) => {
  // Compute mvp matrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

  // Compute inverse transform
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

  // Draw
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
};
