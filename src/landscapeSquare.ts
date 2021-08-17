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
    const fl = scapeOptions.fl || height * Math.random();
    const fr = scapeOptions.fr || height * Math.random();
    const bl = scapeOptions.bl || height * Math.random();
    const br = height * Math.random();
    vertices[0] = new Vertex(width, br, -width);
    vertices[1] = new Vertex(width, fr, 0);
    vertices[2] = new Vertex(0, bl, -width);
    vertices[3] = new Vertex(0, fl, 0);
    faces[0] = {
      vAi: 0,
      vBi: 2,
      vCi: 1,
      color: scapeOptions.color ? scapeOptions.color : Green,
    };
    faces[1] = {
      vAi: 3,
      vBi: 1,
      vCi: 2,
      color: scapeOptions.color ? scapeOptions.color : Green,
    };
    super(vertices, faces);
    this.fl = fl;
    this.fr = fr;
    this.bl = bl;
    this.br = br;
  }
}
