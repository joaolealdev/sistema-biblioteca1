# Documentação gerada com ajuda de IA
# 📚 Sistema de Biblioteca

Um sistema completo de gerenciamento de biblioteca desenvolvido com **Node.js**, **Express**, **MongoDB** e **Frontend Moderno**.

## 📋 Descrição

O Sistema de Biblioteca é uma aplicação web que permite:
- ✅ **Cadastro de Livros** - Adicionar e remover livros do acervo
- ✅ **Gestão de Empréstimos** - Emprestar livros aos usuários com data de devolução prevista
- ✅ **Registro de Devoluções** - Registrar devoluções e atualizar disponibilidade
- ✅ **Visualização** - Interface moderna e responsiva para gerenciar todo o acervo

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web para APIs REST
- **MongoDB** - Banco de dados NoSQL
- **CORS** - Controle de acesso entre origens

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilo responsivo com gradientes e animações
- **JavaScript Vanilla** - Interatividade
- **Font Awesome** - Ícones
- **Fetch API** - Requisições HTTP

## 📁 Estrutura do Projeto

```
sistemaBiblioteca/
├── src/
│   ├── public/
│   │   └── index.html          # Frontend da aplicação
│   ├── db.js                   # Conexão com MongoDB
│   ├── Livros.js              # Rotas de gerenciamento de livros
│   ├── Emprestimos.js         # Rotas de empréstimos e devoluções
│   └── Server.js              # Servidor principal Express
├── seed.js                     # Script para popular banco com 20 livros
├── package.json               # Dependências do projeto
└── README.md                  # Este arquivo
```

## 🚀 Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- MongoDB rodando localmente na porta 27017

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/sistemaBiblioteca.git
cd sistemaBiblioteca
```

2. **Instale as dependências**
```bash
npm install
```

3. **Certifique-se que MongoDB está rodando**
```bash
# Windows
mongod

# Linux/Mac
brew services start mongodb-community
```

4. **Popular o banco com 20 livros brasileiros (opcional)**
```bash
node seed.js
```

5. **Inicie o servidor**
```bash
npm start
```

6. **Acesse a aplicação**
Abra seu navegador e visite: `http://localhost:3000`

## 📖 Como Usar

### 1️⃣ Aba Livros
- **Adicionar Livro**: Preencha o formulário com título, autor, ISBN e quantidade
- **Remover Livro**: Clique no botão "Remover" no card do livro
- **Visualizar**: Todos os livros aparecem em cards com informações de disponibilidade

### 2️⃣ Aba Emprestar
- Selecione um livro disponível do dropdown
- Preencha nome e email do usuário
- Clique em "Emprestar Livro"
- A devolução será prevista para 14 dias depois

### 3️⃣ Aba Empréstimos
- Visualize todos os empréstimos (ativos e devolvidos)
- Clique em "Devolver" para registrar a devolução de um livro
- O livro será marcado como devolvido e voltará ao acervo

## 🗄️ Banco de Dados

### Coleção: Livros
```javascript
{
  _id: ObjectId,
  titulo: String,
  autor: String,
  isbn: String,
  quantidade: Number,        // Total de exemplares
  disponiveis: Number,       // Exemplares disponíveis
  criadoEm: Date
}
```

### Coleção: Empréstimos
```javascript
{
  _id: ObjectId,
  livroId: ObjectId,
  tituloLivro: String,
  nomeUsuario: String,
  emailUsuario: String,
  dataEmprestimo: Date,
  devolucaoPrevista: Date,
  dataDevolucao: Date (opcional),
  status: String             // "ativo" ou "devolvido"
}
```

## 🔌 API REST

### Livros

**GET /livros** - Listar todos os livros
```bash
curl http://localhost:3000/livros
```

**GET /livros/:id** - Buscar livro por ID
```bash
curl http://localhost:3000/livros/1234567890abcdef
```

**POST /livros** - Criar novo livro
```bash
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Dom Casmurro",
    "autor": "Machado de Assis",
    "isbn": "978-8525051234",
    "quantidade": 5
  }'
```

**PUT /livros/:id** - Atualizar livro
```bash
curl -X PUT http://localhost:3000/livros/1234567890abcdef \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Novo Título",
    "autor": "Novo Autor",
    "quantidade": 10
  }'
```

**DELETE /livros/:id** - Remover livro
```bash
curl -X DELETE http://localhost:3000/livros/1234567890abcdef
```

### Empréstimos

**GET /emprestimos** - Listar empréstimos com filtro opcional
```bash
curl http://localhost:3000/emprestimos
curl "http://localhost:3000/emprestimos?status=ativo"
```

**GET /emprestimos/:id** - Buscar empréstimo por ID
```bash
curl http://localhost:3000/emprestimos/1234567890abcdef
```

**POST /emprestimos** - Realizar empréstimo
```bash
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "livroId": "1234567890abcdef",
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@example.com"
  }'
```

**PATCH /emprestimos/:id/devolver** - Registrar devolução
```bash
curl -X PATCH http://localhost:3000/emprestimos/1234567890abcdef/devolver
```

## ✨ Recursos

- 🎨 **Design Moderno** - Interface limpa com gradientes e animações suaves
- 📱 **Responsivo** - Funciona em desktop, tablet e mobile
- ⚡ **Validação** - Valida IDs de ObjectId antes de processar
- 🔄 **Sincronização** - Atualização em tempo real da disponibilidade
- 💾 **Persistência** - Todos os dados salvos no MongoDB
- 🎯 **Intuitivo** - Interface amigável e fácil de usar

## 📊 Dados de Exemplo

O projeto vem com 20 clássicos da literatura brasileira:
1. Dom Casmurro - Machado de Assis
2. Memórias Póstumas de Brás Cubas - Machado de Assis
3. Quincas Borba - Machado de Assis
4. Grande Sertão: Veredas - Guimarães Rosa
5. O Cortiço - Aluísio Azevedo
6. Capitães da Areia - Jorge Amado
7. Gabriela, Cravo e Canela - Jorge Amado
8. Sagarana - Guimarães Rosa
9. São Bernardo - Graciliano Ramos
10. Vidas Secas - Graciliano Ramos
11. Macunaíma - Mário de Andrade
12. O Primo Basílio - Eça de Queiroz
13. Iracema - José de Alencar
14. O Guarani - José de Alencar
15. Senhora - José de Alencar
16. O Seminarista - Bernardo Guimarães
17. O Encoberto - Autran Dourado
18. A Hora da Estrela - Clarice Lispector
19. A Paixão Segundo G.H. - Clarice Lispector
20. Cumplicidade - Fernando Pessoa

## 🐛 Tratamento de Erros

O sistema trata os seguintes erros:

- **ID Inválido** - Retorna erro 400 se o ObjectId for inválido
- **Livro não encontrado** - Retorna erro 404
- **ISBN duplicado** - Retorna erro 409 ao tentar cadastrar ISBN já existente
- **Livro indisponível** - Retorna erro 400 ao tentar emprestar livro sem exemplares
- **Exemplares emprestados** - Não permite remover livro com empréstimos ativo

## 📝 Scripts Disponíveis

```bash
# Iniciar servidor
npm start

# Popular banco com 20 livros
node seed.js
```

## 🎓 Propósito Educacional

Este projeto foi desenvolvido como atividade educacional para demonstrar:
- Arquitetura REST API
- CRUD completo em MongoDB
- Frontend com Fetch API
- Validação de dados
- Tratamento de erros
- Design responsivo

## 📦 Dependências

```json
{
  "express": "^4.18.2",
  "mongodb": "^5.8.0"
}
```

## 📄 Licença

Este projeto é de código aberto e disponível sob a licença ISC.

## 👨‍💻 Autor

Desenvolvido como projeto de estudo e prática de desenvolvimento full-stack.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

## 📞 Suporte

Para dúvidas ou sugestões sobre o projeto, entre em contato ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando Node.js + MongoDB + JavaScript**
