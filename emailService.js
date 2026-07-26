const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


async function enviarEmailRecuperacao(email, link) {

    await transporter.sendMail({

        from: `"Ludos" <${process.env.SMTP_USER}>`,

        to: email,

        subject: "Redefinição de senha - Ludos",

        html: `

            <!DOCTYPE html>

            <html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">

            
            <title>Redefinir senha - Ludos</title>

            <style>
                body,
                table,
                td,
                a {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }

                table,
                td {
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }

                img {
                    -ms-interpolation-mode: bicubic;
                    border: 0;
                    height: auto;
                    line-height: 100%;
                    outline: none;
                    text-decoration: none;
                }

                body {
                    margin: 0;
                    padding: 0;
                    width: 100% !important;
                    height: 100% !important;
                    background-color: #eef0f5;
                }

                @media screen and (max-width: 600px) {
                    .email-container {
                        width: 100% !important;
                    }

                    .fluid-padding {
                        padding-left: 20px !important;
                        padding-right: 20px !important;
                    }
                }
            </style>

            </head>

            <body style="margin:0; padding:0; background-color:#eef0f5;">

            <!-- Preheader -->
            <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
                Recebemos uma solicitação para redefinir a senha da sua conta no Ludos.
            </div>

            <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background-color:#eef0f5;"
            >
                <tr>
                    <td align="center" style="padding:30px 12px;">

                        <table
                            role="presentation"
                            class="email-container"
                            width="480"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                width:480px;
                                max-width:480px;
                                background-color:#ffffff;
                                border-radius:28px;
                                border:2px solid #7ca8f0;
                                overflow:hidden;
                            "
                        >

                            <!-- Logo -->
                            <tr>
                                <td
                                    align="center"
                                    class="fluid-padding"
                                    style="padding:44px 40px 10px 40px;"
                                >
                                    <img
                                        src="https://res.cloudinary.com/dbvmrjqcb/image/upload/v1784946860/Logo_Ludos_yeidyk.png"
                                        alt="Ludos"
                                        width="120"
                                        style="
                                            display:block;
                                            width:120px;
                                            height:auto;
                                            max-width:200px;
                                            border:0;
                                        "
                                    >
                                </td>
                            </tr>

                            <!-- Saudação -->
                            <tr>
                                <td
                                    class="fluid-padding"
                                    style="
                                        padding:20px 40px 0 40px;
                                        font-family:Arial, Helvetica, sans-serif;
                                        font-size:16px;
                                        line-height:26px;
                                        color:#333333;
                                    "
                                >
                                    Olá!
                                </td>
                            </tr>

                            <!-- Texto principal -->
                            <tr>
                                <td
                                    class="fluid-padding"
                                    style="
                                        padding:16px 40px 0 40px;
                                        font-family:Arial, Helvetica, sans-serif;
                                        font-size:16px;
                                        line-height:26px;
                                        color:#333333;
                                    "
                                >
                                    Recebemos uma solicitação para redefinir a senha da sua conta no Ludos.
                                    Se foi você quem pediu, basta
                                    <strong>clicar no botão abaixo para criar uma nova senha</strong>:
                                </td>
                            </tr>

                            <!-- Botão -->
                            <tr>
                                <td
                                    align="center"
                                    class="fluid-padding"
                                    style="padding:30px 40px;"
                                >
                                    <a
                                        href="${link}"
                                        target="_blank"
                                        style="
                                            background-color:#f4c94f;
                                            border-radius:26px;
                                            color:#3a2e00;
                                            display:inline-block;
                                            font-family:Arial, Helvetica, sans-serif;
                                            font-size:16px;
                                            font-weight:bold;
                                            line-height:52px;
                                            text-align:center;
                                            text-decoration:none;
                                            width:280px;
                                            -webkit-text-size-adjust:none;
                                        "
                                    >
                                        Resetar senha
                                    </a>
                                </td>
                            </tr>

                            <!-- Link alternativo -->
                            <tr>
                                <td
                                    class="fluid-padding"
                                    style="
                                        padding:10px 40px 0 40px;
                                        font-family:Arial, Helvetica, sans-serif;
                                        font-size:16px;
                                        line-height:26px;
                                        color:#333333;
                                    "
                                >
                                    Se o botão acima não funcionar, você também pode
                                    <strong>copiar e colar</strong> o link abaixo diretamente no seu navegador:

                                    <br><br>

                                    <a
                                        href="${link}"
                                        target="_blank"
                                        style="
                                            color:#4a6fe0;
                                            word-break:break-all;
                                        "
                                    >
                                        ${link}
                                    </a>
                                </td>
                            </tr>

                            <!-- Expiração -->
                            <tr>
                                <td
                                    class="fluid-padding"
                                    style="
                                        padding:24px 40px 0 40px;
                                        font-family:Arial, Helvetica, sans-serif;
                                        font-size:16px;
                                        line-height:26px;
                                        color:#333333;
                                    "
                                >
                                    Este link é válido por
                                    <strong>apenas 1 hora</strong>.
                                    Se não foi você quem solicitou essa alteração,
                                    pode ignorar este e-mail tranquilamente.
                                </td>
                            </tr>

                            <!-- Rodapé -->
                            <tr>
                                <td
                                    class="fluid-padding"
                                    style="
                                        padding:24px 40px 44px 40px;
                                        font-family:Arial, Helvetica, sans-serif;
                                        font-size:16px;
                                        line-height:24px;
                                        color:#333333;
                                    "
                                >
                                    Atenciosamente,<br>
                                    Equipe Ludos
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>
            </body>
            </html>
            `

    });
}


module.exports = {
    enviarEmailRecuperacao
};