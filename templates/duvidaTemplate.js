const { escapeHtml } = require("./emailUtils");

function duvidaTemplate(data) {
    const v = Object.fromEntries(Object.entries(data).map(([k, value]) => [k, escapeHtml(value)]));
    const replyUrl = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent("Resposta da equipe Ludos")}`;
    const text = `Nova solicitação de atendimento\n\nCliente: ${data.nome}\nE-mail: ${data.email}\nUsuário: ${data.usuarioId}\nSolicitação: ${data.solicitacaoId}\nData: ${data.dataHora}\nTipo: texto\n\nDúvida:\n${data.duvida}`;
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Nova solicitação</title></head><body style="margin:0;background:#eef0f5;padding:24px 10px"><table role="presentation" width="100%"><tr><td align="center"><table role="presentation" width="600" style="width:100%;max-width:600px;background:#fff;border:3px solid #5b91f5;border-radius:28px;font-family:Arial,sans-serif;color:#333"><tr><td align="center" style="padding:34px 30px 12px"><img src="cid:logo-ludos" alt="Ludos" width="105"></td></tr><tr><td style="padding:12px 40px 36px"><h1 style="font-size:23px;color:#173d95">Nova solicitação de atendimento</h1><p><strong>Cliente:</strong> ${v.nome}<br><strong>E-mail:</strong> ${v.email}<br><strong>Usuário:</strong> ${v.usuarioId}<br><strong>Solicitação:</strong> ${v.solicitacaoId}<br><strong>Data:</strong> ${v.dataHora}<br><strong>Tipo:</strong> texto</p><h2 style="font-size:18px">Dúvida</h2><div style="white-space:pre-wrap;background:#f5f7fb;border-radius:12px;padding:18px">${v.duvida}</div><p style="text-align:center;margin-top:28px"><a href="${escapeHtml(replyUrl)}" style="display:inline-block;background:#ffd873;color:#292929;text-decoration:none;border-radius:25px;padding:14px 28px;font-weight:bold">Responder ao cliente</a></p></td></tr></table></td></tr></table></body></html>`;
    return { html, text };
}

module.exports = { duvidaTemplate };
