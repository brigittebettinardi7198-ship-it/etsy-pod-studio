// Print-on-demand designs for Printify: transparent PNGs at verified print-file sizes
const POD = (() => {
  // Sizes verified against Printify's own guides (Oct 2026):
  //  - Apparel master file 4500x5400 px @300 DPI (15x18 in) - printify.com/knowledge-hub/png-file-setup-for-tshirts/
  //  - 11oz mug full wrap 2475x1155 px (8.25x3.85 in) - printify.com/knowledge-hub/how-to-design-and-sell-pod-mugs/
  // Exact sizes vary by print provider; always confirm in Printify's Product Creator upload panel.
  const PRODUCTS = {
    tee: { label: 'T-shirt / Hoodie / Sweatshirt front (4500 x 5400)', w: 4500, h: 5400 },
    mug11: { label: '11oz Mug full wrap (2475 x 1155)', w: 2475, h: 1155 },
    custom: { label: 'Custom size (enter pixels)', w: 3000, h: 3000 },
  };
  const STYLES = {
    retro: { name: 'Retro Bold (shadow)' }, scriptblock: { name: 'Script + Block' }, arched: { name: 'Arched Top Line' },
    cute: { name: 'Cute Rounded (outline)' }, minimal: { name: 'Minimal Spaced' }, handwritten: { name: 'Handwritten' },
    varsityScript: { name: 'Varsity block + script (leopard trend)' }, varsitySerif: { name: 'Varsity block + spaced serif' },
  };
  const FILLS = { solid: 'Solid color', leopard: 'Leopard print', cheetah: 'Cheetah spots', checker: 'Checkered', floral: 'Ditsy floral', cow: 'Cow print' };
  const tiles = {};
  function tile(kind, c1, c2) {
    const key = kind + c1 + c2; if (tiles[key]) return tiles[key];
    const T = 256, c = document.createElement('canvas'); c.width = c.height = T; const x = c.getContext('2d'); const r = U.rng(42);
    const wrap = (fn) => { for (const dx of [-T, 0, T]) for (const dy of [-T, 0, T]) { x.save(); x.translate(dx, dy); fn(); x.restore(); } };
    const blob = (cx, cy, rx, ry, rot) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2); x.fill(); };
    if (kind === 'leopard') {
      x.fillStyle = '#d8b98e'; x.fillRect(0, 0, T, T);
      const spots = []; const G = 5, cell = T / G;
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
        const R = 9 + r() * 6, a = r() * 6, n = 4 + Math.floor(r() * 2), frags = [];
        for (let k = 0; k < n; k++) { const t = a + k * Math.PI * 2 / n + (r() - 0.5) * 0.5; if (r() > 0.12) frags.push([t, 0.32 + r() * 0.16]); }
        spots.push([(i + 0.5 + (j % 2) * 0.5) * cell + (r() - 0.5) * cell * 0.35, (j + 0.5) * cell + (r() - 0.5) * cell * 0.35, R, a, frags]);
      }
      wrap(() => spots.forEach(([cx, cy, R, a, frags]) => {
        x.fillStyle = '#b07f50'; blob(cx, cy, R * 0.72, R * 0.58, a);
        x.fillStyle = '#2b1d15'; frags.forEach(([t, L]) => blob(cx + Math.cos(t) * R, cy + Math.sin(t) * R * 0.85, R * L, R * 0.19, t + Math.PI / 2));
      }));
    } else if (kind === 'cheetah') {
      x.fillStyle = '#e2c290'; x.fillRect(0, 0, T, T); const sp = []; for (let i = 0; i < 40; i++) sp.push([r() * T, r() * T, 5 + r() * 6, r() * 3]);
      x.fillStyle = '#2b1d15'; wrap(() => sp.forEach(([cx, cy, R, a]) => blob(cx, cy, R, R * 0.8, a)));
    } else if (kind === 'checker') {
      const q = T / 4; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#f6efe3' : c1; x.fillRect(i * q, j * q, q, q); }
    } else if (kind === 'cow') {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, T, T); const sp = []; for (let i = 0; i < 6; i++) sp.push([r() * T, r() * T, 22 + r() * 18]);
      x.fillStyle = '#1e1a18'; wrap(() => sp.forEach(([cx, cy, R]) => { x.beginPath(); for (let k = 0; k < 9; k++) { const t = k * Math.PI * 2 / 9, rr = R * (0.7 + r() * 0.5); x[k ? 'lineTo' : 'moveTo'](cx + Math.cos(t) * rr, cy + Math.sin(t) * rr * 0.8); } x.closePath(); x.fill(); }));
    } else { // floral
      x.fillStyle = c1; x.fillRect(0, 0, T, T); const fl = []; for (let i = 0; i < 12; i++) fl.push([r() * T, r() * T, 9 + r() * 6]);
      wrap(() => fl.forEach(([cx, cy, R]) => { x.fillStyle = '#fffaf2'; for (let k = 0; k < 5; k++) { const t = k * Math.PI * 2 / 5; blob(cx + Math.cos(t) * R * 0.6, cy + Math.sin(t) * R * 0.6, R * 0.5, R * 0.5, 0); } x.fillStyle = '#f2c14e'; blob(cx, cy, R * 0.32, R * 0.32, 0); }));
    }
    return (tiles[key] = c);
  }
  function fillFor(ctx, s, px) {
    if (!s.color || typeof s.color === 'string') return s.color;
    const pat = ctx.createPattern(tile(s.color.pattern, s.color.c1, s.color.c2), 'repeat'); const k = px / 256 * (s.color.pattern === 'leopard' || s.color.pattern === 'cheetah' ? 0.75 : 1.1);
    pat.setTransform(new DOMMatrix().scale(k, k)); return pat;
  }

  function lineSpecs(style, lines, c1, c2, fill) {
    const main = fill && fill !== 'solid' ? { pattern: fill, c1, c2 } : c1;
    return lines.map((t, i) => {
      switch (style) {
        case 'varsityScript': return i === 0 ? { t: t.toUpperCase(), font: 'Graduate', w: '400', color: main, outline: c2, outer: '#f5ecdc', squeeze: 0.8, gap: 1.0 } : { t: t.toLowerCase(), font: 'Allura', w: '400', color: c2, gap: 1.0, max: 0.2, wmax: 0.6 };
        case 'varsitySerif': return i === 0 ? { t: t.toUpperCase(), font: 'Graduate', w: '400', color: main, outline: c2, outer: '#f5ecdc', squeeze: 0.8, gap: 1.0 } : { t: t.toUpperCase(), font: 'Playfair Display', w: '700', color: fill && fill !== 'solid' ? '#c49a6c' : c2, sp: 0.35, gap: 1.3, max: 0.11, wmax: 0.62 };
        case 'retro': return { t, font: 'Shrikhand', w: '400', color: main, shadow: c2, gap: 0.98 };
        case 'scriptblock': return i === 0 ? { t, font: 'Great Vibes', w: '400', color: c2, gap: 1.0, max: 0.36 } : { t: t.toUpperCase(), font: 'Bebas Neue', w: '400', color: c1, gap: 0.92 };
        case 'arched': return i === 0 ? { t: t.toUpperCase(), font: 'Bebas Neue', w: '400', color: c2, arch: true, sp: 0.06 } : { t, font: 'Abril Fatface', w: '400', color: c1, gap: 1.05 };
        case 'cute': return { t, font: 'Fredoka', w: '600', color: main, outline: c2, gap: 1.05 };
        case 'minimal': return { t: t.toUpperCase(), font: 'Josefin Sans', w: '600', color: c1, sp: 0.3, gap: 1.6, max: 0.12 };
        default: return { t, font: 'Caveat', w: '700', color: c1, gap: 1.0 };
      }
    });
  }

  function drawText(ctx, box, specs) {
    const measure = (s, px) => { ctx.font = `${s.w} ${px}px "${s.font}"`; return ART.spacedWidth(ctx, s.t, (s.sp || 0) * px) * (s.squeeze || 1); };
    const rows = specs.filter(s => s.t.trim()).map(s => {
      let px = 100 * (box.w * (s.arch ? 0.8 : (s.wmax || 0.94))) / Math.max(1, measure(s, 100));
      px = Math.min(px, box.h * (s.max || 0.34)); return { s, px };
    });
    const hOf = r => r.s.arch ? r.px * 1.5 : r.px * (r.s.gap || 1);
    let tot = rows.reduce((a, r) => a + hOf(r), 0); const k = tot > box.h ? box.h / tot : 1;
    rows.forEach(r => r.px *= k); tot *= k;
    let y = box.y + (box.h - tot) / 2; const cx = box.x + box.w / 2;
    ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    for (const { s, px } of rows) {
      ctx.font = `${s.w} ${px}px "${s.font}"`; const sp = (s.sp || 0) * px;
      if (s.arch) {
        const R = box.w * 0.75, tw = ART.spacedWidth(ctx, s.t, sp), ang = tw / R; const ccy = y + px * 1.1 + R;
        let a = -Math.PI / 2 - ang / 2; ctx.fillStyle = s.color; ctx.textAlign = 'center';
        for (const ch of s.t) { const cw = ctx.measureText(ch).width; a += (cw / 2) / R; ctx.save(); ctx.translate(cx + Math.cos(a) * R, ccy + Math.sin(a) * R); ctx.rotate(a + Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore(); a += (cw / 2 + sp) / R; }
        y += px * 1.5; continue;
      }
      const base = y + px * 0.8;
      ctx.save(); ctx.translate(cx, base); if (s.squeeze) ctx.scale(s.squeeze, 1);
      if (s.shadow) { ctx.fillStyle = s.shadow; ART.drawSpaced(ctx, s.t, px * 0.06, px * 0.06, sp); }
      ctx.textAlign = 'center';
      if (s.outer) { ctx.strokeStyle = s.outer; ctx.lineWidth = px * 0.17; ctx.strokeText(s.t, 0, 0); }
      if (s.outline) { ctx.strokeStyle = s.outline; ctx.lineWidth = px * (s.outer ? 0.07 : 0.14); ctx.strokeText(s.t, 0, 0); }
      ctx.fillStyle = fillFor(ctx, s, px); ART.drawSpaced(ctx, s.t, 0, 0, sp);
      ctx.restore();
      y += px * (s.gap || 1);
    }
  }

  // o: {product, w, h, mode:'quote'|'illus'|'combo', style, text, c1, c2, motif, pal, image, solid, mugLayout:'both'|'center'}
  function render(o, scale = 1) {
    const prod = PRODUCTS[o.product] || PRODUCTS.tee; const Wf = o.product === 'custom' ? (o.w || 3000) : prod.w, Hf = o.product === 'custom' ? (o.h || 3000) : prod.h;
    const W = Math.round(Wf * scale), H = Math.round(Hf * scale); const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'); ART.setSolid(o.solid !== false);
    const P = ART.PALETTES[o.pal] || ART.PALETTES.strawberry; const r = U.rng(o.seed || 7);
    const boxes = (o.product === 'mug11' && o.mugLayout !== 'center') ? [{ x: W * 0.06, y: H * 0.06, w: W * 0.36, h: H * 0.88 }, { x: W * 0.58, y: H * 0.06, w: W * 0.36, h: H * 0.88 }] : [{ x: W * 0.04, y: H * 0.04, w: W * 0.92, h: H * 0.92 }];
    const lines = (o.text || '').split('\n').map(s => s.trim()).filter(Boolean);
    for (const b of boxes) {
      const art = o.image || o.motif;
      if (o.mode === 'illus' || (o.mode === 'combo' && !lines.length)) drawArt(ctx, art, b, P, r);
      else if (o.mode === 'combo') {
        const ih = b.h * 0.5; drawArt(ctx, art, { x: b.x, y: b.y, w: b.w, h: ih }, P, r);
        drawText(ctx, { x: b.x, y: b.y + ih + b.h * 0.03, w: b.w, h: b.h - ih - b.h * 0.03 }, lineSpecs(o.style, lines, o.c1, o.c2, o.fill));
      } else drawText(ctx, b, lineSpecs(o.style, lines, o.c1, o.c2, o.fill));
    }
    ART.setSolid(false);
    return cv;
  }
  function drawArt(ctx, art, b, P, r) {
    const s = Math.min(b.w, b.h) * 0.95;
    if (art && typeof art === 'object') { const sc = Math.min(b.w / art.width, b.h / art.height) * 0.98; ctx.drawImage(art, b.x + (b.w - art.width * sc) / 2, b.y + (b.h - art.height * sc) / 2, art.width * sc, art.height * sc); }
    else ART.drawMotif(ctx, art || 'strawberry', b.x + b.w / 2, b.y + b.h / 2, s, 0, P, r);
  }
  return { PRODUCTS, STYLES, FILLS, render };
})();
