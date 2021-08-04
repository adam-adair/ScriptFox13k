import { Green } from "./colors";
import { Vertex, Face, Mesh } from "./mesh";
export class LandStrip extends Mesh {
  squareSize: number;
  maxHeight: number;
  numSquares: number;
  backVertices: Vertex[];
  constructor(
    squareSize: number,
    maxHeight: number,
    numSquares: number,
    frontVertices: Vertex[]
  ) {
    const faces: Face[] = [];
    const vertices: Vertex[] = [];
    let faceCount = 0;
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < numSquares; i++) {
        if (j === 0 && frontVertices.length) {
          vertices.push(frontVertices[i]);
        } else {
          const offset = frontVertices.length ? frontVertices[i].z : 0;
          const height = Math.random() * maxHeight;
          vertices.push(
            new Vertex(-i * squareSize, height, -j * squareSize + offset)
          );
        }
        if (j === 1) {
          if (i !== 0) {
            //make this triangle
            //3 1
            //  2
            faces[faceCount] = {
              vA: vertices[numSquares + i],
              vB: vertices[i],
              vC: vertices[numSquares + i - 1],
              color: Green,
            };
            faceCount++;
          }
          if (i !== numSquares - 1) {
            //make this triangle
            //2
            //1  3
            faces[faceCount] = {
              vA: vertices[i],
              vB: vertices[numSquares + i],
              vC: vertices[i + 1],
              color: Green,
            };
            faceCount++;
          }
        }
      }
    }
    super(vertices, faces);
    this.backVertices = vertices.slice(numSquares, 2 * numSquares);
  }
}
