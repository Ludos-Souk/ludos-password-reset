# Ludos Password Reset

Backend desenvolvido para o **Ludos** com o objetivo de implementar um fluxo personalizado e seguro de **recuperação e redefinição de senha**.

A solução foi construída para resolver uma limitação do fluxo padrão do Firebase Authentication: a necessidade de personalizar o e-mail enviado ao usuário e controlar a página para a qual ele é direcionado durante o processo de recuperação.

O backend atua como uma camada intermediária entre o frontend, o Firebase Authentication e o serviço de envio de e-mails.

---

## 🎯 Objetivo

O objetivo principal deste projeto é fornecer um fluxo de recuperação de senha no qual o Ludos tenha controle sobre:

* 📧 Template HTML do e-mail;
* 🔗 Link de recuperação enviado ao usuário;
* 🌐 Página de redefinição de senha;
* 🔑 Geração do código de recuperação através do Firebase;
* 📤 Envio do e-mail através de SMTP;
* 🔒 Proteção das credenciais utilizadas pelo backend.

O Firebase Authentication continua sendo responsável pelo gerenciamento da senha do usuário. O backend é responsável principalmente por **gerar o link de recuperação e enviar o e-mail personalizado**.

---

# 🏗️ Arquitetura

O fluxo desenvolvido funciona da seguinte maneira:

```text
                    LUDOS
                      │
                      ▼
              ┌───────────────┐
              │   Frontend    │
              │   JavaScript  │
              └───────┬───────┘
                      │
                      │ POST /auth/forgot-password
                      ▼
              ┌───────────────┐
              │   Backend     │
              │ Node.js +     │
              │ Express       │
              └───────┬───────┘
                      │
             ┌────────┴─────────┐
             ▼                  ▼
      ┌─────────────┐    ┌─────────────┐
      │  Firebase   │    │  Nodemailer │
      │ Admin SDK   │    │    + SMTP   │
      └──────┬──────┘    └──────┬──────┘
             │                  │
             │ Gera link        │ Envia e-mail
             │                  │
             └────────┬─────────┘
                      ▼
               📧 Usuário recebe
                e-mail Ludos
                      │
                      ▼
              🔗 Link de reset
                      │
                      ▼
              Página de redefinição
                      │
                      ▼
             Firebase Authentication
                      │
                      ▼
                🔑 Nova senha
```

---

# 🚀 Funcionalidades

### Recuperação de senha

O usuário informa seu e-mail no frontend e solicita a recuperação da senha.

O frontend envia uma requisição para:

```http
POST /auth/forgot-password
```

O backend então:

1. Recebe o e-mail;
2. Gera o link de recuperação utilizando o Firebase Admin SDK;
3. Define a URL personalizada da página de redefinição;
4. Monta o template HTML do e-mail;
5. Envia o e-mail utilizando Nodemailer;
6. Retorna uma resposta ao frontend.

---

### 📧 E-mail personalizado

Em vez de utilizar o template padrão disponibilizado pelo Firebase, o backend utiliza um template HTML próprio do Ludos.

O e-mail possui:

* Logo do Ludos;
* Identidade visual da aplicação;
* Mensagem personalizada;
* Botão **"Resetar senha"**;
* Link alternativo para recuperação;
* Informação sobre a validade do link;
* Rodapé personalizado.

O link gerado pelo Firebase é inserido dinamicamente no template através de uma variável:

```javascript
${link}
```

Dessa forma, o mesmo template pode ser utilizado para diferentes usuários e solicitações.

---

# 🔗 API

## `POST /auth/forgot-password`

Inicia o processo de recuperação de senha.

### Request

```http
POST /auth/forgot-password
Content-Type: application/json
```

### Body

```json
{
    "email": "usuario@email.com"
}
```

### Exemplo com JavaScript

```javascript
const response = await fetch(
    "http://localhost:3000/auth/forgot-password",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email
        })
    }
);

const data = await response.json();
```

### Resposta de sucesso

```json
{
    "sucesso": true,
    "mensagem": "E-mail de recuperação enviado."
}
```

### Resposta de erro

Caso ocorra algum problema no processo, o backend retorna uma resposta HTTP de erro contendo uma mensagem explicativa.

---

# 🔑 Responsabilidade do Firebase

O Firebase continua sendo responsável pela parte crítica da autenticação.

O backend utiliza o **Firebase Admin SDK** para gerar o link de recuperação.

O link contém informações necessárias para que o Firebase consiga identificar e validar a solicitação, como o código de ação.

O backend **não armazena nem manipula a senha do usuário**.

Após o usuário acessar o link, o frontend utiliza o Firebase Web SDK para concluir a alteração da senha:

```javascript
confirmPasswordReset(
    auth,
    oobCode,
    novaSenha
);
```

Assim, a responsabilidade fica dividida:

| Componente              | Responsabilidade                                       |
| ----------------------- | ------------------------------------------------------ |
| Frontend                | Solicitar recuperação e permitir criação da nova senha |
| Backend                 | Gerar o link e enviar o e-mail personalizado           |
| Firebase Admin          | Gerar o link de recuperação                            |
| Nodemailer              | Enviar o e-mail                                        |
| Firebase Authentication | Validar o código e atualizar a senha                   |

---

# 📂 Estrutura do Backend

```text
ludos-backend/
│
├── server.js
├── firebase-admin.js
├── emailService.js
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

### `server.js`

Responsável por:

* Inicializar o Express;
* Configurar o CORS;
* Configurar o processamento de JSON;
* Disponibilizar o endpoint de recuperação;
* Inicializar o servidor.

---

### `firebase-admin.js`

Responsável pela configuração do Firebase Admin SDK.

As credenciais são obtidas através de variáveis de ambiente:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

Isso evita que informações sensíveis sejam armazenadas diretamente no código.

---

### `emailService.js`

Responsável pelo envio do e-mail de recuperação.

Utiliza:

```text
Nodemailer
      ↓
SMTP
      ↓
E-mail do usuário
```

Também contém o template HTML personalizado utilizado no e-mail.

---

# 🛠️ Tecnologias utilizadas

| Tecnologia                  | Utilização                             |
| --------------------------- | -------------------------------------- |
| **Node.js**                 | Ambiente de execução do backend        |
| **Express**                 | Construção da API                      |
| **Firebase Admin SDK**      | Geração do link de recuperação         |
| **Firebase Authentication** | Gerenciamento da autenticação e senha  |
| **Nodemailer**              | Envio do e-mail                        |
| **SMTP**                    | Serviço de envio de mensagens          |
| **CORS**                    | Comunicação entre frontend e backend   |
| **dotenv**                  | Gerenciamento de variáveis de ambiente |
| **Render**                  | Hospedagem do backend                  |
| **Git / GitHub**            | Versionamento do projeto               |

---

# ⚙️ Como executar localmente

## Pré-requisitos

Para executar o projeto, é necessário possuir:

* [Node.js](https://nodejs.org/) instalado;
* npm;
* Um projeto configurado no Firebase;
* Firebase Authentication habilitado;
* Uma conta de e-mail com SMTP disponível.

---

## 1. Clonar o projeto

```bash
git clone https://github.com/SEU-USUARIO/ludos-backend.git
```

Entre na pasta:

```bash
cd ludos-backend
```

---

## 2. Instalar as dependências

```bash
npm install
```

---

## 3. Configurar as variáveis de ambiente

Crie um arquivo:

```text
.env
```

na raiz do projeto.

Exemplo:

```env
SMTP_USER=seuemail@gmail.com
SMTP_PASS=sua_senha_de_aplicativo

FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_CLIENT_EMAIL=seu_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
```

### Variáveis

| Variável                | Descrição                        |
| ----------------------- | -------------------------------- |
| `SMTP_USER`             | E-mail utilizado para envio      |
| `SMTP_PASS`             | Senha de aplicativo do SMTP      |
| `FIREBASE_PROJECT_ID`   | ID do projeto Firebase           |
| `FIREBASE_CLIENT_EMAIL` | E-mail da Service Account        |
| `FIREBASE_PRIVATE_KEY`  | Chave privada da Service Account |

> ⚠️ **Nunca compartilhe essas informações publicamente.**

---

## 4. Iniciar o servidor

Execute:

```bash
npm start
```

O servidor será executado localmente, utilizando a porta definida pela variável `PORT` ou, em ambiente local, a porta padrão configurada no projeto.

Exemplo:

```text
http://localhost:3000
```

---

# 🔒 Segurança

As credenciais utilizadas pelo Firebase Admin e pelo SMTP **não fazem parte do código versionado**.

O projeto utiliza variáveis de ambiente para armazenar informações sensíveis.

O `.gitignore` deve impedir o versionamento de:

```gitignore
node_modules/
.env
serviceAccountKey.json
```

Entre as informações protegidas estão:

* Senha SMTP;
* Senha de aplicativo;
* Firebase Private Key;
* Credenciais da Service Account.

---

# ☁️ Deploy

O backend foi preparado para ser hospedado no **Render**.

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

As credenciais devem ser configuradas no painel do Render através das Environment Variables.

O backend utiliza a variável `PORT` fornecida pelo ambiente de hospedagem.

---

# 🔄 Fluxo completo

O fluxo final implementado pode ser resumido em:

```text
1. Usuário informa o e-mail
             ↓
2. Frontend chama a API
             ↓
3. POST /auth/forgot-password
             ↓
4. Backend recebe o e-mail
             ↓
5. Firebase Admin gera o link
             ↓
6. Backend monta o template HTML
             ↓
7. Nodemailer envia o e-mail
             ↓
8. Usuário recebe o e-mail personalizado
             ↓
9. Usuário clica em "Resetar senha"
             ↓
10. Página de redefinição é aberta
             ↓
11. Firebase valida o código
             ↓
12. Usuário define uma nova senha
             ↓
13. Firebase atualiza a senha
```

---

# 👥 Equipe

| Integrante           | Área     | GitHub                                                     |
| -------------------- | -------- | ---------------------------------------------------------- |
| **Lucas Lima**       | Backend  | [@lucaslimaoliveira](https://github.com/lucaslimaoliveira) |
| **Giulia Manara**    | Frontend | [@giumanara](https://github.com/giumanara)                 |
| **João Victor**      | Frontend | [@joohnyxxz](https://github.com/joohnyxxz)                 |
| **Gabriela Benfica** | UX       | [@gabkbenfica](https://github.com/gabkbenfica)             |

### Responsabilidades

**Lucas Lima — Backend**

Responsável pela construção do backend de recuperação de senha, integração com Firebase Admin, geração do link de recuperação, configuração do Nodemailer, criação do template de e-mail e preparação do serviço para deploy.

**Giulia Manara — Frontend**

Responsável pelo desenvolvimento da interface frontend e integração com o fluxo de recuperação de senha.

**João Victor — Frontend**

Responsável pelo desenvolvimento e implementação das interfaces frontend relacionadas ao projeto.

**Gabriela Benfica — UX**

Responsável pela experiência do usuário e decisões de UX/UI relacionadas ao fluxo da aplicação.

---

# 🤖 Uso de Inteligência Artificial

Durante o desenvolvimento deste projeto foi utilizado **ChatGPT (OpenAI)** como ferramenta de apoio.

A IA foi utilizada principalmente para:

* Apoiar a estruturação inicial do backend;
* Auxiliar na integração com o Firebase Admin SDK;
* Apoiar a implementação do fluxo de recuperação de senha;
* Auxiliar na configuração do Nodemailer e SMTP;
* Auxiliar na identificação e resolução de erros durante o desenvolvimento;
* Apoiar a configuração do CORS;
* Auxiliar na preparação do backend para deploy no Render;
* Apoiar a elaboração e organização da documentação.

O código foi analisado, testado, adaptado e compreendido pelos integrantes responsáveis antes de ser utilizado no projeto.

A utilização da IA ocorreu como **ferramenta de apoio ao desenvolvimento**, não substituindo a compreensão e a participação dos integrantes na implementação.

---

# 📌 Status

**Em desenvolvimento 🚧**

O fluxo de recuperação de senha está implementado e o backend está preparado para comunicação com o frontend e hospedagem em ambiente de produção.

---

<p align="center">
  Desenvolvido para o projeto <strong>Ludos</strong> 💙
</p>
