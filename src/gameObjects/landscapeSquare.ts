import { Color, Green } from "../core/colors";
import {
  disappearNear,
  playerSpeed,
  scapeCols,
  scapeHeight,
  scapeSpeed,
  scapeWidth,
  scapeY,
} from "../core/constants";
import { Game } from "../core/engine";
import { GameObject } from "../core/gameObject";
import { Vertex, Face } from "../core/mesh";
export interface scapeOptions {
  width: number;
  height: number;
  fl?: number;
  bl?: number;
  fr?: number;
  color?: Color;
}
export class LandscapeSquare extends GameObject {
  fl: number;
  fr: number;
  bl: number;
  br: number;
  constructor(game: Game, scapeOptions: scapeOptions) {
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
    super(game, { vertices, faces });
    this.fl = fl;
    this.fr = fr;
    this.bl = bl;
    this.br = br;
    this.game.landscape.push(this);
  }
  update(ix: number) {
    this.translate(0, 0, scapeSpeed);
    //if square has disappeared
    if (this.mesh.position.z > disappearNear) {
      //add squares to the back
      const lastRow = this.game.landscape.slice(-scapeCols);
      for (let j = 0; j < lastRow.length; j++) {
        const scapeOptions: scapeOptions = {
          width: scapeWidth,
          height: scapeHeight,
        };
        const squareInFront = lastRow[j];
        scapeOptions.fl = squareInFront.bl;
        scapeOptions.fr = squareInFront.br;
        if (j > 0)
          scapeOptions.bl =
            this.game.landscape[this.game.landscape.length - 1].br;
        const newSquare = new LandscapeSquare(this.game, scapeOptions);
        newSquare.translate(
          j * scapeWidth,
          scapeY,
          squareInFront.mesh.position.z - scapeWidth
        );
        newSquare.translate(-scapeWidth * scapeCols * 0.5, 0, 0);
      }
      //remove front row square
      this.game.landscape.splice(ix, scapeCols);
    }
    //check landscape for intersect with player
    if (this.mesh.position.z > 0 && this.mesh.position.z < scapeWidth) {
      //get line based on interpolating sides
      const fraction = this.mesh.position.z / scapeWidth;
      const segment = {
        x1: this.mesh.position.x,
        y1: this.mesh.position.y + this.fl - (this.fl - this.bl) * fraction,
        x2: this.mesh.position.x + scapeWidth,
        y2: this.mesh.position.y + this.fr - (this.fr - this.br) * fraction,
      };
      //check line against player extents
      if (this.game.player.mesh.intersect(segment)) {
        this.game.player.translate(0, playerSpeed, 0);
      } else {
      }
    }
  }
}