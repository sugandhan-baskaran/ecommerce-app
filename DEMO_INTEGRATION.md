# ShopEase × LogSentinel — demo integration

ShopEase is the protected demo target. Its API reports every completed request to LogSentinel and
refuses (HTTP 403) any client IP that LogSentinel has contained. Normal shoppers are unaffected.

Use this only on a network and machines you own. Demo mode trusts a spoofable header — never enable
it on a public deployment.

## Topology

| Machine  | Role                    | Ports                       |
|----------|-------------------------|-----------------------------|
| Laptop 1 | ShopEase (this repo)    | API `5000`, storefront `5173` |
| Laptop 2 | LogSentinel             | `8000`                      |
| Any      | Shopper / demo attacker | —                           |

## Setup (Laptop 1)

Prerequisites: Node.js 18+ and a MongoDB instance (local `mongod`, `docker run -p 27017:27017 mongo:7`,
or an Atlas URI).

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Edit `backend/.env` before starting:

```
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_db
JWT_SECRET=<any long random string>
LOGSENTINEL_URL=http://LAPTOP_2_LAN_IP:8000
LOGSENTINEL_ASSET_ID=demo-store
LOGSENTINEL_CONTROL_TOKEN=shared-demo-secret     # must equal LogSentinel's token
LOGSENTINEL_DEMO_MODE=true
```

Then the storefront, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

`npm run seed` wipes users, products, carts and orders and recreates 28 products plus:

- `admin@example.com` / `admin123`
- `customer@example.com` / `customer123`

## LAN configuration

- The API binds `0.0.0.0:5000` (override with `HOST`); Vite binds all interfaces on `5173`.
- Find Laptop 1's address with `ipconfig` (Windows) or `ip addr` / `ifconfig`. Other machines browse
  `http://LAPTOP_1_LAN_IP:5173`.
- The storefront calls port 5000 on whichever host served the page, so no frontend `.env` is needed.
  Do not set `VITE_API_URL` to `localhost` for a LAN demo.
- With `LOGSENTINEL_DEMO_MODE=true` the API accepts any CORS origin. Otherwise list origins in
  `CLIENT_URL` (comma-separated).
- Windows Firewall: allow Node.js on private networks when prompted, or run once as admin:
  `netsh advfirewall firewall add rule name="ShopEase demo" dir=in action=allow protocol=TCP localport=5000,5173 profile=private`
- Laptop 2's firewall must allow inbound `8000` from Laptop 1.

## What the integration does

Code: `backend/middleware/logSentinel.js`, mounted on `/api` in `backend/server.js`.

**Telemetry.** Each completed API response is queued and sent as
`POST {LOGSENTINEL_URL}/api/events/batch` every 3 s, or immediately when 50 events are queued:

```json
{
  "asset_id": "demo-store",
  "events": [{
    "asset_id": "demo-store", "timestamp": "2026-10-08T11:29:37.285Z", "source": "shopease-api",
    "ip": "192.168.1.23", "method": "GET", "path": "/api/products", "status": 200, "latency_ms": 12,
    "user_agent": "Mozilla/5.0 …", "message": "GET /api/products → 200",
    "raw": "{…same fields as JSON…}"
  }]
}
```

`path` is the original URL including the query string. No bodies, cookies or auth headers are sent.
Blocked (403) requests are reported too.

**Containment.** Before any route runs, the API asks
`GET {LOGSENTINEL_URL}/api/control/blocked/{ip}?asset_id=demo-store` with header
`X-Demo-Control-Token`. `{"blocked": true}` → the request gets:

```json
{ "success": false, "blocked": true, "message": "Access denied: this client has been contained by the LogSentinel response policy." }
```

The answer is cached per IP for 1 s, so a block or unblock takes effect within about a second.

**Fail open.** If LogSentinel is unreachable, slow (>1 s) or rejects the token, traffic is allowed,
queued events are dropped, and a `[LogSentinel]` warning is logged (at most every 30 s). Failed
denylist checks are cached for 5 s. Leaving `LOGSENTINEL_URL` empty disables the integration.

**Client IP.** With `LOGSENTINEL_DEMO_MODE=true`, a valid IP in the `X-Demo-Source-IP` request header
is used as the client IP, so one machine can play several clients. Otherwise the header is ignored
and the real socket IP is used.

## Checking it by hand

```bash
curl http://LAPTOP_1_LAN_IP:5000/api/products
```

```bash
curl -i -H "X-Demo-Source-IP: 203.0.113.50" http://LAPTOP_1_LAN_IP:5000/api/products
```

The first is a normal shopper. The second appears in LogSentinel as `203.0.113.50`; once LogSentinel
contains that IP it returns `403` while the first keeps returning `200`.
