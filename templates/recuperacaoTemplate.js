const { escapeHtml } = require("./emailUtils");

function recuperacaoTemplate(link) {
    const safeLink = escapeHtml(link);
    const text = `Olá!

Recebemos uma solicitação para redefinir a senha da sua conta no Ludos. Se foi você quem pediu, basta acessar o link abaixo para criar uma nova senha:

${link}

Este link é válido por apenas 24 horas. Se não foi você quem solicitou essa alteração, pode ignorar este e-mail tranquilamente.

Atenciosamente,
Equipe Ludos`;

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Redefinição de senha - Ludos</title>
</head>
<body style="margin:0;padding:0;background-color:#eef0f3;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#eef0f3;">
        <tr>
            <td align="center" style="padding:24px 10px;">
                <table role="presentation" width="540" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:540px;background-color:#ffffff;border:5px solid #5790f5;border-radius:48px;font-family:Arial,Helvetica,sans-serif;color:#292929;">
                    <tr>
                        <td align="center" style="padding:64px 32px 28px;">
                            <img src="cid:logo-ludos" alt="Ludos" width="105" style="display:block;width:105px;max-width:100%;height:auto;border:0;">
                        </td>
                    </tr>
                    <tr><td style="padding:8px 72px 0;font-size:20px;line-height:1.2;">Olá!</td></tr>
                    <tr><td style="padding:22px 72px 0;font-size:20px;line-height:1.15;">Recebemos uma solicitação para redefinir a senha da sua conta no Ludos. Se foi você quem pediu, basta <strong>clicar no botão abaixo para criar uma nova senha:</strong></td></tr>
                    <tr><td align="center" style="padding:40px 72px 20px;"><a href="${safeLink}" target="_blank" style="display:block;background-color:#ffda75;color:#292929;text-decoration:none;border-radius:30px;padding:17px 24px;font-size:19px;line-height:1.2;">Resetar senha</a></td></tr>
                    <tr><td style="padding:20px 68px 0;font-size:19px;line-height:1.2;">Se o botão acima não funcionar, você também pode <strong>copiar e colar</strong> o link abaixo diretamente no seu navegador:<div style="padding-top:2px;word-break:break-all;"><a href="${safeLink}" target="_blank" style="color:#292929;text-decoration:none;">${safeLink}</a></div></td></tr>
                    <tr><td style="padding:24px 68px 0;font-size:19px;line-height:1.2;">Este link é válido por <strong>apenas 24 horas</strong>. Se não foi você quem solicitou essa alteração, pode ignorar este e-mail tranquilamente.</td></tr>
                    <tr><td style="padding:24px 68px 88px;font-size:19px;line-height:1.2;">Atenciosamente,<br>Equipe Ludos</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { html, text };
}

module.exports = { recuperacaoTemplate };
