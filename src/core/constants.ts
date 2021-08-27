import { Blue, Green } from "./colors";
import { LevelData } from "./level";

export const clearColor = { r: 0, g: 0.2, b: 0.2, a: 1 };
export const zoom = 10;
export const lightDirection = { x: 0, y: 4, z: 10 };
export const ambientLightAmount = 0.1;
export const scapeWidth = 4;
export const scapeCols = 8;
export const scapeRows = 16;
export const scapeY = -2.5;
export const playerSpeed = 0.2;
export const disappearNear = 20;
export const disappearFar = -40;
export const fogDistance = [45, 60];
export const rotationSpeed = 1;
export const rotationRecovery = 4;
export const bounds = { left: -4, right: 4, top: 3 };
export const bulletInfo = {
  size: 0.05,
  speed: 0.5,
  rotation: 10,
};
export const enemyTypeData = [
  {
    //place holder for player mesh
  },
  //these are enemies
  {
    bulletDelay: 1000,
    bulletDamage: 5,
    health: 20,
  },
  {
    bulletDelay: 750,
    bulletDamage: 10,
    health: 30,
  },
  //these are bonuses
  {
    bulletDelay: 1000000,
    bulletDamage: 0,
    health: 1,
  },
  {
    bulletDelay: 1000000,
    bulletDamage: 0,
    health: 1,
  },
];
export const shadowTextureDim = { width: 512, height: 512 };
export const viewSize = { width: 640, height: 480 };
export const startingHealth = 100;
export const bulletDamage = 5;
export const groundDamage = 0.1;
export const bbScale = 0.9;
export const wireframeTime = 250;
export const bonusMeshes = [3, 4];
export const levels: LevelData[] = [
  {
    waveIndices: [
      [bonusMeshes[1]],
      [1],
      [1, 1],
      [1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1, 2],
    ],
    audioIndex: 0,
    speed: 0.1,
    height: 0.4,
    color: Green,
  },
  {
    waveIndices: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
    audioIndex: 0,
    speed: 0.1,
    height: 1.2,
    color: Green,
  },
];
