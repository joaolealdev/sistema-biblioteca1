const { Router } = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("./db");

const router = Router();

// Listar todos os empréstimos
router.get("/", async (req, res) => {
  const filtro = {};
  if (req.query.status) filtro.status = req.query.status;

  const emprestimos = await getDb()
    .collection("emprestimos")
    .find(filtro)
    .sort({ dataEmprestimo: -1 })
    .toArray();

  res.json(emprestimos);
});

// Buscar empréstimo por ID
router.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  const emprestimo = await getDb()
    .collection("emprestimos")
    .findOne({ _id: new ObjectId(req.params.id) });

  if (!emprestimo)
    return res.status(404).json({ erro: "Empréstimo não encontrado." });
  res.json(emprestimo);
});

// Realizar empréstimo
router.post("/", async (req, res) => {
  const { livroId, nomeUsuario, emailUsuario } = req.body;

  if (!livroId || !nomeUsuario || !emailUsuario) {
    return res
      .status(400)
      .json({ erro: "livroId, nomeUsuario e emailUsuario são obrigatórios." });
  }

  if (!ObjectId.isValid(livroId)) {
    return res.status(400).json({ erro: "livroId inválido." });
  }

  const livro = await getDb()
    .collection("livros")
    .findOne({ _id: new ObjectId(livroId) });

  if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
  if (livro.disponiveis <= 0)
    return res
      .status(400)
      .json({ erro: `"${livro.titulo}" não tem exemplares disponíveis.` });

  await getDb()
    .collection("livros")
    .updateOne({ _id: new ObjectId(livroId) }, { $inc: { disponiveis: -1 } });

  const devolucaoPrevista = new Date();
  devolucaoPrevista.setDate(devolucaoPrevista.getDate() + 14);

  const resultado = await getDb()
    .collection("emprestimos")
    .insertOne({
      livroId: new ObjectId(livroId),
      tituloLivro: livro.titulo,
      nomeUsuario,
      emailUsuario,
      dataEmprestimo: new Date(),
      devolucaoPrevista,
      status: "ativo",
    });

  res
    .status(201)
    .json({
      _id: resultado.insertedId,
      tituloLivro: livro.titulo,
      nomeUsuario,
      status: "ativo",
      devolucaoPrevista,
    });
});

// Registrar devolução
router.patch("/:id/devolver", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  const emprestimo = await getDb()
    .collection("emprestimos")
    .findOne({ _id: new ObjectId(req.params.id) });

  if (!emprestimo)
    return res.status(404).json({ erro: "Empréstimo não encontrado." });
  if (emprestimo.status === "devolvido")
    return res.status(400).json({ erro: "Este empréstimo já foi devolvido." });

  await getDb()
    .collection("emprestimos")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "devolvido", dataDevolucao: new Date() } },
    );

  await getDb()
    .collection("livros")
    .updateOne({ _id: emprestimo.livroId }, { $inc: { disponiveis: 1 } });

  res.json({ mensagem: "Devolução registrada com sucesso." });
});

module.exports = router;
