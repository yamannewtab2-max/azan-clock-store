// POST /api/order — receives a store order and pushes it to the owner's Discord
// channel as a rich embed. The webhook URL never reaches the browser; it lives in
// the DISCORD_WEBHOOK_URL environment variable on the Vercel project.

const LIMIT = { name: 80, address: 400, note: 300, phone: 24, items: 30 };

function esc(s) {
  return String(s == null ? '' : s).replace(/[<>@`*_~|]/g, (c) => '\\' + c).slice(0, 1000);
}

function rupiah(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, LIMIT.items).map((i) => ({
    name: esc(i && i.name).slice(0, LIMIT.name),
    qty: Math.max(1, Math.min(99, Number(i && i.qty) || 1)),
    price: Math.max(0, Number(i && i.price) || 0),
  }));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ ok: false, error: 'bad json' });
    return;
  }

  const items = cleanItems(body.items);
  if (!items.length) {
    res.status(400).json({ ok: false, error: 'no items' });
    return;
  }

  const hook = process.env.DISCORD_WEBHOOK_URL;
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const code = esc(body.code || '').slice(0, 24);
  const lines = items.map((i) => `**${i.qty}×** ${i.name} — ${rupiah(i.qty * i.price)}`);

  const embed = {
    title: `🛎️ New order ${code ? code + ' · ' : ''}${rupiah(total)}`,
    color: 0xc9a227,
    fields: [
      { name: 'Items', value: lines.join('\n').slice(0, 1024) },
      { name: 'Customer', value: [esc(body.name), esc(body.phone)].filter(Boolean).join(' · ') || '—', inline: true },
      { name: 'Payment', value: items.length ? (esc(body.payment) || 'QRIS · unpaid') : '—', inline: true },
      { name: 'Address', value: esc(body.address).slice(0, LIMIT.address) || '—' },
    ],
    footer: { text: 'Azan Clock Store' },
    timestamp: new Date().toISOString(),
  };
  if (body.note) embed.fields.push({ name: 'Note', value: esc(body.note).slice(0, LIMIT.note) });

  if (!hook) {
    // The order still reaches the customer's screen; only the owner alert is missing.
    res.status(503).json({ ok: false, error: 'DISCORD_WEBHOOK_URL is not set on this deployment' });
    return;
  }

  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Azan Clock Store', embeds: [embed] }),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      res.status(502).json({ ok: false, error: `discord ${r.status}`, detail: text.slice(0, 200) });
      return;
    }
    res.status(200).json({ ok: true, total });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'discord unreachable', detail: String(e && e.message) });
  }
};
