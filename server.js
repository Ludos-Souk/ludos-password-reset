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


        // Firebase gera o link original de recuperação
        const link = await auth.generatePasswordResetLink(
            email
        );


        // Pegamos o oobCode gerado pelo Firebase
        const url = new URL(link);

        const oobCode = url.searchParams.get(
            "oobCode"
        );


        // Criamos nosso próprio endereço para a página
        // de redefinição de senha
        const resetUrl =
            `${process.env.RESET_URL}?oobCode=${encodeURIComponent(oobCode)}`;


        console.log("Link personalizado:");
        console.log(resetUrl);


        // Envia o e-mail personalizado através do Gmail
        // utilizando o Nodemailer
        await enviarEmailRecuperacao(
            email,
            resetUrl
        );


        return res.status(200).json({
            sucesso: true,
            mensagem: "E-mail de recuperação enviado."
        });


    } catch (error) {

        console.error(
            "❌ Erro no processo de recuperação de senha:"
        );

        console.error(error);


        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao enviar e-mail."
        });

    }

});


app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Servidor rodando na porta ${PORT}`
    );

});