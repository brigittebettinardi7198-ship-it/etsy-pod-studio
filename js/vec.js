// Vector engine: real font outlines (opentype.js + bundled OFL fonts) -> SVG paths in millimetres.
// Used by Engraving and Baby Names so SVG exports have text converted to outlines (what engravers ask for).
const VEC = (() => {
  const FILES = { script: 'GreatVibes-Regular', script2: 'Allura-Regular', yarn: 'Pacifico-Regular', varsity: 'Graduate-Regular', serif: 'AbrilFatface-Regular', sans: 'Poppins-SemiBold' };
  const FONT_LABELS = { script: 'Elegant script (Great Vibes)', script2: 'Thin script (Allura)', yarn: 'Rounded script (Pacifico)', varsity: 'Varsity block (Graduate)', serif: 'Bold serif (Abril Fatface)', sans: 'Clean sans (Poppins)' };
  const cache = {};
  function font(key) {
    if (!cache[key]) cache[key] = fetch(`fonts/${FILES[key]}.ttf`).then(r => { if (!r.ok) throw new Error('Font failed to load'); return r.arrayBuffer(); }).then(b => opentype.parse(b));
    return cache[key];
  }
  const loadAll = () => Promise.all(Object.keys(FILES).map(font));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Lay out a string at size 100 (units), baseline y=0. sp = extra letter spacing in em.
  function shape(f, text, sp = 0) {
    const size = 100, sc = size / f.unitsPerEm, gl = f.stringToGlyphs(text || ' ');
    let x = 0; const out = []; const bb = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
    gl.forEach((g, i) => {
      const p = g.getPath(x, 0, size), b = p.getBoundingBox(), d = p.toPathData(2), adv = g.advanceWidth * sc;
      if (d && b.x2 > b.x1) { out.push({ d, b, i, x, adv }); bb.x1 = Math.min(bb.x1, b.x1); bb.y1 = Math.min(bb.y1, b.y1); bb.x2 = Math.max(bb.x2, b.x2); bb.y2 = Math.max(bb.y2, b.y2); }
      x += adv + sp * size; if (i < gl.length - 1) x += f.getKerningValue(g, gl[i + 1]) * sc;
    });
    if (!isFinite(bb.x1)) Object.assign(bb, { x1: 0, y1: -70, x2: Math.max(1, x), y2: 0 });
    return { glyphs: out, bbox: bb, adv: x };
  }

  // Fit text into a box (mm). opts: fill (string | fn(i)), stroke, strokeW (mm), sp, attrs (extra per-path attrs fn)
  function fitText(f, text, box, o = {}) {
    const sh = shape(f, text, o.sp || 0), b = sh.bbox, bw = b.x2 - b.x1, bh = b.y2 - b.y1;
    const s = Math.min(box.w / bw, box.h / bh, o.maxScale || Infinity);
    const tx = box.x + (box.w - bw * s) / 2 - b.x1 * s, ty = box.y + (box.h - bh * s) / 2 - b.y1 * s;
    const sw = o.strokeW ? ` stroke="${o.stroke || '#000'}" stroke-width="${(o.strokeW / s).toFixed(3)}" stroke-linejoin="round"` : '';
    const paths = sh.glyphs.map((g, k) => `<path d="${g.d}" fill="${typeof o.fill === 'function' ? o.fill(k) : (o.fill || '#000')}"${sw}${o.attrs ? o.attrs(k) : ''}/>`).join('');
    return { svg: `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})">${paths}</g>`, w: bw * s, h: bh * s, s, x: tx + b.x1 * s, y: ty + b.y1 * s, glyphs: sh.glyphs, tx, ty };
  }

  // Text along a circle. top=true reads clockwise over the top; false reads along the bottom (upright).
  function arcText(f, text, cx, cy, r, capMM, top = true, sp = 0.08) {
    const sh = shape(f, text, sp), capUnits = (f.tables.os2 && f.tables.os2.sCapHeight) ? f.tables.os2.sCapHeight * 100 / f.unitsPerEm : 70;
    const s = capMM / capUnits, total = sh.adv * s; let out = '';
    sh.glyphs.forEach(g => {
      const mid = (g.x + g.adv / 2) * s - total / 2;
      const a = top ? -Math.PI / 2 + mid / r : Math.PI / 2 - mid / r;
      const rr = top ? r : r + capMM;
      const px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a), rot = (top ? a + Math.PI / 2 : a - Math.PI / 2) * 180 / Math.PI;
      out += `<path d="${g.d}" transform="translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(4)}) translate(${(-(g.x + g.adv / 2)).toFixed(2)} 0)"/>`;
    });
    return `<g fill="#000">${out}</g>`;
  }

  function doc(wmm, hmm, inner, defs = '') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${wmm}mm" height="${hmm}mm" viewBox="0 0 ${wmm} ${hmm}">${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>`;
  }
  function toCanvas(svg, pxW, pxH) {
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      img.onload = () => { const c = document.createElement('canvas'); c.width = Math.round(pxW); c.height = Math.round(pxH); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not render the design')); };
      img.src = url;
    });
  }
  const svgBlob = svg => new Blob([svg], { type: 'image/svg+xml' });

  // ---- Line art (stroke-only, black). Drawn in a 100 x 140 unit box; caller scales. ----
  const LS = sw => `fill="none" stroke="#000" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  function leaf(x, y, len, ang) {
    const a = ang * Math.PI / 180, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, nx = -Math.sin(a) * len * 0.28, ny = Math.cos(a) * len * 0.28, mx = (x + ex) / 2, my = (y + ey) / 2;
    return `<path d="M${x} ${y} Q${mx + nx} ${my + ny} ${ex} ${ey} Q${mx - nx} ${my - ny} ${x} ${y} M${x} ${y} L${(x + ex * 2) / 3} ${(y + ey * 2) / 3}"/>`;
  }
  const FLOWERS = {
    daisy: { label: 'Daisy (April)', head(cx, cy, r) { let s = ''; for (let i = 0; i < 12; i++) s += `<ellipse cx="${cx}" cy="${cy - r * 0.58}" rx="${r * 0.17}" ry="${r * 0.4}" transform="rotate(${i * 30} ${cx} ${cy})"/>`; return s + `<circle cx="${cx}" cy="${cy}" r="${r * 0.2}"/>`; } },
    rose: { label: 'Rose (June)', head(cx, cy, r) { let d = `M${cx} ${cy}`; for (let t = 0; t <= Math.PI * 5; t += 0.25) { const rr = r * 0.12 + r * 0.6 * t / (Math.PI * 5); d += ` L${(cx + Math.cos(t) * rr).toFixed(2)} ${(cy + Math.sin(t) * rr * 0.85).toFixed(2)}`; } return `<path d="${d}"/><path d="M${cx - r} ${cy} Q${cx - r} ${cy + r} ${cx} ${cy + r * 0.95} Q${cx + r} ${cy + r} ${cx + r} ${cy}"/><path d="M${cx - r * 0.95} ${cy - r * 0.1} Q${cx - r * 0.6} ${cy - r * 0.9} ${cx} ${cy - r * 0.8} Q${cx + r * 0.6} ${cy - r * 0.9} ${cx + r * 0.95} ${cy - r * 0.1}"/>`; } },
    larkspur: { label: 'Larkspur (July)', sprig: true, head(cx, cy, r) { let s = `<path d="M${cx} ${cy + r * 1.6} L${cx} ${cy - r * 1.6}"/>`; for (let i = 0; i < 6; i++) { const y = cy + r * 1.3 - i * r * 0.55, rr = r * (0.42 - i * 0.05), x = cx + (i % 2 ? rr * 0.9 : -rr * 0.9); for (let k = 0; k < 5; k++) { const a = k * 72 * Math.PI / 180; s += `<circle cx="${(x + Math.cos(a) * rr * 0.55).toFixed(2)}" cy="${(y + Math.sin(a) * rr * 0.55).toFixed(2)}" r="${(rr * 0.42).toFixed(2)}"/>`; } } return s; } },
    lily: { label: 'Lily of the Valley (May)', sprig: true, head(cx, cy, r) { let s = `<path d="M${cx - r * 0.2} ${cy + r * 1.6} Q${cx} ${cy - r * 1.4} ${cx + r * 1.2} ${cy - r * 1.1}"/>`; for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5, x = cx - r * 0.2 + (r * 1.4) * t * t + r * 0.1, y = cy + r * 1.2 - r * 2.4 * t; s += `<path d="M${x} ${y} l0 ${r * 0.3}"/><path d="M${x - r * 0.22} ${y + r * 0.62} Q${x - r * 0.25} ${y + r * 0.25} ${x} ${y + r * 0.28} Q${x + r * 0.25} ${y + r * 0.25} ${x + r * 0.22} ${y + r * 0.62} Q${x + r * 0.11} ${y + r * 0.52} ${x} ${y + r * 0.64} Q${x - r * 0.11} ${y + r * 0.52} ${x - r * 0.22} ${y + r * 0.62}"/>`; } return s; } },
  };
  function bouquet(kind, sw = 1.4) {
    const F = FLOWERS[kind] || FLOWERS.daisy; let s = '';
    const heads = F.sprig ? [[32, 52, 16], [52, 40, 18], [72, 56, 15]] : [[30, 46, 15], [52, 32, 18], [73, 50, 14]];
    heads.forEach(([x, y, r], i) => { s += `<path d="M50 136 Q${(50 + x) / 2 + (i - 1) * 4} ${(136 + y) / 2 + 10} ${x} ${y + (F.sprig ? r * 1.6 : r * 0.9)}"/>`; s += F.head(x, y, r); });
    s += leaf(46, 112, 26, 205) + leaf(54, 106, 26, -25) + leaf(48, 92, 20, 235) + leaf(53, 86, 20, -55);
    return `<g ${LS(sw)}>${s}</g>`;
  }
  const ICONS = {
    mountain: sw => `<g ${LS(sw)}><path d="M5 80 L35 30 L50 52 L62 36 L95 80 Z"/><path d="M27 43 L35 30 L43 43 L39 40 L35 45 L31 40 Z"/><path d="M55 46 L62 36 L69 46"/><circle cx="72" cy="22" r="8"/><path d="M14 80 L20 64 L26 80 M17 72 L23 72"/><path d="M82 80 L87 66 L92 80"/><path d="M0 88 L100 88"/></g>`,
    heart: sw => `<g ${LS(sw)}><path d="M50 85 C10 60 5 30 25 20 C38 14 48 22 50 32 C52 22 62 14 75 20 C95 30 90 60 50 85 Z"/></g>`,
    paw: () => `<g fill="#000"><ellipse cx="50" cy="62" rx="20" ry="16"/><ellipse cx="25" cy="38" rx="8" ry="11"/><ellipse cx="42" cy="26" rx="8" ry="11"/><ellipse cx="58" cy="26" rx="8" ry="11"/><ellipse cx="75" cy="38" rx="8" ry="11"/></g>`,
    coffee: sw => `<g ${LS(sw)}><path d="M18 40 L78 40 L72 85 L24 85 Z"/><path d="M78 50 Q95 50 92 62 Q90 72 75 72"/><path d="M38 30 Q32 22 38 14 M50 30 Q44 22 50 14 M62 30 Q56 22 62 14"/></g>`,
  };

  // ---- Flat animals (few thread colours) in a -1..1 box ----
  const C = { dark: '#3a2f2a', light: '#f7efe2', pink: '#e7a3a3' };
  const eyes = (y = -0.05, dx = 0.28, r = 0.08) => `<circle cx="${-dx}" cy="${y}" r="${r}" fill="${C.dark}"/><circle cx="${dx}" cy="${y}" r="${r}" fill="${C.dark}"/>`;
  const ANIMALS = {
    lion: { label: 'Lion', svg() { let m = ''; for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14; m += `<circle cx="${(Math.cos(a) * 0.72).toFixed(3)}" cy="${(Math.sin(a) * 0.72).toFixed(3)}" r="0.28"/>`; } return `<g fill="#c98a3d">${m}<circle r="0.75"/></g><circle cx="-0.42" cy="-0.42" r="0.17" fill="#e8b86a"/><circle cx="0.42" cy="-0.42" r="0.17" fill="#e8b86a"/><circle r="0.55" fill="#e8b86a"/>${eyes(-0.1, 0.22, 0.07)}<ellipse cx="-0.12" cy="0.22" rx="0.16" ry="0.13" fill="${C.light}"/><ellipse cx="0.12" cy="0.22" rx="0.16" ry="0.13" fill="${C.light}"/><path d="M-0.1 0.06 L0.1 0.06 L0 0.17 Z" fill="${C.dark}"/>`; } },
    elephant: { label: 'Elephant', svg() { return `<ellipse cx="-0.62" cy="-0.05" rx="0.38" ry="0.48" fill="#9aa3a8"/><ellipse cx="0.62" cy="-0.05" rx="0.38" ry="0.48" fill="#9aa3a8"/><ellipse cx="-0.6" cy="-0.02" rx="0.22" ry="0.3" fill="${C.pink}"/><ellipse cx="0.6" cy="-0.02" rx="0.22" ry="0.3" fill="${C.pink}"/><circle r="0.55" fill="#b3bbc0"/><path d="M-0.13 0.2 Q-0.15 0.75 0.18 0.85 Q0.32 0.86 0.3 0.74 Q0.12 0.68 0.13 0.2 Z" fill="#b3bbc0"/>${eyes(-0.1, 0.24, 0.07)}`; } },
    bear: { label: 'Bear', svg() { return `<circle cx="-0.5" cy="-0.5" r="0.24" fill="#a8774f"/><circle cx="0.5" cy="-0.5" r="0.24" fill="#a8774f"/><circle cx="-0.5" cy="-0.5" r="0.12" fill="#e2c3a0"/><circle cx="0.5" cy="-0.5" r="0.12" fill="#e2c3a0"/><circle r="0.68" fill="#a8774f"/><ellipse cx="0" cy="0.22" rx="0.3" ry="0.22" fill="#e2c3a0"/><ellipse cx="0" cy="0.13" rx="0.1" ry="0.07" fill="${C.dark}"/>${eyes(-0.12, 0.26, 0.07)}`; } },
    bunny: { label: 'Bunny', svg() { return `<ellipse cx="-0.25" cy="-0.75" rx="0.16" ry="0.45" fill="#efe7dc"/><ellipse cx="0.25" cy="-0.75" rx="0.16" ry="0.45" fill="#efe7dc"/><ellipse cx="-0.25" cy="-0.72" rx="0.07" ry="0.32" fill="${C.pink}"/><ellipse cx="0.25" cy="-0.72" rx="0.07" ry="0.32" fill="${C.pink}"/><circle cx="0" cy="0.05" r="0.55" fill="#efe7dc" stroke="#cbbfae" stroke-width="0.04"/>${eyes(0, 0.22, 0.065)}<ellipse cx="0" cy="0.17" rx="0.07" ry="0.05" fill="${C.pink}"/>`; } },
  };
  const animal = (name, cx, cy, r) => ANIMALS[name] ? `<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${r.toFixed(3)})">${ANIMALS[name].svg()}</g>` : '';

  return { FILES, FONT_LABELS, font, loadAll, shape, fitText, arcText, doc, toCanvas, svgBlob, esc, FLOWERS, bouquet, ICONS, ANIMALS, animal, LS };
})();
