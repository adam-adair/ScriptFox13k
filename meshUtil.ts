import { Color } from "./src/core/colors";
import { Face, MeshInfo, Vertex } from "./src/core/mesh";

export const JSONfromObjMtl = async (
  url: string,
  mtlUrl: string,
  scale: number,
  { x, y, z } = { x: 0, y: 0, z: 0 }
): Promise<void> => {
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
      vertices.push(new Vertex(+ln[1] * scale, +ln[2] * scale, +ln[3] * scale));
    if (ln[0] === "f") {
      const A = +ln[1].split("/")[0] - 1;
      const B = +ln[2].split("/")[0] - 1;
      const C = +ln[3].split("/")[0] - 1;
      faces.push(new Face(A, B, C, Colors[currentCol]));
    }
  }
  console.log(serialize({ vertices, faces }, 2, { x, y, z }));
};

const serialize = (
  mesh: MeshInfo,
  precision: number,
  { x, y, z } = { x: 0, y: 0, z: 0 }
): string => {
  const v = [];
  const f = [];
  const c = [];
  const colorsArray: string[] = [];
  for (let i = 0; i < mesh.vertices.length; i++) {
    const m = new DOMMatrix();
    m.rotateSelf(x, y, z);
    const ver = mesh.vertices[i];
    let vert = new DOMPoint(ver.x, ver.y, ver.z);
    vert = vert.matrixTransform(m);
    v.push(
      +vert.x.toFixed(precision),
      +vert.y.toFixed(precision),
      +vert.z.toFixed(precision)
    );
  }
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
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
};
