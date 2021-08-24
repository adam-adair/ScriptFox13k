import { CPlayer } from "./music/player-small";
import { song } from "./music/song";
import { Red } from "./core/colors";
// import { Cube } from "./cube";
import { Mesh } from "./core/mesh";
import { LandscapeSquare, scapeOptions } from "./gameObjects/landscapeSquare";
import { handleInput } from "./core/input";
import { Enemy } from "./gameObjects/enemy";
import { Player } from "./gameObjects/player";
import {
  scapeCols,
  scapeRows,
  scapeWidth,
  scapeHeight,
  scapeY,
  viewSize,
} from "./core/constants";
import { Game } from "./core/engine";

const start = document.getElementById("start");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const playerHealth = document.getElementById("playerHealth");

let game: Game;

const init = async () => {
  //initialize game
  game = new Game(canvas);

  //load some meshes
  const meshes = await Promise.all([
    Mesh.fromSerialized("./models/player.json"),
    Mesh.fromSerialized("./models/enemy1.json"),
  ]);

  // serialize obj to make them smaller, save to JSON:

  // const mesh = await Mesh.fromObjMtl("./obj/enemy.obj", "./obj/enemy.mtl", 1);
  // console.log(new Enemy(game, mesh, 1).mesh.serialize(2));

  // set up some objects
  const player = new Player(game, meshes[0]);
  document.onkeydown = (ev) => handleInput(ev, true, player);
  document.onkeyup = (ev) => handleInput(ev, false, player);

  const enemy = new Enemy(game, meshes[1], 15);

  enemy.translate(0, 0, -30);

  for (let i = 0; i < scapeRows; i++) {
    for (let j = 0; j < scapeCols; j++) {
      const scapeOptions: scapeOptions = {
        width: scapeWidth,
        height: scapeHeight,
      };
      if (j > 0) {
        const squareToLeft = game.landscape[i * scapeCols + (j - 1)];
        scapeOptions.fl = squareToLeft.fr;
        scapeOptions.bl = squareToLeft.br;
      }
      if (i > 0) {
        const squareInFront = game.landscape[i * scapeCols + j - scapeCols];
        scapeOptions.fl = squareInFront.bl;
        scapeOptions.fr = squareInFront.br;
      }
      if (i + j === 0) scapeOptions.color = Red;
      const square = new LandscapeSquare(game, scapeOptions);

      square.translate(j * scapeWidth, scapeY, -i * scapeWidth);
      square.translate(-scapeWidth * scapeCols * 0.5, 0, -10);
    }
  }
  requestAnimationFrame(loop);
};

//game loop
const loop = (time: number) => {
  game.update(time);
  playerHealth.innerHTML = game.player.health.toFixed(2);
  requestAnimationFrame(loop);
};

window.onload = () => {
  canvas.width = viewSize.width; //document.body.clientWidth;
  canvas.height = viewSize.height; //document.body.clientHeight;
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
