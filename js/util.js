// Shared helpers: DOM, fonts, PNG DPI, downloads, image upload + white background removal
const U = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Seeded RNG so "Shuffle" changes art but the same seed reproduces it
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  const FONT_SPECS = [
    ['Dancing Script', '700'], ['Great Vibes', '400'], ['Playfair Display', '700'], ['Fredoka', '600'],
    ['Josefin Sans', '600'], ['Josefin Sans', '400'], ['Pacifico', '400'], ['Shrikhand', '400'], ['Bebas Neue', '400'],
    ['Amatic SC', '700'], ['Poppins', '400'], ['Poppins', '700'], ['Abril Fatface', '400'], ['Caveat', '700']
  ];
  let fontsReady = null;
  function loadFonts() {
    if (!fontsReady) {
      fontsReady = Promise.all(FONT_SPECS.map(([f, w]) => document.fonts.load(`${w} 40px "${f}"`).catch(() => null)))
        .then(() => document.fonts.ready);
    }
    return fontsReady;
  }

  // ---- PNG with real 300 DPI metadata (pHYs chunk) ----
  const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(bytes) { let c = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function canvasToBlob(canvas, type = 'image/png', q) {
    return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('Canvas export failed (image may be too large for this device)')), type, q));
  }
  async function pngBlob(canvas, dpi = 300) {
    const blob = await canvasToBlob(canvas, 'image/png');
    const src = new Uint8Array(await blob.arrayBuffer());
    const ppm = Math.round(dpi / 0.0254);
    const chunk = new Uint8Array(21);
    const dv = new DataView(chunk.buffer);
    dv.setUint32(0, 9); chunk.set([0x70, 0x48, 0x59, 0x73], 4); // 'pHYs'
    dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1;
    dv.setUint32(17, crc32(chunk.subarray(4, 17)));
    const out = new Uint8Array(src.length + 21);
    out.set(src.subarray(0, 33), 0); out.set(chunk, 33); out.set(src.subarray(33), 54);
    return new Blob([out], { type: 'image/png' });
  }

  // PDF page (inches) holding a canvas image at full resolution
  function canvasPdf(canvas, wIn, hIn) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: wIn > hIn ? 'l' : 'p', unit: 'in', format: [wIn, hIn], compress: true });
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, wIn, hIn, undefined, 'FAST');
    return doc.output('blob');
  }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  }

  function slug(s) { return (s || 'design').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'design'; }

  function fileToImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => res(img); img.onerror = () => rej(new Error('Could not read that image')); img.src = url;
    });
  }

  // Turn near-white pixels connected to the edges transparent (for clipart saved with white backgrounds)
  function removeWhite(img, tol = 28) {
    const max = 2400; const sc = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * sc), h = Math.round(img.height * sc);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h);
    const d = x.getImageData(0, 0, w, h); const p = d.data;
    const seen = new Uint8Array(w * h); const q = new Int32Array(w * h); let qh = 0, qt = 0;
    const isBg = i => p[i * 4 + 3] < 20 || (p[i * 4] > 255 - tol && p[i * 4 + 1] > 255 - tol && p[i * 4 + 2] > 255 - tol);
    const push = i => { if (!seen[i] && isBg(i)) { seen[i] = 1; q[qt++] = i; } };
    for (let i = 0; i < w; i++) { push(i); push((h - 1) * w + i); }
    for (let j = 0; j < h; j++) { push(j * w); push(j * w + w - 1); }
    while (qh < qt) {
      const i = q[qh++]; p[i * 4 + 3] = 0; const cx = i % w, cy = (i / w) | 0;
      if (cx > 0) push(i - 1); if (cx < w - 1) push(i + 1); if (cy > 0) push(i - w); if (cy < h - 1) push(i + w);
    }
    x.putImageData(d, 0, 0); return c;
  }

  function copyText(t, btn) {
    const done = () => { if (btn) { const o = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = o, 1200); } };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, () => fallback()); else fallback();
    function fallback() { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); }
  }

  function toast(msg, ms = 2600) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
  }

  return { $, $$, rng, loadFonts, pngBlob, canvasToBlob, canvasPdf, download, slug, fileToImage, removeWhite, copyText, toast };
})();
