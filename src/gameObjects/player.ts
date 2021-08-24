import { MeshInfo } from "../core/mesh";
import {
  rotationSpeed,
  rotationRecovery,
  bounds,
  playerSpeed,
  bulletDamage,
  bbScale,
} from "../core/constants";
import { GameInput } from "../core/input";
import { Bullet } from "./bullet";
import { Red, White, Yellow } from "../core/colors";
import { GameObject } from "../core/gameObject";
import { Game } from "../core/engine";
export class Player extends GameObject {
  gameInput: GameInput;
  atBounds: boolean;
  powerUps: string[];

  constructor(game: Game, meshInfo: MeshInfo) {
    super(game, meshInfo);
    this.game.player = this;
    this.atBounds = false;
    this.gameInput = new GameInput();
    this.powerUps = ["doubleGuns"];

    //scale player box for more reasonable hits
    const bb = this.mesh.boundingBox;
    const k = Object.keys(bb) as Array<keyof typeof bb>;
    k.map((j) => {
      bb[j].x *= bbScale;
      bb[j].y *= bbScale;
      bb[j].z *= bbScale;
    });
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
    super.update();
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
    //get rotation and position of player
    const inversePlayerMatrix = new DOMMatrix(this.mesh.modelMatrix.toString());
    inversePlayerMatrix.invertSelf();
    for (let i = 0; i < this.game.bullets.length; i++) {
      //get bullet
      const bullet = this.game.bullets[i];
      const { x, y, z } = bullet.mesh.position;
      //apply some transform to bullet point
      const point = new DOMPoint(x, y, z);
      const rel = point.matrixTransform(inversePlayerMatrix);
      //check if bullet point is in player box
      if (this.mesh.pointIntersect(rel)) {
        this.hit(bulletDamage);
        bullet.destroy();
      }
    }
  }

  fire() {
    let numBullets = 1;
    let offsets = [0];
    if (this.powerUps.includes("doubleGuns")) {
      numBullets = 2;
      offsets = [-1, 1];
    }
    for (let i = 0; i < numBullets; i++) {
      const bullet = new Bullet(this.game, [Red, Yellow, White, Yellow], 1);
      bullet.translate(
        this.mesh.position.x + offsets[i],
        this.mesh.position.y,
        this.mesh.position.z + this.mesh.boundingBox.flt.z - 0.1
      );
      this.game.bullets.push(bullet);
    }
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
