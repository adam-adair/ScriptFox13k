import { Bonus } from "../gameObjects/bonus";
import { Enemy } from "../gameObjects/enemy";
import { Landscape } from "../gameObjects/landscape";
import { Color } from "./colors";
import { bonusMeshes } from "./constants";
import { Game } from "./engine";

export class Level {
  game: Game;
  enemyWaves: Enemy[][];
  currentWave: number;
  landscape: Landscape;
  constructor(game: Game, enemyWaves: Enemy[][], landscape: Landscape) {
    this.currentWave = 0;
    this.game = game;
    this.enemyWaves = enemyWaves;
    this.landscape = landscape;
  }
  static generateLevel(game: Game, levelData: LevelData): Level {
    const { waveIndices, speed, height, color } = levelData;
    const waves = [];
    for (let i = 0; i < waveIndices.length; i++) {
      const wave: Enemy[] = [];
      const w = waveIndices[i];
      for (let j = 0; j < w.length; j++) {
        const e =
          w[j] >= bonusMeshes[0]
            ? new Bonus(game, w[j])
            : new Enemy(game, w[j], w.length, j);
        if (w.length >= 4) {
          j === 4
            ? (e.initialPos = [0, 1.5])
            : (e.initialPos = [
                -6 + (((j % 2) + 1) * 12) / 3,
                Math.floor(j / 2) * 3,
              ]);
        } else {
          e.initialPos = [((j + 1) * 12) / (w.length + 1) + -6, 0.5];
        }
        e.translate(e.initialPos[0], e.initialPos[1], 0);
        wave.push(e);
      }
      waves.push(wave);
    }
    return new Level(game, waves, new Landscape(game, height, speed, color));
  }

  static generateRandomLevel(): LevelData {
    const waveIndices: number[][] = [];
    for (let i = 0; i < 20; i++) {
      if (i % 5 === 0) {
        const bonusIx = Math.floor(Math.random() * bonusMeshes.length);
        waveIndices.push([bonusMeshes[bonusIx]]);
      } else {
        const waveSize = 1 + Math.floor(Math.random() * 5);
        const newWave: number[] = [];
        for (let j = 0; j < waveSize; j++) {
          const randomEnemy = 1 + Math.floor(Math.random() * 5);
          newWave.push(randomEnemy);
        }
        waveIndices.push(newWave);
      }
    }
    return {
      waveIndices,
      speed: Math.random() * 0.25 + 0.1,
      height: Math.random() * 1.6 + 0.4,
      color: new Color(
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5
      ),
    };
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
  speed: number;
  height: number;
  color: Color;
}
