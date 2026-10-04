// Party bundle: 5x7 invite, phone invite, welcome sign, cupcake toppers, favor tags, thank-you card
const INV = (() => {
  const DPI = 300;
  const PIECES = {
    invite: { label: '5x7 Invitation', w: 5, h: 7, pdf: true },
    phone: { label: 'Phone Invite (1080x1920)', px: [1080, 1920], pdf: false },
    welcome: { label: 'Welcome Sign 11x14', w: 11, h: 14, pdf: true },
    toppers: { label: 'Cupcake Toppers (2in, letter sheet)', w: 8.5, h: 11, pdf: true },
    tags: { label: 'Favor Tags (3.5x2in, letter sheet)', w: 8.5, h: 11, pdf: true },
    thanks: { label: 'Thank-You Card 6x4', w: 6, h: 4, pdf: true },
  };

  const TITLES = {
    first: { strawberry: 'Berry First', wildflower: 'Wild One', ladybug: 'Little Ladybug', bows: 'Bow-tiful One', rainbow: 'One Happy Girl', stars: 'Twinkle One', balloons: 'Party of One', bees: 'Sweet One' },
    birthday: { strawberry: 'Berry Sweet', wildflower: 'Wildflower', ladybug: 'Ladybug', bows: 'Pretty in Bows', rainbow: 'Over the Rainbow', stars: 'Starry Night', balloons: 'Let\'s Party', bees: 'Bee Day' },
    baby: { strawberry: 'Berry Sweet', wildflower: 'Little Wildflower', ladybug: 'Little Ladybug', bows: 'Oh Baby', rainbow: 'Rainbow Baby', stars: 'Twinkle Little Star', balloons: 'Oh Baby', bees: 'Mommy to Bee' },
  };

  function defaults(event, theme) {
    const t = TITLES[event][theme] || 'Sweet One';
    if (event === 'baby') return { top: 'Please join us for a', name: '', title: t, sub: 'Baby Shower', invite: 'Honoring', accent: 'Mom-to-be Emma', d1: 'Saturday', d2: 'May 16th', p1: 'Garden House', p2: '456 Oak Street', t1: '1:00 PM', t2: '4:00 PM', rsvp: 'RSVP to Kate at 123-456-7890', thanks: 'Thank you', thanksSub: 'for celebrating baby with us', age: 'Baby', welcome: 'Welcome to' };
    if (event === 'first') return { top: 'Our sweet', name: 'Olivia\'s', title: t, sub: 'Birthday!', invite: 'Please join us to celebrate', accent: 'Olivia is turning one!', d1: 'Sunday', d2: 'September 14th', p1: 'Earth House', p2: '456 Oak Street', t1: '1:00 PM', t2: 'to 4:00 PM', rsvp: 'RSVP to Kate at 123-456-7890', thanks: 'Thank you', thanksSub: 'for celebrating with us', age: '1', welcome: 'Welcome to' };
    return { top: 'You\'re invited to', name: 'Ava\'s', title: t, sub: 'Birthday Party', invite: 'Come celebrate with us', accent: 'Ava is turning five!', d1: 'Saturday', d2: 'June 7th', p1: 'Sunny Park', p2: '12 Maple Lane', t1: '2:00 PM', t2: 'to 5:00 PM', rsvp: 'RSVP to Mom at 123-456-7890', thanks: 'Thank you', thanksSub: 'for celebrating with me', age: '5', welcome: 'Welcome to' };
  }

  function blocksFor(piece, c) {
    if (piece === 'invite' || piece === 'phone') {
      const k = piece === 'phone' ? 1.12 : 1;
      const b = [
        { t: 'text', text: c.top, f: 'caps', size: 3.3 * k, sp: 0.25, upper: true },
        { t: 'text', text: c.name, f: 'serif', size: 6.5 * k, color: 'primary', upper: true, sp: 0.04 },
        { t: 'text', text: c.title, f: 'title', size: 11.5 * k, color: 'primary' },
        { t: 'text', text: c.sub, f: 'caps', size: 4.2 * k, sp: 0.22, upper: true },
        { t: 'gap', size: 2 },
        { t: 'text', text: c.invite, f: 'caps', size: 2.4 * k, sp: 0.18, upper: true },
        { t: 'text', text: c.accent, f: 'title', size: 4.8 * k, color: 'primary' },
        { t: 'divider' },
        { t: 'cols', items: [[c.d1, c.d2], [c.p1, c.p2], [c.t1, c.t2]], size: 2.3 * k },
        { t: 'gap', size: 1.5 },
        { t: 'text', text: c.rsvp, f: 'caps', size: 2.3 * k, sp: 0.14, upper: true },
      ];
      if (piece === 'phone') {
        const j = (a, sep) => a.filter(Boolean).join(sep);
        b.splice(8, 1, { t: 'text', text: j([c.d1, c.d2], ', '), f: 'caps', size: 3, sp: 0.12, upper: true }, { t: 'text', text: j([c.t1, c.t2], ' '), f: 'caps', size: 3, sp: 0.12, upper: true }, { t: 'text', text: j([c.p1, c.p2], ', '), f: 'caps', size: 3, sp: 0.12, upper: true });
        b.push({ t: 'gap', size: 2 }, { t: 'pill', text: 'Tap to RSVP', f: 'caps', size: 2.6, upper: true });
      }
      return b;
    }
    if (piece === 'welcome') return [
      { t: 'text', text: c.welcome, f: 'title', size: 7, color: 'text' },
      { t: 'text', text: c.name, f: 'serif', size: 7, color: 'primary', upper: true, sp: 0.04 },
      { t: 'text', text: c.title, f: 'title', size: 12, color: 'primary' },
      { t: 'text', text: c.sub, f: 'caps', size: 4.4, sp: 0.22, upper: true },
      { t: 'divider' },
      { t: 'text', text: [c.d1, c.d2].filter(Boolean).join(', '), f: 'caps', size: 2.6, sp: 0.2, upper: true },
    ];
    if (piece === 'thanks') return [
      { t: 'text', text: c.thanks, f: 'title', size: 13, color: 'primary' },
      { t: 'text', text: c.thanksSub, f: 'caps', size: 2.8, sp: 0.2, upper: true },
      { t: 'gap', size: 1 },
      { t: 'text', text: [c.name, c.title, c.sub].filter(Boolean).join(' '), f: 'caps', size: 2.2, sp: 0.15, upper: true, color: 'primary' },
    ];
    if (piece === 'tag') return [
      { t: 'text', text: c.thanks, f: 'title', size: 13, color: 'primary' },
      { t: 'text', text: c.thanksSub, f: 'caps', size: 3.6, sp: 0.18, upper: true },
      { t: 'text', text: (c.name || '').replace(/'s$/i, '') || c.accent, f: 'serif', size: 4.2, color: 'primary', upper: true, sp: 0.06 },
    ];
    return [];
  }

  function sizeOf(piece, scale = 1) {
    const d = PIECES[piece]; const [w, h] = d.px || [d.w * DPI, d.h * DPI];
    return [Math.round(w * scale), Math.round(h * scale)];
  }

  // Render a piece to a canvas. scale<1 for previews.
  function render(piece, s, scale = 1) {
    const [W, H] = sizeOf(piece, scale); const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'); const base = { theme: s.theme, pal: s.pal, seed: s.seed, images: s.images, textOn: s.textOn };
    if (piece === 'toppers') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      const d = 2 * DPI * scale, gx = (W - 3 * d) / 4, gy = (H - 4 * d) / 5;
      const T = ART.THEMES[s.theme], P = ART.PALETTES[s.pal], F = ART.FONTS(T);
      const kinds = ['age', 'motif', 'name', 'motif2'];
      for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
        const x = gx + col * (d + gx), y = gy + row * (d + gy), cx = x + d / 2, cy = y + d / 2; const kind = kinds[(row * 3 + col) % 4];
        const r = U.rng((s.seed || 1) + row * 7 + col);
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, 7); ctx.clip();
        ART.pattern(ctx, x, y, d, d, T.pattern === 'plain' ? 'dots' : T.pattern, P, r);
        ctx.beginPath(); ctx.arc(cx, cy, d * 0.38, 0, 7); ctx.fillStyle = P.paper; ctx.fill();
        ctx.setLineDash([d * 0.02, d * 0.02]); ctx.strokeStyle = P.secondary; ctx.lineWidth = d * 0.01; ctx.beginPath(); ctx.arc(cx, cy, d * 0.34, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        const imgs = s.images && s.images.length ? s.images : null; const mot = imgs ? imgs[(row + col) % imgs.length] : (kind === 'motif' ? T.hero : T.motifs[0]);
        if (s.textOn === false || kind === 'motif' || kind === 'motif2') ART.drawMotif(ctx, mot, cx, cy, d * 0.5, 0, P, r);
        else if (kind === 'age') {
          ART.drawMotif(ctx, imgs ? mot : T.motifs[1], cx + d * 0.22, cy - d * 0.22, d * 0.22, 0.3, P, r);
          ART.layoutText(ctx, [{ t: 'text', text: s.c.age, f: 'title', size: 30, color: 'primary' }], { x: cx - d * 0.28, y: cy - d * 0.27, w: d * 0.56, h: d * 0.5 }, F, P);
        } else {
          ART.layoutText(ctx, [{ t: 'text', text: (s.c.name || s.c.accent || '').replace(/'s$/i, ''), f: 'title', size: 14, color: 'primary' }, { t: 'text', text: s.c.sub, f: 'caps', size: 5, sp: 0.15, upper: true }], { x: cx - d * 0.3, y: cy - d * 0.25, w: d * 0.6, h: d * 0.5 }, F, P);
        }
        ctx.restore();
        ctx.strokeStyle = '#cccccc'; ctx.lineWidth = Math.max(1, 2 * scale); ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, 7); ctx.stroke();
      }
      return cv;
    }
    if (piece === 'tags') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      const tw = 3.5 * DPI * scale, th = 2 * DPI * scale, gx = (W - 2 * tw) / 3, gy = (H - 5 * th) / 6;
      const blocks = blocksFor('tag', s.c);
      for (let row = 0; row < 5; row++) for (let col = 0; col < 2; col++) {
        const x = gx + col * (tw + gx), y = gy + row * (th + gy);
        ART.drawCard(ctx, x, y, tw, th, { ...base, seed: (s.seed || 1) + row * 3 + col, blocks, hero: false, corners: 2, inset: 0.07, motifScale: 0.38, frame: 'rounded', bottomPad: 0.06 });
        ctx.beginPath(); ctx.arc(x + th * 0.16, y + th * 0.5, th * 0.045, 0, 7); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#bbbbbb'; ctx.lineWidth = Math.max(1, 2 * scale); ctx.stroke();
        ctx.setLineDash([8 * scale, 8 * scale]); ctx.strokeRect(x, y, tw, th); ctx.setLineDash([]);
      }
      return cv;
    }
    const opts = { ...base, blocks: blocksFor(piece, s.c) };
    if (piece === 'thanks') Object.assign(opts, { hero: false, corners: 4, motifScale: 0.3, bottomPad: 0.08 });
    if (piece === 'welcome') Object.assign(opts, { motifScale: 0.22 });
    ART.drawCard(ctx, 0, 0, W, H, opts);
    return cv;
  }

  async function bundleZip(s, onProgress) {
    const zip = new JSZip(); const base = U.slug(`${s.c.name || ''} ${s.c.title} ${s.c.sub}`);
    const keys = Object.keys(PIECES); let i = 0;
    for (const k of keys) {
      onProgress && onProgress(`Rendering ${PIECES[k].label}…`, i++ / keys.length);
      await new Promise(r => setTimeout(r, 30));
      const cv = render(k, s, 1);
      zip.file(`${base}-${k}.png`, await U.pngBlob(cv, DPI));
      if (PIECES[k].pdf) { const d = PIECES[k]; zip.file(`${base}-${k}.pdf`, U.canvasPdf(cv, d.w, d.h)); }
      if (s.blanks && (k === 'invite' || k === 'phone' || k === 'welcome' || k === 'thanks')) {
        const bl = render(k, { ...s, textOn: false }, 1); zip.file(`blank-backgrounds-for-canva/${base}-${k}-blank.png`, await U.pngBlob(bl, DPI));
      }
      cv.width = cv.height = 1; // free memory
    }
    if (s.listing) zip.file('etsy-listing.txt', s.listing);
    onProgress && onProgress('Zipping…', 0.98);
    return zip.generateAsync({ type: 'blob', compression: 'STORE' });
  }

  return { PIECES, defaults, render, bundleZip, sizeOf, DPI };
})();
