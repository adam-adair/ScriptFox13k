import { Bullet } from "./bullet";
import { Green, Yellow } from "../core/colors";
import { enemyBulletDelay } from "../core/constants";
import { Game } from "../core/engine";
import { GameObject } from "../core/gameObject";
import { MeshInfo } from "../core/mesh";

export class Enemy extends GameObject {
  lastFiredTime: number;
  constructor(game: Game, meshInfo: MeshInfo) {
    super(game, meshInfo);
    this.game.enemies.push(this);
  }
  fire() {
    const bullet = new Bullet(this.game, [Green, Yellow, Green, Yellow], -1);
    bullet.translate(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z
    );
    this.game.bullets.push(bullet);
  }
  update() {
    if (this.lastFiredTime) {
      if (this.game.time - enemyBulletDelay > this.lastFiredTime) {
        this.fire();
        this.lastFiredTime = this.game.time;
      }
    } else this.lastFiredTime = this.game.time;
    // this.translate(0.01, 0, 0);
  }
}
