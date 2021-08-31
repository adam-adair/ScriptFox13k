import { startingHealth, wireframeTime } from "./constants";
import { Game } from "./engine";
import { Matrix, Mesh, MeshInfo, Vertex } from "./mesh";
export class GameObject {
  game: Game;
  mesh: Mesh;
  position: Vertex;
  rotation: Vertex;
  pMatrix: Matrix;
  rMatrix: Matrix;
  modelMatrix: DOMMatrix;
  health: number;
  wireframe: boolean;
  lastHitTime: number;
  constructor(game: Game, meshIndex: number | Mesh, health?: number) {
    this.game = game;
    this.mesh =
      meshIndex instanceof Mesh ? new Mesh(meshIndex) : game.meshes[meshIndex];
    this.health = health || startingHealth;
    this.wireframe = false;
    this.pMatrix = new Matrix();
    this.rMatrix = new Matrix();
    this.modelMatrix = new DOMMatrix();
    this.position = new Vertex(0, 0, 0);
    this.rotation = new Vertex(0, 0, 0);
  }
  translate(x: number, y: number, z: number) {
    this.position = this.position.subtract(new Vertex(-x, -y, -z));
    this.pMatrix.translateSelf(x, y, z);
  }
  rotate(x: number, y: number, z: number): void {
    // this.rotation = this.rotation.subtract(new Vertex(-x, -y, -z));
    this.rotation.x = (this.rotation.x + 360 + x) % 360;
    this.rotation.y = (this.rotation.y + 360 + y) % 360;
    this.rotation.z = (this.rotation.z + 360 + z) % 360;
    this.rMatrix = new Matrix();
    this.rMatrix.rotateSelf(
      -this.rotation.x,
      -this.rotation.y,
      this.rotation.z
    );
  }
  draw(shadow = false) {
    this.modelMatrix = this.pMatrix.multiply(this.rMatrix);
    this.mesh.draw(
      this.game.gl,
      shadow ? this.game.s_program : this.game.program,
      this.game.samplerUniform,
      this.game.shadowDepthTexture,
      shadow,
      this.wireframe,
      this.modelMatrix
    );
  }
  hit(damage: number) {
    this.game.songs[0].play();
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
