import { Color } from "./colors";
import { Mesh, Vertex, Face } from "./mesh";
export class Cube extends Mesh {
  constructor(d: number, color?: Color) {
    const Vertices = [];
    Vertices[0] = new Vertex(-d, -d, -d);
    Vertices[1] = new Vertex(-d, -d, d);
    Vertices[2] = new Vertex(-d, d, -d);
    Vertices[3] = new Vertex(-d, d, d);
    Vertices[4] = new Vertex(d, -d, -d);
    Vertices[5] = new Vertex(d, d, -d);
    Vertices[6] = new Vertex(d, -d, d);
    Vertices[7] = new Vertex(d, d, d);

    const Faces = [];
    Faces[0] = new Face(0, 1, 2, color);
    Faces[1] = new Face(3, 2, 1, color);
    Faces[2] = new Face(5, 7, 4, color);
    Faces[3] = new Face(6, 4, 7, color);
    Faces[4] = new Face(2, 3, 5, color);
    Faces[5] = new Face(7, 5, 3, color);
    Faces[6] = new Face(4, 6, 0, color);
    Faces[7] = new Face(1, 0, 6, color);
    Faces[8] = new Face(3, 1, 7, color);
    Faces[9] = new Face(6, 7, 1, color);
    Faces[10] = new Face(5, 4, 2, color);
    Faces[11] = new Face(0, 2, 4, color);
    super(Vertices, Faces);
  }
}
