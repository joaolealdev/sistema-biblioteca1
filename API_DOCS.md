# API Docs - Sistema de Biblioteca

Base URL:

```text
http://localhost:3000
```

## Observacao Sobre Transactions

As rotas `POST /emprestimos` e `PATCH /emprestimos/:id/devolver` usam transacoes ACID do MongoDB via session, `startTransaction`, `commitTransaction` e `abortTransaction`.

Para funcionar, o MongoDB precisa estar em replica set ou cluster sharded. Em servidor standalone, o MongoDB retorna erro informando que transactions nao sao suportadas.

No desenvolvimento local, use:

```bash
npm run mongo:rs
```

Em outro terminal, rode uma vez:

```bash
npm run mongo:init
```

Esses scripts usam a porta `27018` para nao conflitar com o MongoDB instalado como servico na porta padrao `27017`.

## Livros

### GET /livros

Lista todos os livros.

### GET /livros/:id

Busca um livro por ObjectId.

### POST /livros

Cria um livro.

Body:

```json
{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "978-8525051234",
  "exemplares_total": 5
}
```

Resposta:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "978-8525051234",
  "exemplares_total": 5,
  "exemplares_disponiveis": 5
}
```

### PUT /livros/:id

Atualiza titulo, autor, isbn ou `exemplares_total`.

### DELETE /livros/:id

Remove um livro apenas se todos os exemplares estiverem disponiveis.

## Emprestimos

### GET /emprestimos

Lista emprestimos. Aceita filtro opcional:

```text
GET /emprestimos?status=ativo
```

### GET /emprestimos/:id

Busca um emprestimo por ObjectId.

### POST /emprestimos

Registra emprestimo usando transaction.

Body:

```json
{
  "livro_id": "507f1f77bcf86cd799439011",
  "usuario_nome": "Maria Santos"
}
```

Fluxo transacional:

- verifica se o livro existe;
- verifica se `exemplares_disponiveis > 0`;
- decrementa `exemplares_disponiveis` em 1;
- insere documento em `emprestimos` com status `ativo`;
- confirma a transaction;
- em caso de erro, aborta a transaction.

Resposta:

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "livro_id": "507f1f77bcf86cd799439011",
  "usuario_nome": "Maria Santos",
  "data_emprestimo": "2026-05-29T23:00:00.000Z",
  "data_devolucao_prevista": "2026-06-12T23:00:00.000Z",
  "status": "ativo"
}
```

### PATCH /emprestimos/:id/devolver

Registra devolucao usando transaction.

Fluxo transacional:

- busca o emprestimo;
- valida se `status` e `ativo`;
- atualiza status para `devolvido`;
- registra `data_devolucao_real`;
- incrementa `exemplares_disponiveis` em 1 no livro;
- confirma a transaction;
- em caso de erro, aborta a transaction.

Resposta:

```json
{
  "mensagem": "Devolucao registrada com sucesso."
}
```

## Codigos de Erro

- `400`: dados invalidos, livro indisponivel ou emprestimo nao ativo.
- `404`: livro ou emprestimo nao encontrado.
- `409`: conflito ao reservar ou devolver.
- `500`: erro interno.
