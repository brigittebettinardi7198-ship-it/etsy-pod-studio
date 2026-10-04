// Google Sheets templates as styled .xlsx (ExcelJS). Uses only functions that work in both Excel and Google Sheets.
const SHT = (() => {
  const TEMPLATES = { budget: 'Budget Planner', books: 'Book Tracker', habits: 'Habit Tracker', mom: 'Mom Planner' };
  const argb = h => 'FF' + h.replace('#', '').toUpperCase();
  const fill = h => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: argb(h) } });
  const thin = c => ({ style: 'thin', color: { argb: argb(c) } });
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function kit(pal) {
    const P = ART.PALETTES[pal] || ART.PALETTES.strawberry;
    const C = { head: P.primary, soft: ART.shade(P.secondary, 0.55), mid: ART.shade(P.secondary, 0.2), band: ART.shade(P.secondary, 0.75), text: '#3d3d3d', title: P.text, border: ART.shade(P.secondary, 0.1) };
    const titleRow = (ws, text, sub, span = 8) => {
      ws.mergeCells(1, 2, 1, span); const c = ws.getCell(1, 2); c.value = text; c.font = { name: 'Georgia', size: 22, bold: true, color: { argb: argb(C.title) } }; c.alignment = { vertical: 'middle' }; ws.getRow(1).height = 42;
      if (sub) { ws.mergeCells(2, 2, 2, span); const s = ws.getCell(2, 2); s.value = sub; s.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF8A8A8A' } }; }
      ws.getColumn(1).width = 3;
    };
    const headerRow = (ws, row, col, labels) => labels.forEach((l, i) => { const c = ws.getCell(row, col + i); c.value = l; c.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = fill(C.head); c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; c.border = { bottom: thin(C.border) }; });
    const body = (ws, r0, r1, c0, c1, opts = {}) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { const cell = ws.getCell(r, c); cell.font = { name: 'Arial', size: 10, color: { argb: argb(C.text) } }; cell.border = { top: thin(C.border), bottom: thin(C.border), left: thin(C.border), right: thin(C.border) }; if ((r - r0) % 2 === 1) cell.fill = fill(C.band); if (opts.center) cell.alignment = { horizontal: 'center' }; } };
    const listDV = (ws, range, formulae) => ws.dataValidations.add(range, { type: 'list', allowBlank: true, formulae: [formulae], showErrorMessage: false });
    const kpi = (ws, row, col, label, formula, fmt) => {
      const l = ws.getCell(row, col); l.value = label; l.font = { name: 'Arial', size: 9, bold: true, color: { argb: argb(C.title) } }; l.fill = fill(C.soft); l.alignment = { horizontal: 'center' };
      const v = ws.getCell(row + 1, col); v.value = { formula }; v.font = { name: 'Georgia', size: 16, bold: true, color: { argb: argb(C.title) } }; v.fill = fill(C.soft); v.alignment = { horizontal: 'center' }; if (fmt) v.numFmt = fmt;
      [l, v].forEach(c => c.border = { top: thin(C.border), bottom: thin(C.border), left: thin(C.border), right: thin(C.border) }); ws.getRow(row + 1).height = 28;
    };
    return { P, C, titleRow, headerRow, body, listDV, kpi };
  }
  const MONEY = '"$"#,##0.00';

  function budget(wb, K, year) {
    const start = wb.addWorksheet('Start Here', { properties: { tabColor: { argb: argb(K.C.head) } } });
    K.titleRow(start, 'Budget Planner', 'Type in the white cells. Everything else calculates automatically.', 6);
    const steps = ['1. Type your budget year in C5.', '2. List your income & expense categories on the "Categories" tab.', '3. Log every purchase and paycheck on the "Transactions" tab.', '4. Enter your planned amounts on "Monthly Budget". Actuals fill in for you.', '5. See the whole year on "Annual Summary".', 'Google Sheets: File > Import > Upload this .xlsx, or open it from Google Drive.'];
    start.getCell('B5').value = 'Budget year:'; start.getCell('B5').font = { bold: true }; start.getCell('C5').value = year; start.getCell('C5').fill = K.C && { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(K.C.soft) } };
    steps.forEach((s, i) => { const c = start.getCell(7 + i, 2); c.value = s; c.font = { name: 'Arial', size: 11 }; }); start.getColumn(2).width = 18; start.getColumn(3).width = 70;

    const cat = wb.addWorksheet('Categories');
    K.titleRow(cat, 'Categories', 'Add or rename categories here; dropdowns update automatically.', 4);
    K.headerRow(cat, 4, 2, ['Income Categories', 'Expense Categories']);
    const inc = ['Paycheck', 'Side Hustle', 'Etsy Sales', 'Other Income'], exp = ['Rent / Mortgage', 'Utilities', 'Groceries', 'Dining Out', 'Transportation', 'Insurance', 'Phone & Internet', 'Kids', 'Health', 'Shopping', 'Subscriptions', 'Savings', 'Debt Payments', 'Gifts', 'Misc'];
    for (let i = 0; i < 20; i++) { cat.getCell(5 + i, 2).value = inc[i] || null; cat.getCell(5 + i, 3).value = exp[i] || null; }
    K.body(cat, 5, 24, 2, 3); cat.getColumn(2).width = 24; cat.getColumn(3).width = 24;
    K.headerRow(cat, 4, 5, ['All (feeds dropdown, no need to edit)']); cat.getColumn(5).width = 30;
    for (let i = 0; i < 20; i++) { cat.getCell(5 + i, 5).value = { formula: `IF(B${5 + i}="","",B${5 + i})` }; cat.getCell(25 + i, 5).value = { formula: `IF(C${5 + i}="","",C${5 + i})` }; }
    for (let r = 5; r <= 44; r++) cat.getCell(r, 5).font = { name: 'Arial', size: 9, color: { argb: 'FF9A9A9A' } };

    const tr = wb.addWorksheet('Transactions'); K.titleRow(tr, 'Transactions', 'One row per purchase or paycheck.', 7);
    K.headerRow(tr, 4, 2, ['Date', 'Description', 'Type', 'Category', 'Amount', 'Month']);
    const sample = [[1, 3, 'Paycheck', 'Income', 'Paycheck', 2400], [1, 5, 'Rent', 'Expense', 'Rent / Mortgage', 1200], [1, 8, 'Grocery run', 'Expense', 'Groceries', 142.35], [1, 12, 'Etsy payout', 'Income', 'Etsy Sales', 315.2], [1, 15, 'Electric bill', 'Expense', 'Utilities', 96.4], [2, 2, 'Paycheck', 'Income', 'Paycheck', 2400], [2, 9, 'Pizza night', 'Expense', 'Dining Out', 38.5]];
    for (let r = 5; r <= 504; r++) {
      const s = sample[r - 5];
      if (s) { tr.getCell(r, 2).value = new Date(Date.UTC(year, s[0] - 1, s[1])); tr.getCell(r, 3).value = s[2]; tr.getCell(r, 4).value = s[3]; tr.getCell(r, 5).value = s[4]; tr.getCell(r, 6).value = s[5]; }
      tr.getCell(r, 7).value = { formula: `IF(B${r}="","",TEXT(B${r},"mmm"))` };
      tr.getCell(r, 2).numFmt = 'mm/dd/yyyy'; tr.getCell(r, 6).numFmt = MONEY;
    }
    K.body(tr, 5, 504, 2, 7); [12, 30, 12, 22, 14, 9].forEach((w, i) => tr.getColumn(2 + i).width = w);
    K.listDV(tr, 'D5:D504', '"Income,Expense"'); K.listDV(tr, 'E5:E504', 'Categories!$E$5:$E$44');
    tr.views = [{ state: 'frozen', ySplit: 4 }];

    const mb = wb.addWorksheet('Monthly Budget', { properties: { tabColor: { argb: argb(K.C.head) } } });
    K.titleRow(mb, 'Monthly Budget', 'Pick a month in C4. Planned is yours to type; Actual comes from Transactions.', 6);
    mb.getCell('B4').value = 'Month #'; mb.getCell('B4').font = { bold: true }; mb.getCell('C4').value = 1; mb.getCell('C4').fill = fill(K.C.soft); K.listDV(mb, 'C4', '"1,2,3,4,5,6,7,8,9,10,11,12"');
    mb.getCell('D4').value = { formula: `TEXT(DATE('Start Here'!$C$5,C4,1),"mmmm yyyy")` }; mb.getCell('D4').font = { bold: true, size: 13, color: { argb: argb(K.C.title) } };
    const rng = (col) => `Transactions!$${col}$5:$${col}$504`;
    const dateCrit = `Transactions!$B$5:$B$504,">="&DATE('Start Here'!$C$5,$C$4,1),Transactions!$B$5:$B$504,"<"&DATE('Start Here'!$C$5,$C$4+1,1)`;
    K.kpi(mb, 6, 2, 'TOTAL INCOME', 'SUM(D11:D14)', MONEY); K.kpi(mb, 6, 3, 'TOTAL SPENT', 'SUM(D18:D32)', MONEY); K.kpi(mb, 6, 4, 'LEFT OVER', 'B7-C7', MONEY); K.kpi(mb, 6, 5, '% SPENT', 'IFERROR(C7/B7,0)', '0%');
    K.headerRow(mb, 10, 2, ['Income', 'Planned', 'Actual', 'Difference']);
    for (let i = 0; i < 4; i++) { const r = 11 + i; mb.getCell(r, 2).value = { formula: `Categories!B${5 + i}` }; mb.getCell(r, 3).value = [2400, 300, 300, 0][i]; mb.getCell(r, 4).value = { formula: `SUMIFS(${rng('F')},${rng('E')},B${r},${rng('D')},"Income",${dateCrit})` }; mb.getCell(r, 5).value = { formula: `D${r}-C${r}` }; }
    K.headerRow(mb, 17, 2, ['Expenses', 'Planned', 'Actual', 'Difference']);
    for (let i = 0; i < 15; i++) { const r = 18 + i; mb.getCell(r, 2).value = { formula: `Categories!C${5 + i}` }; mb.getCell(r, 3).value = [1200, 150, 450, 120, 200, 150, 90, 150, 60, 100, 40, 300, 200, 50, 50][i]; mb.getCell(r, 4).value = { formula: `SUMIFS(${rng('F')},${rng('E')},B${r},${rng('D')},"Expense",${dateCrit})` }; mb.getCell(r, 5).value = { formula: `C${r}-D${r}` }; }
    K.body(mb, 11, 14, 2, 5); K.body(mb, 18, 32, 2, 5);
    ['C', 'D', 'E'].forEach(c => { for (let r = 11; r <= 32; r++) mb.getCell(`${c}${r}`).numFmt = MONEY; });
    mb.addConditionalFormatting({ ref: 'E18:E32', rules: [{ type: 'cellIs', operator: 'lessThan', formulae: ['0'], style: { font: { color: { argb: 'FFC0392B' }, bold: true } } }] });
    [3, 20, 16, 16, 16].forEach((w, i) => mb.getColumn(1 + i).width = w); mb.getColumn(2).width = 22;

    const an = wb.addWorksheet('Annual Summary'); K.titleRow(an, 'Annual Summary', 'Totals by month for the budget year.', 6);
    K.headerRow(an, 4, 2, ['Month', 'Income', 'Expenses', 'Saved', 'Savings Rate']);
    MONTHS.forEach((m, i) => {
      const r = 5 + i, crit = `Transactions!$B$5:$B$504,">="&DATE('Start Here'!$C$5,${i + 1},1),Transactions!$B$5:$B$504,"<"&DATE('Start Here'!$C$5,${i + 2},1)`;
      an.getCell(r, 2).value = m; an.getCell(r, 3).value = { formula: `SUMIFS(${rng('F')},${rng('D')},"Income",${crit})` }; an.getCell(r, 4).value = { formula: `SUMIFS(${rng('F')},${rng('D')},"Expense",${crit})` };
      an.getCell(r, 5).value = { formula: `C${r}-D${r}` }; an.getCell(r, 6).value = { formula: `IFERROR(E${r}/C${r},0)` };
    });
    an.getCell(17, 2).value = 'TOTAL'; ['C', 'D', 'E'].forEach(c => an.getCell(`${c}17`).value = { formula: `SUM(${c}5:${c}16)` }); an.getCell('F17').value = { formula: 'IFERROR(E17/C17,0)' };
    K.body(an, 5, 17, 2, 6); an.getRow(17).font = { bold: true };
    for (let r = 5; r <= 17; r++) { ['C', 'D', 'E'].forEach(c => an.getCell(`${c}${r}`).numFmt = MONEY); an.getCell(`F${r}`).numFmt = '0%'; }
    an.addConditionalFormatting({ ref: 'F5:F16', rules: [{ type: 'colorScale', cfvo: [{ type: 'min' }, { type: 'max' }], color: [{ argb: 'FFFFFFFF' }, { argb: argb(K.C.mid) }] }] });
    [3, 16, 16, 16, 16, 14].forEach((w, i) => an.getColumn(1 + i).width = w);
  }

  function books(wb, K, year) {
    const lists = wb.addWorksheet('Lists'); K.titleRow(lists, 'Dropdown Lists', 'Edit these to change the dropdown choices.', 5);
    K.headerRow(lists, 4, 2, ['Genres', 'Formats', 'Status']);
    const g = ['Romance', 'Fantasy', 'Mystery', 'Thriller', 'Sci-Fi', 'Literary', 'Historical', 'Non-Fiction', 'Self-Help', 'Memoir', 'Young Adult', 'Horror', 'Classics', 'Poetry'];
    const f = ['Paperback', 'Hardcover', 'Ebook', 'Audiobook', 'Library'], s = ['TBR', 'Reading', 'Finished', 'DNF'];
    for (let i = 0; i < 20; i++) { lists.getCell(5 + i, 2).value = g[i] || null; lists.getCell(5 + i, 3).value = f[i] || null; lists.getCell(5 + i, 4).value = s[i] || null; }
    K.body(lists, 5, 24, 2, 4); [3, 18, 16, 14].forEach((w, i) => lists.getColumn(1 + i).width = w);

    const lib = wb.addWorksheet('Library', { properties: { tabColor: { argb: argb(K.C.head) } } });
    K.titleRow(lib, `My ${year} Book Tracker`, 'Log every book. Days-to-read and stars calculate automatically.', 12);
    K.headerRow(lib, 4, 2, ['Title', 'Author', 'Genre', 'Format', 'Status', 'Rating (1-5)', 'Stars', 'Started', 'Finished', 'Pages', 'Days to Read', 'Notes']);
    const sample = [['The Midnight Library', 'Matt Haig', 'Literary', 'Paperback', 'Finished', 5, [0, 3], [0, 12], 288], ['Fourth Wing', 'Rebecca Yarros', 'Fantasy', 'Ebook', 'Finished', 4, [0, 14], [0, 25], 512], ['Atomic Habits', 'James Clear', 'Self-Help', 'Audiobook', 'Reading', null, [1, 2], null, 320], ['Lessons in Chemistry', 'Bonnie Garmus', 'Historical', 'Library', 'TBR', null, null, null, 400]];
    for (let r = 5; r <= 304; r++) {
      const s = sample[r - 5]; const d = a => a ? new Date(Date.UTC(year, a[0], a[1])) : null;
      if (s) { [s[0], s[1], s[2], s[3], s[4], s[5]].forEach((v, i) => lib.getCell(r, 2 + i).value = v); lib.getCell(r, 9).value = d(s[6]); lib.getCell(r, 10).value = d(s[7]); lib.getCell(r, 11).value = s[8]; }
      lib.getCell(r, 8).value = { formula: `IF(G${r}="","",REPT("★",G${r})&REPT("☆",5-G${r}))` };
      lib.getCell(r, 12).value = { formula: `IF(AND(I${r}<>"",J${r}<>""),J${r}-I${r},"")` };
      lib.getCell(r, 9).numFmt = 'mm/dd/yyyy'; lib.getCell(r, 10).numFmt = 'mm/dd/yyyy';
    }
    K.body(lib, 5, 304, 2, 13); [3, 30, 22, 14, 13, 12, 11, 12, 12, 12, 9, 12, 30].forEach((w, i) => lib.getColumn(1 + i).width = w);
    K.listDV(lib, 'D5:D304', 'Lists!$B$5:$B$24'); K.listDV(lib, 'E5:E304', 'Lists!$C$5:$C$24'); K.listDV(lib, 'F5:F304', 'Lists!$D$5:$D$24'); K.listDV(lib, 'G5:G304', '"1,2,3,4,5"');
    const st = (txt, col) => ({ type: 'containsText', operator: 'containsText', text: txt, style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: col } } } });
    lib.addConditionalFormatting({ ref: 'F5:F304', rules: [st('Finished', 'FFD5F0D5'), st('Reading', 'FFFFF1C2'), st('TBR', 'FFDDE9F7'), st('DNF', 'FFF6D2D2')] });
    lib.views = [{ state: 'frozen', ySplit: 4, xSplit: 2 }];

    const stats = wb.addWorksheet('Reading Stats', { properties: { tabColor: { argb: argb(K.C.mid) } } }); K.titleRow(stats, 'Reading Stats', 'Updates automatically from your Library tab.', 8);
    K.kpi(stats, 4, 2, 'BOOKS FINISHED', 'COUNTIF(Library!F5:F304,"Finished")'); K.kpi(stats, 4, 3, 'PAGES READ', 'SUMIF(Library!F5:F304,"Finished",Library!K5:K304)', '#,##0');
    K.kpi(stats, 4, 4, 'AVG RATING', 'IFERROR(AVERAGEIF(Library!F5:F304,"Finished",Library!G5:G304),0)', '0.0'); K.kpi(stats, 4, 5, 'READING NOW', 'COUNTIF(Library!F5:F304,"Reading")'); K.kpi(stats, 4, 6, 'TBR PILE', 'COUNTIF(Library!F5:F304,"TBR")');
    K.headerRow(stats, 8, 2, ['Month', 'Books Finished', 'Pages']);
    MONTHS.forEach((m, i) => { const r = 9 + i, crit = `Library!J5:J304,">="&DATE(${year},${i + 1},1),Library!J5:J304,"<"&DATE(${year},${i + 2},1)`; stats.getCell(r, 2).value = m; stats.getCell(r, 3).value = { formula: `COUNTIFS(${crit})` }; stats.getCell(r, 4).value = { formula: `SUMIFS(Library!K5:K304,${crit})` }; });
    K.body(stats, 9, 20, 2, 4, { center: true });
    K.headerRow(stats, 8, 6, ['Genre', 'Books']);
    for (let i = 0; i < 14; i++) { const r = 9 + i; stats.getCell(r, 6).value = { formula: `IF(Lists!B${5 + i}="","",Lists!B${5 + i})` }; stats.getCell(r, 7).value = { formula: `IF(F${r}="","",COUNTIF(Library!D5:D304,F${r}))` }; }
    K.body(stats, 9, 22, 6, 7, { center: true });
    stats.addConditionalFormatting({ ref: 'C9:C20', rules: [{ type: 'dataBar', cfvo: [{ type: 'min' }, { type: 'max' }], color: { argb: argb(K.C.head) } }] });
    [3, 16, 16, 14, 14, 16, 10].forEach((w, i) => stats.getColumn(1 + i).width = w);

    const wl = wb.addWorksheet('Wishlist'); K.titleRow(wl, 'Book Wishlist', 'Books to buy or borrow next.', 7);
    K.headerRow(wl, 4, 2, ['Title', 'Author', 'Where to Get', 'Price', 'Priority', 'Got it?']);
    K.body(wl, 5, 104, 2, 7); for (let r = 5; r <= 104; r++) wl.getCell(r, 5).numFmt = MONEY;
    K.listDV(wl, 'F5:F104', '"High,Medium,Low"'); K.listDV(wl, 'G5:G104', '"✓"'); [3, 30, 22, 18, 10, 10, 9].forEach((w, i) => wl.getColumn(1 + i).width = w);
    wb.views = [{ activeTab: 1 }];
  }

  function habits(wb, K, year) {
    const setup = wb.addWorksheet('Setup', { properties: { tabColor: { argb: argb(K.C.head) } } }); K.titleRow(setup, `${year} Habit Tracker`, 'Type up to 12 habits below. Every month tab updates. Mark days with ✓ from the dropdown.', 5);
    setup.getCell('B4').value = 'Year'; setup.getCell('C4').value = year; setup.getCell('C4').fill = fill(K.C.soft); setup.getCell('B4').font = { bold: true };
    K.headerRow(setup, 6, 2, ['#', 'Habit', 'Monthly Goal (days)']);
    const hs = ['Drink 8 glasses of water', 'Move 30 minutes', 'Read 10 pages', 'No phone after 9pm', 'Take vitamins', 'Journal', 'Sleep by 10:30', 'Meditate', '', '', '', ''];
    hs.forEach((h, i) => { setup.getCell(7 + i, 2).value = i + 1; setup.getCell(7 + i, 3).value = h || null; setup.getCell(7 + i, 4).value = h ? 20 : null; });
    K.body(setup, 7, 18, 2, 4); [3, 6, 34, 20].forEach((w, i) => setup.getColumn(1 + i).width = w);
    MONTHS.forEach((m, mi) => {
      const ws = wb.addWorksheet(m.slice(0, 3)); K.titleRow(ws, `${m} ${year}`, 'Choose ✓ in a day cell to mark it done.', 36);
      const days = new Date(year, mi + 1, 0).getDate();
      K.headerRow(ws, 4, 2, ['Habit']);
      for (let d = 1; d <= 31; d++) {
        const c = ws.getCell(4, 2 + d); c.value = d <= days ? d : null; c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 }; c.fill = fill(K.C.head); c.alignment = { horizontal: 'center' };
        const wd = ws.getCell(5, 2 + d); wd.value = d <= days ? { formula: `LEFT(TEXT(DATE(Setup!$C$4,${mi + 1},${d}),"ddd"),2)` } : null; wd.font = { size: 8, color: { argb: 'FF8A8A8A' } }; wd.alignment = { horizontal: 'center' };
        ws.getColumn(2 + d).width = 4.2;
      }
      K.headerRow(ws, 4, 34, ['Done', 'Goal', '%']);
      for (let i = 0; i < 12; i++) {
        const r = 6 + i; ws.getCell(r, 2).value = { formula: `IF(Setup!C${7 + i}="","",Setup!C${7 + i})` };
        ws.getCell(r, 34).value = { formula: `COUNTIF(C${r}:AG${r},"✓")` }; ws.getCell(r, 35).value = { formula: `IF(Setup!D${7 + i}="","",Setup!D${7 + i})` };
        ws.getCell(r, 36).value = { formula: `IF(B${r}="","",AH${r}/${days})` }; ws.getCell(r, 36).numFmt = '0%';
      }
      K.body(ws, 6, 17, 2, 36, {}); for (let r = 6; r <= 17; r++) for (let c = 3; c <= 36; c++) ws.getCell(r, c).alignment = { horizontal: 'center' };
      ws.getColumn(2).width = 28; [34, 35, 36].forEach(c => ws.getColumn(c).width = 7);
      K.listDV(ws, 'C6:AG17', '"✓,✗"');
      ws.addConditionalFormatting({ ref: 'C6:AG17', rules: [{ type: 'containsText', operator: 'containsText', text: '✓', style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: argb(K.C.mid) } }, font: { color: { argb: argb(K.C.title) }, bold: true } } }] });
      ws.addConditionalFormatting({ ref: 'AJ6:AJ17', rules: [{ type: 'dataBar', cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 1 }], color: { argb: argb(K.C.head) } }] });
      ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 5 }];
    });
    const sum = wb.addWorksheet('Year Summary'); K.titleRow(sum, 'Year in Habits', 'Completion % by month.', 15);
    K.headerRow(sum, 4, 2, ['Habit'].concat(MONTHS.map(m => m.slice(0, 3)), ['Avg']));
    for (let i = 0; i < 12; i++) {
      const r = 5 + i; sum.getCell(r, 2).value = { formula: `IF(Setup!C${7 + i}="","",Setup!C${7 + i})` };
      MONTHS.forEach((m, mi) => { const c = sum.getCell(r, 3 + mi); c.value = { formula: `IF($B${r}="","",'${m.slice(0, 3)}'!AJ${6 + i})` }; c.numFmt = '0%'; });
      sum.getCell(r, 15).value = { formula: `IF($B${r}="","",IFERROR(AVERAGE(C${r}:N${r}),0))` }; sum.getCell(r, 15).numFmt = '0%';
    }
    K.body(sum, 5, 16, 2, 15, { center: true }); sum.getColumn(2).width = 28; for (let c = 3; c <= 15; c++) sum.getColumn(c).width = 8;
    sum.addConditionalFormatting({ ref: 'C5:O16', rules: [{ type: 'colorScale', cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 1 }], color: [{ argb: 'FFFFFFFF' }, { argb: argb(K.C.head) }] }] });
  }

  function mom(wb, K) {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const wk = wb.addWorksheet('Weekly Plan', { properties: { tabColor: { argb: argb(K.C.head) } } }); K.titleRow(wk, 'Mom Weekly Planner', 'Week of: ________   Plan appointments, to-dos and the family schedule.', 9);
    K.headerRow(wk, 4, 2, ['Time'].concat(DAYS));
    const times = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
    times.forEach((t, i) => wk.getCell(5 + i, 2).value = t); K.body(wk, 5, 18, 2, 9); wk.getColumn(2).width = 11; for (let c = 3; c <= 9; c++) wk.getColumn(c).width = 18;
    K.headerRow(wk, 21, 2, ['Top 3 Priorities', '', '', 'To-Do', '', 'Done?']); K.body(wk, 22, 31, 2, 7); K.listDV(wk, 'G22:G31', '"✓"');
    const meal = wb.addWorksheet('Meal Plan'); K.titleRow(meal, 'Weekly Meal Plan', 'Plan meals, then add ingredients to the Grocery List.', 6);
    K.headerRow(meal, 4, 2, ['Day', 'Breakfast', 'Lunch', 'Dinner', 'Snacks']); DAYS.forEach((d, i) => meal.getCell(5 + i, 2).value = d);
    K.body(meal, 5, 11, 2, 6); meal.getColumn(2).width = 13; for (let c = 3; c <= 6; c++) meal.getColumn(c).width = 24; for (let r = 5; r <= 11; r++) meal.getRow(r).height = 34;
    const gro = wb.addWorksheet('Grocery List'); K.titleRow(gro, 'Grocery List', 'Check items off with ✓ as you shop. Estimated total updates.', 7);
    K.headerRow(gro, 4, 2, ['Aisle', 'Item', 'Qty', 'Est. Price', 'Got it?']);
    const items = [['Produce', 'Bananas', 1, 1.29], ['Produce', 'Strawberries', 2, 3.99], ['Dairy', 'Milk', 1, 3.49], ['Bakery', 'Bread', 1, 2.99], ['Pantry', 'Pasta', 2, 1.5]];
    for (let r = 5; r <= 64; r++) { const it = items[r - 5]; if (it) it.forEach((v, i) => gro.getCell(r, 2 + i).value = v); gro.getCell(r, 5).numFmt = MONEY; }
    K.body(gro, 5, 64, 2, 6); K.listDV(gro, 'B5:B64', '"Produce,Dairy,Meat,Bakery,Pantry,Frozen,Snacks,Drinks,Household,Baby,Other"'); K.listDV(gro, 'F5:F64', '"✓"');
    gro.getCell('H4').value = 'Est. Total'; gro.getCell('H4').font = { bold: true }; gro.getCell('H5').value = { formula: 'SUMPRODUCT(D5:D64,E5:E64)' }; gro.getCell('H5').numFmt = MONEY; gro.getCell('H5').font = { bold: true, size: 14, color: { argb: argb(K.C.title) } };
    gro.addConditionalFormatting({ ref: 'B5:F64', rules: [{ type: 'expression', formulae: ['$F5="✓"'], style: { font: { strike: true, color: { argb: 'FF9A9A9A' } } } }] });
    [3, 14, 26, 7, 12, 9, 3, 14].forEach((w, i) => gro.getColumn(1 + i).width = w);
    const ch = wb.addWorksheet('Chore Chart'); K.titleRow(ch, 'Family Chore Chart', 'Pick ✓ when a chore is done. Weekly score updates.', 11);
    K.headerRow(ch, 4, 2, ['Who', 'Chore'].concat(DAYS.map(d => d.slice(0, 3)), ['Score']));
    const chores = [['Kid 1', 'Make bed'], ['Kid 1', 'Feed pet'], ['Kid 2', 'Tidy toys'], ['Kid 2', 'Set table'], ['Everyone', 'Laundry away']];
    for (let r = 5; r <= 16; r++) { const c = chores[r - 5]; if (c) { ch.getCell(r, 2).value = c[0]; ch.getCell(r, 3).value = c[1]; } ch.getCell(r, 11).value = { formula: `COUNTIF(D${r}:J${r},"✓")` }; }
    K.body(ch, 5, 16, 2, 11, { center: true }); K.listDV(ch, 'D5:J16', '"✓"'); ch.getColumn(2).width = 12; ch.getColumn(3).width = 20; for (let c = 4; c <= 11; c++) ch.getColumn(c).width = 8;
    ch.addConditionalFormatting({ ref: 'D5:J16', rules: [{ type: 'containsText', operator: 'containsText', text: '✓', style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: argb(K.C.mid) } } } }] });
  }

  async function build({ type = 'budget', pal = 'strawberry', year = new Date().getFullYear() + 1 }) {
    const wb = new ExcelJS.Workbook(); wb.creator = 'Etsy POD Studio'; wb.created = new Date();
    const K = kit(pal);
    ({ budget, books, habits, mom })[type](wb, K, year);
    const buf = await wb.xlsx.writeBuffer();
    return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  return { build, TEMPLATES };
})();
