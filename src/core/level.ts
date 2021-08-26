import { Enemy } from "../gameObjects/enemy";
import { Landscape } from "../gameObjects/landscape";
import { Color } from "./colors";
import { Game } from "./engine";

export class Level {
  game: Game;
  enemyWaves: Enemy[][];
  currentWave: number;
  landscape: Landscape;
  audio: HTMLAudioElement;
  constructor(
    game: Game,
    enemyWaves: Enemy[][],
    landscape: Landscape,
    audio: HTMLAudioElement
  ) {
    this.currentWave = 0;
    this.game = game;
    this.enemyWaves = enemyWaves;
    this.landscape = landscape;
    this.audio = audio;
  }
  start() {
    this.audio.play();
  }

  static generateLevel(game: Game, levelData: LevelData): Level {
    const { waveIndices, audioIndex, speed, height, color } = levelData;
    const waves = [];
    for (let i = 0; i < waveIndices.length; i++) {
      const wave: Enemy[] = [];
      const w = waveIndices[i];
      for (let j = 0; j < w.length; j++) {
        const e = new Enemy(game, w[j], j * 5 + 15);
        // todo, place enemies and determine behavior
        e.translate(-1 + j, 0, -15);
        wave.push(e);
      }
      waves.push(wave);
    }
    return new Level(
      game,
      waves,
      new Landscape(game, height, speed, color),
      game.songs[audioIndex]
    );
  }
  update() {
    //if no more enemies in this wave
    if (this.enemyWaves[this.currentWave].length === 0) {
      //if no more waves
      if (this.currentWave === this.enemyWaves.length - 1) {
        this.game.nextLevel();
      }
      //go to next wave
      else this.currentWave++;
    }
  }
}

export interface LevelData {
  waveIndices: number[][];
  audioIndex: number;
  speed: number;
  height: number;
  color: Color;
}
