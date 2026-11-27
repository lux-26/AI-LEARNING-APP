// Limitation simple des appels coûteux aux fonctions IA (mémoire locale à l'instance).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;
const buckets = new Map();

export default function aiRateLimit(req, res, next) {
  const userId = req.user?._id?.toString();
  if (!userId) return res.status(401).json({ success: false, error: "Authentification requise" });

  const now = Date.now();
  let bucket = buckets.get(userId);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    bucket = { startedAt: now, count: 0 };
  }

  // Nettoyage opportuniste pour éviter une croissance sans limite de la Map.
  if (buckets.size > 5000) {
    for (const [key, value] of buckets) {
      if (now - value.startedAt >= WINDOW_MS) buckets.delete(key);
    }
  }

  if (bucket.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - bucket.startedAt)) / 1000);
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      error: "Limite temporaire des requêtes IA atteinte. Réessayez plus tard.",
    });
  }

  bucket.count += 1;
  buckets.set(userId, bucket);
  next();
}
