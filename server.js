require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { FieldValue } = require("firebase-admin/firestore");
const { auth, db } = require("./firebase-admin");
const { enviarEmailRecuperacao, enviarEmailLibras, enviarEmailDuvida } = require("./emailService");
const { authenticate } = require("./middleware/authenticate");
const { rateLimit } = require("./middleware/rateLimit");

const app = express();
const PORT = process.env.PORT || 3000;
const origins = (process.env.FRONTEND_ORIGIN || "http://localhost:5500").split(",").map((item) => item.trim());
app.set("trust proxy", 1);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "20kb" }));

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const supportLimit = rateLimit({ max: Number(process.env.SUPPORT_RATE_LIMIT || 5) });
const cleanName = (value, fallback) => typeof value === "string" && value.trim() ? value.trim().slice(0, 100) : fallback;

function nextBusinessDay() {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const date = new Date(Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day) + 1, 12));
    while ([0, 6].includes(date.getUTCDay())) date.setUTCDate(date.getUTCDate() + 1);
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

app.post("/auth/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!emailPattern.test(email || "")) return res.status(400).json({ sucesso: false, mensagem: "Informe um e-mail válido." });
        const link = await auth.generatePasswordResetLink(email);
        const oobCode = new URL(link).searchParams.get("oobCode");
        await enviarEmailRecuperacao(email, `${process.env.RESET_URL}?oobCode=${encodeURIComponent(oobCode)}`);
        return res.json({ sucesso: true, mensagem: "E-mail de recuperação enviado." });
    } catch (error) {
        console.error("Erro na recuperação:", error.message);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao enviar e-mail." });
    }
});

app.post("/api/atendimentos/libras", authenticate, supportLimit, async (req, res) => {
    try {
        const email = req.user.email;
        if (!emailPattern.test(email || "")) return res.status(400).json({ sucesso: false, mensagem: "A conta autenticada não possui um e-mail válido." });
        const nome = cleanName(req.user.name || req.body.nome, "Cliente");
        const atendimento = { usuarioId: req.user.uid, email, nome, tipo: "libras", duvida: null, status: "Pendente", atendente: process.env.SUPPORT_ATTENDANT_NAME, data: nextBusinessDay(), horario: process.env.SUPPORT_SCHEDULE_TIME, meetUrl: process.env.SUPPORT_MEET_URL, criadoEm: FieldValue.serverTimestamp() };
        if (!atendimento.atendente || !atendimento.horario || !atendimento.meetUrl) throw new Error("SUPPORT_CONFIG_MISSING");
        const ref = await db.collection("atendimentos").add(atendimento);
        try { await enviarEmailLibras(email, atendimento); } catch (error) { await ref.update({ status: "Falha no envio" }); throw error; }
        await ref.update({ status: "Agendado", emailEnviadoEm: FieldValue.serverTimestamp() });
        return res.status(201).json({ sucesso: true, mensagem: "As informações do atendimento foram enviadas para seu e-mail." });
    } catch (error) {
        console.error("Erro no atendimento em Libras:", error.message);
        return res.status(500).json({ sucesso: false, mensagem: "Não foi possível agendar o atendimento. Tente novamente." });
    }
});

app.post("/api/atendimentos/duvida", authenticate, supportLimit, async (req, res) => {
    const duvida = typeof req.body.duvida === "string" ? req.body.duvida.trim() : "";
    if (!duvida || duvida.length > 3000) return res.status(400).json({ sucesso: false, mensagem: "A dúvida é obrigatória e deve ter até 3000 caracteres." });
    if (!emailPattern.test(req.user.email || "")) return res.status(400).json({ sucesso: false, mensagem: "A conta autenticada não possui um e-mail válido." });
    try {
        const data = { usuarioId: req.user.uid, email: req.user.email, nome: cleanName(req.user.name || req.body.nome, "Cliente"), tipo: "texto", duvida, status: "Pendente", criadoEm: FieldValue.serverTimestamp() };
        const ref = await db.collection("atendimentos").add(data);
        const emailData = { ...data, solicitacaoId: ref.id, dataHora: new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date()) };
        try { await enviarEmailDuvida(emailData); } catch (error) { await ref.update({ status: "Falha no envio" }); throw error; }
        await ref.update({ status: "Encaminhado", emailEnviadoEm: FieldValue.serverTimestamp() });
        return res.status(201).json({ sucesso: true, mensagem: "Sua dúvida foi encaminhada para a equipe da Ludos." });
    } catch (error) {
        console.error("Erro ao encaminhar dúvida:", error.message);
        return res.status(500).json({ sucesso: false, mensagem: "Não foi possível encaminhar sua dúvida. Tente novamente." });
    }
});

if (require.main === module) app.listen(PORT, "0.0.0.0", () => console.log(`Servidor rodando na porta ${PORT}`));
module.exports = { app, nextBusinessDay };
