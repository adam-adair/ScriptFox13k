export class Color {
  r: number;
  g: number;
  b: number;
  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

export const Red = new Color(1, 0, 0);
export const Green = new Color(0, 1, 0);
export const Blue = new Color(0, 0, 1);
export const White = new Color(1, 1, 1);
