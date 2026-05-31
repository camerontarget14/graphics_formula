const vs = [
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },

  { x: 0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
];

const fs = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

const W = 80;
const H = 40;
// terminal cells are ~2:1 tall:wide, so halve Y to correct aspect ratio
const ASPECT = 0.5;

function project({ x, y, z }) {
  return { x: x / z, y: y / z };
}

function screen({ x, y }) {
  return {
    px: Math.round(((x + 1) / 2) * (W - 1)),
    py: Math.round((1 - (y + 1) / 2) * (H - 1) * ASPECT),
  };
}

function rotate_xz({ x, y, z }, a) {
  return {
    x: x * Math.cos(a) - z * Math.sin(a),
    y,
    z: x * Math.sin(a) + z * Math.cos(a),
  };
}

function rotate_xy({ x, y, z }, a) {
  return {
    x: x * Math.cos(a) - y * Math.sin(a),
    y: x * Math.sin(a) + y * Math.cos(a),
    z,
  };
}

function drawLine(buf, x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0),
    dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1,
    sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    if (x0 >= 0 && x0 < W && y0 >= 0 && y0 < H) buf[y0][x0] = "#";
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

let angle = 0;
const FPS = 24;
const DZ = 1;

function frame() {
  const buf = Array.from({ length: H }, () => Array(W).fill(" "));

  const xfm = (v) => {
    const r = rotate_xy(rotate_xz(v, angle), angle * 0.4);
    const p = project({ x: r.x, y: r.y, z: r.z + DZ });
    return screen(p);
  };

  for (const f of fs) {
    for (let i = 0; i < f.length - 1; i++) {
      const a = xfm(vs[f[i]]);
      const b = xfm(vs[f[i + 1]]);
      drawLine(buf, a.px, a.py, b.px, b.py);
    }
    if (f.length > 2) {
      const a = xfm(vs[f[f.length - 1]]);
      const b = xfm(vs[f[0]]);
      drawLine(buf, a.px, a.py, b.px, b.py);
    }
  }

  process.stdout.write("\x1b[2J\x1b[H");
  process.stdout.write(buf.map((row) => row.join("")).join("\n") + "\n");

  angle += (Math.PI * 2) / FPS / 4;
}

setInterval(frame, 1000 / FPS);
