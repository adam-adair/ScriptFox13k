import { Game } from "../core/engine";
import { LandscapeSquare, scapeOptions } from "./landscapeSquare";
import { scapeWidth, scapeRows, scapeCols, scapeY } from "../core/constants";
import { Color } from "../core/colors";
export class Landscape {
  squares: LandscapeSquare[];
  scapeHeight: number;
  scapeSpeed: number;
  color: Color;
  constructor(
    game: Game,
    scapeHeight: number,
    scapeSpeed: number,
    color: Color
  ) {
    this.squares = [];
    this.color = color;
    this.scapeHeight = scapeHeight;
    this.scapeSpeed = scapeSpeed;
    for (let i = 0; i < scapeRows; i++) {
      for (let j = 0; j < scapeCols; j++) {
        const scapeOptions: scapeOptions = {
          width: scapeWidth,
          height: scapeHeight,
          color: color,
        };
        if (j > 0) {
          const squareToLeft = this.squares[i * scapeCols + (j - 1)];
          scapeOptions.fl = squareToLeft.fr;
          scapeOptions.bl = squareToLeft.br;
        }
        if (i > 0) {
          const squareInFront = this.squares[i * scapeCols + j - scapeCols];
          scapeOptions.fl = squareInFront.bl;
          scapeOptions.fr = squareInFront.br;
        }
        const square = new LandscapeSquare(game, scapeOptions);
        square.translate(j * scapeWidth, scapeY, -i * scapeWidth);
        square.translate(-scapeWidth * scapeCols * 0.5, 0, -10);
        this.squares.push(square);
      }
    }
  }
}
