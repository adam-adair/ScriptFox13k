import { Color, White } from "./colors";

class Matrix extends DOMMatrix {
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
  faces: Face[];
  vbuffer: Float32Array;
  matrix: Matrix;
  nMatrix: Matrix;
  constructor(vertices: Vertex[], faces: Face[]) {
    this.vertices = vertices;
    this.faces = faces;
    this.vbuffer = this.vbo();
    this.matrix = new Matrix();
    this.nMatrix = new Matrix();
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

  rotate(x: number, y: number, z: number): void {
    this.matrix.rotateSelf(x, y, z);
    this.recomputeNormals();
  }

  translate(x: number, y: number, z: number): void {
    this.matrix.translateSelf(x, y, z);
    this.recomputeNormals();
  }

  recomputeNormals() {
    this.nMatrix = new Matrix(this.matrix.toString());
    this.nMatrix.invertSelf();
    this.nMatrix.transposeSelf();
  }
}
