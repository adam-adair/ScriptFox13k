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
import { Green, Purple, Red, White, Yellow } from "../core/colors";
import { GameObject } from "../core/gameObject";
import { Game } from "../core/engine";
export class Player extends GameObject {
  gameInput: GameInput;
  atBounds: boolean;
  powerUps: string[];

  constructor(game: Game, meshIndex: number) {
    super(game, meshIndex);
    this.atBounds = false;
    this.gameInput = new GameInput();
    this.powerUps = [];

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
    super.update();
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
    //get rotation and position of player
    const inversePlayerMatrix = new DOMMatrix(this.modelMatrix.toString());
    inversePlayerMatrix.invertSelf();
    for (let i = 0; i < this.game.bullets.length; i++) {
      //get bullet
      const bullet = this.game.bullets[i];
      const { x, y, z } = bullet.position;
      //apply some transform to bullet point
      const point = new DOMPoint(x, y, z);
      const rel = point.matrixTransform(inversePlayerMatrix);
      //check if bullet point is in player box
      if (this.mesh.pointIntersect(rel)) {
        this.hit(bullet.damage);
        bullet.destroy();
      }
    }
  }

  fire() {
    let numBullets = 1;
    let offsets = [{ x: 0, y: 0 }];
    let powerBullet = 1;
    let bulletColor = [Red, White, Red, White];
    if (this.powerUps.includes("doubleGuns")) {
      const x = Math.cos((this.rotation.z * Math.PI) / 180);
      const y = Math.sin((this.rotation.z * Math.PI) / 180);
      offsets = [
        { x, y },
        { x: -x, y: -y },
      ];
      numBullets = 2;
      bulletColor = [Yellow, White, Yellow, White];
    }
    if (this.powerUps.includes("powerBullet")) {
      powerBullet = 1.75;
      bulletColor = [Green, Purple, White, Purple];
    }
    for (let i = 0; i < numBullets; i++) {
      const bullet = new Bullet(
        this.game,
        bulletColor,
        powerBullet,
        powerBullet * 5
      );

      bullet.translate(
        this.position.x + offsets[i].x,
        this.position.y + offsets[i].y,
        this.position.z + this.mesh.boundingBox.flt.z - 0.1
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
  hit(damage: number) {
    this.game.sounds[1].play();
    super.hit(damage);
    if (this.health <= 0) this.die();
  }
  die() {
    this.game.togglePause(
      `<span id="instructions">You died! Press P to restart.</span>`
    );
  }
}
