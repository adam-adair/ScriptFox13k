import { MeshInfo } from "../core/mesh";
import {
  rotationSpeed,
  rotationRecovery,
  bounds,
  playerSpeed,
} from "../core/constants";
import { GameInput } from "../core/input";
import { Bullet } from "./bullet";
import { Red, White, Yellow } from "../core/colors";
import { GameObject } from "../core/gameObject";
import { Game } from "../core/engine";
export class Player extends GameObject {
  gameInput: GameInput;
  atBounds: boolean;
  constructor(game: Game, meshInfo: MeshInfo) {
    super(game, meshInfo);
    this.game.player = this;
    this.atBounds = false;
    this.gameInput = new GameInput();
  }
  translate(x: number, y: number, z: number) {
    if (
      this.mesh.position.x + x > bounds.left &&
      this.mesh.position.x + x < bounds.right &&
      this.mesh.position.y + y < bounds.top
    ) {
      if (x > 0) this.rotate(0, 0, -rotationSpeed);
      else if (x < 0) this.rotate(0, 0, rotationSpeed);
      this.atBounds = false;
      this.mesh.translate(x, y, z);
    } else this.atBounds = true;
  }

  update() {
    //get player back to 0 rotation
    if (
      this.mesh.rotation.z < 180 &&
      ((!this.gameInput.left && !this.gameInput.spinL) ||
        (this.atBounds && !this.gameInput.spinL))
    ) {
      const amt = Math.min(rotationRecovery, this.mesh.rotation.z);
      this.rotate(0, 0, -amt);
    }
    if (
      this.mesh.rotation.z >= 180 &&
      ((!this.gameInput.right && !this.gameInput.spinR) ||
        (this.atBounds && !this.gameInput.spinR))
    ) {
      this.rotate(0, 0, rotationRecovery);
    }
  }

  fire() {
    const bullet = new Bullet(this.game, [Red, Yellow, White, Yellow], 1);
    bullet.translate(
      this.mesh.position.x,
      this.mesh.position.y,
      this.mesh.position.z - this.mesh.boundingBox.blt.z
    );
    this.game.bullets.push(bullet);
  }

  respondToInput() {
    if (this.gameInput.up) this.translate(0, playerSpeed, 0);
    if (this.gameInput.down) this.translate(0, -playerSpeed, 0);
    if (this.gameInput.left) this.translate(-playerSpeed, 0, 0);
    if (this.gameInput.right) this.translate(playerSpeed, 0, 0);
    if (this.gameInput.spinR) this.rotate(0, 0, -rotationSpeed * 5);
    if (this.gameInput.spinL) this.rotate(0, 0, rotationSpeed * 5);
    if (this.gameInput.fire && this.gameInput.canFire) {
      this.gameInput.canFire = false;
      return this.fire();
    }
  }
}
