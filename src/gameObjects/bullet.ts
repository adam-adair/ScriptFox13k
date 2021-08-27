import { Color } from "../core/colors";
import { bulletInfo, disappearFar, disappearNear } from "../core/constants";
import { Game } from "../core/engine";
import { GameObject } from "../core/gameObject";
import { Face, Mesh, Vertex } from "../core/mesh";

export class Bullet extends GameObject {
  direction: number;
  damage: number;
  constructor(game: Game, colors: Color[], direction: number, damage: number) {
    const vertices: Vertex[] = [
      new Vertex(-bulletInfo.size, -bulletInfo.size, bulletInfo.size),
      new Vertex(bulletInfo.size, -bulletInfo.size, bulletInfo.size),
      new Vertex(0.0, bulletInfo.size, 0.0),
      new Vertex(0.0, -bulletInfo.size, -bulletInfo.size),
    ];
    const faces: Face[] = [
      new Face(0, 1, 2, colors[0]),
      new Face(1, 3, 2, colors[1]),
      new Face(3, 0, 2, colors[2]),
      new Face(0, 3, 1, colors[3]),
    ];
    super(game, new Mesh({ vertices, faces }));
    this.direction = direction;
    this.damage = damage;
  }
  update() {
    this.translate(0, 0, -bulletInfo.speed * this.direction);
    this.rotate(bulletInfo.rotation, bulletInfo.rotation, bulletInfo.rotation);
    if (this.position.z < disappearFar || this.position.z > disappearNear)
      this.destroy();
  }
  destroy() {
    const ix = this.game.bullets.indexOf(this);
    this.game.bullets.splice(ix, 1);
  }
}
