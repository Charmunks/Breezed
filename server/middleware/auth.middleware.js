import { verifyAuthToken } from '../utils/auth.util.js';

async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const user = await verifyAuthToken(token);
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

async function requireAdmin(req, res, next) {
    await requireAuth(req, res, () => {
        if (!req.user?.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
}

export { requireAuth, requireAdmin };
