// Baby name designs: embroidery-ready blanket art (flat thread colours) and yarn / i-cord rope-basket lettering.
const NAM = (() => {
  const THREADS = {
    sage: { name: 'Sage & tan', fill: '#7d8b5a', edge: '#4b5536' }, blue: { name: 'Baby blue', fill: '#7fa6c9', edge: '#3f5f7f' },
    blush: { name: 'Blush pink', fill: '#e3a1a8', edge: '#9c5a63' }, neutral: { name: 'Oatmeal neutral', fill: '#b89a78', edge: '#6b5440' },
    navy: { name: 'Navy & cream', fill: '#2f4a6d', edge: '#1c2c42' },
  };
  const YARNS = {
    ocean: { name: 'Ocean blues (like the bestseller)', c: ['#5f86b3', '#8aa1b8', '#b49a7c', '#a7a3c9', '#4f7396', '#9db7cf'] },
    rainbow: { name: 'Soft rainbow', c: ['#e58f8f', '#f2b279', '#e9cf72', '#9fcb94', '#8fb8db', '#b8a1d9'] },
    blushsage: { name: 'Blush & sage', c: ['#d99aa1', '#9fb08a', '#e8c3a6', '#c4a7c9', '#b7c7a3'] },
    neutral: { name: 'Neutrals', c: ['#b08d6a', '#d6c2a5', '#8c7a6b', '#c9a98a', '#a39787'] },
    pinks: { name: 'Pinks & lilac', c: ['#e48fa6', '#f2b8c6', '#c9a0dc', '#e7a1b0', '#b48ad0'] },
  };
  const SETS = { lion: ['lion'], elephant: ['elephant'], bear: ['bear'], bunny: ['bunny'], safari: ['elephant', 'lion'], forest: ['bear', 'bunny'], none: [] };

  // Embroidery: name with satin-style border + animals left/right. Units: mm.
  async function blanket(o) {
    const W = (o.wIn || 10) * 25.4, H = W * 0.42, f = await VEC.font(o.font || 'varsity'), T = THREADS[o.thread] || THREADS.sage;
    const an = SETS[o.animals] || [], ar = H * 0.36, m = W * 0.03;
    const left = an.length ? ar * 2 + m : 0, right = an.length > 1 ? ar * 2 + m : 0;
    let s = VEC.fitText(f, o.name || 'Oliver', { x: m + left, y: H * 0.12, w: W - 2 * m - left - right, h: H * 0.76 }, { fill: T.fill, stroke: T.edge, strokeW: Math.max(0.8, H * 0.012) }).svg;
    if (an[0]) s = VEC.animal(an[0], m + ar, H * 0.55, ar) + s;
    if (an[1]) s += VEC.animal(an[1], W - m - ar, H * 0.55, ar);
    const svg = VEC.doc(+W.toFixed(2), +H.toFixed(2), s);
    const colors = [...new Set((svg.match(/(?:fill|stroke)="(#[0-9a-fA-F]{6})"/g) || []).map(x => x.slice(-8, -1).toLowerCase()))];
    return { svg, W, H, colors };
  }

  // Yarn / i-cord lettering. mode: 'mockup' (on a rope basket), 'letters' (transparent, textured), 'guide' (stitch guide outlines)
  async function yarn(o) {
    const nameW = (o.wIn || 9) * 25.4, f = await VEC.font('yarn'), cols = (YARNS[o.yarn] || YARNS.ocean).c, mode = o.mode || 'mockup';
    const W = mode === 'mockup' ? nameW * 1.45 : nameW + 20, H = mode === 'mockup' ? W * 0.72 : nameW * 0.42 + (mode === 'guide' ? 40 : 20);
    const name = o.name || 'Wyatt', box = mode === 'mockup' ? { x: (W - nameW) / 2, y: H * 0.28, w: nameW, h: H * 0.42 } : { x: 10, y: 10, w: nameW, h: nameW * 0.42 };
    let defs = '', bg = '', body = '';
    if (mode === 'guide') {
      const t = VEC.fitText(f, name, box, { fill: 'none', stroke: '#000', strokeW: 0.5, attrs: () => ' stroke-dasharray="0"' });
      body = t.svg;
      const leg = t.glyphs.map((g, k) => `<g transform="translate(${10 + k * Math.min(46, (W - 20) / t.glyphs.length)} ${H - 22})"><rect width="9" height="9" rx="2" fill="${cols[k % cols.length]}" stroke="#000" stroke-width="0.3"/><text x="12" y="7.5" font-family="Arial" font-size="7">${k + 1}: ${cols[k % cols.length]}</text></g>`).join('');
      const nums = t.glyphs.map((g, k) => `<text x="${(t.tx + (g.b.x1 + g.b.x2) / 2 * t.s).toFixed(1)}" y="${(t.ty + g.b.y2 * t.s + 7).toFixed(1)}" font-family="Arial" font-size="6" text-anchor="middle" fill="#c33">${k + 1}</text>`).join('');
      body += nums + leg + `<text x="10" y="${H - 4}" font-family="Arial" font-size="5" fill="#555">Stitch guide at actual size (${(nameW / 25.4).toFixed(1)} in wide). Trace outline, couch i-cord along the letters; numbers = yarn colour.</text>`;
      return { svg: VEC.doc(+W.toFixed(1), +H.toFixed(1), `<rect width="100%" height="100%" fill="#fff"/>` + body), W, H };
    }
    // knit texture: little V stitches
    defs = `<pattern id="knit" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0 L1.6 2.2 L3.2 0" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="0.55"/><path d="M0 1.2 L1.6 3.4 L3.2 1.2" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="0.4"/></pattern>
      <filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0.6" dy="1.2" stdDeviation="0.9" flood-color="#000" flood-opacity="0.35"/></filter>`;
    const t = VEC.fitText(f, name, box, { fill: k => cols[k % cols.length], stroke: '#000', strokeW: 0 });
    const shade = c => ART.shade(c, -0.25);
    const letters = t.glyphs.map((g, k) => `<path d="${g.d}" fill="${cols[k % cols.length]}" stroke="${shade(cols[k % cols.length])}" stroke-width="${(0.7 / t.s).toFixed(3)}"/><path d="${g.d}" fill="url(#knit)"/>`).join('');
    body = `<g filter="url(#sh)"><g transform="translate(${t.tx.toFixed(2)} ${t.ty.toFixed(2)}) scale(${t.s.toFixed(4)})">${letters}</g></g>`;
    if (mode === 'mockup') {
      defs += `<pattern id="rope" width="40" height="7" patternUnits="userSpaceOnUse"><rect width="40" height="7" fill="#efe7d8"/><path d="M0 6.5 H40" stroke="#d8ccb6" stroke-width="1.2"/><path d="M0 1 H40" stroke="#fbf7ef" stroke-width="1"/><path d="M0 3.5 Q5 2.5 10 3.5 T20 3.5 T30 3.5 T40 3.5" fill="none" stroke="#e3d8c4" stroke-width="0.6"/></pattern>
        <radialGradient id="vig" cx="50%" cy="45%" r="70%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.18"/></radialGradient>`;
      bg = `<rect width="${W}" height="${H}" fill="url(#rope)"/><rect width="${W}" height="${H}" fill="url(#vig)"/>`;
    }
    return { svg: VEC.doc(+W.toFixed(1), +H.toFixed(1), bg + body, defs), W, H };
  }
  return { THREADS, YARNS, SETS, blanket, yarn };
})();
