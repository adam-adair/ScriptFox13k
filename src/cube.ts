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
    Faces[0] = new Face(Vertices[0], Vertices[1], Vertices[2], color);
    Faces[1] = new Face(Vertices[3], Vertices[2], Vertices[1], color);
    Faces[2] = new Face(Vertices[5], Vertices[7], Vertices[4], color);
    Faces[3] = new Face(Vertices[6], Vertices[4], Vertices[7], color);
    Faces[4] = new Face(Vertices[2], Vertices[3], Vertices[5], color);
    Faces[5] = new Face(Vertices[7], Vertices[5], Vertices[3], color);
    Faces[6] = new Face(Vertices[4], Vertices[6], Vertices[0], color);
    Faces[7] = new Face(Vertices[1], Vertices[0], Vertices[6], color);
    Faces[8] = new Face(Vertices[3], Vertices[1], Vertices[7], color);
    Faces[9] = new Face(Vertices[6], Vertices[7], Vertices[1], color);
    Faces[10] = new Face(Vertices[5], Vertices[4], Vertices[2], color);
    Faces[11] = new Face(Vertices[0], Vertices[2], Vertices[4], color);
    super(Vertices, Faces);
  }
}
