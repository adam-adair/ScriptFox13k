import { Red, Green, Blue } from "./colors";
import { Mesh, Vertex, Face } from "./mesh";
export class Cube extends Mesh {
  constructor(d: number) {
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
    Faces[0] = new Face(Vertices[0], Vertices[1], Vertices[2]);
    Faces[1] = new Face(Vertices[3], Vertices[2], Vertices[1]);
    Faces[2] = new Face(Vertices[5], Vertices[7], Vertices[4]);
    Faces[3] = new Face(Vertices[6], Vertices[4], Vertices[7]);
    Faces[4] = new Face(Vertices[2], Vertices[3], Vertices[5]);
    Faces[5] = new Face(Vertices[7], Vertices[5], Vertices[3]);
    Faces[6] = new Face(Vertices[4], Vertices[6], Vertices[0]);
    Faces[7] = new Face(Vertices[1], Vertices[0], Vertices[6]);
    Faces[8] = new Face(Vertices[3], Vertices[1], Vertices[7]);
    Faces[9] = new Face(Vertices[6], Vertices[7], Vertices[1]);
    Faces[10] = new Face(Vertices[5], Vertices[4], Vertices[2]);
    Faces[11] = new Face(Vertices[0], Vertices[2], Vertices[4]);
    super(Vertices, Faces);
  }
}
