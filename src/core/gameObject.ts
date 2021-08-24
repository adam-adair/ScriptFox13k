import { startingHealth, wireframeTime } from "./constants";
import { Game } from "./engine";
import { Mesh, MeshInfo } from "./mesh";
export class GameObject {
  game: Game;
  mesh: Mesh;
  health: number;
  wireframe: boolean;
  lastHitTime: number;
  constructor(game: Game, mesh: Mesh | MeshInfo, health?: number) {
    this.game = game;
    this.mesh = mesh instanceof Mesh ? mesh : new Mesh(mesh);
    this.health = health || startingHealth;
    this.wireframe = false;
  }
  translate(x: number, y: number, z: number) {
    this.mesh.translate(x, y, z);
  }
  rotate(x: number, y: number, z: number) {
    this.mesh.rotate(x, y, z);
  }
  draw(shadow = false, wireframe = false) {
    this.mesh.draw(
      this.game.gl,
      shadow ? this.game.s_program : this.game.program,
      this.game.samplerUniform,
      this.game.shadowDepthTexture,
      shadow,
      this.wireframe
    );
  }
  hit(damage: number) {
    this.wireframe = true;
    this.health -= damage;
  }
  update(scapeIx?: number) {
    if (this.lastHitTime) {
      if (this.game.time - wireframeTime > this.lastHitTime) {
        this.wireframe = false;
        this.lastHitTime = this.game.time;
      }
    } else this.lastHitTime = this.game.time;
  }
}
