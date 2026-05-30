const { Router } = require("express");
const { ObjectId } = require("mongodb");
const { getClient, getDb } = require("./db");

const router = Router();
const PRAZO_DEVOLUCAO_DIAS = 14;

function criarErro(mensagem, statusCode = 400) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

function validarObjectId(id, nomeCampo) {
  if (!ObjectId.isValid(id)) {
    throw criarErro(`${nomeCampo} invalido.`, 400);
  }

  return new ObjectId(id);
}

function getCollections() {
  const db = getDb();

  return {
    livros: db.collection("livros"),
    emprestimos: db.collection("emprestimos"),
  };
}

function emprestimoComAliases(emprestimo) {
  if (!emprestimo) return emprestimo;

  return {
    ...emprestimo,
    livroId: emprestimo.livro_id,
    tituloLivro: emprestimo.titulo_livro,
    nomeUsuario: emprestimo.usuario_nome,
    emailUsuario: emprestimo.email_usuario,
    dataEmprestimo: emprestimo.data_emprestimo,
    devolucaoPrevista: emprestimo.data_devolucao_prevista,
    dataDevolucao: emprestimo.data_devolucao_real,
  };
}

async function registrarEmprestimo(livroId, usuarioNome, dadosExtras = {}) {
  const livroObjectId = validarObjectId(livroId, "livroId");

  if (!usuarioNome || !String(usuarioNome).trim()) {
    throw criarErro("usuarioNome e obrigatorio.", 400);
  }

  const session = getClient().startSession();

  try {
    session.startTransaction();

    const { livros, emprestimos } = getCollections();
    const livro = await livros.findOne({ _id: livroObjectId }, { session });

    if (!livro) {
      throw criarErro("Livro nao encontrado.", 404);
    }

    if (livro.exemplares_disponiveis <= 0) {
      throw criarErro(`"${livro.titulo}" nao tem exemplares disponiveis.`, 400);
    }

    const atualizacaoLivro = await livros.updateOne(
      { _id: livroObjectId, exemplares_disponiveis: { $gt: 0 } },
      { $inc: { exemplares_disponiveis: -1 } },
      { session },
    );

    if (atualizacaoLivro.modifiedCount !== 1) {
      throw criarErro("Nao foi possivel reservar o exemplar disponivel.", 409);
    }

    const dataEmprestimo = new Date();
    const dataDevolucaoPrevista = new Date(dataEmprestimo);
    dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + PRAZO_DEVOLUCAO_DIAS);

    const novoEmprestimo = {
      livro_id: livroObjectId,
      usuario_nome: String(usuarioNome).trim(),
      data_emprestimo: dataEmprestimo,
      data_devolucao_prevista: dataDevolucaoPrevista,
      status: "ativo",
      titulo_livro: livro.titulo,
    };

    if (dadosExtras.emailUsuario || dadosExtras.email_usuario) {
      novoEmprestimo.email_usuario = dadosExtras.emailUsuario ?? dadosExtras.email_usuario;
    }

    const resultado = await emprestimos.insertOne(novoEmprestimo, { session });
    const emprestimoCriado = { _id: resultado.insertedId, ...novoEmprestimo };

    await session.commitTransaction();
    return emprestimoCriado;
  } catch (erro) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw erro;
  } finally {
    await session.endSession();
  }
}

async function devolverLivro(emprestimoId) {
  const emprestimoObjectId = validarObjectId(emprestimoId, "emprestimoId");
  const session = getClient().startSession();

  try {
    session.startTransaction();

    const { livros, emprestimos } = getCollections();
    const emprestimo = await emprestimos.findOne(
      { _id: emprestimoObjectId },
      { session },
    );

    if (!emprestimo) {
      throw criarErro("Emprestimo nao encontrado.", 404);
    }

    if (emprestimo.status !== "ativo") {
      throw criarErro("Este emprestimo nao esta ativo.", 400);
    }

    const dataDevolucaoReal = new Date();
    const atualizacaoEmprestimo = await emprestimos.updateOne(
      { _id: emprestimoObjectId, status: "ativo" },
      {
        $set: {
          status: "devolvido",
          data_devolucao_real: dataDevolucaoReal,
        },
      },
      { session },
    );

    if (atualizacaoEmprestimo.modifiedCount !== 1) {
      throw criarErro("Nao foi possivel registrar a devolucao.", 409);
    }

    const atualizacaoLivro = await livros.updateOne(
      { _id: emprestimo.livro_id },
      { $inc: { exemplares_disponiveis: 1 } },
      { session },
    );

    if (atualizacaoLivro.modifiedCount !== 1) {
      throw criarErro("Livro vinculado ao emprestimo nao encontrado.", 404);
    }

    const emprestimoDevolvido = {
      ...emprestimo,
      status: "devolvido",
      data_devolucao_real: dataDevolucaoReal,
    };

    await session.commitTransaction();
    return emprestimoDevolvido;
  } catch (erro) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw erro;
  } finally {
    await session.endSession();
  }
}

// Listar todos os emprestimos
router.get("/", async (req, res, next) => {
  try {
    const filtro = {};
    if (req.query.status) filtro.status = req.query.status;

    const emprestimos = await getDb()
      .collection("emprestimos")
      .find(filtro)
      .sort({ data_emprestimo: -1 })
      .toArray();

    res.json(emprestimos.map(emprestimoComAliases));
  } catch (erro) {
    next(erro);
  }
});

// Buscar emprestimo por ID
router.get("/:id", async (req, res, next) => {
  try {
    const emprestimoId = validarObjectId(req.params.id, "ID");

    const emprestimo = await getDb()
      .collection("emprestimos")
      .findOne({ _id: emprestimoId });

    if (!emprestimo) {
      return res.status(404).json({ erro: "Emprestimo nao encontrado." });
    }

    res.json(emprestimoComAliases(emprestimo));
  } catch (erro) {
    next(erro);
  }
});

// Realizar emprestimo com transacao ACID
router.post("/", async (req, res, next) => {
  try {
    const livroId = req.body.livro_id ?? req.body.livroId;
    const usuarioNome = req.body.usuario_nome ?? req.body.nomeUsuario;

    if (!livroId || !usuarioNome) {
      return res.status(400).json({
        erro: "livro_id e usuario_nome sao obrigatorios.",
      });
    }

    const emprestimo = await registrarEmprestimo(livroId, usuarioNome, req.body);

    res.status(201).json(emprestimoComAliases(emprestimo));
  } catch (erro) {
    next(erro);
  }
});

// Registrar devolucao com transacao ACID
router.patch("/:id/devolver", async (req, res, next) => {
  try {
    const emprestimo = await devolverLivro(req.params.id);

    res.json({
      mensagem: "Devolucao registrada com sucesso.",
      emprestimo: emprestimoComAliases(emprestimo),
    });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
module.exports.registrarEmprestimo = registrarEmprestimo;
module.exports.devolverLivro = devolverLivro;
