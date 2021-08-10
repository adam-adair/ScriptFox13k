import { Mesh } from "./mesh";

export const handleInput = (
  ev: KeyboardEvent,
  pressed: boolean,
  inp: {
    up: boolean;
    left: boolean;
    down: boolean;
    right: boolean;
    spinR: boolean;
    spinL: boolean;
  }
) => {
  switch (ev.key) {
    case "w":
      inp.up = pressed;
      ev.preventDefault();
      break;
    case "a":
      inp.left = pressed;
      ev.preventDefault();
      break;
    case "s":
      inp.down = pressed;
      ev.preventDefault();
      break;
    case "d":
      inp.right = pressed;
      ev.preventDefault();
      break;
    case "q":
      inp.spinR = pressed;
      ev.preventDefault();
      break;
    case "e":
      inp.spinL = pressed;
      ev.preventDefault();
      break;
  }
};

export const movePlayer = (
  player: Mesh,
  inp: {
    up: boolean;
    left: boolean;
    down: boolean;
    right: boolean;
    spinL: boolean;
    spinR: boolean;
  },
  movement: number
) => {
  if (inp.up) player.translate(0, movement, 0);
  if (inp.down) player.translate(0, -movement, 0);
  if (inp.left) player.translate(-movement, 0, 0);
  if (inp.right) player.translate(movement, 0, 0);
  if (inp.spinL) player.rotate(movement * 10, 0, 0);
  if (inp.spinR) player.rotate(movement * -10, 0, 0);
};