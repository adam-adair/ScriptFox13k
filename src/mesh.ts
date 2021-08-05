import { Color, White } from "./colors";

export class Matrix extends DOMMatrix {
  transposeSelf() {
    let temp;
    temp = this.m12;
    this.m12 = this.m21;
    this.m21 = temp;

    temp = this.m13;
    this.m13 = this.m31;
    this.m31 = temp;

    temp = this.m14;
    this.m14 = this.m41;
    this.m41 = temp;

    temp = this.m23;
    this.m23 = this.m32;
    this.m32 = temp;

    temp = this.m24;
    this.m24 = this.m42;
    this.m42 = temp;

    temp = this.m34;
    this.m34 = this.m43;
    this.m43 = temp;
  }
}

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
  constructor(vA: Vertex, vB: Vertex, vC: Vertex, color: Color = White) {
    this.vA = vA;
    this.vB = vB;
    this.vC = vC;
    this.color = color;
  }
}

export class Mesh {
  vertices: Vertex[];
  position: Vertex;
  rotation: Vertex;
  faces: Face[];
  vbuffer: Float32Array;
  pMatrix: Matrix;
  rMatrix: Matrix;
  constructor(vertices: Vertex[], faces: Face[]) {
    this.vertices = vertices;
    this.faces = faces;
    this.vbuffer = this.vbo();
    this.pMatrix = new Matrix();
    this.rMatrix = new Matrix();
    this.position = new Vertex(0, 0, 0);
    this.rotation = new Vertex(0, 0, 0);
  }

  vbo = (): Float32Array => {
    const arr = [];
    for (let i = 0; i < this.faces.length; i++) {
      const { vA, vB, vC, color } = this.faces[i];
      const normalA = vA.subtract(vB).cross(vA.subtract(vC));
      // prettier-ignore
      arr.push(
        vA.x, vA.y, vA.z, color.r, color.g, color.b, normalA.x, normalA.y, normalA.z,
        vB.x, vB.y, vB.z, color.r, color.g, color.b, normalA.x, normalA.y, normalA.z,
        vC.x, vC.y, vC.z, color.r, color.g, color.b, normalA.x, normalA.y, normalA.z
        )
    }
    return new Float32Array(arr);
  };

  rotate(x: number, y: number, z: number): void {
    this.rotation = this.rotation.subtract(new Vertex(-x, -y, -z));
    this.rMatrix.rotateSelf(x, y, z);
  }

  translate(x: number, y: number, z: number): void {
    this.position = this.position.subtract(new Vertex(-x, -y, -z));
    this.pMatrix.translateSelf(x, y, z);
  }
}
