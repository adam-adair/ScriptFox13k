import { bonusMeshes, disappearNear } from "../core/constants";
import { Game } from "../core/engine";
import { Enemy } from "./enemy";

export class Bonus extends Enemy {
  bonusType: string;
  constructor(game: Game, meshIndex: number) {
    super(game, meshIndex);
    this.translate(-4 + Math.random() * 8, 0, -50);
    this.rotate(45, 45, 0);
    this.bonusType =
      meshIndex === bonusMeshes[0] ? "doubleGuns" : "powerBullet";
  }
  update() {
    this.rotate(0, 2, 0);
    this.translate(0, 0, 0.5);
    if (this.position.z > disappearNear) this.destroy();
    super.update();
  }
  hit() {
    super.hit(2);
    if (!this.game.player.powerUps.includes(this.bonusType))
      this.game.player.powerUps.push(this.bonusType);
  }
}
