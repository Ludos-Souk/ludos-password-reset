const attempts = new Map();

function rateLimit({ windowMs = 15 * 60 * 1000, max = 5 } = {}) {
    return (req, res, next) => {
        const key = req.user?.uid || req.ip;
        const now = Date.now();
        const recent = (attempts.get(key) || []).filter((time) => now - time < windowMs);
        if (recent.length >= max) return res.status(429).json({ sucesso: false, mensagem: "Muitas solicitações. Tente novamente mais tarde." });
        recent.push(now);
        attempts.set(key, recent);
        next();
    };
}

module.exports = { rateLimit };
