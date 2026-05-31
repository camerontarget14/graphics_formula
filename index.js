const BACKGROUND = "#282828";
const FOREGROUND = "#009AFF";

console.log(vfx);
vfx.width = 800;
vfx.height = 800;
const ctx = vfx.getContext("2d");
console.log(ctx);

function clear() {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, vfx.width, vfx.height);
}

function point({ x, y }) {
  const s = 20;
  ctx.fillStyle = FOREGROUND;
  ctx.fillRect(x - s / 2, y - s / 2, s, s);
}

function line(p1, p2) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = FOREGROUND;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function screen(p) {
  // -1..1 => 0..2 => 0..1 => 0..w
  return {
    x: ((p.x + 1) / 2) * vfx.width,
    y: (1 - (p.y + 1) / 2) * vfx.height,
  };
}

function project({ x, y, z }) {
  return {
    x: x / z,
    y: y / z,
  };
}

const FPS = 60;

function translate_z({ x, y, z }, dz) {
  return { x, y, z: z + dz };
}

function rotate_xz({ x, y, z }, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: x * c - z * s,
    y,
    z: x * s + z * c,
  };
}

let dz = 1;
let angle = 0;

function frame() {
  const dt = 0.5 / FPS;
  // dz += 1*dt;
  angle += Math.PI * dt;
  clear();
  // for (const v of vertices) {
  //     point(screen(project(translate_z(rotate_xz(v, angle), dz))))
  // }
  for (const f of faces) {
    for (let i = 0; i < f.length; ++i) {
      const a = vertices[f[i]];
      const b = vertices[f[(i + 1) % f.length]];
      line(
        screen(project(translate_z(rotate_xz(a, angle), dz))),
        screen(project(translate_z(rotate_xz(b, angle), dz))),
      );
    }
  }
  setTimeout(frame, 1000 / FPS);
}
setTimeout(frame, 1000 / FPS);
