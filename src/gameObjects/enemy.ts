import { Bullet } from "./bullet";
import { Green, Yellow } from "../core/colors";
import { enemyTypeData } from "../core/constants";
import { Game } from "../core/engine";
import { GameObject } from "../core/gameObject";

export class Enemy extends GameObject {
  initialPos: number[];
  reachedStart: boolean;
  lastFiredTime: number;
  enemyType: number;
  constructor(game: Game, meshIndex: number) {
    super(game, meshIndex, enemyTypeData[meshIndex].health);
    this.translate(0, 6, -20);
    this.reachedStart = false;
    this.enemyType = meshIndex;
  }
  fire() {
    const bullet = new Bullet(
      this.game,
      [Green, Yellow, Green, Yellow],
      -1,
      enemyTypeData[this.enemyType].bulletDamage
    );
    bullet.translate(
      this.position.x,
      this.position.y,
      this.position.z + this.mesh.boundingBox.blt.z + 0.1
    );
    this.game.bullets.push(bullet);
  }
  update() {
    super.update();
    //move to start position
    if (!this.reachedStart) {
      this.moveToStart();
      return;
    }

    //fire bullet if enough time elapsed
    if (this.lastFiredTime) {
      if (
        this.game.time - enemyTypeData[this.enemyType].bulletDelay >
        this.lastFiredTime
      ) {
        this.fire();
        this.lastFiredTime = this.game.time;
      }
    } else this.lastFiredTime = this.game.time;

    //check if hit by bullet
    //get rotation and position of enemy
    const inversePlayerMatrix = new DOMMatrix(this.modelMatrix.toString());
    inversePlayerMatrix.invertSelf();
    for (let i = 0; i < this.game.bullets.length; i++) {
      //get bullet
      const bullet = this.game.bullets[i];
      const { x, y, z } = bullet.position;
      //apply some transform to bullet point
      const point = new DOMPoint(x, y, z);
      const rel = point.matrixTransform(inversePlayerMatrix);
      //check if bullet point is in player box
      if (this.mesh.pointIntersect(rel)) {
        this.hit(bullet.damage);
        bullet.destroy();
      }
    }
    if (this.health <= 0) this.destroy();

    //move enemy based on type
    this.move();
  }
  destroy() {
    this.game.sounds[3].play();
    const { enemyWaves, currentWave } = this.game.level;
    const ix = enemyWaves[currentWave].indexOf(this);
    enemyWaves[currentWave].splice(ix, 1);
  }
  moveToStart() {
    this.translate(0, -0.2, 0);
    if (Math.abs(this.position.y - this.initialPos[1]) <= 0.01)
      this.reachedStart = true;
  }
  // todo write movement routines
  move() {
    if (this.enemyType === 1) {
      this.rotate(0, 0, 2);
    }
    if (this.enemyType === 2) {
      this.rotate(0, 0, -3);
    }
    if (this.enemyType === 5) {
      this.rotate(0, 0, 4);
    }
  }
  hit(damage: number) {
    this.game.sounds[2].play();
    super.hit(damage);
  }
}
