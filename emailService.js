require("dotenv").config();

async function enviarEmailRecuperacao(email, resetUrl) {

    try {

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },

                body: JSON.stringify({

                    sender: {
                        name: process.env.BREVO_SENDER_NAME,
                        email: process.env.BREVO_SENDER_EMAIL
                    },

                    to: [
                        {
                            email: email
                        }
                    ],

                    subject: "Redefinição de senha - Ludos",

                    htmlContent: `
                        <div style="font-family: Arial, sans-serif;">

                            <h2>Redefinição de senha</h2>

                            <p>
                                Recebemos uma solicitação para redefinir
                                sua senha no Ludos.
                            </p>

                            <p>
                                Clique no botão abaixo para criar uma
                                nova senha:
                            </p>

                            <a
                                href="${resetUrl}"
                                style="
                                    display: inline-block;
                                    padding: 12px 20px;
                                    background-color: #000000;
                                    color: #ffffff;
                                    text-decoration: none;
                                    border-radius: 6px;
                                "
                            >
                                Redefinir senha
                            </a>

                            <p>
                                Se você não solicitou essa alteração,
                                ignore este e-mail.
                            </p>

                        </div>
                    `
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error("❌ Erro ao enviar e-mail:");
            console.error(data);

            throw new Error("Erro ao enviar e-mail.");

        }

        console.log("✅ E-mail enviado com sucesso!");
        console.log(data);

        return data;

    } catch (error) {

        console.error("❌ Erro no envio do e-mail:");
        console.error(error);

        throw error;

    }
}

module.exports = {
    enviarEmailRecuperacao
};