// Laser engraving designs: one colour (black on transparent), SVG with outlined text + PNG, plus photo-to-engraving filter.
const ENG = (() => {
  // Typical sizes - confirm with your supplier/blank. Sources: Bonny Creations tumbler jig (20oz skinny 236x145mm,
  // 40oz Stanley-style 310x200mm wrap), Beer City Glass 40oz handle tumbler (3x4in front/back area), standard 3.5x2in card.
  const PRODUCTS = {
    skinny20: { label: '20oz skinny tumbler, wrap (typical 236 x 145 mm)', w: 236, h: 145, wrap: true },
    tumbler40: { label: '40oz handle tumbler, wrap (typical 310 x 200 mm)', w: 310, h: 200, wrap: true },
    t40front: { label: '40oz tumbler, front logo area (typical 3 x 4 in)', w: 76.2, h: 101.6 },
    card: { label: 'Wood business card (3.5 x 2 in)', w: 88.9, h: 50.8 },
    plaque: { label: 'Wood plaque / sign (8 x 10 in)', w: 203.2, h: 254 },
    custom: { label: 'Custom size (mm)', w: 100, h: 100 },
  };
  const DESIGNS = { name: 'Script name + subline', monogram: 'Monogram circle', flower: 'Birth-flower line art + name', badge: 'Logo badge (circle)', card: 'Business card layout' };

  async function build(o) {
    const P = PRODUCTS[o.product] || PRODUCTS.skinny20; const W = o.product === 'custom' ? (+o.w || 100) : P.w, H = o.product === 'custom' ? (+o.h || 100) : P.h;
    const F = { main: await VEC.font(o.font || 'script'), sans: await VEC.font('sans'), serif: await VEC.font('serif') };
    let boxes;
    if (P.wrap) { const bw = W * 0.34, bh = H * 0.86; boxes = o.both ? [W * 0.25, W * 0.75].map(cx => ({ x: cx - bw / 2, y: (H - bh) / 2, w: bw, h: bh })) : [{ x: W / 2 - bw / 2, y: (H - bh) / 2, w: bw, h: bh }]; }
    else { const m = Math.min(W, H) * 0.07; boxes = [{ x: m, y: m, w: W - 2 * m, h: H - 2 * m }]; }
    let inner = '';
    for (const b of boxes) inner += design(o.design === 'card' || o.product === 'card' && o.design === 'card' ? 'card' : o.design, b, o, F);
    if (o.guide) inner = `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#e33" stroke-width="0.3" stroke-dasharray="2 2"/>` + inner;
    return { svg: VEC.doc(W, H, inner), W, H };
  }

  function design(kind, b, o, F) {
    const sw = Math.max(0.5, Math.min(b.w, b.h) * 0.012); // line weight in mm (>= 0.5 mm, well above 1 pt minimums)
    const name = o.name || 'Name', sub = o.sub || '';
    if (kind === 'name') {
      if (o.vertical) { // rotate whole design 90 deg (classic skinny tumbler look)
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, rb = { x: cx - b.h / 2, y: cy - b.w / 2, w: b.h, h: b.w };
        return `<g transform="rotate(-90 ${cx} ${cy})">${nameBlock(rb, name, sub, F)}</g>`;
      }
      return nameBlock(b, name, sub, F);
    }
    if (kind === 'monogram') {
      const r = Math.min(b.w / 2, b.h * 0.36), cx = b.x + b.w / 2, cy = b.y + r;
      let s = `<g fill="none" stroke="#000"><circle cx="${cx}" cy="${cy}" r="${r - sw / 2}" stroke-width="${sw}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.88}" stroke-width="${sw * 0.5}"/></g>`;
      s += VEC.fitText(F.serif, (o.initial || name[0] || 'A').toUpperCase(), { x: cx - r * 0.5, y: cy - r * 0.55, w: r, h: r * 1.1 }).svg;
      s += VEC.fitText(F.main, name, { x: b.x, y: cy + r * 1.05, w: b.w, h: b.y + b.h - (cy + r * 1.05) }).svg;
      return s;
    }
    if (kind === 'flower') {
      const fh = b.h * 0.68, fw = fh * 100 / 140, sc = fw / 100;
      let s = `<g transform="translate(${b.x + (b.w - fw) / 2} ${b.y}) scale(${sc})">${VEC.bouquet(o.flower || 'daisy', sw / sc)}</g>`;
      s += VEC.fitText(F.main, name, { x: b.x, y: b.y + fh * 0.82, w: b.w, h: b.h - fh * 0.82 - (sub ? b.h * 0.08 : 0) }).svg;
      if (sub) s += VEC.fitText(F.sans, sub.toUpperCase(), { x: b.x + b.w * 0.2, y: b.y + b.h * 0.93, w: b.w * 0.6, h: b.h * 0.06 }, { sp: 0.25 }).svg;
      return s;
    }
    if (kind === 'badge') {
      const r = Math.min(b.w, b.h) / 2, cx = b.x + b.w / 2, cy = b.y + b.h / 2, band = r * 0.22;
      let s = `<g fill="none" stroke="#000"><circle cx="${cx}" cy="${cy}" r="${r - sw / 2}" stroke-width="${sw}"/><circle cx="${cx}" cy="${cy}" r="${r - band}" stroke-width="${sw * 0.6}"/></g>`;
      const cap = band * 0.5;
      s += VEC.arcText(F.sans, (o.name || 'Your Business').toUpperCase(), cx, cy, r - band + (band - cap) / 2, cap, true);
      if (sub) s += VEC.arcText(F.sans, sub.toUpperCase(), cx, cy, r - band + (band - cap) / 2, cap, false);
      s += `<g fill="#000"><circle cx="${cx - r + band / 2}" cy="${cy}" r="${band * 0.12}"/><circle cx="${cx + r - band / 2}" cy="${cy}" r="${band * 0.12}"/></g>`;
      const ir = (r - band) * 0.62, isc = ir * 2 / 100;
      s += `<g transform="translate(${cx - ir} ${cy - ir * 1.05}) scale(${isc})">${VEC.ICONS[o.icon || 'mountain'](sw / isc)}</g>`;
      return s;
    }
    if (kind === 'card') {
      const lw = b.h; const r = lw * 0.42, cx = b.x + lw * 0.45, cy = b.y + b.h / 2;
      let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#000" stroke-width="${sw}"/>`;
      const ir = r * 0.7, isc = ir * 2 / 100; s += `<g transform="translate(${cx - ir} ${cy - ir * 1.05}) scale(${isc})">${VEC.ICONS[o.icon || 'mountain'](sw / isc)}</g>`;
      const tx = b.x + lw * 0.98, tw = b.w - lw * 0.98; const lines = (o.contact || '').split('\n').filter(Boolean).slice(0, 4);
      s += VEC.fitText(F.serif, name, { x: tx, y: b.y + b.h * 0.08, w: tw, h: b.h * 0.24 }, { }).svg.replace('<g ', '<g data-a="l" ');
      if (sub) s += VEC.fitText(F.sans, sub.toUpperCase(), { x: tx, y: b.y + b.h * 0.36, w: tw, h: b.h * 0.09 }, { sp: 0.2 }).svg;
      lines.forEach((l, i) => s += VEC.fitText(F.sans, l, { x: tx, y: b.y + b.h * (0.56 + i * 0.12), w: tw, h: b.h * 0.075 }).svg);
      return s;
    }
    return nameBlock(b, name, sub, F);
  }
  function nameBlock(b, name, sub, F) {
    const nh = sub ? b.h * 0.72 : b.h; let s = VEC.fitText(F.main, name, { x: b.x, y: b.y, w: b.w, h: nh }).svg;
    if (sub) s += VEC.fitText(F.sans, sub.toUpperCase(), { x: b.x + b.w * 0.1, y: b.y + b.h * 0.82, w: b.w * 0.8, h: b.h * 0.12 }, { sp: 0.3 }).svg;
    return s;
  }

  // ---- Photo -> engraving style ----
  // mode: 'gray' (high-contrast grayscale), 'sketch' (pencil sketch), 'dither' (pure black/white dots, what many lasers want)
  function photo(img, o) {
    const dpi = o.dpi || 300, W = Math.round(o.wIn * dpi), H = Math.round(o.hIn * dpi);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const sc = Math.max(W / img.width, H / img.height); x.drawImage(img, (W - img.width * sc) / 2, (H - img.height * sc) / 2, img.width * sc, img.height * sc);
    const id = x.getImageData(0, 0, W, H), d = id.data, n = W * H, g = new Float32Array(n);
    const ct = (o.contrast ?? 30) / 100 + 1, br = (o.brightness ?? 0) * 2.55;
    for (let i = 0; i < n; i++) { let v = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; v = (v - 128) * ct + 128 + br; g[i] = v < 0 ? 0 : v > 255 ? 255 : v; }
    if (o.mode === 'sketch') {
      const inv = new Float32Array(n); for (let i = 0; i < n; i++) inv[i] = 255 - g[i];
      const bl = blur(inv, W, H, Math.max(2, Math.round(Math.min(W, H) / 180)));
      for (let i = 0; i < n; i++) { const v = bl[i] >= 255 ? 255 : Math.min(255, g[i] * 255 / (255 - bl[i])); g[i] = v < 255 ? Math.pow(v / 255, 2.2) * 255 : 255; }
    } else if (o.mode === 'dither') {
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
        const i = y * W + xx, old = g[i], nw = old < 128 ? 0 : 255, e = old - nw; g[i] = nw;
        if (xx + 1 < W) g[i + 1] += e * 7 / 16; if (y + 1 < H) { if (xx > 0) g[i + W - 1] += e * 3 / 16; g[i + W] += e * 5 / 16; if (xx + 1 < W) g[i + W + 1] += e / 16; }
      }
    }
    const oval = o.shape === 'oval';
    for (let i = 0; i < n; i++) {
      const v = g[i] < 0 ? 0 : g[i] > 255 ? 255 : g[i]; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
      if (oval) { const px = (i % W) / W - 0.5, py = Math.floor(i / W) / H - 0.5; if (px * px / 0.25 + py * py / 0.25 > 1) d[i * 4 + 3] = 0; }
    }
    x.putImageData(id, 0, 0); return c;
  }
  function blur(src, W, H, r) { // 3x separable box blur
    let a = src, b = new Float32Array(src.length);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < H; y++) { let s = 0; const o = y * W; for (let x = -r; x <= r; x++) s += a[o + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { b[o + x] = s / (2 * r + 1); s += a[o + Math.min(W - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
      [a, b] = [b, a];
      for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += a[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { b[y * W + x] = s / (2 * r + 1); s += a[Math.min(H - 1, y + r + 1) * W + x] - a[Math.max(0, y - r) * W + x]; } }
      [a, b] = [b, a];
    }
    return a;
  }
  return { PRODUCTS, DESIGNS, build, photo };
})();
