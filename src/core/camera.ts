export const perspective = (
  fov: number,
  ratio: number,
  near: number,
  far: number
) => {
  const tan = 1 / Math.tan((fov * Math.PI) / 180);
  // prettier-ignore
  return new DOMMatrix([
    tan / ratio, 0, 0, 0,
    0, tan, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * near * far) / (near - far), 0
  ]);
};

export const orthogonal = (x: number, y: number, z: number) => {
  // prettier-ignore
  return new DOMMatrix([
    2 / x, 0, 0, 0,
    0, 2 / y, 0, 0,
    0, 0, -2 / z, 0,
    -1, 1, 0, 1
  ]);
};
