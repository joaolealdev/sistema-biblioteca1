const { Router } = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("./db");

const router = Router();

// Listar todos os livros
router.get("/", async (req, res) => {
  const livros = await getDb().collection("livros").find().toArray();
  res.json(livros);
});

// Buscar livro por ID
router.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  const livro = await getDb()
    .collection("livros")
    .findOne({ _id: new ObjectId(req.params.id) });

  if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
  res.json(livro);
});

// Cadastrar livro
router.post("/", async (req, res) => {
  const { titulo, autor, isbn, quantidade } = req.body;

  if (!titulo || !autor || !isbn || quantidade == null) {
    return res
      .status(400)
      .json({ erro: "titulo, autor, isbn e quantidade são obrigatórios." });
  }

  const existente = await getDb().collection("livros").findOne({ isbn });
  if (existente) return res.status(409).json({ erro: "ISBN já cadastrado." });

  const resultado = await getDb().collection("livros").insertOne({
    titulo,
    autor,
    isbn,
    quantidade,
    disponiveis: quantidade,
    criadoEm: new Date(),
  });

  res
    .status(201)
    .json({
      _id: resultado.insertedId,
      titulo,
      autor,
      isbn,
      quantidade,
      disponiveis: quantidade,
    });
});

// Atualizar livro
router.put("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  const { titulo, autor, quantidade } = req.body;

  const resultado = await getDb()
    .collection("livros")
    .findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { titulo, autor, quantidade } },
      { returnDocument: "after" },
    );

  if (!resultado)
    return res.status(404).json({ erro: "Livro não encontrado." });
  res.json(resultado);
});

// Remover livro
router.delete("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  const livro = await getDb()
    .collection("livros")
    .findOne({ _id: new ObjectId(req.params.id) });

  if (!livro) return res.status(404).json({ erro: "Livro não encontrado." });
  if (livro.disponiveis < livro.quantidade) {
    return res
      .status(400)
      .json({ erro: "Há exemplares emprestados. Devolva antes de remover." });
  }

  await getDb()
    .collection("livros")
    .deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ mensagem: "Livro removido com sucesso." });
});

module.exports = router;
