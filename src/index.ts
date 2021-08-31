import { Mesh } from "./core/mesh";
import { handleInput } from "./core/input";
import { Player } from "./gameObjects/player";
import { levels, startingHealth, viewSize } from "./core/constants";
import { Game } from "./core/engine";
import { Level } from "./core/level";
import { Green, Purple, Yellow } from "./core/colors";
import { generateSong } from "./sound/generateSong";
import { processSong, rlDecode } from "../rlEncode";
import { Cube } from "./cube";
import { song1 } from "./sound/song1";
import { dieSound, hitSound, hitSound2 } from "./sound/hitSound";
import { pmesh } from "./models/player";
import { e1mesh } from "./models/enemy1";
import { e2mesh } from "./models/enemy2";
import { e3mesh } from "./models/enemy3";
import { e4mesh } from "./models/enemy4";
import { e5mesh } from "./models/enemy5";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const playerHealth = document.getElementById("playerHealth");
const instructions = document.getElementById("instructions");
const overlay = document.getElementById("overlay");

let game: Game;
let sounds: HTMLAudioElement[];
// serialize obj to make them smaller, save to JSON:
// import { JSONfromObjMtl } from "../meshUtil";
// JSONfromObjMtl("./obj/enemy6.obj", "./obj/enemy6.mtl", 1, {
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

  game.sounds = sounds;
  // game.songs = [h, s];
  game.sounds[0].play();
  //load some meshes
  game.meshes = [
    Mesh.fromSerialized(pmesh),
    Mesh.fromSerialized(e1mesh),
    Mesh.fromSerialized(e2mesh),
    Mesh.fromSerialized(e3mesh),
    Mesh.fromSerialized(e4mesh),
    Mesh.fromSerialized(e5mesh),
  ];
  game.meshes.push(new Cube(0.5, Yellow));
  game.meshes.push(new Cube(0.5, Purple));
  game.meshes.push(new Cube(0.5, Green));

  game.level = Level.generateLevel(game, levels[0]);
  // set up some objects
  game.player = new Player(game, 0);
  document.onkeydown = (ev) => handleInput(ev, true, game);
  document.onkeyup = (ev) => handleInput(ev, false, game);

  requestAnimationFrame(loop);
};

//game loop
export const loop = (time: number) => {
  game.update(time);
  playerHealth.style.width =
    ((100 * game.player.health) / startingHealth).toString() + "%";
  if (!game.paused) requestAnimationFrame(loop);
};

window.onload = () => {
  canvas.width = viewSize.width;
  canvas.height = viewSize.height;
  document.onkeyup = async (ev) => {
    ev.preventDefault();
    document.onkeyup = null;
    if (ev.key.toLowerCase() === "p") {
      await loadSounds();
      overlay.style.opacity = "0%";
      init();
    }
  };
};

const loadSounds = async () => {
  instructions.innerHTML = `<p>Loading Audio...0%</p>`;
  sounds = [
    await generateSong(processSong(song1, rlDecode), true, instructions),
    // await generateSong(hitSound),
    await generateSong(hitSound),
    await generateSong(hitSound2),
    await generateSong(dieSound),
  ];
};
