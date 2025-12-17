const rateLimitStore = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, { count: 1, windowStart: now });
        return next();
    }

    const record = rateLimitStore.get(ip);

    if (now - record.windowStart > WINDOW_MS) {
        record.count = 1;
        record.windowStart = now;
        return next();
    }

    record.count++;

    if (record.count > MAX_REQUESTS) {
        return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    next();
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitStore.entries()) {
        if (now - record.windowStart > WINDOW_MS) {
            rateLimitStore.delete(ip);
        }
    }
}, WINDOW_MS);

export { rateLimit };
