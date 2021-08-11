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
  public add(otherVertex: Vertex): Vertex {
    return new Vertex(
      this.x + otherVertex.x,
      this.y + otherVertex.y,
      this.z + otherVertex.z
    );
  }
  public scale(factor: number): Vertex {
    return new Vertex(this.x * factor, this.y * factor, this.z * factor);
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
  normals?: Vertex[];
  constructor(vertices: Vertex[], faces: Face[], normals?: Vertex[]) {
    this.vertices = vertices;
    this.faces = faces;
    this.pMatrix = new Matrix();
    this.rMatrix = new Matrix();
    this.position = new Vertex(0, 0, 0);
    this.rotation = new Vertex(0, 0, 0);
    if (normals) this.normals = normals;
  }

  // load babylon mesh, make smaller json for js13k with serialize(), then load smaller json
  static async fromURL(
    url: string,
    meshIndex?: number,
    babylon: boolean = false
  ): Promise<Mesh> {
    const res = await fetch(url);
    const obj = await res.json();
    console.log(obj);
    const vertices: Vertex[] = [];
    const faces: Face[] = [];
    let normals: Vertex[] = null;
    if (babylon) {
      // todo colors, multiple meshes, scale, normals?
      const indices = obj.meshes[meshIndex].indices;
      const positions = obj.meshes[meshIndex].positions;
      const _normals = obj.meshes[meshIndex].positions;
      normals = [];
      const scale = 0.05;
      for (let i = 0; i < positions.length; i += 3) {
        vertices.push(
          new Vertex(
            positions[i] * scale,
            positions[i + 1] * scale,
            positions[i + 2] * scale
          )
        );
        normals.push(
          new Vertex(
            _normals[i] * scale,
            _normals[i + 1] * scale,
            _normals[i + 2] * scale
          )
        );
      }
      for (let i = 0; i < indices.length; i += 3) {
        faces.push(new Face(indices[i], indices[i + 2], indices[i + 1]));
      }
    } else {
      // for mesh JSON

      // for (let i = 0; i < obj.vertices.length; i++) {
      //   const vert = obj.vertices[i];
      //   vertices.push(new Vertex(vert.x, vert.y, vert.z));
      // }
      // for (let i = 0; i < obj.faces.length; i++) {
      //   const face = obj.faces[i];
      //   faces.push(new Face(face.vAi, face.vBi, face.vCi, face.color));
      // }

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
    }
    return new Mesh(vertices, faces, normals);
  }

  draw = (gl: WebGLRenderingContext, program: WebGLProgram): void => {
    //if vbo doesn't exist, create it and fill with polygon info
    if (!this.vbo) {
      const arr = [];
      for (let i = 0; i < this.faces.length; i++) {
        const { vAi, vBi, vCi, color } = this.faces[i];
        const vA = this.vertices[vAi];
        const vB = this.vertices[vBi];
        const vC = this.vertices[vCi];

        let normalA: Vertex, normalB: Vertex, normalC: Vertex;
        if (this.normals) {
          normalA =
            normalB =
            normalC =
              this.normals[vAi]
                .add(this.normals[vBi])
                .add(this.normals[vCi])
                .scale(1 / 3);
        } else {
          normalA = normalB = normalC = vA.subtract(vB).cross(vA.subtract(vC));
        }
        // normalA = normalB = normalC = vA.subtract(vB).cross(vA.subtract(vC));
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
  };

  rotate(x: number, y: number, z: number): void {
    this.rotation = this.rotation.subtract(new Vertex(-x, -y, -z));
    this.rMatrix.rotateSelf(x, y, z);
  }

  translate(x: number, y: number, z: number): void {
    this.position = this.position.subtract(new Vertex(-x, -y, -z));
    this.pMatrix.translateSelf(x, y, z);
  }

  // toJSON(): string {
  //   return JSON.stringify({
  //     faces: this.faces,
  //     vertices: this.vertices,
  //   });
  // }

  serialize(): string {
    const v = [];
    const f = [];
    const c = [];
    const colorsArray: string[] = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const vert = this.vertices[i];
      v.push(+vert.x.toFixed(8), +vert.y.toFixed(8), +vert.z.toFixed(8));
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
}
