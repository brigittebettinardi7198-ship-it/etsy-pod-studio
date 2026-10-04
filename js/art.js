// Illustration + layout engine: palettes, themes, hand-coded "watercolor" motifs, patterns, frames, text layout
const ART = (() => {
  const PALETTES = {
    strawberry: { name: 'Strawberry Pink', bg: '#fbe3e6', paper: '#fffaf8', primary: '#e2525e', secondary: '#f5b5bd', accent: '#f4cf63', text: '#a8333f', leaf: '#6aa85a' },
    blush: { name: 'Blush & Gold', bg: '#f8e6e1', paper: '#fffdfb', primary: '#d08585', secondary: '#f1c9c3', accent: '#d8b26e', text: '#8c5a5a', leaf: '#9bb58c' },
    sage: { name: 'Sage Garden', bg: '#e6eee0', paper: '#fcfdf9', primary: '#7f9c6f', secondary: '#c5d6b8', accent: '#f2c66d', text: '#4f6a43', leaf: '#6f9160', extra: ['#b9a3e3', '#f3b6c4', '#f2c66d', '#9cc5e8', '#ffffff'] },
    lavender: { name: 'Lavender Dream', bg: '#ece6f6', paper: '#fdfcff', primary: '#9b83c9', secondary: '#d4c7ee', accent: '#f6cf7a', text: '#5f4b8b', leaf: '#88b07d' },
    sunshine: { name: 'Sunshine Yellow', bg: '#fdf1cf', paper: '#fffdf5', primary: '#ee9f25', secondary: '#fbd98a', accent: '#ef7d63', text: '#9a610e', leaf: '#7aae5c' },
    babyblue: { name: 'Baby Blue', bg: '#e2eef8', paper: '#fbfdff', primary: '#6f9fcf', secondary: '#bcd6ee', accent: '#f4d27a', text: '#3f6a96', leaf: '#86b38a' },
    rainbow: { name: 'Pastel Rainbow', bg: '#fdf1ea', paper: '#fffdfa', primary: '#e57f7f', secondary: '#9cc9e8', accent: '#f6d37a', text: '#b85f5f', leaf: '#8fc08a', extra: ['#ee8a8a', '#f6b37a', '#f6d37a', '#9fd39b', '#9cc9e8', '#c3a8e6'] },
    boho: { name: 'Neutral Boho', bg: '#f1e6da', paper: '#fffaf4', primary: '#c47a5a', secondary: '#e3c3a8', accent: '#d9a95b', text: '#7d4e37', leaf: '#8f9e6e' },
  };
  for (const p of Object.values(PALETTES)) if (!p.extra) p.extra = [p.primary, p.secondary, p.accent, p.leaf, shade(p.primary, 0.35)];

  const THEMES = {
    strawberry: { name: 'Strawberry Gingham', pattern: 'gingham', frame: 'scallop', motifs: ['strawberry', 'daisy', 'strawberry', 'leaf', 'heart'], hero: 'bow', title: 'Dancing Script', palette: 'strawberry', word: 'Berry', ai: 'cute watercolor strawberries and white daisies' },
    wildflower: { name: 'Wildflower Garden', pattern: 'wash', frame: 'arch', motifs: ['wildflower', 'daisy', 'leaf', 'bee', 'wildflower'], hero: 'daisy', title: 'Great Vibes', palette: 'sage', word: 'Wild', ai: 'delicate watercolor wildflowers bouquet' },
    ladybug: { name: 'Little Ladybug', pattern: 'dots', frame: 'rounded', motifs: ['ladybug', 'daisy', 'leaf', 'heart', 'daisy'], hero: 'ladybug', title: 'Fredoka', palette: 'strawberry', word: 'Ladybug', ai: 'cute watercolor ladybugs with daisies' },
    bows: { name: 'Coquette Bows', pattern: 'stripes', frame: 'scallop', motifs: ['bow', 'heart', 'sparkle', 'heart'], hero: 'bow', title: 'Great Vibes', palette: 'blush', word: 'Bow', ai: 'pink satin ribbon bows watercolor' },
    rainbow: { name: 'Boho Rainbow', pattern: 'plain', frame: 'arch', motifs: ['rainbow', 'cloud', 'sparkle', 'heart', 'daisy'], hero: 'rainbow', title: 'Fredoka', palette: 'rainbow', word: 'Rainbow', ai: 'pastel boho rainbow with clouds watercolor' },
    stars: { name: 'Twinkle Little Star', pattern: 'confetti', frame: 'rounded', motifs: ['cloud', 'star', 'moon', 'sparkle'], hero: 'moon', title: 'Great Vibes', palette: 'babyblue', word: 'Twinkle', ai: 'soft watercolor moon stars and clouds nursery' },
    balloons: { name: 'Balloon Party', pattern: 'confetti', frame: 'rounded', motifs: ['balloon', 'star', 'sparkle', 'balloon'], hero: 'balloon', title: 'Pacifico', palette: 'rainbow', word: 'Party', ai: 'cute pastel party balloons watercolor' },
    bees: { name: 'Sweet Honey Bee', pattern: 'dots', frame: 'arch', motifs: ['bee', 'daisy', 'leaf', 'heart'], hero: 'bee', title: 'Dancing Script', palette: 'sunshine', word: 'Bee', ai: 'cute watercolor honey bees and daisies' },
  };

  let SOLID = false; // POD shirts: no semi-transparent pixels
  function setSolid(v) { SOLID = !!v; }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, a = Math.abs(amt);
    r = Math.round(r + (t - r) * a); g = Math.round(g + (t - g) * a); b = Math.round(b + (t - b) * a);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // Painterly fill: layered translucent fills + soft highlight + darker edge (solid mode for POD)
  function paint(ctx, build, color, s, edge = true) {
    if (SOLID) {
      ctx.beginPath(); build(ctx); ctx.fillStyle = color; ctx.fill();
      if (edge) { ctx.lineWidth = s * 0.025; ctx.strokeStyle = shade(color, -0.3); ctx.stroke(); }
      return;
    }
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate((i - 1) * s * 0.007, (i === 1 ? -1 : 1) * s * 0.006); ctx.beginPath(); build(ctx); ctx.fillStyle = color; ctx.fill(); ctx.restore(); }
    ctx.globalAlpha = 1; ctx.beginPath(); build(ctx); ctx.save(); ctx.clip();
    const g = ctx.createRadialGradient(-s * 0.15, -s * 0.2, s * 0.02, -s * 0.1, -s * 0.1, s * 0.6);
    g.addColorStop(0, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-s, -s, s * 2, s * 2);
    const g2 = ctx.createRadialGradient(s * 0.1, s * 0.25, s * 0.1, 0, 0, s * 0.7);
    g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,0.10)');
    ctx.fillStyle = g2; ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.restore();
    if (edge) { ctx.globalAlpha = 0.45; ctx.lineWidth = s * 0.018; ctx.strokeStyle = shade(color, -0.35); ctx.stroke(); }
    ctx.restore();
  }
  const ellipse = (c, x, y, rx, ry, r = 0) => { c.moveTo(x + rx * Math.cos(r), y + rx * Math.sin(r)); c.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); };
  const circle = (c, x, y, r) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); };

  // ---- Motifs: drawn centered at 0,0, about s wide ----
  const M = {
    heart(c, s, P, r) {
      const col = r() < 0.5 ? P.primary : P.secondary;
      paint(c, c => { c.moveTo(0, s * 0.38); c.bezierCurveTo(-s * 0.62, -s * 0.02, -s * 0.36, -s * 0.52, 0, -s * 0.2); c.bezierCurveTo(s * 0.36, -s * 0.52, s * 0.62, -s * 0.02, 0, s * 0.38); c.closePath(); }, col, s);
    },
    leaf(c, s, P) {
      paint(c, c => { c.moveTo(0, -s * 0.5); c.quadraticCurveTo(s * 0.34, -s * 0.05, 0, s * 0.5); c.quadraticCurveTo(-s * 0.34, -s * 0.05, 0, -s * 0.5); }, P.leaf, s);
      c.save(); c.globalAlpha = SOLID ? 1 : 0.5; c.strokeStyle = shade(P.leaf, -0.3); c.lineWidth = s * 0.02; c.beginPath(); c.moveTo(0, -s * 0.4); c.lineTo(0, s * 0.45); c.stroke(); c.restore();
    },
    strawberry(c, s, P) {
      const red = '#e4505c';
      paint(c, c => { c.moveTo(0, s * 0.52); c.bezierCurveTo(-s * 0.5, s * 0.22, -s * 0.48, -s * 0.3, 0, -s * 0.26); c.bezierCurveTo(s * 0.48, -s * 0.3, s * 0.5, s * 0.22, 0, s * 0.52); c.closePath(); }, red, s);
      c.save(); c.fillStyle = '#fbe9a6';
      for (let row = 0; row < 4; row++) for (let i = -2; i <= 2; i++) {
        const y = -s * 0.12 + row * s * 0.14, x = i * s * 0.12 + (row % 2) * s * 0.06; const lim = s * (0.34 - row * 0.06);
        if (Math.abs(x) < lim) { c.beginPath(); ellipse(c, x, y, s * 0.018, s * 0.03); c.fill(); }
      }
      c.restore();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.55;
        c.save(); c.translate(0, -s * 0.25); c.rotate(a + Math.PI / 2);
        paint(c, c => { c.moveTo(0, 0); c.quadraticCurveTo(s * 0.09, -s * 0.12, 0, -s * 0.24); c.quadraticCurveTo(-s * 0.09, -s * 0.12, 0, 0); }, P.leaf || '#6aa85a', s * 0.5, false);
        c.restore();
      }
      c.save(); c.strokeStyle = shade(P.leaf, -0.25); c.lineWidth = s * 0.035; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -s * 0.28); c.quadraticCurveTo(s * 0.02, -s * 0.4, s * 0.08, -s * 0.45); c.stroke(); c.restore();
    },
    daisy(c, s, P) {
      for (let i = 0; i < 11; i++) {
        c.save(); c.rotate(i * Math.PI * 2 / 11);
        paint(c, c => ellipse(c, 0, -s * 0.27, s * 0.085, s * 0.2), '#ffffff', s * 0.6, true);
        c.restore();
      }
      paint(c, c => circle(c, 0, 0, s * 0.12), '#f5c33b', s * 0.4);
    },
    wildflower(c, s, P, r) {
      const cols = P.extra;
      const stems = [[-0.18, 0.1, -0.12], [0.02, -0.05, 0.02], [0.2, 0.15, 0.14]];
      stems.forEach(([dx, top, bend], k) => {
        c.save(); c.strokeStyle = P.leaf; c.lineWidth = s * 0.025; c.lineCap = 'round';
        c.beginPath(); c.moveTo(0, s * 0.5); c.quadraticCurveTo(s * bend, s * 0.2, s * dx, -s * 0.3 + s * top); c.stroke(); c.restore();
        c.save(); c.translate(s * (dx * 0.6 + bend * 0.3), s * 0.18); c.rotate(dx * 3); M.leaf(c, s * 0.22, P); c.restore();
        c.save(); c.translate(s * dx, -s * 0.3 + s * top);
        const col = cols[Math.floor(r() * cols.length)] || P.secondary;
        for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * Math.PI * 2 / 5); paint(c, c => circle(c, 0, -s * 0.07, s * 0.065), col, s * 0.3); c.restore(); }
        paint(c, c => circle(c, 0, 0, s * 0.035), '#f5c33b', s * 0.15, false);
        c.restore();
      });
    },
    ladybug(c, s) {
      paint(c, c => { c.moveTo(s * 0.17, -s * 0.28); c.arc(0, -s * 0.28, s * 0.17, 0, Math.PI, true); c.closePath(); }, '#2f2f35', s * 0.5);
      paint(c, c => ellipse(c, 0, s * 0.05, s * 0.38, s * 0.36), '#e0433f', s);
      c.save(); c.strokeStyle = '#2f2f35'; c.lineWidth = s * 0.025; c.beginPath(); c.moveTo(0, -s * 0.3); c.lineTo(0, s * 0.4); c.stroke();
      c.beginPath(); c.moveTo(-s * 0.06, -s * 0.42); c.quadraticCurveTo(-s * 0.12, -s * 0.55, -s * 0.2, -s * 0.55); c.moveTo(s * 0.06, -s * 0.42); c.quadraticCurveTo(s * 0.12, -s * 0.55, s * 0.2, -s * 0.55); c.stroke();
      c.fillStyle = '#2f2f35';
      [[-0.18, -0.05, 0.07], [0.18, -0.05, 0.07], [-0.2, 0.2, 0.06], [0.2, 0.2, 0.06], [-0.07, 0.3, 0.04], [0.07, 0.3, 0.04]].forEach(([x, y, rr]) => { c.beginPath(); circle(c, s * x, s * y, s * rr); c.fill(); });
      c.fillStyle = '#ffffff'; c.globalAlpha = SOLID ? 1 : 0.7; c.beginPath(); ellipse(c, -s * 0.15, -s * 0.15, s * 0.05, s * 0.03, -0.6); c.fill();
      c.restore();
    },
    bow(c, s, P) {
      const col = P.primary;
      const loop = side => c => { c.moveTo(0, 0); c.bezierCurveTo(side * s * 0.15, -s * 0.35, side * s * 0.55, -s * 0.3, side * s * 0.45, -s * 0.02); c.bezierCurveTo(side * s * 0.4, s * 0.12, side * s * 0.15, s * 0.08, 0, 0); };
      const tail = side => c => { c.moveTo(-side * s * 0.02, s * 0.02); c.bezierCurveTo(side * s * 0.12, s * 0.2, side * s * 0.08, s * 0.35, side * s * 0.25, s * 0.52); c.lineTo(side * s * 0.33, s * 0.42); c.bezierCurveTo(side * s * 0.2, s * 0.3, side * s * 0.15, s * 0.15, side * s * 0.06, 0); c.closePath(); };
      paint(c, tail(-1), shade(col, -0.05), s); paint(c, tail(1), shade(col, -0.05), s);
      paint(c, loop(-1), col, s); paint(c, loop(1), col, s);
      paint(c, c => ellipse(c, 0, 0, s * 0.08, s * 0.09), shade(col, -0.1), s * 0.4);
    },
    star(c, s, P) {
      paint(c, c => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * 0.2 : s * 0.48; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); }, P.accent, s);
    },
    sparkle(c, s, P) {
      paint(c, c => { const a = s * 0.5, b = s * 0.09; c.moveTo(0, -a); c.quadraticCurveTo(b, -b, a, 0); c.quadraticCurveTo(b, b, 0, a); c.quadraticCurveTo(-b, b, -a, 0); c.quadraticCurveTo(-b, -b, 0, -a); c.closePath(); }, P.accent, s, false);
    },
    cloud(c, s, P) {
      paint(c, c => { circle(c, -s * 0.22, s * 0.05, s * 0.18); circle(c, 0, -s * 0.06, s * 0.25); circle(c, s * 0.24, s * 0.05, s * 0.17); c.moveTo(-s * 0.35, s * 0.08); c.roundRect(-s * 0.38, s * 0.0, s * 0.76, s * 0.22, s * 0.11); }, '#ffffff', s, false);
      c.save(); c.globalAlpha = SOLID ? 1 : 0.6; c.strokeStyle = P.secondary; c.lineWidth = s * 0.02; c.beginPath(); c.moveTo(-s * 0.34, s * 0.22); c.lineTo(s * 0.34, s * 0.22); c.stroke(); c.restore();
    },
    rainbow(c, s, P) {
      const cols = P.extra.slice(0, 5); const w = s * 0.075;
      cols.forEach((col, i) => {
        const R = s * 0.42 - i * w;
        paint(c, c => { c.moveTo(-R, s * 0.12); c.arc(0, s * 0.12, R, Math.PI, 0); c.lineTo(R - w, s * 0.12); c.arc(0, s * 0.12, R - w, 0, Math.PI, true); c.closePath(); }, col, s * 0.6, false);
      });
      c.save(); c.translate(-s * 0.33, s * 0.15); M.cloud(c, s * 0.32, P); c.restore();
      c.save(); c.translate(s * 0.33, s * 0.15); M.cloud(c, s * 0.32, P); c.restore();
    },
    balloon(c, s, P, r) {
      const col = P.extra[Math.floor(r() * P.extra.length)];
      c.save(); c.strokeStyle = shade(col, -0.3); c.lineWidth = s * 0.012; c.beginPath(); c.moveTo(0, s * 0.3); c.bezierCurveTo(s * 0.08, s * 0.4, -s * 0.08, s * 0.48, 0, s * 0.6); c.stroke(); c.restore();
      paint(c, c => { c.moveTo(0, s * 0.3); c.lineTo(-s * 0.04, s * 0.34); c.lineTo(s * 0.04, s * 0.34); c.closePath(); }, col, s * 0.3, false);
      paint(c, c => ellipse(c, 0, -s * 0.05, s * 0.28, s * 0.35), col, s);
    },
    moon(c, s, P) {
      const R = s * 0.42, d = R * 0.85, y = Math.sqrt(R * R - d * d / 4);
      const th = Math.atan2(y, d / 2);
      paint(c, c => { c.arc(0, 0, R, th, -th + Math.PI * 2, false); c.arc(d, 0, R, Math.atan2(-y, -d / 2), Math.atan2(y, -d / 2), true); c.closePath(); }, P.accent, s);
    },
    bee(c, s) {
      c.save(); c.globalAlpha = SOLID ? 1 : 0.75;
      paint(c, c => { ellipse(c, -s * 0.1, -s * 0.22, s * 0.13, s * 0.18, -0.4); ellipse(c, s * 0.1, -s * 0.22, s * 0.13, s * 0.18, 0.4); }, '#eef6fb', s * 0.5);
      c.restore();
      paint(c, c => ellipse(c, 0, s * 0.05, s * 0.3, s * 0.21), '#f6c445', s);
      c.save(); c.beginPath(); ellipse(c, 0, s * 0.05, s * 0.3, s * 0.21); c.clip(); c.fillStyle = '#3a3330';
      [-0.08, 0.08].forEach(x => c.fillRect(s * x - s * 0.035, -s * 0.3, s * 0.07, s * 0.7)); c.restore();
      c.fillStyle = '#3a3330'; c.beginPath(); circle(c, s * 0.2, 0, s * 0.025); c.fill();
    },
    mushroom(c, s) {
      paint(c, c => { c.roundRect(-s * 0.1, -s * 0.05, s * 0.2, s * 0.45, s * 0.06); }, '#f7ead6', s * 0.6);
      paint(c, c => { c.moveTo(-s * 0.42, 0); c.bezierCurveTo(-s * 0.42, -s * 0.45, s * 0.42, -s * 0.45, s * 0.42, 0); c.closePath(); }, '#e0533f', s);
      c.fillStyle = '#ffffff'; [[-0.2, -0.1, 0.05], [0.05, -0.22, 0.06], [0.25, -0.08, 0.04]].forEach(([x, y, rr]) => { c.beginPath(); circle(c, s * x, s * y, s * rr); c.fill(); });
    },
  };
  const MOTIF_NAMES = Object.keys(M);

  function drawMotif(ctx, name, x, y, s, rot, P, r) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    if (name && typeof name === 'object') { // custom image (uploaded clipart)
      const sc = s / Math.max(name.width, name.height);
      ctx.drawImage(name, -name.width * sc / 2, -name.height * sc / 2, name.width * sc, name.height * sc);
    } else (M[name] || M.heart)(ctx, s, P, r);
    ctx.restore();
  }

  // ---- Patterns ----
  function pattern(ctx, x, y, w, h, type, P, r) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = P.bg; ctx.fillRect(x, y, w, h);
    const m = Math.min(w, h);
    if (type === 'gingham') {
      const g = m * 0.045; ctx.fillStyle = P.secondary; ctx.globalAlpha = 0.42;
      for (let i = x - g; i < x + w; i += g * 2) ctx.fillRect(i, y, g, h);
      for (let j = y - g; j < y + h; j += g * 2) ctx.fillRect(x, j, w, g);
    } else if (type === 'dots') {
      const g = m * 0.07; ctx.fillStyle = P.secondary; ctx.globalAlpha = 0.6;
      for (let j = 0, row = 0; j < h + g; j += g, row++) for (let i = (row % 2) * g / 2; i < w + g; i += g) { ctx.beginPath(); ctx.arc(x + i, y + j, g * 0.12, 0, 7); ctx.fill(); }
    } else if (type === 'stripes') {
      const g = m * 0.05; ctx.fillStyle = P.secondary; ctx.globalAlpha = 0.45;
      for (let i = x; i < x + w; i += g * 2) ctx.fillRect(i, y, g, h);
    } else if (type === 'wash') {
      for (let k = 0; k < 7; k++) {
        const cx = x + r() * w, cy = y + r() * h, rr = m * (0.3 + r() * 0.4);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr); const col = [P.secondary, P.leaf, P.accent][k % 3];
        g.addColorStop(0, col + '55'); g.addColorStop(1, col + '00'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      }
    } else if (type === 'confetti') {
      const n = Math.round((w * h) / (m * m) * 60);
      for (let k = 0; k < n; k++) {
        ctx.fillStyle = P.extra[k % P.extra.length]; ctx.globalAlpha = 0.55; const s = m * (0.008 + r() * 0.012);
        ctx.save(); ctx.translate(x + r() * w, y + r() * h); ctx.rotate(r() * 6);
        if (k % 3) { ctx.beginPath(); ctx.arc(0, 0, s, 0, 7); ctx.fill(); } else ctx.fillRect(-s, -s * 0.4, s * 2, s * 0.8);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ---- Frame shapes ----
  function framePath(ctx, x, y, w, h, type, m) {
    ctx.beginPath();
    if (type === 'arch') {
      const r = Math.min(w / 2, h * 0.38);
      ctx.moveTo(x, y + h); ctx.lineTo(x, y + r); ctx.ellipse(x + w / 2, y + r, w / 2, r, 0, Math.PI, Math.PI * 2); ctx.lineTo(x + w, y + h); ctx.closePath();
    } else if (type === 'scallop') {
      const sr = m * 0.028; ctx.roundRect(x, y, w, h, sr);
      const nx = Math.max(3, Math.round(w / (sr * 2.2))), ny = Math.max(3, Math.round(h / (sr * 2.2)));
      for (let i = 0; i <= nx; i++) { const px = x + w * i / nx; circle(ctx, px, y, sr); circle(ctx, px, y + h, sr); }
      for (let j = 1; j < ny; j++) { const py = y + h * j / ny; circle(ctx, x, py, sr); circle(ctx, x + w, py, sr); }
    } else ctx.roundRect(x, y, w, h, m * 0.04);
  }

  // ---- Text ----
  const FONTS = theme => ({ title: [theme.title || 'Dancing Script', theme.title === 'Great Vibes' || theme.title === 'Pacifico' ? '400' : theme.title === 'Fredoka' ? '600' : '700'], caps: ['Josefin Sans', '600'], serif: ['Playfair Display', '700'], body: ['Josefin Sans', '400'] });
  function setFont(ctx, F, kind, px) { const [f, w] = F[kind] || F.body; ctx.font = `${w} ${px}px "${f}"`; }
  function spacedWidth(ctx, t, sp) { if (!sp) return ctx.measureText(t).width; let w = 0; for (const ch of t) w += ctx.measureText(ch).width + sp; return w - sp; }
  function drawSpaced(ctx, t, cx, y, sp) {
    if (!sp) { ctx.textAlign = 'center'; ctx.fillText(t, cx, y); return; }
    ctx.textAlign = 'left'; let x = cx - spacedWidth(ctx, t, sp) / 2;
    for (const ch of t) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + sp; }
  }

  // blocks: {t:'text', text, f:'title|caps|serif|body', size, color, sp}, {t:'gap', size}, {t:'cols', items:[[...lines]], size}, {t:'divider'}, {t:'pill', text, size}
  function layoutText(ctx, blocks, area, F, P, dry) {
    const u = area.w / 60; let scale = 1;
    const measure = sc => {
      let H = 0; const rows = [];
      for (const b of blocks) {
        if (b.t === 'gap') { rows.push({ b, h: b.size * u * sc }); H += b.size * u * sc; continue; }
        if (b.t === 'divider') { rows.push({ b, h: 3 * u * sc }); H += 3 * u * sc; continue; }
        if (b.t === 'text' || b.t === 'pill') {
          if (!b.text) continue;
          let px = b.size * u * sc; setFont(ctx, F, b.f || 'caps', px); const sp = (b.sp || 0) * px;
          const txt = b.upper ? b.text.toUpperCase() : b.text;
          const maxW = area.w * (b.t === 'pill' ? 0.7 : 1); let wd = spacedWidth(ctx, txt, sp);
          if (wd > maxW) px *= maxW / wd;
          const lh = px * (b.f === 'title' ? 1.18 : 1.32) + (b.t === 'pill' ? px * 1.2 : 0);
          rows.push({ b, px, txt, h: lh }); H += lh; continue;
        }
        if (b.t === 'cols') {
          const items = b.items.filter(it => it.some(Boolean)); if (!items.length) continue;
          let px = b.size * u * sc; setFont(ctx, F, 'caps', px); const sp = 0.08 * px; const colW = area.w / items.length * 0.9;
          let worst = 1; items.forEach(it => it.forEach(l => { const wd = spacedWidth(ctx, (l || '').toUpperCase(), sp); if (wd > colW) worst = Math.min(worst, colW / wd); }));
          px *= worst; const lines = Math.max(...items.map(i => i.length)); const h = lines * px * 1.45 + px * 0.6;
          rows.push({ b, px, items, h }); H += h;
        }
      }
      return { H, rows };
    };
    let res = measure(1);
    if (res.H < area.h * 0.72) { scale = Math.min(1.7, area.h * 0.8 / res.H); res = measure(scale); }
    if (res.H > area.h) { scale *= area.h / res.H; res = measure(scale); }
    if (dry) return res;
    let y = area.y + (area.h - res.H) / 2; const cx = area.x + area.w / 2;
    ctx.textBaseline = 'alphabetic';
    for (const row of res.rows) {
      const b = row.b;
      if (b.t === 'text') {
        setFont(ctx, F, b.f || 'caps', row.px); ctx.fillStyle = P[b.color] || b.color || P.text;
        drawSpaced(ctx, row.txt, cx, y + row.px * (b.f === 'title' ? 0.92 : 1.0), (b.sp || 0) * row.px);
      } else if (b.t === 'pill') {
        setFont(ctx, F, b.f || 'caps', row.px); const sp = (b.sp || 0.15) * row.px; const tw = spacedWidth(ctx, row.txt, sp);
        const ph = row.px * 2.1, pw = tw + row.px * 3; ctx.fillStyle = P.primary; ctx.beginPath(); ctx.roundRect(cx - pw / 2, y + row.px * 0.3, pw, ph, ph / 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; drawSpaced(ctx, row.txt, cx, y + row.px * 0.3 + ph / 2 + row.px * 0.36, sp);
      } else if (b.t === 'divider') {
        const yy = y + row.h / 2; ctx.strokeStyle = P.secondary; ctx.lineWidth = u * 0.25;
        ctx.beginPath(); ctx.moveTo(cx - area.w * 0.25, yy); ctx.lineTo(cx - u * 2, yy); ctx.moveTo(cx + u * 2, yy); ctx.lineTo(cx + area.w * 0.25, yy); ctx.stroke();
        ctx.save(); ctx.translate(cx, yy); M.heart(ctx, u * 2.6, P, () => 0.1); ctx.restore();
      } else if (b.t === 'cols') {
        const n = row.items.length, cw = area.w / n; setFont(ctx, F, 'caps', row.px); ctx.fillStyle = P[b.color] || P.text;
        row.items.forEach((it, i) => {
          const ccx = area.x + cw * (i + 0.5);
          it.forEach((l, k) => l && drawSpaced(ctx, l.toUpperCase(), ccx, y + row.px * (1.1 + k * 1.45), 0.08 * row.px));
          if (i > 0) { ctx.strokeStyle = P.secondary; ctx.lineWidth = u * 0.2; ctx.beginPath(); ctx.moveTo(area.x + cw * i, y + row.px * 0.2); ctx.lineTo(area.x + cw * i, y + row.h - row.px * 0.4); ctx.stroke(); }
        });
      }
      y += row.h;
    }
    return res;
  }

  // ---- Full card: background, panel frame, motif clusters, text ----
  // o: {theme, pal, blocks, seed, images:[], hero:true, corners:4|2|0, frame:'auto'|'none', textOn}
  function drawCard(ctx, x, y, w, h, o) {
    const T = THEMES[o.theme] || THEMES.strawberry, P = PALETTES[o.pal] || PALETTES[T.palette];
    const r = U.rng(o.seed || 1), m = Math.min(w, h), F = FONTS(T);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    pattern(ctx, x, y, w, h, o.pattern || T.pattern, P, r);
    const inset = m * (o.inset ?? 0.085);
    const px = x + inset, py = y + inset, pw = w - inset * 2, ph = h - inset * 2;
    const frame = o.frame || T.frame;
    ctx.save(); ctx.shadowColor = 'rgba(80,40,40,0.18)'; ctx.shadowBlur = m * 0.03; ctx.shadowOffsetY = m * 0.008;
    framePath(ctx, px, py, pw, ph, frame, m); ctx.fillStyle = P.paper; ctx.fill(); ctx.restore();
    const bi = m * 0.025; framePath(ctx, px + bi, py + bi, pw - bi * 2, ph - bi * 2, frame === 'scallop' ? 'rounded' : frame, m);
    ctx.setLineDash([m * 0.012, m * 0.012]); ctx.strokeStyle = P.secondary; ctx.lineWidth = m * 0.004; ctx.stroke(); ctx.setLineDash([]);

    const pool = (o.images && o.images.length) ? o.images : T.motifs;
    const pick = () => pool[Math.floor(r() * pool.length)];
    const cluster = (cx, cy, size, n) => {
      const items = [];
      for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = size * 0.35 * Math.sqrt(r()); items.push([pick(), cx + Math.cos(a) * d, cy + Math.sin(a) * d, size * (0.45 + r() * 0.5), (r() - 0.5) * 0.9]); }
      items.sort((a, b) => b[3] - a[3]).forEach(it => drawMotif(ctx, it[0], it[1], it[2], it[3], it[4], P, r));
    };
    const cs = m * (o.motifScale || 0.24), corners = o.corners ?? 4;
    if (corners >= 2) { cluster(px + cs * 0.22, py + ph - cs * 0.22, cs, 5); cluster(px + pw - cs * 0.22, py + ph - cs * 0.22, cs, 5); }
    if (corners >= 4) {
      cluster(px + cs * 0.18, py + cs * 0.2, cs * 0.85, 3); cluster(px + pw - cs * 0.18, py + cs * 0.2, cs * 0.85, 3);
      const ss = cs * 0.42;
      if (h >= w) { const n = h / w > 1.6 ? 3 : 2; for (let i = 1; i <= n; i++) { const fy = py + ph * (0.2 + 0.6 * i / (n + 1)); drawMotif(ctx, pick(), px + ss * 0.1, fy + (r() - 0.5) * ss, ss * (0.8 + r() * 0.4), (r() - 0.5) * 0.8, P, r); drawMotif(ctx, pick(), px + pw - ss * 0.1, fy + (r() - 0.5) * ss + ss * 0.6, ss * (0.8 + r() * 0.4), (r() - 0.5) * 0.8, P, r); } }
      else { for (let i = 1; i <= 2; i++) { const fx = px + pw * (0.2 + 0.6 * i / 3); drawMotif(ctx, pick(), fx, py + ss * 0.1, ss, (r() - 0.5) * 0.8, P, r); drawMotif(ctx, pick(), fx + ss, py + ph - ss * 0.1, ss, (r() - 0.5) * 0.8, P, r); } }
    }
    let topPad = 0;
    if (o.hero !== false) {
      const hs = m * 0.2; const heroName = (o.images && o.images.length) ? o.images[0] : T.hero;
      drawMotif(ctx, heroName, x + w / 2, py + hs * 0.25, hs, 0, P, r); topPad = hs * 0.55;
    }
    if (o.textOn !== false && o.blocks && o.blocks.length) {
      const side = pw * 0.12, area = { x: px + side, y: py + Math.max(topPad, ph * 0.08), w: pw - side * 2, h: ph - Math.max(topPad, ph * 0.08) - ph * (o.bottomPad ?? 0.13) };
      layoutText(ctx, o.blocks, area, F, P);
    }
    ctx.restore();
    return { P, T, F };
  }

  return { PALETTES, THEMES, MOTIF_NAMES, M, drawMotif, drawCard, pattern, framePath, layoutText, FONTS, setFont, spacedWidth, drawSpaced, shade, setSolid };
})();
