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
  };

  function lineSpecs(style, lines, c1, c2) {
    return lines.map((t, i) => {
      switch (style) {
        case 'retro': return { t, font: 'Shrikhand', w: '400', color: c1, shadow: c2, gap: 0.98 };
        case 'scriptblock': return i === 0 ? { t, font: 'Great Vibes', w: '400', color: c2, gap: 1.0, max: 0.36 } : { t: t.toUpperCase(), font: 'Bebas Neue', w: '400', color: c1, gap: 0.92 };
        case 'arched': return i === 0 ? { t: t.toUpperCase(), font: 'Bebas Neue', w: '400', color: c2, arch: true, sp: 0.06 } : { t, font: 'Abril Fatface', w: '400', color: c1, gap: 1.05 };
        case 'cute': return { t, font: 'Fredoka', w: '600', color: c1, outline: c2, gap: 1.05 };
        case 'minimal': return { t: t.toUpperCase(), font: 'Josefin Sans', w: '600', color: c1, sp: 0.3, gap: 1.6, max: 0.12 };
        default: return { t, font: 'Caveat', w: '700', color: c1, gap: 1.0 };
      }
    });
  }

  function drawText(ctx, box, specs) {
    const measure = (s, px) => { ctx.font = `${s.w} ${px}px "${s.font}"`; return ART.spacedWidth(ctx, s.t, (s.sp || 0) * px); };
    const rows = specs.filter(s => s.t.trim()).map(s => {
      let px = 100 * (box.w * (s.arch ? 0.8 : 0.94)) / Math.max(1, measure(s, 100));
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
      if (s.shadow) { ctx.fillStyle = s.shadow; ART.drawSpaced(ctx, s.t, cx + px * 0.06, base + px * 0.06, sp); }
      if (s.outline) { ctx.strokeStyle = s.outline; ctx.lineWidth = px * 0.14; ctx.textAlign = 'center'; ctx.strokeText(s.t, cx, base); }
      ctx.fillStyle = s.color; ART.drawSpaced(ctx, s.t, cx, base, sp);
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
        drawText(ctx, { x: b.x, y: b.y + ih + b.h * 0.03, w: b.w, h: b.h - ih - b.h * 0.03 }, lineSpecs(o.style, lines, o.c1, o.c2));
      } else drawText(ctx, b, lineSpecs(o.style, lines, o.c1, o.c2));
    }
    ART.setSolid(false);
    return cv;
  }
  function drawArt(ctx, art, b, P, r) {
    const s = Math.min(b.w, b.h) * 0.95;
    if (art && typeof art === 'object') { const sc = Math.min(b.w / art.width, b.h / art.height) * 0.98; ctx.drawImage(art, b.x + (b.w - art.width * sc) / 2, b.y + (b.h - art.height * sc) / 2, art.width * sc, art.height * sc); }
    else ART.drawMotif(ctx, art || 'strawberry', b.x + b.w / 2, b.y + b.h / 2, s, 0, P, r);
  }
  return { PRODUCTS, STYLES, render };
})();
