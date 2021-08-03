import { Color } from "./colors";

export class Vertex {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  public subtract(otherVertex: Vertex): Vertex {
    return new Vertex(
      this.x - otherVertex.x,
      this.y - otherVertex.y,
      this.z - otherVertex.z
    );
  }
  public cross(otherVertex: Vertex): Vertex {
    return new Vertex(
      this.y * otherVertex.z - this.z * otherVertex.y,
      this.z * otherVertex.x - this.x * otherVertex.z,
      this.x * otherVertex.y - this.y * otherVertex.x
    );
  }
  public dot(otherVertex: Vertex): number {
    return (
      this.x * otherVertex.x + this.y * otherVertex.y + this.z * otherVertex.z
    );
  }
}

export class Face {
  vA: Vertex;
  vB: Vertex;
  vC: Vertex;
  color: Color;
  constructor(
    vA: Vertex,
    vB: Vertex,
    vC: Vertex,
    color: Color = new Color(1, 0, 0)
  ) {
    this.vA = vA;
    this.vB = vB;
    this.vC = vC;
    this.color = color;
  }
}

export class Mesh {
  vertices: Vertex[];
  faces: Face[];
  vbuffer: Float32Array;
  matrix: DOMMatrix;
  constructor(vertices: Vertex[], faces: Face[]) {
    this.vertices = vertices;
    this.faces = faces;
    this.vbuffer = this.vbo();
    this.matrix = new DOMMatrix();
  }

  vbo = (): Float32Array => {
    const arr = [];
    for (let i = 0; i < this.faces.length; i++) {
      const { vA, vB, vC, color } = this.faces[i];
      const normal = vA.subtract(vB).cross(vA.subtract(vC));
      // prettier-ignore
      arr.push(
        vA.x, vA.y, vA.z, color.r, color.b, color.g, normal.x, normal.y, normal.z,
        vB.x, vB.y, vB.z, color.r, color.b, color.g, normal.x, normal.y, normal.z,
        vC.x, vC.y, vC.z, color.r, color.b, color.g, normal.x, normal.y, normal.z)
    }
    return new Float32Array(arr);
  };
}
