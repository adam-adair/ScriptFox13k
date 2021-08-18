import { Blue, Green, Red, White, Yellow } from "./colors";
import { bulletInfo } from "./constants";
import { Face, Mesh, Vertex } from "./mesh";

export class Bullet extends Mesh {
  constructor() {
    const vertices: Vertex[] = [
      new Vertex(-bulletInfo.size, -bulletInfo.size, bulletInfo.size),
      new Vertex(bulletInfo.size, -bulletInfo.size, bulletInfo.size),
      new Vertex(0.0, bulletInfo.size, 0.0),
      new Vertex(0.0, -bulletInfo.size, -bulletInfo.size),
    ];
    const faces: Face[] = [
      new Face(0, 1, 2, Red),
      new Face(1, 3, 2, Yellow),
      new Face(3, 0, 2, White),
      new Face(0, 3, 1, Yellow),
    ];
    super({ vertices, faces });
  }
  draw(gl: WebGLRenderingContext, program: WebGLProgram) {
    this.translate(0, 0, -bulletInfo.speed);
    this.rotate(bulletInfo.rotation, bulletInfo.rotation, bulletInfo.rotation);
    super.draw(gl, program);
  }
}
