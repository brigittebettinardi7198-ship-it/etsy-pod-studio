// UI wiring
(() => {
  const { $, $$ } = U;
  const state = { images: [], seed: 11 };
  const opt = (sel, obj, labelKey = 'name') => { sel.innerHTML = Object.entries(obj).map(([k, v]) => `<option value="${k}">${typeof v === 'string' ? v : v[labelKey] || v.label}</option>`).join(''); };
  const debounce = (fn, ms = 250) => { let h; return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); }; };
  const nextYear = new Date().getFullYear() + (new Date().getMonth() >= 8 ? 1 : 0);

  // ---------- tabs ----------
  $$('#tabs button').forEach(b => b.onclick = () => {
    $$('#tabs button').forEach(x => x.classList.toggle('on', x === b));
    $$('.tab').forEach(t => t.classList.toggle('on', t.id === b.dataset.tab));
    if (b.dataset.tab === 'pod') renderPod(); if (b.dataset.tab === 'engrave') renderEng(); if (b.dataset.tab === 'names') renderNames(); if (b.dataset.tab === 'planner') plannerPreview();
    window.scrollTo(0, 0);
  });

  // ---------- listing widget ----------
  function showListing(el, L, fname) {
    el.innerHTML = `<div class="listing">
      <div class="lt"><span>Title</span><span>${L.title.length}/140</span></div><input value="" class="l-title">
      <div class="lt"><span>Tags (${L.tags.length}/13, each ≤ 20 characters)</span><button class="mini l-ct">Copy tags</button></div>
      <div class="chips">${L.tags.map(t => `<span class="chip">${t} <small>${t.length}</small></span>`).join('')}</div>
      <div class="lt"><span>Description</span><span><button class="mini l-cd">Copy description</button> <button class="mini l-dl">Download .txt</button></span></div><textarea class="l-desc"></textarea>
      <div class="row" style="margin-top:6px"><button class="mini l-cti">Copy title</button></div></div>`;
    $('.l-title', el).value = L.title; $('.l-desc', el).value = L.description;
    $('.l-cti', el).onclick = e => U.copyText($('.l-title', el).value, e.target);
    $('.l-ct', el).onclick = e => U.copyText(L.tags.join(', '), e.target);
    $('.l-cd', el).onclick = e => U.copyText($('.l-desc', el).value, e.target);
    $('.l-dl', el).onclick = () => U.download(new Blob([LST.text(L)], { type: 'text/plain' }), (fname || 'etsy-listing') + '.txt');
  }

  // ---------- PARTY ----------
  const FIELDS = [['top', 'Top line'], ['name', 'Name (e.g. Olivia\'s)'], ['title', 'Big title', 1], ['sub', 'Under title'], ['age', 'Age (toppers)'], ['invite', 'Invite line', 1], ['accent', 'Script line', 1], ['d1', 'Day'], ['d2', 'Date'], ['p1', 'Place'], ['p2', 'Address'], ['t1', 'Time'], ['t2', 'Time 2'], ['rsvp', 'RSVP line', 1], ['welcome', 'Sign top line'], ['thanks', 'Thank-you word'], ['thanksSub', 'Thank-you line', 1]];
  $('#p-fields').innerHTML = FIELDS.map(([k, l, w]) => `<label class="${w ? 'wide' : ''}">${l}<input data-k="${k}"></label>`).join('');
  opt($('#p-theme'), ART.THEMES); opt($('#p-pal'), ART.PALETTES);
  const party = () => {
    const c = {}; $$('#p-fields input').forEach(i => c[i.dataset.k] = i.value);
    return { theme: $('#p-theme').value, pal: $('#p-pal').value, event: $('#p-event').value, seed: state.seed, c, images: $('#p-useimg').checked ? state.images : [], blanks: $('#p-blanks').checked };
  };
  function fillDefaults() { const d = INV.defaults($('#p-event').value, $('#p-theme').value); $$('#p-fields input').forEach(i => i.value = d[i.dataset.k] ?? ''); }
  const previewScale = { invite: 0.2, phone: 0.28, welcome: 0.1, toppers: 0.12, tags: 0.12, thanks: 0.2 };
  $('#p-grid').innerHTML = Object.entries(INV.PIECES).map(([k, d]) => `<div class="piece" data-k="${k}"><div class="name">${d.label}</div><div class="cv"></div><div class="row"><button class="mini" data-act="png">PNG 300 DPI</button>${d.pdf ? '<button class="mini" data-act="pdf">PDF</button>' : ''}</div></div>`).join('');
  async function renderParty() {
    await U.loadFonts(); const s = party();
    for (const k of Object.keys(INV.PIECES)) { const cv = INV.render(k, s, previewScale[k]); const box = $(`.piece[data-k="${k}"] .cv`); box.innerHTML = ''; box.appendChild(cv); }
    showListing($('#p-listing'), LST.party($('#p-kind').value, { theme: s.theme, event: s.event, delivery: $('#p-delivery').value }), U.slug(s.c.title) + '-listing');
  }
  const rp = debounce(renderParty);
  $('#p-theme').onchange = () => { $('#p-pal').value = ART.THEMES[$('#p-theme').value].palette; $('#a-prompt').value = ART.THEMES[$('#p-theme').value].ai; fillDefaults(); rp(); };
  $('#p-event').onchange = () => { fillDefaults(); rp(); };
  ['#p-pal', '#p-useimg', '#p-delivery', '#p-kind'].forEach(s => $(s).onchange = rp);
  $('#p-fields').oninput = rp;
  $('#p-shuffle').onclick = () => { state.seed = Math.floor(Math.random() * 1e6); rp(); };
  $('#p-reset').onclick = () => { fillDefaults(); rp(); };
  $('#p-grid').onclick = async e => {
    const b = e.target.closest('button'); if (!b) return; const k = b.closest('.piece').dataset.k; const s = party(); const d = INV.PIECES[k];
    b.disabled = true; const old = b.textContent; b.textContent = 'Working…'; await new Promise(r => setTimeout(r, 20));
    try {
      await U.loadFonts(); const cv = INV.render(k, s, 1); const name = `${U.slug(s.c.name + ' ' + s.c.title)}-${k}`;
      if (b.dataset.act === 'png') U.download(await U.pngBlob(cv, INV.DPI), name + '.png'); else U.download(U.canvasPdf(cv, d.w, d.h), name + '.pdf');
    } catch (err) { U.toast(err.message); }
    b.disabled = false; b.textContent = old;
  };
  $('#p-zip').onclick = async () => {
    const b = $('#p-zip'); b.disabled = true; await U.loadFonts(); const s = party();
    s.listing = LST.text(LST.party($('#p-kind').value, { theme: s.theme, event: s.event, delivery: $('#p-delivery').value }));
    try { const blob = await INV.bundleZip(s, (m) => $('#p-status').textContent = m); U.download(blob, `${U.slug(s.c.name + ' ' + s.c.title + ' bundle')}.zip`); $('#p-status').textContent = 'Done! Check your downloads.'; }
    catch (err) { $('#p-status').textContent = 'Error: ' + err.message; }
    b.disabled = false;
  };

  // ---------- PLANNER ----------
  opt($('#pl-style'), PLN.STYLES); opt($('#pl-pal'), ART.PALETTES); $('#pl-year').value = nextYear; $('#pl-pal').value = 'blush';
  const plOpts = () => ({ year: +$('#pl-year').value || nextYear, style: $('#pl-style').value, pal: $('#pl-pal').value, weekStart: +$('#pl-ws').value, title: $('#pl-title').value || 'Digital Planner' });
  function plannerPreview() {
    const o = plOpts(), S = PLN.STYLES[o.style], P = ART.PALETTES[o.pal]; const c = $('#pl-preview').getContext('2d'); const W = 1194, H = 834;
    c.fillStyle = S.bg; c.fillRect(0, 0, W, H);
    const tabs = P.extra.concat(P.extra, P.extra).slice(0, 14);
    tabs.forEach((col, i) => { c.fillStyle = S.soft < 0 ? ART.shade(col, -0.15) : ART.shade(col, S.soft * 0.45); c.beginPath(); c.roundRect(W - 66, 28 + i * 55.6 + 2, 80, 51, 8); c.fill(); c.fillStyle = S.soft < 0 ? '#fff' : S.ink; c.font = '600 13px Poppins'; c.textAlign = 'center'; c.fillText(['Year', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Notes'][i], W - 34, 28 + i * 55.6 + 32); });
    c.textAlign = 'left'; c.fillStyle = S.soft < 0 ? ART.shade(P.primary, 0.2) : P.primary; c.font = `700 34px ${S.font === 'times' ? 'Georgia' : 'Poppins'}`; c.fillText(`January ${o.year}`, 44, 74);
    const gx = 274, gw = W - 70 - 26 - gx, cw = gw / 7, ch = (H - 180) / 5; c.strokeStyle = S.line; c.lineWidth = 1;
    for (let k = 0; k < 35; k++) { c.strokeRect(gx + (k % 7) * cw, 146 + Math.floor(k / 7) * ch, cw, ch); }
    c.beginPath(); c.roundRect(44, 120, 210, H - 150, 10); c.stroke(); c.fillStyle = S.ink; c.font = '600 13px Poppins'; c.fillText('Monthly Goals', 60, 148);
    showListing($('#pl-listing'), LST.planner(o), `${o.year}-planner-listing`);
  }
  ['#pl-year', '#pl-style', '#pl-pal', '#pl-ws', '#pl-title'].forEach(s => $(s).oninput = debounce(plannerPreview));
  $('#pl-go').onclick = async () => {
    const b = $('#pl-go'); b.disabled = true; $('#pl-status').textContent = 'Building pages…'; await new Promise(r => setTimeout(r, 30));
    try { const o = plOpts(); const r = PLN.build(o); U.download(r.blob, `${o.year}-${o.style}-digital-planner.pdf`); $('#pl-status').textContent = `Done: ${r.pages} pages (${r.weeks} weekly spreads), all linked.`; }
    catch (err) { $('#pl-status').textContent = 'Error: ' + err.message; }
    b.disabled = false;
  };

  // ---------- SHEETS ----------
  opt($('#s-type'), SHT.TEMPLATES); opt($('#s-pal'), ART.PALETTES); $('#s-year').value = nextYear;
  const SINFO = {
    budget: ['Start Here (instructions + year)', 'Categories (edit your income & expense list)', 'Transactions (date, type, category dropdowns)', 'Monthly Budget (planned vs actual, auto-totals, over-budget in red)', 'Annual Summary (income, spending, savings rate by month)'],
    books: ['Library (title, author, genre/format/status dropdowns, star rating, days-to-read)', 'Reading Stats (books finished, pages, avg rating, by month & by genre)', 'Wishlist (where to buy, price, priority)', 'Lists (edit dropdown choices)'],
    habits: ['Setup (year + up to 12 habits with goals)', 'Jan–Dec tabs (✓ dropdown grid, weekday letters, % complete bars)', 'Year Summary (color-scaled completion by month)'],
    mom: ['Weekly Plan (hour-by-hour week + priorities/to-dos)', 'Meal Plan', 'Grocery List (aisles, ✓ to strike through, estimated total)', 'Chore Chart (✓ per day, weekly score)'],
  };
  function sheetsInfo() { const t = $('#s-type').value; $('#s-info').innerHTML = `<h3>${SHT.TEMPLATES[t]} – tabs included</h3><ul>${SINFO[t].map(x => `<li>${x}</li>`).join('')}</ul><p class="hint">Uses only formulas that work the same in Google Sheets and Excel (SUMIFS, COUNTIFS, IFERROR, TEXT…).</p>`; showListing($('#s-listing'), LST.sheet({ type: t }), `${t}-sheet-listing`); }
  $('#s-type').onchange = sheetsInfo;
  $('#s-go').onclick = async () => {
    const b = $('#s-go'); b.disabled = true; $('#s-status').textContent = 'Building…';
    try { const t = $('#s-type').value; const blob = await SHT.build({ type: t, pal: $('#s-pal').value, year: +$('#s-year').value || nextYear }); U.download(blob, `${U.slug(SHT.TEMPLATES[t])}-google-sheets.xlsx`); $('#s-status').textContent = 'Done!'; }
    catch (err) { $('#s-status').textContent = 'Error: ' + err.message; }
    b.disabled = false;
  };

  // ---------- POD ----------
  opt($('#d-product'), POD.PRODUCTS, 'label'); opt($('#d-style'), POD.STYLES); opt($('#d-fill'), POD.FILLS); opt($('#d-pal'), ART.PALETTES);
  function motifOptions() { const cur = $('#d-motif').value; $('#d-motif').innerHTML = ART.MOTIF_NAMES.map(m => `<option value="${m}">${m[0].toUpperCase() + m.slice(1)}</option>`).join('') + state.images.map((_, i) => `<option value="img${i}">My clipart #${i + 1}</option>`).join(''); if (cur && $(`#d-motif option[value="${cur}"]`)) $('#d-motif').value = cur; }
  motifOptions(); $('#d-motif').value = 'strawberry';
  let podBg = 'checker';
  const podOpts = () => { const m = $('#d-motif').value; return { product: $('#d-product').value, w: +$('#d-w').value, h: +$('#d-h').value, mode: $('#d-mode').value, style: $('#d-style').value, fill: $('#d-fill').value, text: $('#d-text').value, c1: $('#d-c1').value, c2: $('#d-c2').value, motif: m.startsWith('img') ? null : m, image: m.startsWith('img') ? state.images[+m.slice(3)] : null, pal: $('#d-pal').value, solid: $('#d-solid').checked, mugLayout: $('#d-muglayout').value, seed: state.seed }; };
  async function renderPod() {
    await U.loadFonts(); const o = podOpts(); $('#d-custom').hidden = o.product !== 'custom'; $('#d-muglayout-wrap').hidden = o.product !== 'mug11';
    const full = o.product === 'custom' ? [o.w, o.h] : [POD.PRODUCTS[o.product].w, POD.PRODUCTS[o.product].h];
    const sc = 700 / Math.max(...full); const cv = POD.render(o, sc); const st = $('#d-stage'); st.innerHTML = ''; st.appendChild(cv);
    cv.className = podBg === 'checker' ? 'checker' : ''; cv.style.background = podBg === 'checker' ? '' : podBg;
    $('#d-size').textContent = `Exports at ${full[0]} x ${full[1]} px, 300 DPI, transparent background.` + (o.product === 'mug11' ? ' Printify 11oz mug wrap; the handle sits in the middle gap when "both sides" is chosen.' : '');
    showListing($('#d-listing'), LST.pod(o), 'pod-listing');
  }
  const rpod = debounce(renderPod);
  ['#d-product', '#d-mode', '#d-fill', '#d-c1', '#d-c2', '#d-motif', '#d-pal', '#d-solid', '#d-muglayout', '#d-w', '#d-h'].forEach(s => $(s).oninput = rpod);
  $('#d-text').oninput = rpod;
  $('#d-style').oninput = () => { const v = $('#d-style').value; if (v.startsWith('varsity')) { $('#d-c1').value = '#c8a27a'; $('#d-c2').value = '#3a2a20'; $('#d-fill').value = 'leopard'; if (!/\n/.test($('#d-text').value)) $('#d-text').value = 'Cozy\nseason'; $('#d-mode').value = 'quote'; } rpod(); };
  $('#d-bg').onclick = e => { const b = e.target.closest('button'); if (!b) return; podBg = b.dataset.bg; $$('#d-bg button').forEach(x => x.classList.toggle('on', x === b)); rpod(); };
  $$('#d-bg button').forEach(b => { if (b.dataset.bg !== 'checker') b.style.background = b.dataset.bg; else b.className += ' checker'; });
  $('#d-go').onclick = async () => {
    const b = $('#d-go'); b.disabled = true; $('#d-status').textContent = 'Rendering full size…'; await new Promise(r => setTimeout(r, 30));
    try { await U.loadFonts(); const o = podOpts(); const cv = POD.render(o, 1); U.download(await U.pngBlob(cv, 300), `${U.slug(o.text || o.motif || 'design')}-${o.product}-${cv.width}x${cv.height}.png`); $('#d-status').textContent = 'Done!'; }
    catch (err) { $('#d-status').textContent = 'Error: ' + err.message; }
    b.disabled = false;
  };

  // ---------- ART LIBRARY + POLLINATIONS ----------
  function renderLib() {
    $('#a-lib').innerHTML = ''; state.images.forEach((img, i) => { const d = document.createElement('div'); const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'); const sc = Math.min(150 / img.width, 150 / img.height); x.drawImage(img, (160 - img.width * sc) / 2, (160 - img.height * sc) / 2, img.width * sc, img.height * sc); c.className = 'checker'; d.appendChild(c); const del = document.createElement('button'); del.textContent = '×'; del.onclick = () => { state.images.splice(i, 1); renderLib(); }; d.appendChild(del); $('#a-lib').appendChild(d); });
    motifOptions(); rp();
  }
  async function addImage(img) {
    let c; if ($('#a-white').checked) c = U.removeWhite(img); else { c = document.createElement('canvas'); const sc = Math.min(1, 2400 / Math.max(img.width, img.height)); c.width = img.width * sc; c.height = img.height * sc; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); }
    state.images.push(c);
  }
  $('#a-upload').onchange = async e => { for (const f of e.target.files) { try { await addImage(await U.fileToImage(f)); } catch (err) { U.toast(err.message); } } e.target.value = ''; renderLib(); U.toast('Clipart added. Tick "Use my clipart" on the Invites tab, or pick it under Illustration on Printify Designs.', 4000); };
  $('#a-clear').onclick = () => { state.images = []; renderLib(); };

  const BLOCK = /\b(nude|nudity|naked|nsfw|sexy|sexual|sex|porn|erotic|lingerie|topless|breast|boobs|fetish|bikini|gore|blood)\b/i;
  let aiSeed = 1;
  function aiGenerate(newSeed) {
    const p = $('#a-prompt').value.trim(); if (!p) return;
    if (BLOCK.test(p)) { $('#a-result').innerHTML = '<p class="note">Let\'s keep it family-friendly. Please try a different description.</p>'; return; }
    if (newSeed) aiSeed = Math.floor(Math.random() * 1e9);
    const prompt = `${p}, cute clipart illustration, isolated on plain white background, children's book style, family friendly, no text`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&safe=true&seed=${aiSeed}`;
    $('#a-result').innerHTML = '<p class="status">Painting… free AI can take 10–60 seconds.</p>';
    const img = new Image(); img.referrerPolicy = 'no-referrer'; img.alt = p;
    const t = setTimeout(() => { if (!img.complete) $('#a-result').innerHTML = '<p class="note">The free AI service is busy or slow right now. Wait a moment and press Regenerate.</p>'; }, 90000);
    img.onload = () => { clearTimeout(t); $('#a-result').innerHTML = ''; $('#a-result').appendChild(img); const a = document.createElement('p'); a.className = 'hint'; a.innerHTML = `Like it? Save the image, then upload it on the left. <a href="${url}" target="_blank" rel="noreferrer noopener">Open full size</a>`; $('#a-result').appendChild(a); };
    img.onerror = () => { clearTimeout(t); $('#a-result').innerHTML = '<p class="note">The free AI service turned this request away (it limits how often free images can be made). Wait about 30 seconds and press Regenerate.</p>'; };
    img.src = url;
  }
  $('#a-gen').onclick = () => aiGenerate(false); $('#a-regen').onclick = () => aiGenerate(true);

  // ---------- ENGRAVING ----------
  opt($('#e-product'), ENG.PRODUCTS, 'label'); opt($('#e-design'), ENG.DESIGNS); opt($('#e-font'), VEC.FONT_LABELS);
  $('#e-flower').innerHTML = Object.entries(VEC.FLOWERS).map(([k, v]) => `<option value="${k}">${v.label || k}</option>`).join('');
  $('#e-product').value = 'skinny20'; $('#e-vertical').checked = true;
  let engBg = 'checker';
  const engOpts = () => ({ product: $('#e-product').value, w: +$('#e-w').value, h: +$('#e-h').value, design: $('#e-design').value, font: $('#e-font').value, name: $('#e-name').value, sub: $('#e-sub').value, initial: ($('#e-name').value.trim()[0] || 'M').toUpperCase(), flower: $('#e-flower').value, icon: $('#e-icon').value, contact: $('#e-contact').value, vertical: $('#e-vertical').checked, both: $('#e-both').checked });
  let engSvg = null;
  async function renderEng() {
    const o = engOpts(); const P = ENG.PRODUCTS[o.product];
    $('#e-custom').hidden = o.product !== 'custom';
    $('#e-flower-w').hidden = o.design !== 'flower'; $('#e-icon-w').hidden = o.design !== 'badge'; $('#e-contact-w').hidden = o.design !== 'card';
    try {
      const r = await ENG.build(o); engSvg = r;
      const st = $('#e-stage'); st.innerHTML = r.svg; const s = st.firstElementChild; s.removeAttribute('width'); s.removeAttribute('height'); s.style.width = '100%';
      st.className = 'pod-stage' + (engBg === 'checker' ? ' checker' : ''); st.style.background = engBg === 'checker' ? '' : engBg;
      const dpi = +$('#e-dpi').value;
      $('#e-size').textContent = `${r.W} x ${r.H} mm (${(r.W / 25.4).toFixed(2)} x ${(r.H / 25.4).toFixed(2)} in). PNG: ${Math.round(r.W / 25.4 * dpi)} x ${Math.round(r.H / 25.4 * dpi)} px at ${dpi} DPI. ${P.wrap ? 'Wrap size is typical; confirm with your supplier or measure your tumbler.' : ''}`;
      showListing($('#e-listing'), LST.engrave(o), `engraved-${o.product}-listing`);
    } catch (err) { $('#e-status').textContent = 'Error: ' + err.message; }
  }
  const reng = debounce(renderEng);
  ['#e-product', '#e-design', '#e-font', '#e-flower', '#e-icon', '#e-vertical', '#e-both', '#e-dpi', '#e-w', '#e-h'].forEach(s => $(s).oninput = reng);
  ['#e-name', '#e-sub', '#e-contact'].forEach(s => $(s).oninput = reng);
  $('#e-design').addEventListener('input', () => { const d = $('#e-design').value; if (d === 'card') { $('#e-product').value = 'card'; $('#e-name').value = 'Summit Crest'; $('#e-sub').value = 'Coffee Roasters'; $('#e-font').value = 'serif'; } else if (d === 'badge') { $('#e-product').value = 't40front'; $('#e-name').value = 'Summit Crest'; $('#e-sub').value = 'Est. 2026'; } else if (d === 'flower') { $('#e-product').value = 'tumbler40'; $('#e-sub').value = ''; $('#e-vertical').checked = false; } });
  $('#e-bg').onclick = e => { const b = e.target.closest('button'); if (!b) return; engBg = b.dataset.bg; $$('#e-bg button').forEach(x => x.classList.toggle('on', x === b)); renderEng(); };
  $$('#e-bg button').forEach(b => { if (b.dataset.bg !== 'checker') b.style.background = b.dataset.bg; else b.className += ' checker'; });
  const engName = () => `${U.slug($('#e-name').value || 'design')}-${$('#e-design').value}-${$('#e-product').value}`;
  $('#e-svg').onclick = async () => { const r = await ENG.build(engOpts()); U.download(VEC.svgBlob(r.svg), engName() + '.svg'); };
  $('#e-png').onclick = async () => {
    const b = $('#e-png'); b.disabled = true; $('#e-status').textContent = 'Rendering PNG…';
    try { const r = await ENG.build(engOpts()); const dpi = +$('#e-dpi').value; const cv = await VEC.toCanvas(r.svg, r.W / 25.4 * dpi, r.H / 25.4 * dpi); U.download(await U.pngBlob(cv, dpi), `${engName()}-${dpi}dpi.png`); $('#e-status').textContent = 'Done!'; }
    catch (err) { $('#e-status').textContent = 'Error: ' + err.message; }
    b.disabled = false;
  };
  // photo -> engraving
  let phImg = null;
  const phOpts = (dpi) => { const [w, h] = $('#ph-size').value.split('x').map(Number); return { mode: $('#ph-mode').value, wIn: w, hIn: h, dpi, contrast: +$('#ph-contrast').value, brightness: +$('#ph-bright').value, shape: $('#ph-shape').value }; };
  function renderPhoto() { if (!phImg) return; const o = phOpts(60); const cv = ENG.photo(phImg, o); cv.className = 'checker'; const st = $('#ph-stage'); st.innerHTML = ''; st.appendChild(cv); }
  const rph = debounce(renderPhoto, 300);
  ['#ph-mode', '#ph-size', '#ph-shape', '#ph-contrast', '#ph-bright'].forEach(s => $(s).oninput = rph);
  $('#ph-file').onchange = async e => { const f = e.target.files[0]; if (!f) return; phImg = await U.fileToImage(f); renderPhoto(); };
  $('#ph-go').onclick = async () => {
    if (!phImg) { U.toast('Upload a photo first'); return; }
    const b = $('#ph-go'); b.disabled = true; $('#e-status').textContent = 'Processing photo at 300 DPI…'; await new Promise(r => setTimeout(r, 30));
    try { const o = phOpts(300); const cv = ENG.photo(phImg, o); U.download(await U.pngBlob(cv, 300), `photo-engraving-${o.mode}-${$('#ph-size').value}in-300dpi.png`); $('#e-status').textContent = 'Done!'; }
    catch (err) { $('#e-status').textContent = 'Error: ' + err.message; }
    b.disabled = false;
  };

  // ---------- BABY NAMES ----------
  opt($('#n-yarn'), NAM.YARNS); opt($('#n-thread'), NAM.THREADS); opt($('#n-font'), VEC.FONT_LABELS); $('#n-font').value = 'varsity';
  const namOpts = () => ({ kind: $('#n-kind').value, name: $('#n-name').value, yarn: $('#n-yarn').value, mode: $('#n-mode').value, ywIn: +$('#n-ywidth').value || 9, font: $('#n-font').value, thread: $('#n-thread').value, animals: $('#n-animals').value, bwIn: +$('#n-bwidth').value || 10 });
  const namBuild = o => o.kind === 'basket' ? NAM.yarn({ wIn: o.ywIn, yarn: o.yarn, mode: o.mode, name: o.name }) : NAM.blanket({ wIn: o.bwIn, font: o.font, thread: o.thread, animals: o.animals, name: o.name });
  async function renderNames() {
    const o = namOpts(); $('#n-basket-opts').hidden = o.kind !== 'basket'; $('#n-blanket-opts').hidden = o.kind !== 'blanket';
    try {
      const r = await namBuild(o); const st = $('#n-stage'); st.innerHTML = r.svg; const s = st.firstElementChild; s.removeAttribute('width'); s.removeAttribute('height'); s.style.width = '100%';
      $('#n-info').textContent = `${(r.W / 25.4).toFixed(1)} x ${(r.H / 25.4).toFixed(1)} in. ` + (o.kind === 'blanket' ? `Thread colors: ${r.colors.join(', ')}` : o.mode === 'guide' ? 'Print at 100% scale. Lay the i-cord along the outline and stitch it down; numbers show the yarn color per letter.' : o.mode === 'letters' ? 'Transparent PNG of the yarn letters, for mockups or a Printify/Etsy listing photo.' : 'Listing mockup: name on a natural cotton rope basket.');
      $('#n-note').innerHTML = o.kind === 'blanket' ? '<b>Embroidery note:</b> this is the artwork. Embroidery machines need a <b>digitized</b> stitch file (DST, PES, JEF…). Your embroidery supplier usually digitizes it from this PNG/SVG, often for a one-time fee. Flat colors and simple shapes keep that cost down.' : 'Yarn names are hand-made (knitted i-cord or wrapped cord stitched onto the basket). Use the stitch guide as the template; use the mockup for listing photos.';
      showListing($('#n-listing'), LST.names({ kind: o.kind, name: o.name, animals: o.animals }), `${o.kind}-name-listing`);
    } catch (err) { $('#n-status').textContent = 'Error: ' + err.message; }
  }
  const rnam = debounce(renderNames);
  ['#n-kind', '#n-yarn', '#n-mode', '#n-ywidth', '#n-font', '#n-thread', '#n-animals', '#n-bwidth', '#n-name'].forEach(s => $(s).oninput = rnam);
  const namName = o => `${U.slug(o.name || 'name')}-${o.kind === 'basket' ? 'yarn-' + o.mode : 'embroidery-' + o.animals}`;
  $('#n-svg').onclick = async () => { const o = namOpts(); const r = await namBuild(o); U.download(VEC.svgBlob(r.svg), namName(o) + '.svg'); };
  $('#n-png').onclick = async () => {
    const b = $('#n-png'); b.disabled = true; $('#n-status').textContent = 'Rendering PNG…';
    try { const o = namOpts(); const r = await namBuild(o); const cv = await VEC.toCanvas(r.svg, r.W / 25.4 * 300, r.H / 25.4 * 300); U.download(await U.pngBlob(cv, 300), namName(o) + '-300dpi.png'); $('#n-status').textContent = 'Done!'; }
    catch (err) { $('#n-status').textContent = 'Error: ' + err.message; }
    b.disabled = false;
  };

  // ---------- FIND A SUPPLIER ----------
  opt($('#f-type'), SUP.TYPES);
  $('#f-search').innerHTML = SUP.SEARCH.map(s => `<div class="sbtn"><a href="${s.u}" target="_blank" rel="noopener noreferrer">Open ${s.n} ↗</a><small>${s.how}</small></div>`).join('');
  function renderFind() {
    const t = $('#f-type').value; const L = SUP.LIST.filter(s => s.t.includes(t));
    $('#f-list').innerHTML = (L.length ? L : SUP.LIST).map(s => `<div class="sup"><b><a href="${s.u}" target="_blank" rel="noopener noreferrer">${s.n} ↗</a></b><div>${s.p}</div><div class="m">Etsy integration: ${s.etsy} · Time: ${s.time}</div><div class="m">${s.note}</div></div>`).join('') + (L.length ? '' : '<p class="hint">No researched supplier for this type yet; showing all. Use the image search buttons on the left.</p>');
  }
  $('#f-type').oninput = renderFind;
  $('#f-file').onchange = async e => { const f = e.target.files[0]; if (!f) return; const url = URL.createObjectURL(f); $('#f-preview').innerHTML = `<img src="${url}" alt="your photo" style="max-width:100%;border-radius:10px">`; };
  renderFind();

  // ---------- init ----------
  $('#p-theme').value = 'strawberry'; $('#p-pal').value = 'strawberry'; fillDefaults(); renderParty(); sheetsInfo(); plannerPreview();

  // Test hooks (used for automated checks)
  window.Studio = { U, ART, state, party, podOpts, plOpts, INV, PLN, SHT, POD, LST, VEC, ENG, NAM, SUP, renderParty, renderPod, renderEng, renderNames, engOpts, namOpts };
})();
