import { Mesh } from "./core/mesh";
import { handleInput } from "./core/input";
import { Player } from "./gameObjects/player";
import { levels, viewSize } from "./core/constants";
import { Game } from "./core/engine";
import { Level } from "./core/level";
import { Purple, Yellow } from "./core/colors";
import { generateSong } from "./sound/generateSong";
import { song1 } from "./sound/song1";
import { Cube } from "./cube";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const playerHealth = document.getElementById("playerHealth");

let game: Game;

// serialize obj to make them smaller, save to JSON:
// import { JSONfromObjMtl } from "../meshUtil";
// JSONfromObjMtl("./obj/enemy3.obj", "./obj/enemy3.mtl", 1, {
//   x: 0,
//   y: -90,
//   z: 0,
// });

// const s = generateSong(song1);

const init = async () => {
  //initialize game
  game = new Game(canvas);

  game.songs = [null];
  // game.songs = [s];

  //load some meshes
  game.meshes = await Promise.all([
    Mesh.fromSerialized("./models/player.json"),
    Mesh.fromSerialized("./models/enemy1.json"),
    Mesh.fromSerialized("./models/enemy2.json"),
    Mesh.fromSerialized("./models/enemy3.json"),
  ]);

  game.meshes.push(new Cube(0.5, Yellow));
  game.meshes.push(new Cube(0.5, Purple));

  game.level = Level.generateLevel(game, levels[0]);
  // set up some objects
  game.player = new Player(game, 0);
  document.onkeydown = (ev) => handleInput(ev, true, game.player);
  document.onkeyup = (ev) => handleInput(ev, false, game.player);

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
