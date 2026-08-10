require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { logoAttachment } = require("./templates/emailUtils");
const { librasTemplate } = require("./templates/librasTemplate");
const { duvidaTemplate } = require("./templates/duvidaTemplate");

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "not-configured");

function baseMessage(to, subject, content) {
    return {
        from: { email: process.env.SENDGRID_SENDER_EMAIL, name: process.env.SENDGRID_SENDER_NAME || "Ludos" },
        to,
        subject,
        attachments: [logoAttachment()],
        ...content
    };
}

async function send(message) {
    try {
        const [response] = await sgMail.send(message);
        return response;
    } catch (error) {
        console.error("Falha no SendGrid:", error.response?.body || error.message);
        throw new Error("EMAIL_DELIVERY_FAILED");
    }
}

async function enviarEmailRecuperacao(email, link) {
    const safeLink = String(link).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    return send(baseMessage(email, "Redefinição de senha - Ludos", {
        text: `Acesse o link para redefinir sua senha: ${link}`,
        html: `<p>Olá!</p><p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${safeLink}">Resetar senha</a></p><p>${safeLink}</p>`
    }));
}

const enviarEmailLibras = (email, data) => send(baseMessage(email, "Atendimento em Libras - Ludos", librasTemplate(data)));
const enviarEmailDuvida = (data) => send(baseMessage(process.env.SUPPORT_EMAIL, "Nova solicitação de atendimento - Ludos", duvidaTemplate(data)));

module.exports = { enviarEmailRecuperacao, enviarEmailLibras, enviarEmailDuvida };
