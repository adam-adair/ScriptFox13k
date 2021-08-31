import { Mesh } from "./core/mesh";
import { handleInput } from "./core/input";
import { Player } from "./gameObjects/player";
import { levels, viewSize } from "./core/constants";
import { Game } from "./core/engine";
import { Level } from "./core/level";
import { Purple, Yellow } from "./core/colors";
import { generateSong } from "./sound/generateSong";
import { processSong, rlDecode } from "../rlEncode";
import { Cube } from "./cube";
import { song1 } from "../music/song1";
import { hitSound } from "../music/hitSound";
import { pmesh } from "../models/player";
import { e1mesh } from "../models/enemy1";
import { e2mesh } from "../models/enemy2";
import { e3mesh } from "../models/enemy3";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const playerHealth = document.getElementById("playerHealth");
const instructions = document.getElementById("instructions");
const overlay = document.getElementById("overlay");

let game: Game;
let sounds: HTMLAudioElement[];
// serialize obj to make them smaller, save to JSON:
// import { JSONfromObjMtl } from "../meshUtil";
// JSONfromObjMtl("./obj/enemy3.obj", "./obj/enemy3.mtl", 1, {
//   x: 0,
//   y: -90,
//   z: 0,
// });

// encode song json to make smaller as well
// import { rlEncode } from "../rlEncode";
// import { song1 } from "./sound/song1";
// console.log(JSON.stringify(processSong(song1, rlEncode)));
// const s = generateSong(song1);

const init = async () => {
  //initialize game
  game = new Game(canvas);

  game.songs = sounds;
  // game.songs = [h, s];
  game.songs[1].play();
  //load some meshes
  game.meshes = [
    Mesh.fromSerialized(pmesh),
    Mesh.fromSerialized(e1mesh),
    Mesh.fromSerialized(e2mesh),
    Mesh.fromSerialized(e3mesh),
  ];
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
  document.onkeyup = async (ev) => {
    ev.preventDefault();
    document.onkeyup = null;
    if (ev.key === " ") {
      await loadSounds();
      overlay.style.display = "none";
      init();
    }
  };
};

const loadSounds = async () => {
  instructions.innerHTML = `<p>Loading Audio...0%</p>`;
  sounds = [
    await generateSong(hitSound),
    await generateSong(processSong(song1, rlDecode), instructions),
  ];
};
