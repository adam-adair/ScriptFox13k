import { Bullet } from "./bullet";
import { Green, Yellow } from "../core/colors";
import { bulletDamage, enemyBulletDelay } from "../core/constants";
import { Game } from "../core/engine";
import { GameObject } from "../core/gameObject";

export class Enemy extends GameObject {
  lastFiredTime: number;
  constructor(game: Game, meshIndex: number, health: number) {
    super(game, meshIndex, health);
  }
  fire() {
    const bullet = new Bullet(this.game, [Green, Yellow, Green, Yellow], -1);
    bullet.translate(
      this.position.x,
      this.position.y,
      this.position.z + this.mesh.boundingBox.blt.z + 0.1
    );
    this.game.bullets.push(bullet);
  }
  update() {
    super.update();
    if (this.lastFiredTime) {
      if (this.game.time - enemyBulletDelay > this.lastFiredTime) {
        this.fire();
        this.lastFiredTime = this.game.time;
      }
    } else this.lastFiredTime = this.game.time;
    //get rotation and position of player
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
        this.hit(bulletDamage);
        bullet.destroy();
      }
    }
    if (this.health <= 0) this.destroy();
  }
  destroy() {
    const { enemyWaves, currentWave } = this.game.level;
    const ix = enemyWaves[currentWave].indexOf(this);
    enemyWaves[currentWave].splice(ix, 1);
  }
}
