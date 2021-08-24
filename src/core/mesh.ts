import { Color, White } from "./colors";
import { shadowTexture, viewSize } from "./constants";

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
  lookAt(
    cameraX: number,
    cameraY: number,
    cameraZ: number,
    targetX: number,
    targetY: number,
    targetZ: number,
    upX = 0,
    upY = 1,
    upZ = 0
  ): void {
    var e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;
    fx = targetX - cameraX;
    fy = targetY - cameraY;
    fz = targetZ - cameraZ;
    rlf = 1 / Math.hypot(fx, fy, fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;
    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;
    rls = 1 / Math.hypot(sx, sy, sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;
    // prettier-ignore
    var ret = new Matrix([
      sx, ux, -fx, 0,
      sy, uy, -fy, 0,
      sz, uz, -fz, 0,
      0,  0,  0,   1
    ]);
    ret.translateSelf(-cameraX, -cameraY, -cameraZ);
    this.multiplySelf(ret);
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
  // public add(otherVertex: Vertex): Vertex {
  //   return new Vertex(
  //     this.x + otherVertex.x,
  //     this.y + otherVertex.y,
  //     this.z + otherVertex.z
  //   );
  // }
  // public scale(factor: number): Vertex {
  //   return new Vertex(this.x * factor, this.y * factor, this.z * factor);
  // }
  public cross(otherVertex: Vertex): Vertex {
    return new Vertex(
      this.y * otherVertex.z - this.z * otherVertex.y,
      this.z * otherVertex.x - this.x * otherVertex.z,
      this.x * otherVertex.y - this.y * otherVertex.x
    );
  }
  // public dot(otherVertex: Vertex): number {
  //   return (
  //     this.x * otherVertex.x + this.y * otherVertex.y + this.z * otherVertex.z
  //   );
  // }
}

export class Face {
  vAi: number;
  vBi: number;
  vCi: number;
  color: Color;
  constructor(vA: number, vB: number, vC: number, color: Color = White) {
    this.vAi = vA;
    this.vBi = vB;
    this.vCi = vC;
    this.color = color;
  }
}
// facing box: front/back,left/right, top/bottom
export interface BoundingBox {
  flb: DOMPoint;
  frb: DOMPoint;
  flt: DOMPoint;
  frt: DOMPoint;
  blb: DOMPoint;
  brb: DOMPoint;
  blt: DOMPoint;
  brt: DOMPoint;
}

export type MeshInfo = {
  vertices: Vertex[];
  faces: Face[];
};

export class Mesh {
  vertices: Vertex[];
  position: Vertex;
  rotation: Vertex;
  faces: Face[];
  pMatrix: Matrix;
  rMatrix: Matrix;
  modelMatrix: DOMMatrix;
  buffer: WebGLBuffer;
  vbo: Float32Array;
  boundingBox: BoundingBox;
  constructor({ vertices, faces }: MeshInfo) {
    this.vertices = vertices;
    this.faces = faces;
    this.pMatrix = new Matrix();
    this.rMatrix = new Matrix();
    this.modelMatrix = new DOMMatrix();
    this.position = new Vertex(0, 0, 0);
    this.rotation = new Vertex(0, 0, 0);
    const extents = {
      x1: Infinity,
      y1: Infinity,
      z1: Infinity,
      x2: -Infinity,
      y2: -Infinity,
      z2: -Infinity,
    };
    for (let i = 0; i < this.vertices.length; i++) {
      const vert = this.vertices[i];
      if (vert.x < extents.x1) extents.x1 = vert.x;
      if (vert.y < extents.y1) extents.y1 = vert.y;
      if (vert.z < extents.z1) extents.z1 = vert.z;
      if (vert.x > extents.x2) extents.x2 = vert.x;
      if (vert.y > extents.y2) extents.y2 = vert.y;
      if (vert.z > extents.z2) extents.z2 = vert.z;
    }
    this.boundingBox = {
      flb: new DOMPoint(extents.x1, extents.y1, extents.z1),
      frb: new DOMPoint(extents.x2, extents.y1, extents.z1),
      flt: new DOMPoint(extents.x1, extents.y2, extents.z1),
      frt: new DOMPoint(extents.x2, extents.y2, extents.z1),
      blb: new DOMPoint(extents.x1, extents.y1, extents.z2),
      brb: new DOMPoint(extents.x2, extents.y1, extents.z2),
      blt: new DOMPoint(extents.x1, extents.y2, extents.z2),
      brt: new DOMPoint(extents.x2, extents.y2, extents.z2),
    };
  }

  static async fromSerialized(url: string): Promise<MeshInfo> {
    const res = await fetch(url);
    const obj = await res.json();
    const vertices: Vertex[] = [];
    const faces: Face[] = [];
    // for serialized mesh
    const { v, f, c } = obj;
    const colors: Color[] = [];
    for (let i = 0; i < v.length; i += 3) {
      vertices.push(new Vertex(v[i], v[i + 1], v[i + 2]));
    }
    for (let i = 0; i < c.length; i += 3) {
      colors.push(new Color(c[i], c[i + 1], c[i + 2]));
    }
    for (let i = 0; i < f.length; i += 4) {
      faces.push(new Face(f[i], f[i + 1], f[i + 2], colors[f[i + 3]]));
    }
    return { vertices, faces };
  }

  static async fromObjMtl(
    url: string,
    mtlUrl: string,
    scale: number
  ): Promise<MeshInfo> {
    const res = await fetch(url);
    const objArr = (await res.text()).split("\n");
    const mtlRes = await fetch(mtlUrl);
    const mtlArr = (await mtlRes.text()).split("\n");
    const vertices: Vertex[] = [];
    const faces: Face[] = [];
    type MaterialsList = {
      [key: string]: Color;
    };
    const Colors: MaterialsList = {};
    for (let i = 0; i < mtlArr.length; i++) {
      const ln = mtlArr[i].split(" ");
      if (ln[0] === "newmtl") {
        const cols = mtlArr[i + 3].split(" ");
        Colors[ln[1]] = new Color(+cols[1], +cols[2], +cols[3]);
      }
    }
    let currentCol = "";
    for (let i = 0; i < objArr.length; i++) {
      const ln = objArr[i].split(" ");
      if (ln[0] === "usemtl") currentCol = ln[1];
      if (ln[0] === "v")
        vertices.push(
          new Vertex(+ln[1] * scale, +ln[2] * scale, +ln[3] * scale)
        );
      if (ln[0] === "f") {
        const A = +ln[1].split("/")[0] - 1;
        const B = +ln[2].split("/")[0] - 1;
        const C = +ln[3].split("/")[0] - 1;
        faces.push(new Face(A, B, C, Colors[currentCol]));
      }
    }
    return { vertices, faces };
  }

  draw(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    samplerUniform: WebGLUniformLocation,
    shadowDepthTexture: WebGLTexture,
    shadow = false,
    wireframe = false
  ): void {
    //if vbo doesn't exist, create it and fill with polygon info
    if (!this.vbo) {
      const arr = [];
      for (let i = 0; i < this.faces.length; i++) {
        const { vAi, vBi, vCi, color } = this.faces[i];
        const vA = this.vertices[vAi];
        const vB = this.vertices[vBi];
        const vC = this.vertices[vCi];
        let normalA, normalB, normalC;
        normalA = normalB = normalC = vA.subtract(vB).cross(vA.subtract(vC));
        // prettier-ignore
        arr.push(
          vA.x, vA.y, vA.z, color.r, color.g, color.b, normalA.x, normalA.y, normalA.z,
          vB.x, vB.y, vB.z, color.r, color.g, color.b, normalB.x, normalB.y, normalB.z,
          vC.x, vC.y, vC.z, color.r, color.g, color.b, normalC.x, normalC.y, normalC.z
          )
      }
      this.vbo = new Float32Array(arr);
      this.buffer = gl.createBuffer();
    }
    //get model and normal matrix
    this.modelMatrix = this.pMatrix.multiply(this.rMatrix);
    const normalMatrix = new Matrix(this.modelMatrix.toString());
    normalMatrix.invertSelf();
    normalMatrix.transposeSelf();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vbo, gl.STATIC_DRAW);
    const FSIZE = this.vbo.BYTES_PER_ELEMENT;

    const position = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 9, 0);
    gl.enableVertexAttribArray(position);
    if (!shadow) {
      const color = gl.getAttribLocation(program, "color");
      gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 3);
      gl.enableVertexAttribArray(color);

      const normal = gl.getAttribLocation(program, "normal");
      //color doesn't exist on sprogram
      gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 6);
      gl.enableVertexAttribArray(normal);

      // Set the normal matrix
      const nMatrix = gl.getUniformLocation(program, "nMatrix");
      gl.uniformMatrix4fv(nMatrix, false, normalMatrix.toFloat32Array());

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, shadowDepthTexture);
      gl.uniform1i(samplerUniform, 0);
    }
    // Set the model matrix
    const model = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(model, false, this.modelMatrix.toFloat32Array());

    wireframe
      ? gl.drawArrays(gl.LINE_LOOP, 0, this.faces.length * 3)
      : gl.drawArrays(gl.TRIANGLES, 0, this.faces.length * 3);
  }

  rotate(x: number, y: number, z: number): void {
    // this.rotation = this.rotation.subtract(new Vertex(-x, -y, -z));
    this.rotation.x = (this.rotation.x + 360 + x) % 360;
    this.rotation.y = (this.rotation.y + 360 + y) % 360;
    this.rotation.z = (this.rotation.z + 360 + z) % 360;
    this.rMatrix = new Matrix();
    this.rMatrix.rotateSelf(
      -this.rotation.x,
      -this.rotation.y,
      this.rotation.z
    );
  }

  translate(x: number, y: number, z: number): void {
    this.position = this.position.subtract(new Vertex(-x, -y, -z));
    this.pMatrix.translateSelf(x, y, z);
  }

  serialize(precision: number): string {
    const v = [];
    const f = [];
    const c = [];
    const colorsArray: string[] = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const vert = this.vertices[i];
      v.push(
        +vert.x.toFixed(precision),
        +vert.y.toFixed(precision),
        +vert.z.toFixed(precision)
      );
    }
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      const faceColor =
        "r" + face.color.r + "g" + face.color.g + "b" + face.color.b;
      if (!colorsArray.includes(faceColor)) {
        colorsArray.push(faceColor);
        c.push(face.color.r, face.color.g, face.color.b);
      }
      const colorIndex = colorsArray.indexOf(faceColor);
      f.push(face.vAi, face.vBi, face.vCi, colorIndex);
    }
    return JSON.stringify({ v, f, c });
  }

  floorIntersect = (a: { x1: number; y1: number; x2: number; y2: number }) => {
    const trans1 = this.boundingBox.flb.matrixTransform(this.modelMatrix);
    const trans2 = this.boundingBox.frb.matrixTransform(this.modelMatrix);
    //use matrices and get rotation
    const b = {
      x1: trans1.x,
      x2: trans2.x,
      y1: trans1.y,
      y2: trans2.y,
    };
    //left side of ship between two segments
    if (a.x1 < b.x1 && a.x2 > b.x1) {
      const ht = a.y2 - a.y1;
      const fwt = (b.x1 - a.x1) / (a.x2 - a.x1);
      const fht = fwt * ht + a.y1;
      if (b.y1 < fht) return true;
    }
    //right side of ship between two segments
    if (a.x1 < b.x2 && a.x2 > b.x2) {
      const ht = a.y2 - a.y1;
      const fwt = (b.x2 - a.x1) / (a.x2 - a.x1);
      const fht = fwt * ht + a.y1;
      if (b.y2 < fht) return true;
    }
    return false;
  };

  meshIntersect = (otherMesh: Mesh): boolean => {
    return false;
  };

  pointIntersect = (point: DOMPoint): boolean => {
    const min = this.boundingBox.flb;
    const max = this.boundingBox.brt;
    return (
      point.x >= min.x &&
      point.x <= max.x &&
      point.y >= min.y &&
      point.y <= max.y &&
      point.z >= min.z &&
      point.z <= max.z
    );
  };
}
