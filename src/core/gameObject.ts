import { Game } from "./engine";
import { Mesh, MeshInfo } from "./mesh";
export class GameObject {
  game: Game;
  mesh: Mesh;
  constructor(game: Game, mesh: Mesh | MeshInfo) {
    this.game = game;
    this.mesh = mesh instanceof Mesh ? mesh : new Mesh(mesh);
  }
  translate(x: number, y: number, z: number) {
    this.mesh.translate(x, y, z);
  }
  rotate(x: number, y: number, z: number) {
    this.mesh.rotate(x, y, z);
  }
  draw() {
    this.mesh.draw(this.game.gl, this.game.program);
  }
}
