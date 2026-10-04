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
    if (b.dataset.tab === 'pod') renderPod(); if (b.dataset.tab === 'planner') plannerPreview();
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
  opt($('#d-product'), POD.PRODUCTS, 'label'); opt($('#d-style'), POD.STYLES); opt($('#d-pal'), ART.PALETTES);
  function motifOptions() { const cur = $('#d-motif').value; $('#d-motif').innerHTML = ART.MOTIF_NAMES.map(m => `<option value="${m}">${m[0].toUpperCase() + m.slice(1)}</option>`).join('') + state.images.map((_, i) => `<option value="img${i}">My clipart #${i + 1}</option>`).join(''); if (cur && $(`#d-motif option[value="${cur}"]`)) $('#d-motif').value = cur; }
  motifOptions(); $('#d-motif').value = 'strawberry';
  let podBg = 'checker';
  const podOpts = () => { const m = $('#d-motif').value; return { product: $('#d-product').value, w: +$('#d-w').value, h: +$('#d-h').value, mode: $('#d-mode').value, style: $('#d-style').value, text: $('#d-text').value, c1: $('#d-c1').value, c2: $('#d-c2').value, motif: m.startsWith('img') ? null : m, image: m.startsWith('img') ? state.images[+m.slice(3)] : null, pal: $('#d-pal').value, solid: $('#d-solid').checked, mugLayout: $('#d-muglayout').value, seed: state.seed }; };
  async function renderPod() {
    await U.loadFonts(); const o = podOpts(); $('#d-custom').hidden = o.product !== 'custom'; $('#d-muglayout-wrap').hidden = o.product !== 'mug11';
    const full = o.product === 'custom' ? [o.w, o.h] : [POD.PRODUCTS[o.product].w, POD.PRODUCTS[o.product].h];
    const sc = 700 / Math.max(...full); const cv = POD.render(o, sc); const st = $('#d-stage'); st.innerHTML = ''; st.appendChild(cv);
    cv.className = podBg === 'checker' ? 'checker' : ''; cv.style.background = podBg === 'checker' ? '' : podBg;
    $('#d-size').textContent = `Exports at ${full[0]} x ${full[1]} px, 300 DPI, transparent background.` + (o.product === 'mug11' ? ' Printify 11oz mug wrap; the handle sits in the middle gap when "both sides" is chosen.' : '');
    showListing($('#d-listing'), LST.pod(o), 'pod-listing');
  }
  const rpod = debounce(renderPod);
  ['#d-product', '#d-mode', '#d-style', '#d-c1', '#d-c2', '#d-motif', '#d-pal', '#d-solid', '#d-muglayout', '#d-w', '#d-h'].forEach(s => $(s).oninput = rpod);
  $('#d-text').oninput = rpod;
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

  // ---------- init ----------
  $('#p-theme').value = 'strawberry'; $('#p-pal').value = 'strawberry'; fillDefaults(); renderParty(); sheetsInfo(); plannerPreview();

  // Test hooks (used for automated checks)
  window.Studio = { U, ART, state, party, podOpts, plOpts, INV, PLN, SHT, POD, LST, renderParty, renderPod };
})();
