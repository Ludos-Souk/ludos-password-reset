const { auth } = require("../firebase-admin");

async function authenticate(req, res, next) {
    const match = req.get("authorization")?.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ sucesso: false, mensagem: "Autenticação necessária." });
    try {
        req.user = await auth.verifyIdToken(match[1]);
        return next();
    } catch {
        return res.status(401).json({ sucesso: false, mensagem: "Token inválido ou expirado." });
    }
}

module.exports = { authenticate };
