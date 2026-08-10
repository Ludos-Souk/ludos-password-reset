require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");
const { auth, db } = require("./firebase-admin");
const { enviarEmailRecuperacao, enviarEmailLibras, enviarEmailDuvida, enviarEmailPromocional } = require("./emailService");
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

function secretsMatch(received, expected) {
    if (typeof received !== "string" || typeof expected !== "string" || !expected) return false;
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

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

app.post("/api/envios-promocionais/:senhaSecreta", async (req, res) => {
    if (!secretsMatch(req.params.senhaSecreta, process.env.ENVIO_LOTE_SECRET)) {
        return res.status(401).json({ sucesso: false, mensagem: "Não autorizado." });
    }

    const cupom = typeof req.body.cupom === "string" ? req.body.cupom.trim() : "";
    const envios = req.body.envios;
    if (!cupom || cupom.length > 60 || /[\r\n]/.test(cupom)) {
        return res.status(400).json({ sucesso: false, mensagem: "O cupom é obrigatório, não pode conter quebras de linha e deve ter até 60 caracteres." });
    }
    if (!Array.isArray(envios) || envios.length === 0 || envios.length > 100) {
        return res.status(400).json({ sucesso: false, mensagem: "Envios deve conter entre 1 e 100 destinatários." });
    }

    const destinatarios = [];
    const emailsVistos = new Set();
    for (let index = 0; index < envios.length; index += 1) {
        const nome = cleanName(envios[index]?.nome, "");
        const email = typeof envios[index]?.email === "string" ? envios[index].email.trim().toLowerCase() : "";
        if (!nome || !emailPattern.test(email)) {
            return res.status(400).json({ sucesso: false, mensagem: `Nome ou e-mail inválido no item ${index + 1}.` });
        }
        if (!emailsVistos.has(email)) {
            emailsVistos.add(email);
            destinatarios.push({ nome, email });
        }
    }

    const siteUrl = process.env.SITE_URL;
    if (!siteUrl) return res.status(500).json({ sucesso: false, mensagem: "SITE_URL não está configurada." });

    const falhas = [];
    let enviados = 0;
    for (const destinatario of destinatarios) {
        try {
            await enviarEmailPromocional(destinatario.email, { nome: destinatario.nome, cupom, siteUrl });
            enviados += 1;
        } catch (error) {
            console.error("Falha no envio promocional:", destinatario.email, error.message);
            falhas.push({ email: destinatario.email, motivo: "Falha no envio." });
        }
    }

    const status = falhas.length === 0 ? 200 : enviados > 0 ? 207 : 502;
    return res.status(status).json({ sucesso: falhas.length === 0, enviados, falhas });
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
