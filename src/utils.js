export function distance(positionA, positionB) {
  return Math.sqrt(
    (positionB.x - positionA.x) ** 2 + (positionB.y - positionA.y) ** 2,
  );
}
