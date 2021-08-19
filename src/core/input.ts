import { Player } from "../gameObjects/player";

export class GameInput {
  up = false;
  left = false;
  down = false;
  in = false;
  out = false;
  right = false;
  fire = false;
  canFire = true;
  spinR = false;
  spinL = false;
}

export const handleInput = (
  ev: KeyboardEvent,
  pressed: boolean,
  player: Player
) => {
  switch (ev.key) {
    case "w":
      player.gameInput.up = pressed;
      ev.preventDefault();
      break;
    case "a":
      player.gameInput.left = pressed;
      ev.preventDefault();
      break;
    case "s":
      player.gameInput.down = pressed;
      ev.preventDefault();
      break;
    case "d":
      player.gameInput.right = pressed;
      ev.preventDefault();
      break;
    case "e":
      player.gameInput.spinR = pressed;
      ev.preventDefault();
      break;
    case "q":
      player.gameInput.spinL = pressed;
      ev.preventDefault();
      break;
    case " ":
      if (!pressed) {
        player.gameInput.canFire = true;
      }
      player.gameInput.fire = pressed;
      ev.preventDefault();
      break;
  }
};
