import { perspective, orthogonal } from "./camera";
import { Red } from "./colors";
import { Cube } from "./cube";
import { constants } from "./constants";
import { Mesh } from "./mesh";
import { LandscapeSquare, scapeOptions } from "./landscapeSquare";
import { movePlayer, handleInput } from "./input";
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
  disappearingPoint,
  scapeY,
  fogDistance,
} = constants;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const playerInput = {
  spinL: false,
  spinR: false,
  up: false,
  down: false,
  right: false,
  left: false,
};
document.onkeydown = (ev) => handleInput(ev, true, playerInput);
document.onkeyup = (ev) => handleInput(ev, false, playerInput);

//shader source
const vs_source = require("./glsl/vshader.glsl") as string;
const fs_source = require("./glsl/fshader.glsl") as string;

let gl: WebGLRenderingContext;
let program: WebGLProgram;
let landscape: LandscapeSquare[] = [];
let inp = "";
let enemies: Mesh[] = [];
let player: Mesh;

const init = async () => {
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
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //set light, camera uniforms
  const camera = gl.getUniformLocation(program, "camera");
  const cameraMatrix = perspective(zoom, canvas.width / canvas.height, 1, 100);
  cameraMatrix.translateSelf(0, 0, -zoom * 2);

  // for ortho view:
  // const cameraMatrix = orthogonal(zoom * ratio, zoom, 100);
  // cameraMatrix.translateSelf((zoom * ratio) / 2, -zoom / 2, -zoom);

  gl.uniformMatrix4fv(camera, false, cameraMatrix.toFloat32Array());

  // light
  const light = gl.getUniformLocation(program, "light");
  gl.uniform3f(light, lightDirection.x, lightDirection.y, lightDirection.z);
  const ambientLight = gl.getUniformLocation(program, "ambientLight");
  gl.uniform3f(
    ambientLight,
    ambientLightAmount,
    ambientLightAmount,
    ambientLightAmount
  );

  //fog
  const a_fogColor = new Float32Array([
    clearColor.r,
    clearColor.g,
    clearColor.b,
  ]);
  const a_fogDist = new Float32Array(fogDistance);
  const u_FogColor = gl.getUniformLocation(program, "u_FogColor");
  const u_FogDist = gl.getUniformLocation(program, "u_FogDist");
  gl.uniform3fv(u_FogColor, a_fogColor);
  gl.uniform2fv(u_FogDist, a_fogDist);

  //set up some stupid objects
  // player = await Mesh.fromURL("./models/player.json");
  player = await Mesh.fromURL("./models/Rabbit.babylon", true);
  player = await Mesh.fromURL("./models/rabbit.json");
  // console.log(player.serialize());
  enemies.push(new Cube(0.2));
  // player = new Cube(0.3, Red);
  player.translate(2, 0, 0);
  player.rotate(45, 45, 45);

  for (let i = 0; i < scapeRows; i++) {
    for (let j = 0; j < scapeCols; j++) {
      const scapeOptions: scapeOptions = {
        width: scapeWidth,
        height: scapeHeight,
      };
      if (j > 0) {
        const squareToLeft = landscape[i * scapeCols + (j - 1)];
        scapeOptions.fl = squareToLeft.fr;
        scapeOptions.bl = squareToLeft.br;
      }
      if (i > 0) {
        const squareInFront = landscape[i * scapeCols + j - scapeCols];
        scapeOptions.fl = squareInFront.bl;
        scapeOptions.fr = squareInFront.br;
      }
      if (i + j === 0) scapeOptions.color = Red;
      const square = new LandscapeSquare(scapeOptions);

      square.translate(j * scapeWidth, scapeY, -i * scapeWidth);
      square.translate(-scapeWidth * scapeCols * 0.5, 0, 0);
      landscape.push(square);
    }
  }
  requestAnimationFrame(loop);
};

//game loop
const loop = () => {
  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //box movement
  movePlayer(player, playerInput, movement);
  inp = "";

  //move landscape towards camera
  for (let i = 0; i < landscape.length; i++) {
    const square = landscape[i];
    square.translate(0, 0, scapeSpeed);
    square.draw(gl, program);
    //if square has disappeared
    if (square.position.z > disappearingPoint) {
      //add squares to the back
      const lastRow = landscape.slice(-scapeCols);
      for (let j = 0; j < lastRow.length; j++) {
        const scapeOptions: scapeOptions = {
          width: scapeWidth,
          height: scapeHeight,
        };
        const squareInFront = lastRow[j];
        scapeOptions.fl = squareInFront.bl;
        scapeOptions.fr = squareInFront.br;
        if (j > 0) scapeOptions.bl = landscape[landscape.length - 1].br;
        const newSquare = new LandscapeSquare(scapeOptions);
        newSquare.translate(
          j * scapeWidth,
          -2.5,
          squareInFront.position.z - scapeWidth
        );
        newSquare.translate(-scapeWidth * scapeCols * 0.5, 0, 0);
        landscape.push(newSquare);
      }
      //remove front row square
      landscape.splice(i, scapeCols);
    }
  }

  // draw enemies
  for (let i = 0; i < enemies.length; i++) {
    //create gl buffer of vertex positions/colors and bind to object's vbuffer
    const enemy = enemies[i];
    //make enemy spin
    enemy.rotate(0.5, 0.5, 0.5);
    enemy.draw(gl, program);
  }

  //draw player

  player.draw(gl, program);
  requestAnimationFrame(loop);
};

window.onload = () => {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  init();
};
