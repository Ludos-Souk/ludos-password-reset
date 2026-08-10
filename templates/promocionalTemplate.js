const { escapeHtml } = require("./emailUtils");

function promocionalTemplate({ nome, cupom, siteUrl }) {
    const safeName = escapeHtml(nome);
    const safeCoupon = escapeHtml(cupom);
    const safeSiteUrl = escapeHtml(siteUrl);
    const text = `Olá, ${nome}!

Queremos convidar você para conhecer a Ludos e descobrir nossos produtos.

Use o cupom ${cupom} para aproveitar uma condição especial.

Acesse: ${siteUrl}

Esperamos você!
Equipe Ludos`;

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Conheça a Ludos</title>
</head>
<body style="margin:0;padding:0;background-color:#eef0f3;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#eef0f3;">
        <tr>
            <td align="center" style="padding:24px 10px;">
                <table role="presentation" width="540" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:540px;background-color:#ffffff;border:5px solid #5790f5;border-radius:48px;font-family:Arial,Helvetica,sans-serif;color:#292929;">
                    <tr><td align="center" style="padding:52px 32px 24px;"><img src="cid:logo-ludos" alt="Ludos" width="105" style="display:block;width:105px;max-width:100%;height:auto;border:0;"></td></tr>
                    <tr><td style="padding:10px 64px 0;font-size:20px;line-height:1.3;">Olá, <strong>${safeName}</strong>!</td></tr>
                    <tr><td style="padding:22px 64px 0;font-size:20px;line-height:1.35;">Temos um convite especial para você: venha conhecer a <strong>Ludos</strong> e descobrir nossos produtos.</td></tr>
                    <tr><td align="center" style="padding:34px 64px 0;"><div style="background-color:#f3f6ff;border:2px dashed #5790f5;border-radius:18px;padding:20px;font-size:17px;line-height:1.4;">Use seu cupom especial:<br><strong style="display:inline-block;padding-top:6px;color:#173d95;font-size:27px;letter-spacing:1px;">${safeCoupon}</strong></div></td></tr>
                    <tr><td align="center" style="padding:34px 64px 18px;"><a href="${safeSiteUrl}" target="_blank" style="display:block;background-color:#ffda75;color:#292929;text-decoration:none;border-radius:30px;padding:17px 24px;font-size:19px;line-height:1.2;font-weight:bold;">Conhecer nossos produtos</a></td></tr>
                    <tr><td style="padding:18px 64px 0;font-size:16px;line-height:1.35;text-align:center;">Se o botão não funcionar, acesse:<br><a href="${safeSiteUrl}" target="_blank" style="color:#173d95;word-break:break-all;">${safeSiteUrl}</a></td></tr>
                    <tr><td style="padding:30px 64px 64px;font-size:18px;line-height:1.3;">Esperamos você!<br>Equipe Ludos</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { html, text };
}

module.exports = { promocionalTemplate };
