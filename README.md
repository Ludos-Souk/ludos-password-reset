# Ludos - Backend de E-mails e Atendimento

Backend Node.js do Ludos responsável pela recuperação personalizada de senha, envio de e-mails, atendimento em Libras, encaminhamento de dúvidas e envios promocionais controlados.

O Firebase Authentication continua responsável pela validação dos usuários e pela alteração das senhas. Este backend utiliza o Firebase Admin SDK para gerar links de recuperação, verificar tokens e persistir solicitações de atendimento. O SendGrid realiza a entrega dos e-mails.

## Repositórios relacionados

| Repositório | Responsabilidade |
| ----------- | ---------------- |
| [ludos](https://github.com/Ludos-Souk/ludos) | Front-end da loja e integração com Firebase Web SDK. |
| [ludos-password-reset](https://github.com/Ludos-Souk/ludos-password-reset) | API de recuperação de senha, e-mails e atendimento. |
| [functions](https://github.com/Ludos-Souk/functions) | Atualização automática dos status dos pedidos. |

## Funcionalidades

- Geração de link de recuperação pelo Firebase Admin SDK;
- Envio de e-mail personalizado de redefinição de senha;
- Verificação de Firebase ID Token nas rotas protegidas;
- Solicitação de atendimento em Libras;
- Agendamento para o próximo dia útil;
- Envio de dúvidas para a equipe de suporte;
- Persistência dos atendimentos no Firestore;
- Limitação de solicitações por usuário ou endereço IP;
- Envio promocional em lote, protegido por segredo;
- Remoção de destinatários duplicados;
- Templates HTML e texto simples;
- CORS configurável;
- Respostas JSON padronizadas.

## Arquitetura

```mermaid
flowchart TD
    Frontend["Front-end Ludos"] --> API["Node.js e Express"]
    API --> Auth["Firebase Authentication"]
    API --> Firestore["Firebase Firestore"]
    API --> SendGrid["SendGrid"]
    SendGrid --> Usuario["Usuário ou suporte"]
```

## Tecnologias

- Node.js;
- Express;
- Firebase Admin SDK;
- Firebase Authentication;
- Firebase Firestore;
- SendGrid;
- CORS;
- dotenv;
- Render;
- Git e GitHub.

## API

Em produção, o front-end utiliza:

```text
https://ludos-password-reset.onrender.com
```

Todas as respostas utilizam JSON. Os formatos mais comuns são:

```json
{
  "sucesso": true,
  "mensagem": "Operação concluída."
}
```

```json
{
  "sucesso": false,
  "mensagem": "Não foi possível concluir a operação."
}
```

### `POST /auth/forgot-password`

Solicita o envio do e-mail de recuperação de senha.

#### Requisição

```http
POST /auth/forgot-password
Content-Type: application/json
```

```json
{
  "email": "usuario@email.com"
}
```

#### Processo

1. Valida o formato do e-mail;
2. Gera o link pelo Firebase Admin SDK;
3. Extrai o `oobCode`;
4. Monta a URL definida em `RESET_URL`;
5. Envia o template personalizado pelo SendGrid.

#### Respostas

- `200`: e-mail enviado;
- `400`: e-mail inválido;
- `500`: falha ao gerar o link ou enviar o e-mail.

### `POST /api/atendimentos/libras`

Cria uma solicitação de atendimento em Libras e envia os dados do agendamento ao usuário.

#### Autenticação

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

```json
{
  "nome": "Nome do cliente"
}
```

O ID e o e-mail são obtidos do token autenticado. Um e-mail enviado no corpo não substitui o e-mail do token.

A data é calculada como o próximo dia útil, de segunda a sexta-feira, no fuso `America/Sao_Paulo`. Feriados não são considerados. O horário e o link da reunião são configurados por variáveis de ambiente.

#### Respostas

- `201`: atendimento criado e e-mail enviado;
- `400`: conta sem e-mail válido;
- `401`: token ausente, inválido ou expirado;
- `429`: limite de solicitações atingido;
- `500`: configuração ausente ou falha interna.

### `POST /api/atendimentos/duvida`

Encaminha uma dúvida para a equipe de suporte.

#### Autenticação

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

```json
{
  "nome": "Nome do cliente",
  "duvida": "Texto com até 3000 caracteres"
}
```

A solicitação é persistida na coleção `atendimentos`. O e-mail enviado ao suporte inclui o identificador da solicitação e a data no fuso de São Paulo.

#### Respostas

- `201`: dúvida persistida e encaminhada;
- `400`: dúvida vazia, maior que 3000 caracteres ou conta sem e-mail válido;
- `401`: token ausente, inválido ou expirado;
- `429`: limite de solicitações atingido;
- `500`: falha de persistência ou envio.

### `POST /api/envios-promocionais/:senhaSecreta`

Envia uma mensagem promocional individual para até 100 destinatários.

```json
{
  "cupom": "LUDOS10",
  "envios": [
    {
      "nome": "Cliente",
      "email": "cliente@email.com"
    }
  ]
}
```

O segredo recebido na rota é comparado com `ENVIO_LOTE_SECRET`. O endpoint:

- Valida nomes e e-mails;
- Limita o lote a 100 itens;
- Remove e-mails duplicados;
- Envia uma mensagem individual para cada destinatário;
- Retorna quantidade de envios e falhas.

Possíveis respostas:

- `200`: todos os e-mails enviados;
- `207`: envio parcial;
- `400`: cupom ou destinatários inválidos;
- `401`: segredo inválido;
- `500`: configuração ausente;
- `502`: todos os envios falharam.

## Limitação de solicitações

As rotas de atendimento utilizam, por padrão, até cinco solicitações por usuário ou IP em uma janela de 15 minutos. O total pode ser alterado por `SUPPORT_RATE_LIMIT`.

A implementação atual mantém os registros da janela em memória. Em ambientes com múltiplas instâncias, recomenda-se utilizar um armazenamento compartilhado, como Redis.

## Persistência no Firestore

As rotas de atendimento gravam a coleção `atendimentos`.

Exemplo de atendimento em Libras:

```js
{
  usuarioId: "uid",
  email: "usuario@email.com",
  nome: "Nome",
  tipo: "libras",
  status: "Agendado",
  atendente: "Nome do atendente",
  data: "11/08/2026",
  horario: "14:00",
  meetUrl: "https://meet.google.com/...",
  criadoEm: serverTimestamp()
}
```

Exemplo de atendimento por texto:

```js
{
  usuarioId: "uid",
  email: "usuario@email.com",
  nome: "Nome",
  tipo: "texto",
  duvida: "Dúvida do usuário",
  status: "Encaminhado",
  criadoEm: serverTimestamp()
}
```

O front-end não deve gravar a mesma solicitação, pois isso criaria documentos duplicados.

## Estrutura

```text
ludos-password-reset/
├── assets/
│   └── logo-ludos.png
├── middleware/
│   ├── authenticate.js
│   └── rateLimit.js
├── templates/
│   ├── duvidaTemplate.js
│   ├── emailUtils.js
│   ├── librasTemplate.js
│   ├── promocionalTemplate.js
│   └── recuperacaoTemplate.js
├── .env.example
├── .gitignore
├── ATENDIMENTO.md
├── emailService.js
├── firebase-admin.js
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
└── server.js
```

## Como executar localmente

### Pré-requisitos

- Node.js;
- npm;
- Projeto Firebase com Authentication e Firestore;
- Service Account do Firebase;
- Conta e remetente verificado no SendGrid.

### Clonar e instalar

```bash
git clone https://github.com/Ludos-Souk/ludos-password-reset.git
cd ludos-password-reset
npm ci
```

### Configurar o ambiente

Copie `.env.example` para `.env` e preencha as variáveis:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5500
RESET_URL=http://localhost:5500/src/pages/resetarSenha.html

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

SENDGRID_API_KEY=
SENDGRID_SENDER_EMAIL=
SENDGRID_SENDER_NAME=Ludos

SITE_URL=http://localhost:5500
ENVIO_LOTE_SECRET=

SUPPORT_EMAIL=
SUPPORT_ATTENDANT_NAME=
SUPPORT_MEET_URL=https://meet.google.com/xxx-xxxx-xxx
SUPPORT_SCHEDULE_TIME=14:00
SUPPORT_RATE_LIMIT=5
```

### Variáveis de ambiente

| Variável | Finalidade |
| -------- | ---------- |
| `PORT` | Porta do servidor. O padrão é `3000`. |
| `FRONTEND_ORIGIN` | Origens permitidas pelo CORS, separadas por vírgula. |
| `RESET_URL` | Página do front-end que conclui a redefinição. |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase. |
| `FIREBASE_CLIENT_EMAIL` | E-mail da Service Account. |
| `FIREBASE_PRIVATE_KEY` | Chave privada da Service Account. |
| `SENDGRID_API_KEY` | Chave da API do SendGrid. |
| `SENDGRID_SENDER_EMAIL` | Remetente verificado no SendGrid. |
| `SENDGRID_SENDER_NAME` | Nome apresentado como remetente. |
| `SITE_URL` | Endereço do site incluído nos e-mails promocionais. |
| `ENVIO_LOTE_SECRET` | Segredo da rota de envio promocional. |
| `SUPPORT_EMAIL` | Destinatário das dúvidas dos usuários. |
| `SUPPORT_ATTENDANT_NAME` | Nome apresentado no atendimento em Libras. |
| `SUPPORT_MEET_URL` | Link da reunião de atendimento. |
| `SUPPORT_SCHEDULE_TIME` | Horário do atendimento. |
| `SUPPORT_RATE_LIMIT` | Máximo de solicitações por janela. |

### Iniciar o servidor

```bash
npm start
```

O servidor fica disponível em:

```text
http://localhost:3000
```

## Deploy no Render

Configuração sugerida:

```text
Build Command: npm ci
Start Command: npm start
```

Cadastre todas as variáveis no painel do Render. Não envie o arquivo `.env`.

Configure `FRONTEND_ORIGIN`, `RESET_URL` e `SITE_URL` com os endereços públicos corretos. O servidor utiliza a variável `PORT` fornecida pelo ambiente.

## Segurança

- Credenciais não devem ser versionadas;
- `.env` e `serviceAccountKey.json` devem permanecer no `.gitignore`;
- O backend verifica Firebase ID Token nas rotas de atendimento;
- O e-mail e o UID são obtidos do token, não do corpo da requisição;
- A chave privada aceita `\n` e é normalizada na inicialização;
- Os corpos JSON são limitados a 20 KB;
- O segredo promocional é comparado com `timingSafeEqual`;
- Templates devem escapar todo conteúdo controlado pelo usuário;
- Chaves expostas devem ser revogadas imediatamente.

Em uma evolução futura, recomenda-se mover o segredo promocional do caminho da URL para um cabeçalho de autorização e utilizar rate limiting compartilhado.

## Validação manual

1. Execute `npm start`;
2. Teste um e-mail válido e inválido em `/auth/forgot-password`;
3. Obtenha `firebaseUser.getIdToken()` no front-end autenticado;
4. Teste as duas rotas de atendimento;
5. Confirme o documento criado no Firestore;
6. Confirme as versões HTML e texto do e-mail;
7. Teste token ausente e expirado;
8. Teste dúvida vazia e com mais de 3000 caracteres;
9. Ultrapasse o limite para confirmar o status `429`;
10. Teste o lote promocional com destinatários duplicados e inválidos;
11. Confirme o funcionamento dos links de redefinição, site, Meet e `mailto:`.

### Validação de sintaxe

```bash
node --check server.js
node --check emailService.js
node --check firebase-admin.js
node --check middleware/authenticate.js
node --check middleware/rateLimit.js
node --check templates/duvidaTemplate.js
node --check templates/librasTemplate.js
node --check templates/promocionalTemplate.js
node --check templates/recuperacaoTemplate.js
```

## Equipe

| Integrante | Função principal | GitHub |
| ---------- | ---------------- | ------ |
| Gabriela Benfica Ricci | UX | [@gabkbenfica](https://github.com/gabkbenfica) |
| Giulia Monteiro Manara | Front-end | [@giumanara](https://github.com/giumanara) |
| João Vitor Maldonado Ianoni | Front-end | [@joohnyxxz](https://github.com/joohnyxxz) |
| Lucas Lima de Oliveira | Back-end | [@lucaslimaoliveira](https://github.com/lucaslimaoliveira) |

Apesar da divisão de responsabilidades, todos os integrantes devem conhecer o funcionamento geral da solução.

## Uso de inteligência artificial

Ferramentas de inteligência artificial foram utilizadas como apoio na estruturação do backend, integração com Firebase Admin e SendGrid, elaboração dos templates, configuração do CORS, tratamento de erros, segurança e documentação.

Todo conteúdo sugerido foi revisado, testado e adaptado pelos integrantes. A equipe permanece responsável pelas decisões técnicas e pela compreensão do código.

Não foram adicionadas instruções ocultas ou mecanismos destinados a interferir em ferramentas automatizadas de avaliação.

## Status

O backend está integrado ao front-end e preparado para execução local e deploy no Render. As funcionalidades dependem da configuração correta do Firebase, SendGrid e variáveis de ambiente.

## Licença

Este projeto está licenciado sob a licença MIT. Consulte [LICENSE](LICENSE).
