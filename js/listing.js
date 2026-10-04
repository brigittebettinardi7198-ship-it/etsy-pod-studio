// Etsy listing copy: title (<140 chars), exactly 13 tags (<=20 chars each), description. Template-based, no AI needed.
const LST = (() => {
  const clampTitle = parts => { let t = ''; for (const p of parts) { const n = t ? `${t}, ${p}` : p; if (n.length <= 139) t = n; } return t; };
  function tagsFrom(list) {
    const out = [], seen = new Set();
    for (let t of list) { if (!t) continue; t = t.toLowerCase().replace(/[^a-z0-9 &'-]/g, '').replace(/\s+/g, ' ').trim(); if (t.length > 20) continue; if (!t || seen.has(t)) continue; seen.add(t); out.push(t); if (out.length === 13) break; }
    return out;
  }
  const THEME_WORDS = {
    strawberry: ['strawberry', 'berry first', 'berry sweet', 'gingham', 'fruit party'], wildflower: ['wildflower', 'wild one', 'floral', 'garden party', 'boho flowers'],
    ladybug: ['ladybug', 'little ladybug', 'garden party', 'bug party', 'daisy'], bows: ['coquette', 'pink bow', 'bow party', 'ribbon', 'girly'],
    rainbow: ['rainbow', 'boho rainbow', 'pastel rainbow', 'one happy girl', 'clouds'], stars: ['twinkle star', 'twinkle twinkle', 'moon and stars', 'starry', 'celestial'],
    balloons: ['balloon party', 'balloons', 'pastel party', 'colorful party', 'confetti'], bees: ['bumble bee', 'honey bee', 'sweet as can bee', 'bee party', 'daisy'],
  };
  const EVENT = { first: ['1st birthday', 'first birthday', 'one year old'], birthday: ['birthday', 'kids birthday', 'girl birthday'], baby: ['baby shower', 'baby girl shower', 'sprinkle'] };

  function party(kind, { theme, event, delivery }) {
    const tw = THEME_WORDS[theme] || THEME_WORDS.strawberry, ev = EVENT[event] || EVENT.birthday, T = ART.THEMES[theme] || ART.THEMES.strawberry;
    const cap = s => s.replace(/\b\w/g, c => c.toUpperCase());
    const editable = delivery === 'canva' ? 'Editable Template' : 'Personalized Printable';
    const what = kind === 'bundle' ? `${cap(ev[0])} Bundle` : `${cap(ev[0])} Invitation`;
    const title = clampTitle([`${cap(tw[1] || tw[0])} ${what}`, `${editable}`, `${cap(tw[0])} ${cap(ev[1] || ev[0])} Decor`, kind === 'bundle' ? 'Welcome Sign, Cupcake Toppers, Favor Tags' : 'Digital Evite', 'Instant Download', 'Printable']);
    const tags = tagsFrom([`${tw[0]} invitation`, `${tw[0]} ${ev[0]}`, `${ev[0]} invite`, `${ev[0]} bundle`, tw[1], tw[2], tw[3], `${ev[0]} decor`, `${tw[0]} party`, 'editable invitation', 'digital invitation', 'printable invite', 'party printables', 'welcome sign', 'cupcake toppers', 'favor tags', 'evite', 'instant download', `${ev[1] || ev[0]} party`]);
    const items = kind === 'bundle' ? ['5x7 invitation (print or text)', 'Phone-size digital invitation (1080x1920) to text or email', 'Welcome sign 11x14 (prints great up to 16x20)', 'Cupcake toppers, 2 in circles, 12 per letter sheet', 'Favor tags, 3.5x2 in, 10 per letter sheet', 'Thank-you card 6x4'] : ['5x7 invitation (print or text)', 'Phone-size digital invitation (1080x1920)'];
    const how = delivery === 'canva' ? ['Purchase and download the PDF with your template link.', 'Open the link in Canva (free account works).', 'Edit names, dates, and details. Download and print or share!'] : ['Purchase this listing.', 'Send me your details in the personalization box (name, age, date, time, location, RSVP).', 'I will email your personalized files within 1-2 business days.'];
    const description = `${T.name} ${what} - a sweet, hand-illustrated look for your ${ev[0]}!\n\nWHAT'S INCLUDED\n${items.map(i => '- ' + i).join('\n')}\n\nHOW IT WORKS\n${how.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nDETAILS\n- High-resolution 300 DPI PNG and PDF files\n- Print at home, at a local print shop, or online\n- Colors may vary slightly between screens and printers\n\nPLEASE NOTE\nThis is a DIGITAL item. No physical product will be shipped. For personal use only; please do not resell or share the files.\n\nThank you for visiting my shop!`;
    return { title, tags, description };
  }
  function planner({ year, style }) {
    const S = PLN.STYLES[style] || PLN.STYLES.pastel;
    const title = clampTitle([`${year} Digital Planner`, 'GoodNotes Planner', 'iPad Planner Hyperlinked', `${S.name} Weekly Monthly Planner`, 'Notability Planner', 'Dated Planner', 'Landscape']);
    const tags = tagsFrom([`${year} planner`, 'digital planner', 'goodnotes planner', 'ipad planner', 'hyperlinked planner', 'notability planner', 'weekly planner', 'monthly planner', 'dated planner', `${year} digital`, 'landscape planner', 'aesthetic planner', 'minimalist planner', 'tablet planner', 'pdf planner']);
    const description = `${year} Digital Planner (${S.name}) - fully hyperlinked for GoodNotes, Notability, Noteshelf, and other PDF annotation apps.\n\nWHAT'S INCLUDED\n- Cover page\n- Year at a glance (tap any month)\n- 12 monthly calendars with goals and notes\n- Weekly spreads for the whole year (tap any date on the monthly page)\n- Dot-grid notes pages\n- Clickable side tabs on every page\n\nHOW TO USE\n1. Download the PDF after purchase.\n2. Open it in GoodNotes (or your favorite PDF app) on your iPad or tablet.\n3. Tap tabs and dates to move around. Write with your stylus!\n\nThis is a DIGITAL product. No physical item will be shipped. Personal use only.`;
    return { title, tags, description };
  }
  function sheet({ type }) {
    const n = SHT.TEMPLATES[type];
    const extra = { budget: ['budget planner', 'budget spreadsheet', 'monthly budget', 'expense tracker', 'finance tracker', 'paycheck budget', 'savings tracker'], books: ['book tracker', 'reading log', 'reading tracker', 'book journal', 'tbr list', 'bookish gift', 'reading challenge'], habits: ['habit tracker', 'daily habits', 'goal tracker', 'self care tracker', 'routine tracker', 'wellness tracker', 'monthly habits'], mom: ['mom planner', 'family planner', 'meal planner', 'grocery list', 'chore chart', 'busy mom', 'weekly planner'] }[type];
    const title = clampTitle([`${n} Google Sheets Template`, 'Excel Spreadsheet', extra[1].replace(/\b\w/g, c => c.toUpperCase()), 'Easy Automated Tracker', 'Digital Download', 'Aesthetic Template']);
    const tags = tagsFrom([extra[0], 'google sheets', 'spreadsheet', 'excel template'].concat(extra.slice(1), ['digital download', 'automated tracker', 'sheets template', 'google template', 'aesthetic tracker']));
    const description = `${n} for Google Sheets and Excel - pretty, simple, and automated.\n\nFEATURES\n- Multiple tabs that work together\n- Formulas calculate totals and stats for you\n- Dropdown menus and color-coded cells\n- Works on desktop, tablet and phone (Google Sheets app)\n\nHOW TO USE\n1. Download the .xlsx file.\n2. Google Sheets: open Google Drive > New > File upload, then open the file with Google Sheets (or File > Import).\n3. Excel: just open the file.\n\nThis is a DIGITAL product. No physical item will be shipped. Personal use only.`;
    return { title, tags, description };
  }
  function pod({ product, text, motif, style, fill }) {
    const q = (text || '').replace(/\n/g, ' ').trim(); const subj = q || (typeof motif === 'string' ? motif : 'cute') + ' design';
    const isMug = product === 'mug11';
    const varsity = /varsity/i.test(style || '');
    const thing = isMug ? 'Coffee Mug' : varsity ? `${fill && fill !== 'solid' ? (fill === 'leopard' || fill === 'cheetah' ? 'Leopard ' : fill[0].toUpperCase() + fill.slice(1) + ' ') : ''}Varsity Sweatshirt` : 'Shirt';
    if (varsity && !isMug) {
      const title = clampTitle([`${subj.replace(/\b\w/g, c => c.toUpperCase()).slice(0, 50)} ${thing}`, 'Retro Collegiate Crewneck', fill === 'leopard' || fill === 'cheetah' ? 'Cheetah Print Sweatshirt' : 'Trendy Sweatshirt', 'Fall Sweatshirt', 'Gift for Her', 'Oversized Crewneck']);
      const tags = tagsFrom([q.length <= 20 ? q.toLowerCase() : '', fill === 'leopard' || fill === 'cheetah' ? 'leopard sweatshirt' : 'trendy sweatshirt', 'varsity sweatshirt', 'collegiate crewneck', fill === 'leopard' || fill === 'cheetah' ? 'cheetah print' : 'retro sweatshirt', 'fall sweatshirt', 'cozy season', 'coffee sweatshirt', 'oversized crewneck', 'gift for her', 'womens sweatshirt', 'trendy crewneck', 'comfort colors', 'autumn sweatshirt', 'aesthetic sweatshirt']);
      const description = `${subj.replace(/\b\w/g, c => c.toUpperCase())} ${thing}\n\n- Cozy unisex crewneck (size up for an oversized fit)\n- Varsity block lettering${fill && fill !== 'solid' ? ` filled with ${fill} print` : ''}\n- See size chart and color options in photos\n\nMade to order just for you. Production 2-5 business days plus shipping.`;
      return { title, tags, description };
    }
    const cap = s => s.replace(/\b\w/g, c => c.toUpperCase());
    const title = clampTitle([`${cap(subj).slice(0, 60)} ${thing}`, isMug ? 'Funny Coffee Mug' : 'Graphic Tee', isMug ? 'Cute Gift Mug 11oz' : 'Unisex T-Shirt', 'Gift for Her', 'Trendy Gift', isMug ? 'Ceramic Mug' : 'Comfort Tee']);
    const words = q.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 3);
    const tags = tagsFrom([q.length <= 20 ? q : '', `${words[0] || 'cute'} ${isMug ? 'mug' : 'shirt'}`, isMug ? 'coffee mug' : 'graphic tee', isMug ? 'funny mug' : 'funny shirt', isMug ? 'gift mug' : 'trendy shirt', isMug ? 'coffee lover gift' : 'unisex tshirt', 'gift for her', 'gift for mom', 'birthday gift', isMug ? 'ceramic mug' : 'comfort colors', isMug ? 'quote mug' : 'aesthetic shirt', typeof motif === 'string' ? `${motif} ${isMug ? 'mug' : 'shirt'}` : '', 'cute gift', 'best friend gift', 'christmas gift', 'mothers day gift']);
    const description = `${cap(subj)} ${thing}\n\n${isMug ? '- 11oz white ceramic mug\n- Design printed on both sides\n- Dishwasher and microwave safe' : '- Soft, comfortable unisex fit\n- Printed with eco-friendly inks\n- See size chart in photos'}\n\nMakes a perfect gift for birthdays, holidays, or just because!\n\nMade to order just for you. Production 2-5 business days plus shipping.`;
    return { title, tags, description };
  }
  function engrave({ product, design, name, flower }) {
    const n = (name || '').trim(); const cap = x => x.replace(/\b\w/g, c => c.toUpperCase());
    const what = { skinny20: 'Engraved Skinny Tumbler 20oz', tumbler40: 'Engraved 40oz Tumbler with Handle', t40front: 'Custom Logo 40oz Tumbler', card: 'Engraved Wood Business Cards', plaque: 'Engraved Wood Sign', custom: 'Laser Engraved Gift' }[product] || 'Laser Engraved Gift';
    const style = { name: 'Personalized Name', monogram: 'Monogram', flower: 'Birth Flower', badge: 'Custom Logo', card: 'Custom Logo' }[design] || 'Personalized';
    const title = clampTitle([`${style} ${what}`, product === 'card' ? 'Real Wood Business Cards' : 'Laser Engraved Personalized Gift', design === 'flower' ? 'Birth Month Flower Gift' : 'Bridesmaid Proposal Gift', 'Gift for Her', 'Custom Name Gift']);
    const base = product === 'card' ? ['wood business card', 'engraved business', 'custom business card', 'wooden cards', 'laser engraved', 'small business', 'logo business card', 'unique business card', 'bamboo business', 'qr code card', 'realtor gift', 'eco business cards', 'networking cards']
      : ['engraved tumbler', 'personalized tumbler', 'laser engraved', 'custom tumbler', 'bridesmaid gift', 'tumbler with name', product === 'skinny20' ? 'skinny tumbler' : '40oz tumbler', design === 'flower' ? 'birth flower gift' : 'monogram tumbler', design === 'badge' ? 'custom logo tumbler' : 'name tumbler', 'gift for her', 'teacher gift', 'bachelorette gift', 'coworker gift', 'personalized gift'];
    const tags = tagsFrom(base);
    const description = `${style} ${what}${n ? ` (shown with "${n}")` : ''}.\n\nPERSONALIZATION\nAdd your name, initial, date or logo in the personalization box. We'll engrave it exactly as typed.\n\nDETAILS\n- Permanent laser engraving, will not peel or fade\n${product === 'card' ? '- Real wood cards, 3.5 x 2 in standard business card size\n- Engraved one side (ask about two-sided)' : '- Double-wall insulated stainless steel\n- Engraving on the front (both sides available)'}\n- Made to order\n\nPlease double-check spelling; personalized items can't be returned unless there's a defect.`;
    return { title, tags, description };
  }
  function names({ kind, name, animals }) {
    const isBasket = kind === 'basket'; const n = (name || '').trim();
    const title = isBasket ? clampTitle(['Personalized Name Basket', 'Rope Storage Basket with Name', 'Nursery Toy Organizer', 'Baby Shower Gift', 'Custom Knitted Name Basket', 'Kids Room Decor'])
      : clampTitle([`Personalized Embroidered Baby Blanket${animals && animals !== 'none' ? ` with ${animals === 'safari' ? 'Safari Animals' : animals.replace(/\b\w/g, c => c.toUpperCase())}` : ''}`, 'Custom Name Blanket', 'Baby Shower Gift', 'Newborn Gift', 'Nursery Keepsake']);
    const tags = tagsFrom(isBasket ? ['name basket', 'personalized basket', 'rope basket', 'toy storage', 'nursery storage', 'baby shower gift', 'custom name basket', 'nursery decor', 'kids room decor', 'newborn gift', 'knitted name', 'storage basket', 'baby basket', 'toy organizer']
      : ['baby blanket', 'embroidered blanket', 'name blanket', 'personalized blanket', 'baby shower gift', 'newborn gift', animals === 'lion' || animals === 'safari' ? 'safari nursery' : 'nursery decor', 'custom baby gift', 'baby name blanket', 'keepsake blanket', 'new baby gift', 'gender neutral', 'baby boy gift', 'baby girl gift']);
    const description = isBasket ? `Personalized cotton rope basket with a hand-finished knitted yarn name${n ? ` (shown: ${n})` : ''}.\n\nPERFECT FOR\n- Nursery and toy storage\n- Baby shower and new baby gifts\n\nPERSONALIZATION\nEnter the name and choose your yarn colors.\n\nDETAILS\n- Soft, sturdy cotton rope with handles\n- Made to order; sizes in the drop-down\n\nPlease double-check spelling before ordering.`
      : `Personalized embroidered baby blanket${n ? ` (shown: ${n})` : ''}, a keepsake they'll treasure.\n\nDETAILS\n- Name embroidered (stitched, not printed)\n- Soft, cozy and machine washable\n- Made to order\n\nPERSONALIZATION\nEnter the baby's name exactly as you'd like it stitched.\n\nGreat for baby showers, newborn and christening gifts.`;
    return { title, tags, description };
  }
  const text = L => `TITLE (${L.title.length} chars):\n${L.title}\n\nTAGS (${L.tags.length}):\n${L.tags.join(', ')}\n\nDESCRIPTION:\n${L.description}\n`;
  return { party, planner, sheet, pod, engrave, names, text };
})();
