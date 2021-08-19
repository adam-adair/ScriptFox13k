import { Color } from "./colors";
import { bulletInfo } from "./constants";
import { Face, Mesh, Vertex } from "./mesh";

export class Bullet extends Mesh {
  direction: number;
  constructor(colors: Color[], direction: number) {
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
    super({ vertices, faces });
    this.direction = direction;
  }
  update() {
    this.translate(0, 0, -bulletInfo.speed * this.direction);
    this.rotate(bulletInfo.rotation, bulletInfo.rotation, bulletInfo.rotation);
  }
}
