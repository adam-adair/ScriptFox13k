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

let game: Game;

const init = async () => {
  //initialize game
  game = new Game(canvas);

  // set up some objects
  const player = new Player(
    game,
    await Mesh.fromSerialized("./models/player.json")
    // await Mesh.fromObjMtl("./obj/ship3.obj", "./obj/ship3.mtl", 0.05)
  );
  document.onkeydown = (ev) => handleInput(ev, true, player);
  document.onkeyup = (ev) => handleInput(ev, false, player);

  const enemy = new Enemy(
    game,
    await Mesh.fromSerialized("./models/enemy.json")
    // await Mesh.fromObjMtl("./obj/enemy.obj", "./obj/enemy.mtl", 1)
  );
  // console.log(enemy.serialize(2));
  enemy.rotate(0, -90, 90);
  enemy.translate(0, 0, -10);

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
