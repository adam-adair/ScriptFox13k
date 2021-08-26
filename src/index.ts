import { Mesh } from "./core/mesh";
import { handleInput } from "./core/input";
import { Player } from "./gameObjects/player";
import { levels, viewSize } from "./core/constants";
import { Game } from "./core/engine";
import { Level } from "./core/level";
import { Blue } from "./core/colors";
import { generateSong } from "./music/generateSong";
import { song1 } from "./music/song1";

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
  ]);

  // serialize obj to make them smaller, save to JSON:

  // const mesh = await Mesh.fromObjMtl("./obj/enemy.obj", "./obj/enemy.mtl", 1);
  // console.log(new Enemy(game, mesh, 1).mesh.serialize(2));

  game.level = Level.generateLevel(game, levels[0]);

  // set up some objects
  const player = new Player(game, 0);
  document.onkeydown = (ev) => handleInput(ev, true, player);
  document.onkeyup = (ev) => handleInput(ev, false, player);

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
