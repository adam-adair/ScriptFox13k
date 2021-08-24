import { Bullet } from "./bullet";
import { Green, Yellow } from "../core/colors";
import { bulletDamage, enemyBulletDelay } from "../core/constants";
import { Game } from "../core/engine";
import { GameObject } from "../core/gameObject";
import { MeshInfo } from "../core/mesh";

export class Enemy extends GameObject {
  lastFiredTime: number;
  constructor(game: Game, meshInfo: MeshInfo, health: number) {
    super(game, meshInfo, health);
    this.game.enemies.push(this);
  }
  fire() {
    const bullet = new Bullet(this.game, [Green, Yellow, Green, Yellow], -1);
    bullet.translate(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z + this.mesh.boundingBox.blt.z + 0.1
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
    const inversePlayerMatrix = new DOMMatrix(this.mesh.modelMatrix.toString());
    inversePlayerMatrix.invertSelf();
    for (let i = 0; i < this.game.bullets.length; i++) {
      //get bullet
      const bullet = this.game.bullets[i];
      const { x, y, z } = bullet.mesh.position;
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
    const ix = this.game.enemies.indexOf(this);
    this.game.enemies.splice(ix, 1);
  }
}
