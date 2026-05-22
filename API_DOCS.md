# - Documentação gerada com ajuda de IA - MCP
# 🔌 Documentação da API - Sistema de Biblioteca

## Base URL
```
http://localhost:3000
```

## Headers Padrão
```
Content-Type: application/json
```

---

## 📚 LIVROS

### 1. Listar todos os livros
```http
GET /livros
```

**Resposta (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "titulo": "Dom Casmurro",
    "autor": "Machado de Assis",
    "isbn": "978-8525051234",
    "quantidade": 5,
    "disponiveis": 5,
    "criadoEm": "2026-05-21T10:30:00.000Z"
  }
]
```

---

### 2. Buscar livro por ID
```http
GET /livros/:id
```

**Parâmetros:**
- `id` (string, required) - ObjectId do livro

**Exemplo:**
```
GET /livros/507f1f77bcf86cd799439011
```

**Resposta (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "978-8525051234",
  "quantidade": 5,
  "disponiveis": 5,
  "criadoEm": "2026-05-21T10:30:00.000Z"
}
```

**Possíveis Erros:**
- 400 - ID inválido
- 404 - Livro não encontrado

---

### 3. Criar novo livro
```http
POST /livros
```

**Body (JSON):**
```json
{
  "titulo": "Novo Livro",
  "autor": "Nome Autor",
  "isbn": "978-1234567890",
  "quantidade": 3
}
```

**Campos obrigatórios:** titulo, autor, isbn, quantidade

**Resposta (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "titulo": "Novo Livro",
  "autor": "Nome Autor",
  "isbn": "978-1234567890",
  "quantidade": 3,
  "disponiveis": 3
}
```

**Possíveis Erros:**
- 400 - Campos obrigatórios faltando
- 409 - ISBN já cadastrado

---

### 4. Atualizar livro
```http
PUT /livros/:id
```

**Parâmetros:**
- `id` (string, required) - ObjectId do livro

**Body (JSON):**
```json
{
  "titulo": "Título Atualizado",
  "autor": "Novo Autor",
  "quantidade": 10
}
```

**Resposta (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "titulo": "Título Atualizado",
  "autor": "Novo Autor",
  "isbn": "978-8525051234",
  "quantidade": 10,
  "disponiveis": 10,
  "criadoEm": "2026-05-21T10:30:00.000Z"
}
```

**Possíveis Erros:**
- 400 - ID inválido
- 404 - Livro não encontrado

---

### 5. Remover livro
```http
DELETE /livros/:id
```

**Parâmetros:**
- `id` (string, required) - ObjectId do livro

**Exemplo:**
```
DELETE /livros/507f1f77bcf86cd799439011
```

**Resposta (200 OK):**
```json
{
  "mensagem": "Livro removido com sucesso."
}
```

**Possíveis Erros:**
- 400 - ID inválido ou há exemplares emprestados
- 404 - Livro não encontrado

---

## 📤 EMPRÉSTIMOS

### 1. Listar empréstimos
```http
GET /emprestimos
```

**Query Parameters (opcionais):**
- `status` - "ativo" ou "devolvido"

**Exemplos:**
```
GET /emprestimos
GET /emprestimos?status=ativo
GET /emprestimos?status=devolvido
```

**Resposta (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "livroId": "507f1f77bcf86cd799439011",
    "tituloLivro": "Dom Casmurro",
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@email.com",
    "dataEmprestimo": "2026-05-21T10:30:00.000Z",
    "devolucaoPrevista": "2026-06-04T10:30:00.000Z",
    "status": "ativo"
  }
]
```

---

### 2. Buscar empréstimo por ID
```http
GET /emprestimos/:id
```

**Parâmetros:**
- `id` (string, required) - ObjectId do empréstimo

**Exemplo:**
```
GET /emprestimos/507f1f77bcf86cd799439020
```

**Resposta (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "livroId": "507f1f77bcf86cd799439011",
  "tituloLivro": "Dom Casmurro",
  "nomeUsuario": "João Silva",
  "emailUsuario": "joao@email.com",
  "dataEmprestimo": "2026-05-21T10:30:00.000Z",
  "devolucaoPrevista": "2026-06-04T10:30:00.000Z",
  "status": "ativo"
}
```

**Possíveis Erros:**
- 400 - ID inválido
- 404 - Empréstimo não encontrado

---

### 3. Realizar empréstimo
```http
POST /emprestimos
```

**Body (JSON):**
```json
{
  "livroId": "507f1f77bcf86cd799439011",
  "nomeUsuario": "João Silva",
  "emailUsuario": "joao@email.com"
}
```

**Campos obrigatórios:** livroId, nomeUsuario, emailUsuario

**Resposta (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "tituloLivro": "Dom Casmurro",
  "nomeUsuario": "João Silva",
  "status": "ativo",
  "devolucaoPrevista": "2026-06-04T10:30:00.000Z"
}
```

**Lógica:**
- Data de devolução prevista = Data atual + 14 dias
- Quantidade disponível do livro é decrementada em 1
- Empréstimo criado com status "ativo"

**Possíveis Erros:**
- 400 - Campos obrigatórios faltando, livroId inválido ou livro indisponível
- 404 - Livro não encontrado

---

### 4. Registrar devolução
```http
PATCH /emprestimos/:id/devolver
```

**Parâmetros:**
- `id` (string, required) - ObjectId do empréstimo

**Exemplo:**
```
PATCH /emprestimos/507f1f77bcf86cd799439020/devolver
```

**Resposta (200 OK):**
```json
{
  "mensagem": "Devolução registrada com sucesso."
}
```

**Lógica:**
- Status muda para "devolvido"
- Data de devolução é registrada
- Quantidade disponível do livro é incrementada em 1

**Possíveis Erros:**
- 400 - ID inválido ou empréstimo já foi devolvido
- 404 - Empréstimo não encontrado

---

## 🔄 Fluxo Completo de Exemplo

### 1. Listar livros disponíveis
```bash
curl http://localhost:3000/livros
```

### 2. Criar empréstimo
```bash
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "livroId": "507f1f77bcf86cd799439011",
    "nomeUsuario": "Maria Santos",
    "emailUsuario": "maria@email.com"
  }'
```

Resposta inclui a data de devolução (14 dias depois)

### 3. Listar empréstimos ativos
```bash
curl "http://localhost:3000/emprestimos?status=ativo"
```

### 4. Devolver livro
```bash
curl -X PATCH http://localhost:3000/emprestimos/507f1f77bcf86cd799439020/devolver
```

### 5. Verificar que o livro voltou ao acervo
```bash
curl http://localhost:3000/livros/507f1f77bcf86cd799439011
```

A quantidade disponível deve ter aumentado em 1.

---

## 🛡️ Validações

### ObjectId Validation
- Todos os IDs são validados como ObjectIds válidos
- Se inválido, retorna erro 400

### Campos Obrigatórios
- **Livros:** titulo, autor, isbn, quantidade
- **Empréstimos:** livroId, nomeUsuario, emailUsuario

### Regras de Negócio
- ISBN deve ser único
- Não é possível emprestar livro sem exemplares disponíveis
- Não é possível remover livro com exemplares emprestados
- Empréstimo não pode ser devolvido duas vezes

---

## 📝 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Erro na validação |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: ISBN duplicado) |
| 500 | Internal Server Error - Erro no servidor |

---

## 🔍 Exemplo de Teste com cURL

```bash
# Listar todos os livros
curl http://localhost:3000/livros

# Adicionar novo livro
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste","autor":"Autor","isbn":"123","quantidade":5}'

# Emprestar um livro
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livroId":"ID_DO_LIVRO","nomeUsuario":"Nome","emailUsuario":"email@test.com"}'

# Ver empréstimos ativos
curl "http://localhost:3000/emprestimos?status=ativo"

# Devolver um livro
curl -X PATCH http://localhost:3000/emprestimos/ID_DO_EMPRESTIMO/devolver
```

---

## 📌 Notas Importantes

1. Todos os timestamps são em UTC
2. Devolução é sempre prevista para 14 dias após empréstimo
3. ObjectIds são gerados automaticamente pelo MongoDB
4. As operações são síncronas
5. CORS está ativado para todas as origens

---