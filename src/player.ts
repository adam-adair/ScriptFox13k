import { Mesh, MeshInfo } from "./mesh";
import { rotationSpeed, rotationRecovery, bounds, movement } from "./constants";
import { GameInput } from "./input";
import { Bullet } from "./bullet";
import { Red, White, Yellow } from "./colors";
export class Player extends Mesh {
  gameInput: GameInput;
  atBounds: boolean;
  bullets: Bullet[];
  constructor(meshInfo: MeshInfo, bullets: Bullet[]) {
    super(meshInfo);
    this.atBounds = false;
    this.gameInput = new GameInput();
    this.bullets = bullets;
  }
  translate(x: number, y: number, z: number) {
    if (
      this.position.x + x > bounds.left &&
      this.position.x + x < bounds.right &&
      this.position.y + y < bounds.top
    ) {
      if (x > 0) this.rotate(0, 0, -rotationSpeed);
      else if (x < 0) this.rotate(0, 0, rotationSpeed);
      this.atBounds = false;
      super.translate(x, y, z);
    } else this.atBounds = true;
  }

  update() {
    //get player back to 0 rotation
    if (
      this.rotation.z < 180 &&
      ((!this.gameInput.left && !this.gameInput.spinL) ||
        (this.atBounds && !this.gameInput.spinL))
    ) {
      const amt = Math.min(rotationRecovery, this.rotation.z);
      this.rotate(0, 0, -amt);
    }
    if (
      this.rotation.z >= 180 &&
      ((!this.gameInput.right && !this.gameInput.spinR) ||
        (this.atBounds && !this.gameInput.spinR))
    ) {
      this.rotate(0, 0, rotationRecovery);
    }
  }

  fire() {
    const bullet = new Bullet([Red, Yellow, White, Yellow], 1);
    bullet.translate(
      this.position.x,
      this.position.y,
      this.position.z - this.boundingBox.blt.z
    );
    this.bullets.push(bullet);
  }

  respondToInput() {
    if (this.gameInput.up) this.translate(0, movement, 0);
    if (this.gameInput.down) this.translate(0, -movement, 0);
    if (this.gameInput.left) this.translate(-movement, 0, 0);
    if (this.gameInput.right) this.translate(movement, 0, 0);
    if (this.gameInput.spinR) this.rotate(0, 0, -rotationSpeed * 5);
    if (this.gameInput.spinL) this.rotate(0, 0, rotationSpeed * 5);
    if (this.gameInput.fire && this.gameInput.canFire) {
      this.gameInput.canFire = false;
      return this.fire();
    }
  }
}
