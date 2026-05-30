const express = require("express");
const { conectar } = require("./db");
const livros = require("./Livros");
const emprestimos = require("./Emprestimos");

const app = express();
app.use(express.json());

// Servir arquivos estaticos
app.use(express.static("src/public"));

// CORS - permitir requisicoes do frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/livros", livros);
app.use("/emprestimos", emprestimos);

// Rota raiz
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

function erroReplicaSetTransacao(err) {
  return (
    err.code === 20 &&
    typeof err.message === "string" &&
    err.message.includes("Transaction numbers are only allowed")
  );
}

// Handler de erros global
app.use((err, req, res, next) => {
  console.error(err);

  if (erroReplicaSetTransacao(err)) {
    return res.status(503).json({
      erro:
        "Transacoes do MongoDB exigem replica set. Inicie o replica set local com: npm run mongo:rs. Em outro terminal, rode uma vez: npm run mongo:init.",
    });
  }

  res.status(err.statusCode || 500).json({
    erro: err.statusCode ? err.message : "Erro interno no servidor.",
  });
});

async function iniciar() {
  await conectar();
  app.listen(3000, () =>
    console.log("Servidor rodando em http://localhost:3000"),
  );
}

iniciar().catch((erro) => {
  console.error("Erro ao iniciar servidor:", erro);
});
