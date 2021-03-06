import { Green, Ice } from "./colors";
import { LevelData } from "./level";

export const clearColor = { r: 0, g: 0.2, b: 0.2, a: 1 };
export const zoom = 10;
export const lightDirection = { x: 0, y: 4, z: 10 };
export const ambientLightAmount = 0.1;
export const scapeWidth = 4;
export const scapeCols = 8;
export const scapeRows = 16;
export const scapeY = -2.5;
export const playerSpeed = 0.15;
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
  {
    bulletDelay: 500,
    bulletDamage: 15,
    health: 40,
  },
  {
    bulletDelay: 500,
    bulletDamage: 20,
    health: 50,
  },
  {
    bulletDelay: 400,
    bulletDamage: 25,
    health: 60,
  },
  //these are bonuses
  {
    bulletDelay: 10000,
    bulletDamage: 0,
    health: 1,
  },
  {
    bulletDelay: 10000,
    bulletDamage: 0,
    health: 1,
  },
  {
    bulletDelay: 10000,
    bulletDamage: 0,
    health: 1,
  },
];
export const bonusMeshes = [6, 7, 8];
export const bonusTypes = ["doubleGuns", "powerBullet", "health50"];

export const shadowTextureDim = { width: 512, height: 512 };
export const viewSize = { width: 640, height: 480 };
export const startingHealth = 500;
export const bulletDamage = 5;
export const groundDamage = 0.1;
export const bbScale = 0.9;
export const wireframeTime = 250;
export const levels: LevelData[] = [
  {
    //level 1
    waveIndices: [
      [1],
      [1, 1],
      [1, 1, 1],
      [2],
      [1, 2, 1],
      [bonusMeshes[0]],
      [1, 1, 1, 1],
      [1, 1, 1, 1, 2],
      [2, 2, 2],
      [3],
      [bonusMeshes[1]],
      [2, 2],
      [2, 1, 2],
      [1, 3, 1],
      [3, 3],
      [3, 2, 2, 3],
      [bonusMeshes[2]],
      [3, 3, 3],
      [3, 3, 3, 3],
      [2, 2, 2, 2, 3],
      [4],
    ],
    speed: 0.1,
    height: 0.4,
    color: Green,
  },
  {
    //level 2
    waveIndices: [
      [bonusMeshes[1]],
      [3, 3],
      [3, 2, 3],
      [3, 2, 2, 3],
      [3, 3, 3],
      [3, 3, 3, 3, 4],
      [bonusMeshes[0]],
      [2, 4, 2],
      [2, 2, 2, 2, 3],
      [3, 3, 3],
      [3, 4, 3],
      [1, 3, 3, 1],
      [3, 4, 4, 3],
      [4, 4],
      [4, 4, 4],
      [bonusMeshes[2]],
      [3, 3, 3, 3, 5],
      [4, 5, 4],
      [5, 4, 5],
      [3, 2, 2, 3, 5],
      [5, 5, 5],
    ],
    speed: 0.15,
    height: 1.2,
    color: Ice,
  },
];
export const enemyLimits: [number, number][][] = [
  //wave size = 0,
  [[0, 0]],
  //wave size = 1
  [[0, 3.5]],
  //size = 2
  [
    [0, 3.5],
    [0, 3.5],
  ],
  [
    [0, 3.5],
    [0, 3.5],
    [0, 3.5],
  ],
  [
    [4.5, -1],
    [0, 3.0],
    [0, 3.0],
    [-1, 4.5],
  ],
  [
    [4.5, -1],
    [0, 3.0],
    [0, 3.0],
    [-1, 4.5],
    [0, 0],
  ],
];
