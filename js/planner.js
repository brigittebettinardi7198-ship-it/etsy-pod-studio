// GoodNotes-style hyperlinked PDF planner (iPad landscape), built entirely with jsPDF
const PLN = (() => {
  const W = 1194, H = 834; // iPad Pro 11" landscape, points
  const STYLES = {
    minimal: { name: 'Clean Minimal', bg: '#ffffff', ink: '#333333', muted: '#9a9a9a', line: '#e4e4e4', font: 'helvetica', soft: 0.82 },
    pastel: { name: 'Soft Pastel', bg: '#fffaf7', ink: '#5a4a4a', muted: '#a59393', line: '#efe2dc', font: 'helvetica', soft: 0.7 },
    boho: { name: 'Warm Boho', bg: '#fbf5ee', ink: '#5b4134', muted: '#a68d7c', line: '#eadbcb', font: 'times', soft: 0.6 },
    dark: { name: 'Dark Mode', bg: '#2a2a30', ink: '#f1ece6', muted: '#a8a4ad', line: '#45454e', font: 'helvetica', soft: -0.35 },
  };
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY = 86400000;

  function build({ year = new Date().getFullYear() + 1, style = 'pastel', pal = 'strawberry', weekStart = 1, title = 'Digital Planner', notesPages = 4 }) {
    const S = STYLES[style] || STYLES.pastel; const P = ART.PALETTES[pal] || ART.PALETTES.strawberry;
    const tabCols = P.extra.concat(P.extra, P.extra).slice(0, 14).map(c => S.soft < 0 ? ART.shade(c, -0.15) : ART.shade(c, S.soft * 0.45));
    const accent = S.soft < 0 ? ART.shade(P.primary, 0.2) : P.primary;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: [W, H], compress: true });
    doc.setProperties({ title: `${year} ${title}`, creator: 'Etsy POD Studio' });

    // ---- page map ----
    const first = Date.UTC(year, 0, 1); const firstDow = new Date(first).getUTCDay();
    const wk0 = first - ((firstDow - weekStart + 7) % 7) * DAY; const last = Date.UTC(year, 11, 31);
    const weeks = []; for (let t = wk0; t <= last; t += 7 * DAY) weeks.push(t);
    const PG = { cover: 1, year: 2, month: m => 3 + m, week: i => 15 + i, notes: 15 + weeks.length };
    const weekOf = t => Math.floor((t - wk0) / (7 * DAY));
    const total = PG.notes + notesPages - 1;

    const tx = W - 70, tabW = 70, tabTop = 28, tabH = (H - 56) / 14;
    const X0 = 44, X1 = tx - 26;
    const font = (sz, bold) => { doc.setFont(S.font, bold ? 'bold' : 'normal'); doc.setFontSize(sz); };
    const ink = c => doc.setTextColor(c || S.ink);
    const page = n => { if (n > 1) doc.addPage([W, H], 'l'); doc.setFillColor(S.bg); doc.rect(0, 0, W, H, 'F'); };
    const link = (x, y, w, h, pg) => doc.link(x, y, w, h, { pageNumber: pg });

    function tabs(active) {
      const labels = ['Year'].concat(MONTHS.map(m => m.slice(0, 3)), ['Notes']);
      const targets = [PG.year].concat(MONTHS.map((_, i) => PG.month(i)), [PG.notes]);
      labels.forEach((l, i) => {
        const y = tabTop + i * tabH, on = i === active;
        doc.setFillColor(tabCols[i]); doc.roundedRect(tx + (on ? -6 : 4), y + 2, tabW + 10, tabH - 4, 8, 8, 'F');
        font(12, on); ink(S.soft < 0 ? '#ffffff' : ART.shade(S.ink, 0)); doc.text(l, tx + (on ? 26 : 36) - (on ? 0 : 0), y + tabH / 2 + 4, { align: 'center' });
        link(tx, y, tabW, tabH, targets[i]);
      });
    }
    function header(text, sub) { font(34, true); ink(accent); doc.text(text, X0, 74); if (sub) { font(13); ink(S.muted); doc.text(sub, X0, 96); } }
    function lines(x, y, w, h, gap = 26) { doc.setDrawColor(S.line); doc.setLineWidth(0.8); for (let yy = y + gap; yy < y + h - 4; yy += gap) doc.line(x, yy, x + w, yy); }
    function box(x, y, w, h, fill) { doc.setDrawColor(S.line); doc.setLineWidth(1); if (fill) { doc.setFillColor(fill); doc.roundedRect(x, y, w, h, 10, 10, 'FD'); } else doc.roundedRect(x, y, w, h, 10, 10, 'S'); }
    const md = t => { const d = new Date(t); return `${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`; };
    const dayNames = () => { const a = []; for (let i = 0; i < 7; i++) a.push(DAYS[(i + weekStart) % 7]); return a; };

    // 1. Cover
    page(1);
    P.extra.slice(0, 5).forEach((c, i) => { doc.setFillColor(S.soft < 0 ? ART.shade(c, -0.3) : ART.shade(c, 0.35)); doc.circle(150 + i * 230, 700 + (i % 2) * 60, 120 + (i % 3) * 30, 'F'); });
    font(120, true); ink(accent); doc.text(String(year), W / 2, 330, { align: 'center' });
    font(40); ink(S.ink); doc.text(title, W / 2, 400, { align: 'center' });
    font(15); ink(S.muted); doc.text('HYPERLINKED  ·  YEARLY  ·  MONTHLY  ·  WEEKLY  ·  NOTES', W / 2, 440, { align: 'center' });
    doc.setFillColor(accent); doc.roundedRect(W / 2 - 110, 480, 220, 54, 27, 27, 'F'); font(18, true); ink('#ffffff'); doc.text('Open Planner', W / 2, 513, { align: 'center' });
    link(W / 2 - 110, 480, 220, 54, PG.year);

    // 2. Year overview
    page(2); tabs(0); header(`${year} at a Glance`, 'Tap a month to jump to it');
    const cw = (X1 - X0) / 4, ch = (H - 140) / 3;
    MONTHS.forEach((mn, m) => {
      const bx = X0 + (m % 4) * cw, by = 120 + Math.floor(m / 4) * ch;
      box(bx + 6, by + 6, cw - 12, ch - 12, S.soft < 0 ? ART.shade(S.bg, 0.05) : '#ffffff');
      font(15, true); ink(accent); doc.text(mn, bx + 22, by + 32);
      const cell = (cw - 44) / 7; font(8, true); ink(S.muted);
      dayNames().forEach((d, i) => doc.text(d[0], bx + 22 + cell * i + cell / 2, by + 50, { align: 'center' }));
      font(9); ink(S.ink);
      const f = Date.UTC(year, m, 1), off = (new Date(f).getUTCDay() - weekStart + 7) % 7, dim = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
      for (let d = 1; d <= dim; d++) { const k = off + d - 1; doc.text(String(d), bx + 22 + cell * (k % 7) + cell / 2, by + 68 + Math.floor(k / 7) * 16, { align: 'center' }); }
      link(bx + 6, by + 6, cw - 12, ch - 12, PG.month(m));
    });

    // 3. Months
    MONTHS.forEach((mn, m) => {
      page(PG.month(m)); tabs(m + 1); header(`${mn} ${year}`, 'Tap a date to open that week');
      const side = 210, gx0 = X0 + side + 20, gw = X1 - gx0, top = 120;
      box(X0, top, side, H - top - 30); font(13, true); ink(accent); doc.text('Monthly Goals', X0 + 16, top + 28); lines(X0 + 16, top + 34, side - 32, 250);
      font(13, true); ink(accent); doc.text('Notes', X0 + 16, top + 320); lines(X0 + 16, top + 326, side - 32, H - top - 30 - 340);
      const f = Date.UTC(year, m, 1), off = (new Date(f).getUTCDay() - weekStart + 7) % 7, dim = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
      const rows = Math.ceil((off + dim) / 7), cwid = gw / 7, chh = (H - top - 60) / rows;
      font(11, true); ink(S.muted); dayNames().forEach((d, i) => doc.text(d.slice(0, 3).toUpperCase(), gx0 + cwid * i + cwid / 2, top + 14, { align: 'center' }));
      doc.setDrawColor(S.line); doc.setLineWidth(1);
      for (let k = 0; k < rows * 7; k++) {
        const x = gx0 + (k % 7) * cwid, y = top + 26 + Math.floor(k / 7) * chh, d = k - off + 1;
        doc.rect(x, y, cwid, chh, 'S');
        if (d >= 1 && d <= dim) {
          font(13, true); ink(S.ink); doc.text(String(d), x + 8, y + 18);
          const t = Date.UTC(year, m, d); link(x, y, cwid, chh, PG.week(weekOf(t)));
        }
      }
    });

    // 4. Weeks
    weeks.forEach((t0, i) => {
      page(PG.week(i)); const d0 = new Date(t0), mIdx = d0.getUTCFullYear() < year ? 0 : d0.getUTCMonth();
      tabs(mIdx + 1); header(`Week ${i + 1}`, `${md(t0)} - ${md(t0 + 6 * DAY)}, ${new Date(t0 + 6 * DAY).getUTCFullYear()}`);
      // prev / next
      font(12, true); ink(accent);
      if (i > 0) { doc.text('< Prev week', X1 - 210, 74); link(X1 - 214, 58, 100, 24, PG.week(i - 1)); }
      if (i < weeks.length - 1) { doc.text('Next week >', X1 - 90, 74); link(X1 - 94, 58, 100, 24, PG.week(i + 1)); }
      const top = 116, gw = X1 - X0, bw = gw / 4, bh = (H - top - 30) / 2;
      for (let k = 0; k < 8; k++) {
        const x = X0 + (k % 4) * bw, y = top + Math.floor(k / 4) * bh;
        box(x + 5, y + 5, bw - 10, bh - 10, S.soft < 0 ? ART.shade(S.bg, 0.04) : '#ffffff');
        if (k < 7) {
          const t = t0 + k * DAY, dd = new Date(t);
          doc.setFillColor(tabCols[1 + dd.getUTCMonth()]); doc.roundedRect(x + 5, y + 5, bw - 10, 34, 10, 10, 'F'); doc.rect(x + 5, y + 25, bw - 10, 14, 'F');
          font(13, true); ink(S.soft < 0 ? '#ffffff' : S.ink); doc.text(DAYS[dd.getUTCDay()].toUpperCase(), x + 18, y + 28);
          font(13, true); doc.text(md(t), x + bw - 18, y + 28, { align: 'right' });
          if (dd.getUTCFullYear() === year) link(x + bw - 80, y + 8, 70, 28, PG.month(dd.getUTCMonth()));
          lines(x + 18, y + 42, bw - 36, bh - 52, 24);
        } else {
          font(13, true); ink(accent); doc.text('TO-DO', x + 18, y + 30);
          doc.setDrawColor(S.muted); for (let yy = y + 50; yy < y + bh - 20; yy += 26) { doc.rect(x + 18, yy - 10, 11, 11, 'S'); doc.setDrawColor(S.line); doc.line(x + 36, yy + 1, x + bw - 18, yy + 1); doc.setDrawColor(S.muted); }
        }
      }
    });

    // 5. Notes
    for (let n = 0; n < notesPages; n++) {
      page(PG.notes + n); tabs(13); header('Notes', `Page ${n + 1} of ${notesPages}`);
      box(X0, 116, X1 - X0, H - 146); doc.setFillColor(S.muted);
      for (let y = 140; y < H - 40; y += 22) for (let x = X0 + 20; x < X1 - 10; x += 22) doc.circle(x, y, 0.9, 'F');
    }
    return { blob: doc.output('blob'), pages: total, weeks: weeks.length };
  }
  return { build, STYLES };
})();
