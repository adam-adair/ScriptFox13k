import { Mesh } from "./mesh";

export const control = (player: Mesh, inp: string, movement: number) => {
  switch (inp) {
    case "d":
      player.translate(movement, 0, 0);
      break;
    case "a":
      player.translate(-movement, 0, 0);
      break;
    case "w":
      player.translate(0, movement, 0);
      break;
    case "s":
      player.translate(0, -movement, 0);
      break;
    case "e":
      player.translate(0, 0, -movement);
      break;
    case "q":
      player.translate(0, 0, movement);
      break;
    case "r":
      player.rotate(0, 0, -movement * 50);
      break;
    case "f":
      player.rotate(0, 0, movement * 50);
      break;
    case "t":
      player.rotate(0, -movement * 50, 0);
      break;
    case "g":
      player.rotate(0, movement * 50, 0);
      break;
    case "y":
      player.rotate(-movement * 50, 0, 0);
      break;
    case "h":
      player.rotate(movement * 50, 0, 0);
      break;
  }
};
