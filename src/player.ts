import { Mesh, MeshInfo } from "./mesh";
import { rotationSpeed, rotationRecovery, bounds, movement } from "./constants";
import { GameInput } from "./input";
import { Bullet } from "./bullet";
export class Player extends Mesh {
  gameInput: GameInput;
  atBounds: boolean;
  constructor(meshInfo: MeshInfo) {
    super(meshInfo);
    this.atBounds = false;
    this.gameInput = new GameInput();
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

  draw(gl: WebGLRenderingContext, program: WebGLProgram): void {
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

    super.draw(gl, program);
  }

  fire() {
    // console.log(this.rotation);
    const bullet = new Bullet();
    bullet.translate(
      this.position.x,
      this.position.y,
      this.position.z - this.boundingBox[4].z
    );
    return bullet;
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
