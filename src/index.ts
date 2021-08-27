import { Mesh } from "./core/mesh";
import { handleInput } from "./core/input";
import { Player } from "./gameObjects/player";
import { levels, viewSize } from "./core/constants";
import { Game } from "./core/engine";
import { Level } from "./core/level";
import { Blue, Purple, Yellow } from "./core/colors";
import { generateSong } from "./music/generateSong";
import { song1 } from "./music/song1";
import { Enemy } from "./gameObjects/enemy";
import { Cube } from "./cube";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const playerHealth = document.getElementById("playerHealth");

let game: Game;

const init = async () => {
  //initialize game
  game = new Game(canvas);

  game.songs = [null]; //[generateSong(song1)];

  //load some meshes
  game.meshes = await Promise.all([
    Mesh.fromSerialized("./models/player.json"),
    Mesh.fromSerialized("./models/enemy1.json"),
    Mesh.fromSerialized("./models/enemy2.json"),
  ]);

  game.meshes.push(new Cube(0.5, Yellow));
  game.meshes.push(new Cube(0.5, Purple));

  // serialize obj to make them smaller, save to JSON:

  // const mesh = await Mesh.fromObjMtl("./obj/enemy2.obj", "./obj/enemy2.mtl", 1);
  // console.log(new Mesh(mesh).serialize(2));

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
