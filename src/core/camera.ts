import { Matrix } from "./mesh";

export const perspective = (
  fov: number,
  ratio: number,
  near: number,
  far: number
) => {
  const tan = 1 / Math.tan((fov * Math.PI) / 180);
  // prettier-ignore
  return new Matrix([
    tan / ratio, 0, 0, 0,
    0, tan, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * near * far) / (near - far), 0
  ]);
};

export const orthogonal = (
  top: number,
  bottom: number,
  left: number,
  right: number,
  near: number,
  far: number
) => {
  const rw = 1 / (right - left);
  const rh = 1 / (top - bottom);
  const rd = 1 / (far - near);
  // prettier-ignore
  return new Matrix([
    2 * rw, 0, 0, 0,
    0, 2 * rh, 0, 0,
    0, 0, -2 * rd, 0,
    -(right + left) * rw, -(top + bottom) * rh, -(far + near) * rd, 1
  ]);
};
