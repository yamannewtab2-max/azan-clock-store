# Azan Clock Store

One-page online store for Islamic azan wall clocks — animated storefront, cart,
checkout, and an Orders panel for the owner. Orders are pushed to a Discord
channel the moment a customer places one.

## Files

- `index.html` — the whole store (shop + checkout + Orders panel). No build step.
- `products.json` — the catalog: name, tagline, price, badge, stock, `photo` (URL or path).
- `api/order.js` — serverless function that forwards an order to the Discord webhook.
- `assets/icon.svg` — app icon / Add-to-Home-Screen.
- `products.json` `photo` empty → a generated clock illustration is drawn instead.

## Pages

- `/` — the shop: 12 models, family filter (wristwatch / wall clock / table watch), cart, checkout.
- `/p/<id>` — one page per model (`/p/w-01`, `/p/c-04`, `/p/t-03`), served by `p.html`
  through the rewrite in `vercel.json`. Each page carries: gallery (photos when supplied,
  otherwise a drawn preview), description, specification list, quantity, add-to-cart,
  related models from the same family, and Product JSON-LD for Google.
- `/product/<id>` — the same page, if you prefer the longer URL.

Adding a photo: drop the file in `assets/p/` and list it in that product's `photos`
array in `products.json` — the drawn preview is replaced automatically, and extra
photos become a thumbnail strip.

## Owner panel

Open the store and tap **Orders** (or go to `/#orders`).

- Left: the order list (newest first), each row shows code, customer, total, paid/unpaid.
- Right: order detail — customer, WhatsApp link, address, items, payment state,
  **Mark paid**, **Resend to Discord**, **Delete order**.
- **Courier**: add a courier with a photo from your phone, then tap the photo to
  assign them to the selected order. The customer sees the courier on the confirmation screen.
- **Payment QR**: upload the QRIS image customers should scan.
- **Prices & delivery**: change product prices and the delivery fee. Saving never
  touches an order that already exists.

The panel is client-side on purpose (no login yet). Orders live in the browser that
placed them and in the Discord channel — the Discord message is the durable copy.

## Two things still needed

1. **Discord webhook** — Discord → your channel → Edit Channel → Integrations →
   Webhooks → New Webhook → Copy Webhook URL. Set it on the deployment as
   `DISCORD_WEBHOOK_URL` (Vercel → Project → Settings → Environment Variables),
   then redeploy. Until then orders are saved and the alert shows "Discord failed".
2. **Payment QR** — send the QRIS image so it can be committed as `assets/qris.png`.
   That file is what every customer sees at checkout; the panel upload only covers
   the device it was uploaded from.

## Local preview

```bash
python3 -m http.server 8130    # then open http://localhost:8130
```

## Live

https://azan-clock-store.vercel.app
