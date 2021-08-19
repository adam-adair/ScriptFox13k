import { Bullet } from "./bullet";
import { Green, Yellow } from "./colors";
import { enemyBulletDelay } from "./constants";
import { Mesh, MeshInfo } from "./mesh";

export class Enemy extends Mesh {
  lastTime: number;
  bullets: Bullet[];
  constructor(meshInfo: MeshInfo, bullets: Bullet[]) {
    super(meshInfo);
    this.bullets = bullets;
  }
  fire() {
    // console.log("fire", this.bullets);
    const bullet = new Bullet([Green, Yellow, Green, Yellow], -1);
    bullet.translate(this.position.x, this.position.y, this.position.z);
    this.bullets.push(bullet);
  }
  update(time: number) {
    if (this.lastTime) {
      if (time - enemyBulletDelay > this.lastTime) {
        this.fire();
        this.lastTime = time;
      }
    } else this.lastTime = time;
    // this.translate(0.01, 0, 0);
  }
}
