import { perspective, orthogonal } from "./camera";
import { Red } from "./colors";
import { Cube } from "./cube";
import { constants } from "./constants";
import { Matrix, Mesh } from "./mesh";
import { LandscapeSquare, scapeOptions } from "./landscapeSquare";
import { control } from "./input";
const {
  clearColor,
  zoom,
  lightDirection,
  ambientLightAmount,
  scapeCols,
  scapeRows,
  scapeSpeed,
  scapeWidth,
  scapeHeight,
  movement,
} = constants;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const { width, height } = canvas;
const ratio = width / height;

//shader source
const vs_source = require("./glsl/vshader.glsl") as string;
const fs_source = require("./glsl/fshader.glsl") as string;

let gl: WebGLRenderingContext;
let program: WebGLProgram;
let meshes: Mesh[];
let landscape: LandscapeSquare[] = [];
let inp = "";
let lastRowHeights = [];
let modelColorPositionBuffer: WebGLBuffer;
let enemy: Mesh;
let player: Mesh;

const init = () => {
  //initialize webgl
  gl = canvas.getContext("webgl");

  program = gl.createProgram();

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
  gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
  gl.enable(gl.DEPTH_TEST);

  //set light, camera uniforms
  const camera = gl.getUniformLocation(program, "camera");
  const cameraMatrix = perspective(zoom, ratio, 1, 100);
  cameraMatrix.translateSelf(0, 0, -zoom * 2);

  // for ortho view:
  // const cameraMatrix = orthogonal(zoom * ratio, zoom, 100);
  // cameraMatrix.translateSelf((zoom * ratio) / 2, -zoom / 2, -zoom);

  gl.uniformMatrix4fv(camera, false, cameraMatrix.toFloat32Array());

  const light = gl.getUniformLocation(program, "light");
  gl.uniform3f(light, lightDirection.x, lightDirection.y, lightDirection.z);
  const ambientLight = gl.getUniformLocation(program, "ambientLight");
  gl.uniform3f(
    ambientLight,
    ambientLightAmount,
    ambientLightAmount,
    ambientLightAmount
  );

  //set up some stupid objects
  enemy = new Cube(1);
  player = new Cube(0.3, Red);
  player.translate(2, 0, 0);
  player.rotate(45, 45, 45);
  enemy.rotate(45, 45, 45);

  for (let i = 0; i < scapeRows; i++) {
    for (let j = 0; j < scapeCols; j++) {
      const scapeOptions: scapeOptions = {
        width: scapeWidth,
        height: scapeHeight,
      };
      if (i > 0) {
        const squareInFront = landscape[(i - 1) * scapeCols + j];
        scapeOptions.fl = squareInFront.bl;
        scapeOptions.fr = squareInFront.br;
      }
      if (j > 0) {
        const squareToLeft = landscape[j - 1 + i * scapeCols];
        scapeOptions.fl = squareToLeft.fr;
        scapeOptions.bl = squareToLeft.br;
      }

      const square = new LandscapeSquare(scapeOptions);

      if (i === scapeRows - 1) {
        lastRowHeights.push(square.bl, square.br);
      }
      square.translate(j * scapeWidth, -2.5, i * scapeWidth);
      square.translate(-scapeWidth * scapeCols * 0.5, 0, 0);
      landscape.push(square);
    }
  }

  meshes = [enemy, player, ...landscape];

  //initialize camera and input
  requestAnimationFrame(loop);
};

//game loop
const loop = () => {
  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //box movement
  control(player, inp, movement);
  inp = "";

  //make enemy spin
  enemy.rotate(0.5, 0.5, 0.5);

  // //for each object
  for (let i = 0; i < meshes.length; i++) {
    //create gl buffer of vertex positions/colors and bind to object's vbuffer
    const mesh = meshes[i];

    //set object's attributes
    const FSIZE = mesh.vbuffer.BYTES_PER_ELEMENT;

    modelColorPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelColorPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vbuffer, gl.STATIC_DRAW);
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

    const modelMatrix = mesh.pMatrix.multiply(mesh.rMatrix);
    const normalMatrix = new Matrix(modelMatrix.toString());
    normalMatrix.invertSelf();
    normalMatrix.transposeSelf();

    gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());
    gl.uniformMatrix4fv(nMatrix, false, normalMatrix.toFloat32Array());

    gl.drawArrays(gl.TRIANGLES, 0, mesh.faces.length * 3);
  }
  requestAnimationFrame(loop);
};

init();

document.onkeydown = (ev) => {
  inp = ev.key;
};
