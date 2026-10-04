# Etsy & POD Studio

A free, static, no-backend web app for making Etsy digital products and Printify print-on-demand designs.

- **Invites & party bundles**: themed 5x7 invitation, phone invite (1080x1920), 11x14 welcome sign, cupcake toppers, favor tags, thank-you card. 300 DPI PNG + PDF + ZIP (with blank backgrounds for Canva).
- **GoodNotes planners**: hyperlinked iPad-landscape PDF (year, monthly, weekly, notes; side tabs).
- **Google Sheets templates**: budget planner, book tracker, habit tracker, mom planner (.xlsx with formulas, dropdowns, conditional formatting).
- **Printify designs**: transparent PNGs at 4500x5400 (apparel) and 2475x1155 (11oz mug wrap).
- **Etsy listing copy** for every product: title (<140 chars), 13 tags (<=20 chars), description.

Everything renders in the browser (canvas, jsPDF, JSZip, ExcelJS, Google Fonts). No API keys.
Run locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
