import { Color, Red, White } from "./colors";

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

export class Mesh {
  vertices: Vertex[];
  position: Vertex;
  rotation: Vertex;
  faces: Face[];
  pMatrix: Matrix;
  rMatrix: Matrix;
  buffer: WebGLBuffer;
  vbo: Float32Array;
  /////////////////////////////////////////////
  //remove
  e_vbo: Float32Array;
  bottomSegmentuffer: WebGLBuffer;
  //remove
  bottomSegment: [DOMPoint, DOMPoint];
  /////////////////////////////////////////////
  constructor(vertices: Vertex[], faces: Face[]) {
    this.vertices = vertices;
    this.faces = faces;
    this.pMatrix = new Matrix();
    this.rMatrix = new Matrix();
    this.position = new Vertex(0, 0, 0);
    this.rotation = new Vertex(0, 0, 0);
    const extents = {
      x1: Infinity,
      y1: Infinity,
      x2: -Infinity,
      y2: Infinity,
    };
    for (let i = 0; i < this.vertices.length; i++) {
      const vert = this.vertices[i];
      if (vert.x < extents.x1) extents.x1 = vert.x;
      if (vert.y < extents.y1) extents.y1 = extents.y2 = vert.y;
      if (vert.x > extents.x2) extents.x2 = vert.x;
    }
    this.bottomSegment = [
      new DOMPoint(extents.x1, extents.y1, 0),
      new DOMPoint(extents.x2, extents.y2, 0),
    ];
  }

  static async fromSerialized(url: string): Promise<Mesh> {
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
    return new Mesh(vertices, faces);
  }

  static async fromObjMtl(
    url: string,
    mtlUrl: string,
    scale: number
  ): Promise<Mesh> {
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
    return new Mesh(vertices, faces);
  }

  draw = (gl: WebGLRenderingContext, program: WebGLProgram): DOMMatrix => {
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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vbo, gl.STATIC_DRAW);
    const FSIZE = this.vbo.BYTES_PER_ELEMENT;

    const position = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 9, 0);
    gl.enableVertexAttribArray(position);

    const color = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    const normal = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 6);
    gl.enableVertexAttribArray(normal);

    // Set the model matrix
    const model = gl.getUniformLocation(program, "model");
    const nMatrix = gl.getUniformLocation(program, "nMatrix");

    const modelMatrix = this.pMatrix.multiply(this.rMatrix);
    const normalMatrix = new Matrix(modelMatrix.toString());
    normalMatrix.invertSelf();
    normalMatrix.transposeSelf();

    gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());
    gl.uniformMatrix4fv(nMatrix, false, normalMatrix.toFloat32Array());

    gl.drawArrays(gl.TRIANGLES, 0, this.faces.length * 3);
    return modelMatrix;
  };

  rotate(x: number, y: number, z: number): void {
    this.rotation = this.rotation.subtract(new Vertex(-x, -y, -z));
    this.rMatrix.rotateSelf(x, y, z);
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

  /////////////////////////////////////////////
  //remove later
  drawExtents = (gl: WebGLRenderingContext, program: WebGLProgram): void => {
    //if vbo doesn't exist, create it and fill with polygon info
    // if (!this.e_vbo) {
    const mm = this.pMatrix.multiply(this.rMatrix);
    const trans1 = this.bottomSegment[0].matrixTransform(mm);
    const trans2 = this.bottomSegment[1].matrixTransform(mm);
    this.e_vbo = new Float32Array([
      trans1.x,
      trans1.y,
      0,
      Red.r,
      Red.g,
      Red.b,
      -10,
      -10,
      -10,
      trans2.x,
      trans2.y,
      0,
      Red.r,
      Red.g,
      Red.b,
      -10,
      -10,
      -10,
    ]);
    this.bottomSegmentuffer = gl.createBuffer();
    // }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bottomSegmentuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.e_vbo, gl.STATIC_DRAW);
    const FSIZE = this.vbo.BYTES_PER_ELEMENT;

    const position = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 9, 0);
    gl.enableVertexAttribArray(position);

    const color = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    const normal = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 6);
    gl.enableVertexAttribArray(normal);

    // Set the model matrix
    const model = gl.getUniformLocation(program, "model");
    const nMatrix = gl.getUniformLocation(program, "nMatrix");

    const modelMatrix = new Matrix(); //this.pMatrix.multiply(this.rMatrix);
    const normalMatrix = new Matrix(modelMatrix.toString());
    normalMatrix.invertSelf();
    normalMatrix.transposeSelf();

    gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());
    gl.uniformMatrix4fv(nMatrix, false, normalMatrix.toFloat32Array());

    gl.drawArrays(gl.LINE_LOOP, 0, 2);
  };
  /////////////////////////////////////////////
  turn = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number }
  ) => {
    const a = p1.y;
    const b = p1.x;
    const c = p2.y;
    const d = p2.x;
    const e = p3.y;
    const f = p3.x;
    const A = (f - b) * (c - a);
    const B = (d - b) * (e - a);
    return A > B + Number.EPSILON ? 1 : A + Number.EPSILON < B ? -1 : 0;
  };

  //revise this to use matrices, factor in rotation, deal with being completely under the ground
  intersect = (
    modelMatrix: DOMMatrix,
    a: { x1: number; y1: number; x2: number; y2: number }
  ) => {
    const trans1 = this.bottomSegment[0].matrixTransform(modelMatrix);
    const trans2 = this.bottomSegment[1].matrixTransform(modelMatrix);
    //use matrices and get rotation
    const b = {
      x1: trans1.x,
      x2: trans2.x,
      y1: trans1.y,
      y2: trans2.y,
    };
    const p1 = { x: a.x1, y: a.y1 };
    const p2 = { x: a.x2, y: a.y2 };
    const p3 = { x: b.x1, y: b.y1 };
    const p4 = { x: b.x2, y: b.y2 };
    return (
      this.turn(p1, p3, p4) != this.turn(p2, p3, p4) &&
      this.turn(p1, p2, p3) != this.turn(p1, p2, p4)
    );
  };
}
