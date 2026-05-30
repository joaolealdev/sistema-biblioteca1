const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "biblioteca";

const livros = [
  { titulo: "Dom Casmurro", autor: "Machado de Assis", isbn: "978-8525051234", exemplares_total: 5, exemplares_disponiveis: 5 },
  { titulo: "Memorias Postumas de Bras Cubas", autor: "Machado de Assis", isbn: "978-8525051235", exemplares_total: 3, exemplares_disponiveis: 3 },
  { titulo: "Quincas Borba", autor: "Machado de Assis", isbn: "978-8525051236", exemplares_total: 4, exemplares_disponiveis: 4 },
  { titulo: "Grande Sertao: Veredas", autor: "Guimaraes Rosa", isbn: "978-8525051237", exemplares_total: 2, exemplares_disponiveis: 2 },
  { titulo: "O Cortico", autor: "Aluisio Azevedo", isbn: "978-8525051238", exemplares_total: 6, exemplares_disponiveis: 6 },
  { titulo: "Capitaes da Areia", autor: "Jorge Amado", isbn: "978-8525051239", exemplares_total: 7, exemplares_disponiveis: 7 },
  { titulo: "Gabriela, Cravo e Canela", autor: "Jorge Amado", isbn: "978-8525051240", exemplares_total: 5, exemplares_disponiveis: 5 },
  { titulo: "Sagarana", autor: "Guimaraes Rosa", isbn: "978-8525051241", exemplares_total: 3, exemplares_disponiveis: 3 },
  { titulo: "Sao Bernardo", autor: "Graciliano Ramos", isbn: "978-8525051242", exemplares_total: 4, exemplares_disponiveis: 4 },
  { titulo: "Vidas Secas", autor: "Graciliano Ramos", isbn: "978-8525051243", exemplares_total: 5, exemplares_disponiveis: 5 },
  { titulo: "Macunaima", autor: "Mario de Andrade", isbn: "978-8525051244", exemplares_total: 3, exemplares_disponiveis: 3 },
  { titulo: "O Primo Basilio", autor: "Eca de Queiroz", isbn: "978-8525051245", exemplares_total: 2, exemplares_disponiveis: 2 },
  { titulo: "Iracema", autor: "Jose de Alencar", isbn: "978-8525051246", exemplares_total: 4, exemplares_disponiveis: 4 },
  { titulo: "O Guarani", autor: "Jose de Alencar", isbn: "978-8525051247", exemplares_total: 3, exemplares_disponiveis: 3 },
  { titulo: "Senhora", autor: "Jose de Alencar", isbn: "978-8525051248", exemplares_total: 4, exemplares_disponiveis: 4 },
  { titulo: "O Seminarista", autor: "Bernardo Guimaraes", isbn: "978-8525051249", exemplares_total: 2, exemplares_disponiveis: 2 },
  { titulo: "O Encoberto", autor: "Autran Dourado", isbn: "978-8525051250", exemplares_total: 3, exemplares_disponiveis: 3 },
  { titulo: "A Hora da Estrela", autor: "Clarice Lispector", isbn: "978-8525051251", exemplares_total: 4, exemplares_disponiveis: 4 },
  { titulo: "A Paixao Segundo G.H.", autor: "Clarice Lispector", isbn: "978-8525051252", exemplares_total: 5, exemplares_disponiveis: 5 },
  { titulo: "Cumplicidade", autor: "Fernando Pessoa", isbn: "978-8525051253", exemplares_total: 3, exemplares_disponiveis: 3 },
];

async function popular() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const livrosColecao = db.collection("livros");
    const emprestimosColecao = db.collection("emprestimos");

    const emprestimosRemovidos = await emprestimosColecao.deleteMany({});
    const livrosRemovidos = await livrosColecao.deleteMany({});

    console.log(`${emprestimosRemovidos.deletedCount} emprestimos removidos`);
    console.log(`${livrosRemovidos.deletedCount} livros removidos`);

    const resultado = await livrosColecao.insertMany(livros);
    console.log(`${resultado.insertedCount} livros adicionados com sucesso!`);

    const livrosInseridos = await livrosColecao.find().toArray();
    console.log("\nLivros cadastrados:");
    livrosInseridos.forEach((livro, index) => {
      console.log(
        `${index + 1}. ${livro.titulo} - ${livro.autor} (${livro.exemplares_disponiveis}/${livro.exemplares_total})`,
      );
    });
  } catch (erro) {
    console.error("Erro:", erro.message);
  } finally {
    await client.close();
  }
}

popular();
