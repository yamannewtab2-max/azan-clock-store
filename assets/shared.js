/* Azan Clock Store — shared bits used by both the shop (index.html) and the
   product page (p.html). Everything hangs off window.AZ so nothing collides
   with the page-level scripts. Cart state lives in the same localStorage key
   the shop already uses, so a product added here shows up in the shop cart. */
(function () {
  const KEY = 'azan.store.v1';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const idr = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- product art ----------
     The clock face IS the product, so a clean dial in the right case reads
     honestly until real photos arrive: put photo paths in products.json
     ("photos": ["assets/p/w-01-1.jpg"]) and they are used instead. */
  const BRASS = ['#C9A227', '#D9B44A', '#B98F1F', '#E0C070'];

  function dial(accent, r, small) {
    const ticks = Array.from({ length: 12 }, (_, i) =>
      `<line x1="150" y1="${150 - r + 5}" x2="150" y2="${150 - r + (i % 3 === 0 ? 19 : 13)}" stroke="${accent}"
        stroke-width="${i % 3 === 0 ? 2.6 : 1.2}" opacity="${i % 3 === 0 ? 1 : .55}" stroke-linecap="round"
        transform="rotate(${i * 30} 150 150)"/>`).join('');
    return `${ticks}
      <text x="150" y="${150 - r + 33}" text-anchor="middle" fill="${accent}" font-family="monospace"
        font-size="${small ? 8 : 11}" letter-spacing="3.5" opacity=".9">AZAN</text>
      <line x1="150" y1="150" x2="150" y2="${150 - r * .56}" stroke="#F2F0E8" stroke-width="${small ? 6 : 7}" stroke-linecap="round"/>
      <line x1="150" y1="150" x2="${150 + r * .38}" y2="${150 - r * .3}" stroke="#F2F0E8" stroke-width="${small ? 4 : 4.6}" stroke-linecap="round"/>
      <line x1="150" y1="150" x2="150" y2="${150 - r * .84}" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" class="${reduce ? '' : 'spin'}"/>
      <circle cx="150" cy="150" r="4.6" fill="${accent}"/>`;
  }

  function productArt(p) {
    const seed = (p && p.id) || '';
    let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
    const accent = BRASS[Math.abs(h) % BRASS.length];
    const cat = (p && p.cat) || 'wall';

    if (cat === 'wrist') {
      return `<svg viewBox="0 0 300 300" aria-hidden="true">
        <rect x="113" y="10" width="74" height="80" rx="16" fill="#1A1F1A" stroke="#2F382F" stroke-width="1"/>
        <path d="M124 14 h52 M124 84 h52 M124 216 h52 M124 286 h52" stroke="#2F382F" stroke-width="1"/>
        <rect x="113" y="210" width="74" height="80" rx="16" fill="#1A1F1A" stroke="#2F382F" stroke-width="1"/>
        <circle cx="150" cy="150" r="76" fill="#0E120F" stroke="${accent}" stroke-width="2"/>
        <circle cx="150" cy="150" r="66" fill="none" stroke="${accent}" stroke-width=".6" opacity=".45"/>
        ${dial(accent, 66, true)}
        <rect x="227" y="142" width="7" height="16" rx="3" fill="${accent}"/>
      </svg>`;
    }
    if (cat === 'table') {
      return `<svg viewBox="0 0 300 300" aria-hidden="true">
        <path d="M118 194 L150 230 L182 194 Z" fill="#232A23" stroke="#39443A" stroke-width="1"/>
        <rect x="96" y="226" width="108" height="9" rx="4" fill="${accent}" opacity=".9"/>
        <rect x="104" y="235" width="92" height="6" rx="3" fill="#2A2D24"/>
        <circle cx="150" cy="118" r="82" fill="#0E120F" stroke="${accent}" stroke-width="2"/>
        <circle cx="150" cy="118" r="72" fill="none" stroke="${accent}" stroke-width=".6" opacity=".45"/>
        <g transform="translate(0,-32)">${dial(accent, 72, true)}</g>
      </svg>`;
    }
    if (p && p.id === 'c-02') {
      return `<svg viewBox="0 0 300 300" aria-hidden="true">
        <rect x="20" y="72" width="260" height="152" rx="12" fill="#0E120F" stroke="${accent}" stroke-width="1.6"/>
        <text x="150" y="82" text-anchor="middle" fill="#8C8877" font-family="monospace" font-size="9" letter-spacing="5">28 SAFAR 1448</text>
        <text x="150" y="164" text-anchor="middle" fill="${accent}" font-family="monospace" font-size="54" letter-spacing="2">4:38</text>
        <text x="150" y="192" text-anchor="middle" fill="#8C8877" font-family="monospace" font-size="12" letter-spacing="6">FAJR</text>
        <rect x="20" y="224" width="260" height="9" rx="4" fill="${accent}" opacity=".35"/>
        <path d="M150 40 l5 10 -5 10 -5 -10 z" fill="${accent}"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 300 300" aria-hidden="true">
      <path d="M150 22 l4 8 -4 8 -4 -8 z" fill="none" stroke="${accent}" stroke-width="1.2"/>
      <circle cx="150" cy="166" r="98" fill="${accent}" opacity=".92"/>
      <circle cx="150" cy="166" r="90" fill="#0E120F"/>
      <circle cx="150" cy="166" r="82" fill="none" stroke="${accent}" stroke-width=".8" opacity=".55"/>
      <g transform="translate(0,16)">${dial(accent, 82, true)}</g>
    </svg>`;
  }

  const FAMILIES = [
    { key: 'wrist', label: 'Wristwatch' },
    { key: 'wall', label: 'Wall clock' },
    { key: 'table', label: 'Table watch' },
  ];
  const familyLabel = (k) => ((FAMILIES.find((f) => f.key === k) || {}).label || '');
  // root-absolute: p.html is served under /p/<id>, so relative paths would resolve there
  const productUrl = (id) => '/p/' + encodeURIComponent(id);

  /* ---------- cart, shared with the shop ---------- */
  function read() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || '{}');
      return d && typeof d === 'object' ? d : {};
    } catch (e) { return {}; }
  }
  function write(patch) {
    const d = read();
    Object.assign(d, patch);
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
    return d;
  }
  const cartLines = () => (Array.isArray(read().cart) ? read().cart : []);
  const cartCount = () => cartLines().reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const cartTotal = () => cartLines().reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  function cartAdd(p, qty) {
    qty = Math.max(1, Number(qty) || 1);
    const cart = cartLines().slice();
    const line = cart.find((i) => i.id === p.id);
    if (line) line.qty += qty; else cart.push({ id: p.id, name: p.name, price: Number(p.price) || 0, qty });
    write({ cart });
    return cartCount();
  }
  function cartSetQty(id, qty) {
    const cart = cartLines().map((i) => i.id === id ? Object.assign({}, i, { qty: Math.max(0, qty) }) : i)
      .filter((i) => i.qty > 0);
    write({ cart });
    return cartCount();
  }

  window.AZ = {
    KEY, esc, idr, reduce, dial, productArt, FAMILIES, familyLabel, productUrl,
    cartLines, cartCount, cartTotal, cartAdd, cartSetQty, read, write,
  };
})();
