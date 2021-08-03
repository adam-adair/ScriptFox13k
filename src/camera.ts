export const perspective = (
  fov: number,
  ratio: number,
  near: number,
  far: number
) => {
  const tan = 1 / Math.tan((fov * Math.PI) / 180);
  return new DOMMatrix([
    tan / ratio,
    0,
    0,
    0,
    0,
    tan,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * near * far) / (near - far),
    0,
  ]);
};
