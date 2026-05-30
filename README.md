# Sistema de Biblioteca

API e frontend simples para gerenciamento de livros e emprestimos usando Node.js, Express e MongoDB.

## Atividade: Transactions no MongoDB

Esta versao implementa emprestimo e devolucao de livros com transacoes ACID do MongoDB.

As funcoes principais estao em `src/Emprestimos.js`:

- `registrarEmprestimo(livroId, usuarioNome)`: abre uma session, verifica disponibilidade, decrementa `exemplares_disponiveis`, cria um documento em `emprestimos` com status `ativo` e confirma a transaction. Em qualquer erro, a transaction e abortada.
- `devolverLivro(emprestimoId)`: abre uma session, valida se o emprestimo esta `ativo`, marca como `devolvido`, registra `data_devolucao_real`, incrementa `exemplares_disponiveis` no livro e confirma a transaction. Em qualquer erro, a transaction e abortada.

Importante: transacoes MongoDB exigem replica set ou cluster sharded. Em desenvolvimento local, inicie o MongoDB como replica set antes de testar as rotas transacionais.

Exemplo local:

```bash
mongod --dbpath ./data/db --replSet rs0
mongosh --eval "rs.initiate()"
```

## Schema das Collections

### livros

```javascript
{
  _id: ObjectId,
  titulo: String,
  autor: String,
  isbn: String,
  exemplares_total: Number,
  exemplares_disponiveis: Number,
  criadoEm: Date
}
```

### emprestimos

```javascript
{
  _id: ObjectId,
  livro_id: ObjectId,
  usuario_nome: String,
  data_emprestimo: Date,
  data_devolucao_prevista: Date,
  data_devolucao_real: Date, // preenchido na devolucao
  status: "ativo" | "devolvido"
}
```

## Como Rodar

```bash
npm install
npm run seed
npm start
```

Acesse `http://localhost:3000`.

## Endpoints

### Livros

- `GET /livros`
- `GET /livros/:id`
- `POST /livros`
- `PUT /livros/:id`
- `DELETE /livros/:id`

Criar livro:

```bash
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Dom Casmurro",
    "autor": "Machado de Assis",
    "isbn": "978-8525051234",
    "exemplares_total": 5
  }'
```

### Emprestimos

- `GET /emprestimos`
- `GET /emprestimos/:id`
- `POST /emprestimos`
- `PATCH /emprestimos/:id/devolver`

Registrar emprestimo:

```bash
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "livro_id": "ID_DO_LIVRO",
    "usuario_nome": "Maria Santos"
  }'
```

Registrar devolucao:

```bash
curl -X PATCH http://localhost:3000/emprestimos/ID_DO_EMPRESTIMO/devolver
```

## Fluxo da Transaction de Emprestimo

1. Inicia uma session com `getClient().startSession()`.
2. Executa `session.withTransaction(...)`.
3. Busca o livro dentro da session.
4. Se nao existir disponibilidade, lanca erro e a transaction e abortada.
5. Decrementa `exemplares_disponiveis` usando filtro atomico `{ exemplares_disponiveis: { $gt: 0 } }`.
6. Insere o emprestimo com status `ativo`.
7. Confirma a transaction ao final.

## Fluxo da Transaction de Devolucao

1. Inicia uma session com `getClient().startSession()`.
2. Executa `session.withTransaction(...)`.
3. Busca o emprestimo dentro da session.
4. Se o status nao for `ativo`, lanca erro e a transaction e abortada.
5. Atualiza status para `devolvido` e registra `data_devolucao_real`.
6. Incrementa `exemplares_disponiveis` no livro relacionado.
7. Confirma a transaction ao final.
