import {
  clearColor,
  zoom,
  lightDirection,
  ambientLightAmount,
  fogDistance,
  shadowTextureDim,
  viewSize,
  levels,
} from "./constants";
import { perspective, orthogonal } from "./camera";
import { Player } from "../gameObjects/player";
import { Bullet } from "../gameObjects/bullet";
import { Matrix, Mesh } from "./mesh";
import { Level } from "./level";

export class Game {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  s_program: WebGLProgram;
  shadowFramebuffer: WebGLFramebuffer;
  shadowDepthTexture: WebGLTexture;
  samplerUniform: WebGLUniformLocation;
  meshes: Mesh[];
  songs: HTMLAudioElement[];
  player: Player;
  bullets: Bullet[];
  level: Level;
  lastTime: number;
  time: number;
  currentLevel: number;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.currentLevel = 0;
    this.gl = canvas.getContext("webgl");
    this.bullets = [];
    const { gl } = this;
    //set background color, enable depth
    gl.clearDepth(1.0);
    gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    //normal program
    const vs_source = require("../glsl/vshader.glsl") as string;
    const fs_source = require("../glsl/fshader.glsl") as string;
    const s_vs_source = require("../glsl/s_vshader.glsl") as string;
    const s_fs_source = require("../glsl/s_fshader.glsl") as string;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vs_source);
    gl.compileShader(vertexShader);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fragShader,
      fs_source.replace("shadowTexture", shadowTextureDim.width.toString())
    );
    gl.compileShader(fragShader);
    this.program = gl.createProgram();
    const { program } = this;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    /////////////////////////////////////////////////////////////////
    // shadow program
    // guide: https://www.chinedufn.com/webgl-shadow-mapping-tutorial/

    const lightVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(lightVertexShader, s_vs_source);
    gl.compileShader(lightVertexShader);
    const lightFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(lightFragmentShader, s_fs_source);
    gl.compileShader(lightFragmentShader);
    this.s_program = gl.createProgram();
    const { s_program } = this;
    gl.attachShader(s_program, lightVertexShader);
    gl.attachShader(s_program, lightFragmentShader);
    gl.linkProgram(s_program);
    gl.useProgram(s_program);

    //output shadow to frame buffer, bind to texture
    this.shadowFramebuffer = gl.createFramebuffer();
    const { shadowFramebuffer } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);

    this.shadowDepthTexture = gl.createTexture();
    const { shadowDepthTexture } = this;
    gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      shadowTextureDim.width,
      shadowTextureDim.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    const renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      shadowTextureDim.width,
      shadowTextureDim.height
    );

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      shadowDepthTexture,
      0
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      renderBuffer
    );

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    //create projection matrix for shadow "camera"
    const lightMatrix = orthogonal(2.2 * zoom, -1, -zoom, zoom, 0, 100);
    lightMatrix.rotateSelf(90, 0, 0);
    lightMatrix.translateSelf(0, -16, 0);
    // lightMatrix.lookAt(0, 1, 0, 0, 0, 0);

    const lightCamera = gl.getUniformLocation(s_program, "lightMatrix");
    gl.uniformMatrix4fv(lightCamera, false, lightMatrix.toFloat32Array());
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /////////////////////////////////////////////////////////////////
    //switch to normal program
    gl.useProgram(program);

    /////////////////////////////////////////////////////////////////
    //set texture and shadow cam uniforms
    this.samplerUniform = gl.getUniformLocation(program, "depthColorTexture");

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture);
    gl.uniform1i(this.samplerUniform, 0);

    const uLightMatrix = gl.getUniformLocation(program, "lightMatrix");

    gl.uniformMatrix4fv(uLightMatrix, false, lightMatrix.toFloat32Array());

    /////////////////////////////////////////////////////////////////

    //set light, camera uniforms
    const camera = gl.getUniformLocation(program, "camera");
    const cameraMatrix = perspective(
      zoom,
      canvas.width / canvas.height,
      1,
      100
    );
    // cameraMatrix.translateSelf(0, -5, -zoom * 2);
    cameraMatrix.lookAt(0, 5, zoom * 2.5, 0, 1, 0);
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
    const {
      player,
      bullets,
      level,
      program,
      s_program,
      shadowFramebuffer,
      gl,
    } = this;
    const { enemyWaves, currentWave, landscape } = level;

    /////////////////////////////////////////////////////////////////
    //switch to shadow program
    gl.useProgram(s_program);

    //draw texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
    gl.viewport(0, 0, shadowTextureDim.width, shadowTextureDim.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    player.draw(true);
    // shadows for enemies but looks weird
    // for (let i = 0; i < enemyWaves[currentWave].length; i++) {
    //   const enemy = enemyWaves[currentWave][i];
    //   enemy.draw(true);
    // }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //switch back and clear
    gl.useProgram(program);
    gl.viewport(0, 0, viewSize.width, viewSize.height);
    gl.clearColor(clearColor.r, clearColor.g, clearColor.b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /////////////////////////////////////////////////////////////////

    //update ticks
    this.lastTime = time;
    this.time = time;

    //draw player
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    player.respondToInput();
    player.update();
    player.draw();

    //draw enemies
    for (let i = 0; i < enemyWaves[currentWave].length; i++) {
      const enemy = enemyWaves[currentWave][i];
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
    for (let i = 0; i < landscape.squares.length; i++) {
      const square = landscape.squares[i];
      square.update(i);
      square.draw();
    }

    level.update();
  }
  nextLevel() {
    // todo something when you win
    if (this.currentLevel + 1 === levels.length) console.log("Won");
    else {
      // todo something to change levels, audio
      this.player.powerUps = [];
      this.currentLevel++;
      this.level = Level.generateLevel(this, levels[this.currentLevel]);
    }
  }
}
