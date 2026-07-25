require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { auth } = require("./firebase-admin");

const {
    enviarEmailRecuperacao
} = require("./emailService");


const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());


app.post("/auth/forgot-password", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                sucesso: false,
                mensagem: "E-mail é obrigatório."
            });

        }

        // Firebase gera o link original
        const link = await auth.generatePasswordResetLink(
            email
        );

        // Pegamos o oobCode gerado pelo Firebase
        const url = new URL(link);

        const oobCode = url.searchParams.get(
            "oobCode"
        );

        // Criamos nosso próprio endereço
        const resetUrl =
            `${process.env.RESET_URL}?oobCode=${encodeURIComponent(oobCode)}`;

        console.log("Link personalizado:");
        console.log(resetUrl);

        // Envia nosso link no e-mail
        await enviarEmailRecuperacao(
            email,
            resetUrl
        );

        res.json({
            sucesso: true,
            mensagem: "E-mail de recuperação enviado."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao enviar e-mail."
        });

    }

});


app.listen(PORT, () => {

    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );

});