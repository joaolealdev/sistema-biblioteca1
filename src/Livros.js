const { Router } = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("./db");

const router = Router();

function getLivroCollection() {
  return getDb().collection("livros");
}

function livroComAliases(livro) {
  if (!livro) return livro;

  return {
    ...livro,
    quantidade: livro.exemplares_total,
    disponiveis: livro.exemplares_disponiveis,
  };
}

function normalizarQuantidade(body) {
  return body.exemplares_total ?? body.quantidade;
}

// Listar todos os livros
router.get("/", async (req, res, next) => {
  try {
    const livros = await getLivroCollection().find().toArray();
    res.json(livros.map(livroComAliases));
  } catch (erro) {
    next(erro);
  }
});

// Buscar livro por ID
router.get("/:id", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ erro: "ID invalido." });
    }

    const livro = await getLivroCollection().findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!livro) return res.status(404).json({ erro: "Livro nao encontrado." });
    res.json(livroComAliases(livro));
  } catch (erro) {
    next(erro);
  }
});

// Cadastrar livro
router.post("/", async (req, res, next) => {
  try {
    const { titulo, autor, isbn } = req.body;
    const exemplaresTotal = Number(normalizarQuantidade(req.body));

    if (!titulo || !autor || !isbn || !Number.isInteger(exemplaresTotal) || exemplaresTotal < 1) {
      return res.status(400).json({
        erro: "titulo, autor, isbn e exemplares_total sao obrigatorios.",
      });
    }

    const existente = await getLivroCollection().findOne({ isbn });
    if (existente) return res.status(409).json({ erro: "ISBN ja cadastrado." });

    const novoLivro = {
      titulo,
      autor,
      isbn,
      exemplares_total: exemplaresTotal,
      exemplares_disponiveis: exemplaresTotal,
      criadoEm: new Date(),
    };

    const resultado = await getLivroCollection().insertOne(novoLivro);

    res.status(201).json(livroComAliases({ _id: resultado.insertedId, ...novoLivro }));
  } catch (erro) {
    next(erro);
  }
});

// Atualizar livro
router.put("/:id", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ erro: "ID invalido." });
    }

    const livroId = new ObjectId(req.params.id);
    const livro = await getLivroCollection().findOne({ _id: livroId });

    if (!livro) return res.status(404).json({ erro: "Livro nao encontrado." });

    const atualizacao = {};
    if (req.body.titulo != null) atualizacao.titulo = req.body.titulo;
    if (req.body.autor != null) atualizacao.autor = req.body.autor;
    if (req.body.isbn != null) atualizacao.isbn = req.body.isbn;

    const exemplaresTotalInformado = normalizarQuantidade(req.body);
    if (exemplaresTotalInformado != null) {
      const exemplaresTotal = Number(exemplaresTotalInformado);
      if (!Number.isInteger(exemplaresTotal) || exemplaresTotal < 1) {
        return res.status(400).json({ erro: "exemplares_total deve ser inteiro positivo." });
      }

      const emprestados = livro.exemplares_total - livro.exemplares_disponiveis;
      if (exemplaresTotal < emprestados) {
        return res.status(400).json({
          erro: "Total nao pode ser menor que a quantidade de exemplares emprestados.",
        });
      }

      atualizacao.exemplares_total = exemplaresTotal;
      atualizacao.exemplares_disponiveis = exemplaresTotal - emprestados;
    }

    if (Object.keys(atualizacao).length === 0) {
      return res.status(400).json({ erro: "Informe ao menos um campo para atualizar." });
    }

    const resultado = await getLivroCollection().findOneAndUpdate(
      { _id: livroId },
      { $set: atualizacao },
      { returnDocument: "after" },
    );

    res.json(livroComAliases(resultado.value ?? resultado));
  } catch (erro) {
    next(erro);
  }
});

// Remover livro
router.delete("/:id", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ erro: "ID invalido." });
    }

    const livroId = new ObjectId(req.params.id);
    const livro = await getLivroCollection().findOne({ _id: livroId });

    if (!livro) return res.status(404).json({ erro: "Livro nao encontrado." });
    if (livro.exemplares_disponiveis < livro.exemplares_total) {
      return res.status(400).json({
        erro: "Ha exemplares emprestados. Devolva antes de remover.",
      });
    }

    await getLivroCollection().deleteOne({ _id: livroId });
    res.json({ mensagem: "Livro removido com sucesso." });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
