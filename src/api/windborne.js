const BASE = process.env.NODE_ENV === 'production' ? '/api/treasure' : '/windborne/treasure';
export default BASE;

function coerceNum(x) {
  if (x == null) return null;
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  if (typeof x === 'string') {
    const cleaned = x.replace(',', '.');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalize(raw, fallbackId) {
  if (!raw) return null;

  if (Array.isArray(raw)) {
    const a = raw.map((x) =>
      typeof x === 'string' ? Number(x.replace(',', '.')) : x
    );

    const n0 = Number.isFinite(a[0]) ? a[0] : null;
    const n1 = Number.isFinite(a[1]) ? a[1] : null;
    const n2 = Number.isFinite(a[2]) ? a[2] : null;

    let lat = n0,
      lon = n1;

    const looksLikeLatLon = (lt, ln) =>
      lt != null && ln != null && Math.abs(lt) <= 90 && Math.abs(ln) <= 180;

    if (!looksLikeLatLon(lat, lon) && looksLikeLatLon(n1, n0)) {
      lat = n1;
      lon = n0;
    }

    if (!looksLikeLatLon(lat, lon)) return null;

    let t = null,
      alt = undefined;
    if (Number.isFinite(n2)) {
      if (n2 > 1e9 && n2 < 2e10) t = Math.floor(n2);
      else alt = n2;
    }

    return { id: String(fallbackId ?? ''), lat, lon, alt, t };
  }

  if (typeof raw !== 'object') return null;

  const id =
    raw.id ??
    raw.ID ??
    raw.name ??
    raw.balloon_id ??
    raw.deviceId ??
    raw.device_id ??
    fallbackId;

  const lat =
    coerceNum(raw.lat) ??
    coerceNum(raw.latitude) ??
    coerceNum(raw.Lat) ??
    coerceNum(raw.Latitude);

  const lon =
    coerceNum(raw.lon) ??
    coerceNum(raw.lng) ??
    coerceNum(raw.long) ??
    coerceNum(raw.longitude) ??
    coerceNum(raw.Lon) ??
    coerceNum(raw.Longitude);

  const alt =
    coerceNum(raw.alt) ??
    coerceNum(raw.altitude) ??
    coerceNum(raw.Alt) ??
    coerceNum(raw.Altitude);

  const t =
    coerceNum(raw.time) ??
    coerceNum(raw.timestamp) ??
    coerceNum(raw.ts) ??
    coerceNum(raw.unix) ??
    (raw.timestamp_iso
      ? Math.floor(Date.parse(raw.timestamp_iso) / 1000)
      : null);

  if (lat == null || lon == null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;

  return {
    id: String(id ?? ''),
    lat,
    lon,
    alt: alt ?? undefined,
    t: t ?? null,
  };
}

function flattenPayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  for (const key of ['data', 'items', 'points', 'features', 'balloons']) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  const vals = Object.values(payload).filter(
    (v) => v && (Array.isArray(v) || typeof v === 'object')
  );
  if (vals.length === 0) return [];

  if (vals.every(Array.isArray)) return vals.flat();

  const flattened = [];
  for (const v of vals) {
    if (Array.isArray(v)) flattened.push(...v);
    else flattened.push(v);
  }
  return flattened;
}

export async function fetchCurrentSnapshot() {
  const url = `${BASE}/00.json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await fetch(url, { cache: 'no-store', signal: controller.signal });
  } catch (err) {
    clearTimeout(timeoutId);
    throw new Error(`Fetch failed: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Invalid JSON');
  }

  const rawItems = flattenPayload(json);
  const out = [];
  const seen = new Set();

  const now = Math.floor(Date.now() / 1000);
  const DAY = 24 * 60 * 60;

  for (let i = 0; i < rawItems.length; i++) {
    const norm = normalize(rawItems[i], `balloon_${i}`);
    if (!norm) continue;

    if (norm.t != null && now - norm.t > DAY) continue;

    const key =
      norm.id && norm.id !== ''
        ? `id:${norm.id}`
        : `geo:${norm.lat.toFixed(4)},${norm.lon.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push(norm);
  }

  return out;
}
