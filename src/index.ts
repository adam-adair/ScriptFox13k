import { perspective } from "./camera";
import { Cube } from "./cube";
import { Mesh } from "./mesh";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const { width, height } = canvas;
const ratio = width / height;

//shader source
const vs_source = require("./glsl/vshader.glsl") as string;
const fs_source = require("./glsl/fshader.glsl") as string;

//initialize webgl
const gl = canvas.getContext("webgl");

const program = gl.createProgram();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vs_source);
gl.compileShader(vertexShader);
const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fs_source);
gl.compileShader(fragShader);

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);
gl.useProgram(program);

// Log compilation errors, if any
console.log("vertex shader:", gl.getShaderInfoLog(vertexShader) || "OK");
console.log("fragment shader:", gl.getShaderInfoLog(fragShader) || "OK");
console.log("program:", gl.getProgramInfoLog(program) || "OK");

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

//set light, camera uniforms
const camera = gl.getUniformLocation(program, "camera");
const cameraMatrix = perspective(30, ratio, 1, 100);
cameraMatrix.translateSelf(0, 0, -5);
gl.uniformMatrix4fv(camera, false, cameraMatrix.toFloat32Array());
const light = gl.getUniformLocation(program, "light");
gl.uniform4f(light, 0.1, 3.0, 0.7, 1.0);

// // prettier-ignore
// const vertices = new Float32Array([
//   1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
//   -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
//   1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
//   -1.0, 1.0, -1.0, -1.0, -1.0, -1.0,
// ]);

// // prettier-ignore
// const faces = new Uint8Array([
//   0, 1, 2,   0, 2, 3,  // front
//   0, 3, 4,   0, 4, 5,  // right
//   0, 5, 6,   0, 6, 1,  // up
//   1, 6, 7,   1, 7, 2,  // left
//   7, 4, 3,   7, 3, 2,  // down
//   4, 7, 6,   4, 6, 5   // back
// ]);

// // prettier-ignore
// const colors = new Float32Array([
//   .2,.7,.2, .5,.3,.5,
//   .5,0,.5, 0,.5,.5,
//   0,.2,0, .2, 0, .2,
//   .2, .5, .2, 0, .2, .5,
//   1,1,1, 1,0,1,
//   0,1,1, 0,0,1,

// ]);

const cube = new Cube(1);
const cube2 = new Cube(1);
const meshes = [cube2, cube2];
// meshes[1].matrix.translateSelf(1, 1, 1);

let cube2x = 0;
setInterval(() => {
  // cameraMatrix.rotateSelf(0.9, 0, 0.9);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(camera, false, cameraMatrix.toFloat32Array());
  cube2x += 0.5;
  //for each object
  for (let i = 0; i < meshes.length; i++) {
    const mesh = meshes[i];
    //create gl buffer of vertex positions/colors and bind to object's vbuffer
    const modelColorPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelColorPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vbuffer, gl.STATIC_DRAW);

    //set object's attributes
    const FSIZE = mesh.vbuffer.BYTES_PER_ELEMENT;

    const position = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 9, 0);
    gl.enableVertexAttribArray(position);

    const color = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    const normal = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 6);
    gl.enableVertexAttribArray(normal);
    // Set the model matrix
    const model = gl.getUniformLocation(program, "model");
    // mesh.matrix.translateSelf(i * 0.5, i * 0.5, i * 0.5);
    mesh.matrix.rotateSelf(i * 0.5, i * 0.5, 0 * i * 0.5);
    // mesh.matrix.translateSelf(i * -0.5, i * -0.5, i * -0.5);

    gl.uniformMatrix4fv(model, false, mesh.matrix.toFloat32Array());

    gl.drawArrays(gl.TRIANGLES, 0, cube.faces.length * 27);
  }
}, 16);
