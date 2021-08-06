import { Color, Green } from "./colors";
import { Vertex, Face, Mesh } from "./mesh";
export interface scapeOptions {
  width: number;
  height: number;
  fl?: number;
  bl?: number;
  fr?: number;
  color?: Color;
}
export class LandscapeSquare extends Mesh {
  fl: number;
  fr: number;
  bl: number;
  br: number;
  constructor(scapeOptions: scapeOptions) {
    const faces: Face[] = [];
    const vertices: Vertex[] = [];
    const { width, height } = scapeOptions;
    const fl = scapeOptions.fl || Math.random() * height;
    const fr = scapeOptions.fr || Math.random() * height;
    const bl = scapeOptions.bl || Math.random() * height;
    const br = Math.random() * height;
    vertices[0] = new Vertex(width, br, -width);
    vertices[1] = new Vertex(width, fr, 0);
    vertices[2] = new Vertex(0, bl, -width);
    vertices[3] = new Vertex(0, fl, 0);
    faces[0] = {
      vA: vertices[0],
      vB: vertices[2],
      vC: vertices[1],
      color: scapeOptions.color ? scapeOptions.color : Green,
    };
    faces[1] = {
      vA: vertices[3],
      vB: vertices[1],
      vC: vertices[2],
      color: scapeOptions.color ? scapeOptions.color : Green,
    };
    super(vertices, faces);
    this.fl = fl;
    this.fr = fr;
    this.bl = bl;
    this.br = br;
  }
}
