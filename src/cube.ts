import { Color } from "./core/colors";
import { Mesh, Vertex, Face } from "./core/mesh";
export class Cube extends Mesh {
  constructor(d: number, color?: Color) {
    const vertices = [];
    vertices[0] = new Vertex(-d, -d, -d);
    vertices[1] = new Vertex(-d, -d, d);
    vertices[2] = new Vertex(-d, d, -d);
    vertices[3] = new Vertex(-d, d, d);
    vertices[4] = new Vertex(d, -d, -d);
    vertices[5] = new Vertex(d, d, -d);
    vertices[6] = new Vertex(d, -d, d);
    vertices[7] = new Vertex(d, d, d);

    const faces = [];
    faces[0] = new Face(0, 1, 2, color);
    faces[1] = new Face(3, 2, 1, color);
    faces[2] = new Face(5, 7, 4, color);
    faces[3] = new Face(6, 4, 7, color);
    faces[4] = new Face(2, 3, 5, color);
    faces[5] = new Face(7, 5, 3, color);
    faces[6] = new Face(4, 6, 0, color);
    faces[7] = new Face(1, 0, 6, color);
    faces[8] = new Face(3, 1, 7, color);
    faces[9] = new Face(6, 7, 1, color);
    faces[10] = new Face(5, 4, 2, color);
    faces[11] = new Face(0, 2, 4, color);
    super({ vertices, faces });
  }
}
