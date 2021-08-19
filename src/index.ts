import { CPlayer } from "../music/player-small";
import { song } from "../music/song";
import { perspective, orthogonal } from "./camera";
import { Red } from "./colors";
import { Cube } from "./cube";
import { Mesh } from "./mesh";
import { LandscapeSquare, scapeOptions } from "./landscapeSquare";
import { handleInput } from "./input";
import { Enemy } from "./enemy";
import { Player } from "./player";
import {
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
  disappearNear,
  scapeY,
  fogDistance,
  disappearFar,
} from "./constants";
import { Bullet } from "./bullet";

const start = document.getElementById("start");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

//shader source
const vs_source = require("./glsl/vshader.glsl") as string;
const fs_source = require("./glsl/fshader.glsl") as string;

let gl: WebGLRenderingContext;
let program: WebGLProgram;
let landscape: LandscapeSquare[] = [];
let enemies: Enemy[] = [];
let bullets: Bullet[] = [];
let player: Player;
let lastTime: number;

//check if line segments intersect
// const intersect = (
//   a: { x1: number; y1: number; x2: number; y2: number },
//   b: { x1: number; y1: number; x2: number; y2: number }
// ) => {
//   return (
//     Turn(p1, p3, p4) != Turn(p2, p3, p4) && Turn(p1, p2, p3) != Turn(p1, p2, p4)
//   );
//   // return true;
// };

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
  // const cameraMatrix = orthogonal(
  //   (zoom * canvas.width) / canvas.height,
  //   zoom,
  //   100
  // );
  // cameraMatrix.translateSelf(
  //   (zoom * canvas.width) / canvas.height / 2,
  //   -zoom / 2,
  //   -zoom
  // );

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

  // set up some objects
  player = new Player(
    await Mesh.fromSerialized("./models/player.json"),
    // await Mesh.fromObjMtl("./obj/ship3.obj", "./obj/ship3.mtl", 0.05)
    bullets
  );
  document.onkeydown = (ev) => handleInput(ev, true, player);
  document.onkeyup = (ev) => handleInput(ev, false, player);

  const enemy = new Enemy(
    await Mesh.fromSerialized("./models/enemy.json"),
    // await Mesh.fromObjMtl("./obj/enemy.obj", "./obj/enemy.mtl", 1)
    bullets
  );
  // console.log(enemy.serialize(2));
  enemy.rotate(0, -90, 90);
  enemy.translate(0, 0, -10);
  enemies.push(enemy);

  // player = new Cube(0.3, Red);
  // player.translate(0, scapeY / 2, 0);
  player.rotate(0, 180, 0);

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
      square.translate(-scapeWidth * scapeCols * 0.5, 0, -10);
      landscape.push(square);
    }
  }
  requestAnimationFrame(loop);
};
//game loop
const loop = (time: number) => {
  if (lastTime) {
    //do something w time gap
  }
  lastTime = time;
  //clear screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //player movement
  player.respondToInput();

  //draw player
  player.update();
  player.draw(gl, program);

  let hit = "green";
  //move landscape towards camera
  for (let i = 0; i < landscape.length; i++) {
    const square = landscape[i];
    square.translate(0, 0, scapeSpeed);
    square.draw(gl, program);
    //if square has disappeared
    if (square.position.z > disappearNear) {
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
          scapeY,
          squareInFront.position.z - scapeWidth
        );
        newSquare.translate(-scapeWidth * scapeCols * 0.5, 0, 0);
        landscape.push(newSquare);
      }
      //remove front row square
      landscape.splice(i, scapeCols);
    }
    //check landscape for intersect with player
    if (square.position.z > 0 && square.position.z < scapeWidth) {
      //get line based on interpolating sides
      const fraction = square.position.z / scapeWidth;
      const segment = {
        x1: square.position.x,
        y1: square.position.y + square.fl - (square.fl - square.bl) * fraction,
        x2: square.position.x + scapeWidth,
        y2: square.position.y + square.fr - (square.fr - square.br) * fraction,
      };
      //check line against player extents
      if (player.intersect(segment)) {
        player.translate(0, movement, 0);
        hit = "red";
      } else {
      }
    }
  }
  document.body.style.background = hit;

  // draw enemies
  for (let i = 0; i < enemies.length; i++) {
    //create gl buffer of vertex positions/colors and bind to object's vbuffer
    const enemy = enemies[i];
    //make enemy spin
    enemy.rotate(0.5, 0, 0);
    enemy.update(time);
    enemy.draw(gl, program);
  }
  // console.log(bullets);
  // draw bullets
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.update();
    bullet.draw(gl, program);
    if (bullet.position.z < disappearFar || bullet.position.z > disappearNear)
      bullets.splice(i, 1);
  }

  requestAnimationFrame(loop);
};

window.onload = () => {
  canvas.width = 640; //document.body.clientWidth;
  canvas.height = 480; //document.body.clientHeight;
  init();
};

const startMusic = () => {
  const cPlayer = new CPlayer();
  cPlayer.init(song);
  cPlayer.generate();
  var done = false;
  setInterval(function () {
    if (done) {
      return;
    }
    done = cPlayer.generate() >= 1;
    if (done) {
      // Put the generated song in an Audio element.
      var wave = cPlayer.createWave();
      var audio = document.createElement("audio");
      audio.src = URL.createObjectURL(new Blob([wave], { type: "audio/wav" }));
      audio.play();
      audio.loop = true;
    }
  }, 0);
  // init();
};

start.onclick = startMusic;
