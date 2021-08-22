import {
  clearColor,
  zoom,
  lightDirection,
  ambientLightAmount,
  fogDistance,
  shadowTexture,
  viewSize,
} from "./constants";
import { perspective, orthogonal } from "./camera";
import { Player } from "../gameObjects/player";
import { Enemy } from "../gameObjects/enemy";
import { Bullet } from "../gameObjects/bullet";
import { LandscapeSquare } from "../gameObjects/landscapeSquare";

export class Game {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  landscape: LandscapeSquare[];
  lastTime: number;
  time: number;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl");
    this.program = this.gl.createProgram();
    this.enemies = [];
    this.bullets = [];
    this.landscape = [];
    const { gl, program } = this;

    //normal program
    const vs_source = require("../glsl/vshader.glsl") as string;
    const fs_source = require("../glsl/fshader.glsl") as string;

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
    gl.clearDepth(1.0);
    gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    //set light, camera uniforms
    const camera = gl.getUniformLocation(program, "camera");
    const cameraMatrix = perspective(
      zoom,
      canvas.width / canvas.height,
      1,
      100
    );
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
  }
  update(time: number) {
    const { player, bullets, enemies, landscape } = this;
    //update ticks
    this.lastTime = time;
    this.time = time;

    // //draw player
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    player.respondToInput();
    player.update();
    player.draw();

    //draw enemies
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      enemy.update();
      enemy.draw();
    }

    //draw bullets
    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];
      bullet.update();
      bullet.draw();
    }

    //draw landscape
    for (let i = 0; i < landscape.length; i++) {
      const square = landscape[i];
      square.update(i);
      square.draw();
    }
  }
}
