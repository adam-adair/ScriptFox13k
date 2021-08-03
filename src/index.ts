import { perspective, orthogonal } from "./camera";
import { Red } from "./colors";
import { Cube } from "./cube";

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

//set background color, enable depth
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

//set light, camera uniforms
const camera = gl.getUniformLocation(program, "camera");
let cameraMatrix: DOMMatrix;
const zoom = 10;
let currentView = "c";

const light = gl.getUniformLocation(program, "light");
gl.uniform3f(light, 0.1, 1.1, 0.1);
const ambientLight = gl.getUniformLocation(program, "ambientLight");
const aL = 0.35;
gl.uniform3f(ambientLight, aL, aL, aL);

const setCamera = () => {
  if (currentView === "p") {
    cameraMatrix = orthogonal(zoom * ratio, zoom, 100);
    cameraMatrix.translateSelf((zoom * ratio) / 2, -zoom / 2, -zoom);
    currentView = "c";
  } else {
    cameraMatrix = perspective(zoom, ratio, 1, 100);
    cameraMatrix.translateSelf(0, 0, -zoom * 2);
    currentView = "p";
  }
  gl.uniformMatrix4fv(camera, false, cameraMatrix.toFloat32Array());
};

//set up some stupid objects
const cube = new Cube(0.3, Red);
const cube2 = new Cube(1);
const meshes = [cube, cube2];
const player = meshes[0];
player.translate(1, 1, 1);
let inp = "";
setCamera();

//game loop
const loop = () => {
  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //box movement
  const m = 0.1;
  switch (inp) {
    case "d":
      player.translate(m, 0, 0);
      break;
    case "a":
      player.translate(-m, 0, 0);
      break;
    case "w":
      player.translate(0, m, 0);
      break;
    case "s":
      player.translate(0, -m, 0);
      break;
    case "e":
      player.translate(0, 0, -m);
      break;
    case "q":
      player.translate(0, 0, m);
      break;
    case "r":
      player.rotate(0, 0, -m * 50);
      break;
    case "f":
      player.rotate(0, 0, m * 50);
      break;
    case "t":
      player.rotate(0, -m * 50, 0);
      break;
    case "g":
      player.rotate(0, m * 50, 0);
      break;
    case "y":
      player.rotate(-m * 50, 0, 0);
      break;
    case "h":
      player.rotate(m * 50, 0, 0);
      break;
    case "x":
      setCamera();
      break;
  }
  inp = "";

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
    const nMatrix = gl.getUniformLocation(program, "nMatrix");
    mesh.rotate(i * 2, i * 2, i * 2);

    gl.uniformMatrix4fv(model, false, mesh.matrix.toFloat32Array());
    gl.uniformMatrix4fv(nMatrix, false, mesh.nMatrix.toFloat32Array());

    gl.drawArrays(gl.TRIANGLES, 0, cube.faces.length * 27);
  }
  requestAnimationFrame(loop);
};

loop();

document.onkeydown = (ev) => {
  inp = ev.key;
};
