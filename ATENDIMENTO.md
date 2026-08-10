# Integração da API de atendimento

As duas rotas exigem `Content-Type: application/json` e o Firebase ID token em `Authorization: Bearer <token>`. O e-mail e o ID são obtidos do token; um e-mail enviado no corpo é ignorado.

## Libras

`POST /api/atendimentos/libras`

```json
{ "nome": "Nome do cliente" }
```

```js
const token = await firebaseUser.getIdToken();
const response = await fetch(`${API_URL}/api/atendimentos/libras`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ nome: firebaseUser.displayName })
});
const resultado = await response.json();
```

A data é o próximo dia útil (segunda a sexta-feira) em `America/Sao_Paulo`; feriados não são considerados. O horário vem de `SUPPORT_SCHEDULE_TIME`.

## Dúvida

`POST /api/atendimentos/duvida`

```json
{ "nome": "Nome do cliente", "duvida": "Texto com até 3000 caracteres" }
```

```js
const token = await firebaseUser.getIdToken();
const response = await fetch(`${API_URL}/api/atendimentos/duvida`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify({ nome: firebaseUser.displayName, duvida })
});
const resultado = await response.json();
```

O frontend deve desativar o botão durante a chamada, exibir carregamento e reativá-lo em `finally`. Use `response.ok` e `resultado.mensagem` nos estados de sucesso/erro. Remova a gravação do atendimento no frontend: o backend agora grava a coleção `atendimentos` e fazê-lo nos dois lados criaria duplicatas.

Todas as respostas usam `{ "sucesso": boolean, "mensagem": string }`. Status: `201` sucesso, `400` validação, `401` autenticação, `429` limite e `500` falha interna/envio.

## Ambiente

Use `.env.example`. Além das configurações existentes de Firebase e SendGrid, configure `FRONTEND_ORIGIN` (origens separadas por vírgula), `SUPPORT_EMAIL`, `SUPPORT_ATTENDANT_NAME`, `SUPPORT_MEET_URL`, `SUPPORT_SCHEDULE_TIME` e, opcionalmente, `SUPPORT_RATE_LIMIT`.

## Validação manual

1. Inicie com `npm start` e obtenha `firebaseUser.getIdToken()` no frontend autenticado.
2. Chame cada rota e confirme status `201`, documento no Firestore e e-mail HTML/texto.
3. Teste token ausente (`401`), dúvida vazia ou maior que 3000 (`400`) e mais de cinco chamadas em 15 minutos (`429`, por padrão).
4. Confirme responsividade em um cliente móvel e teste o link do Google Meet e o `mailto:`.
