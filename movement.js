function traceNeonHarborGridMove(startX, startY, direction, steps, maxX = 6, maxY = 4) {
  const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[direction];
  if (!delta || !Number.isInteger(steps) || steps <= 0) return [];

  let x = Math.max(0, Math.min(maxX, startX));
  let y = Math.max(0, Math.min(maxY, startY));
  const path = [];
  for (let step = 0; step < steps; step += 1) {
    const nextX = Math.max(0, Math.min(maxX, x + delta[0]));
    const nextY = Math.max(0, Math.min(maxY, y + delta[1]));
    if (nextX === x && nextY === y) break;
    x = nextX;
    y = nextY;
    path.push({ x, y });
  }
  return path;
}

if (typeof window !== 'undefined') window.traceNeonHarborGridMove = traceNeonHarborGridMove;
if (typeof module !== 'undefined' && module.exports) module.exports = { traceNeonHarborGridMove };
