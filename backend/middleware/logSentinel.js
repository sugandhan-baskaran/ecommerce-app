// Demo-only bridge to LogSentinel: ships API telemetry and enforces its denylist.
// Everything here fails open — a LogSentinel outage must never take down the store.
import { isIP } from "node:net";

const FLUSH_INTERVAL_MS = 3000;
const MAX_BATCH = 50;
const DELIVERY_TIMEOUT_MS = 3000;
const BLOCK_CACHE_MS = 1000;
const LOOKUP_TIMEOUT_MS = 1000;
// While LogSentinel is unreachable, back off so requests don't each wait on a timeout.
const LOOKUP_FAILURE_CACHE_MS = 5000;
const MAX_CACHED_IPS = 5000;
const WARN_EVERY_MS = 30000;

const queue = [];
let flushTimer;
const denyCache = new Map();
const lastWarned = {};

const config = () => ({
  apiUrl: (process.env.LOGSENTINEL_URL || "").trim().replace(/\/+$/, ""),
  assetId: process.env.LOGSENTINEL_ASSET_ID || "demo-store",
  controlToken: process.env.LOGSENTINEL_CONTROL_TOKEN || "",
  demoMode: process.env.LOGSENTINEL_DEMO_MODE === "true",
});

function warn(kind, message) {
  const now = Date.now();
  if (now - (lastWarned[kind] || 0) < WARN_EVERY_MS) return;
  lastWarned[kind] = now;
  console.warn(`[LogSentinel] ${message}`);
}

function clientIp(req) {
  // The spoofable header is only honoured while presenting the controlled demo.
  if (config().demoMode) {
    const demoIp = (req.get("x-demo-source-ip") || "").trim();
    if (isIP(demoIp)) return demoIp;
  }
  const ip = (req.ip || req.socket?.remoteAddress || "unknown").replace(/^::ffff:/, "");
  return ip === "::1" ? "127.0.0.1" : ip;
}

async function flush() {
  clearTimeout(flushTimer);
  flushTimer = undefined;
  const events = queue.splice(0, queue.length);
  if (!events.length) return;
  const { apiUrl, assetId } = config();
  try {
    const response = await fetch(`${apiUrl}/api/events/batch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ asset_id: assetId, events }),
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    if (!response.ok) warn("telemetry", `telemetry rejected with HTTP ${response.status}`);
  } catch (error) {
    // Dropped, not retried: the queue stays bounded during an outage.
    warn("telemetry", `telemetry delivery failed (${events.length} events dropped): ${error.message}`);
  }
}

function enqueue(event) {
  queue.push(event);
  if (queue.length >= MAX_BATCH) return void flush();
  if (!flushTimer) {
    flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
    flushTimer.unref();
  }
}

export function logSentinelTelemetry(req, res, next) {
  if (!config().apiUrl) return next();
  const started = performance.now();
  const ip = clientIp(req);
  res.on("finish", () => {
    const event = {
      asset_id: config().assetId,
      timestamp: new Date().toISOString(),
      source: "shopease-api",
      ip,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latency_ms: Math.round(performance.now() - started),
      user_agent: req.get("user-agent") || "unknown",
      message: `${req.method} ${req.originalUrl} → ${res.statusCode}`,
    };
    // Request metadata only — never bodies, cookies or Authorization headers.
    event.raw = JSON.stringify({ ...event, message: undefined });
    enqueue(event);
  });
  next();
}

async function lookupBlocked(ip) {
  const { apiUrl, assetId, controlToken } = config();
  try {
    const response = await fetch(
      `${apiUrl}/api/control/blocked/${encodeURIComponent(ip)}?asset_id=${encodeURIComponent(assetId)}`,
      { headers: { "x-demo-control-token": controlToken }, signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    return { blocked: body?.blocked === true, ttl: BLOCK_CACHE_MS };
  } catch (error) {
    warn("containment", `denylist check unavailable, allowing traffic: ${error.message}`);
    return { blocked: false, ttl: LOOKUP_FAILURE_CACHE_MS };
  }
}

function isBlocked(ip) {
  const cached = denyCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  if (denyCache.size >= MAX_CACHED_IPS) {
    const now = Date.now();
    for (const [key, entry] of denyCache) if (entry.expiresAt <= now) denyCache.delete(key);
  }
  // Cache the in-flight lookup so a burst from one IP shares a single request.
  const entry = { expiresAt: Infinity };
  entry.result = lookupBlocked(ip).then(({ blocked, ttl }) => {
    entry.expiresAt = Date.now() + ttl;
    return blocked;
  });
  denyCache.set(ip, entry);
  return entry.result;
}

export async function logSentinelContainment(req, res, next) {
  if (!config().apiUrl) return next();
  if (await isBlocked(clientIp(req))) {
    return res.status(403).json({
      success: false,
      blocked: true,
      message: "Access denied: this client has been contained by the LogSentinel response policy.",
    });
  }
  next();
}
