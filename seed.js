const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "biblioteca";

const livros = [
  { titulo: "Dom Casmurro", autor: "Machado de Assis", isbn: "978-8525051234", quantidade: 5, disponiveis: 5 },
  { titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", isbn: "978-8525051235", quantidade: 3, disponiveis: 3 },
  { titulo: "Quincas Borba", autor: "Machado de Assis", isbn: "978-8525051236", quantidade: 4, disponiveis: 4 },
  { titulo: "Grande Sertão: Veredas", autor: "Guimarães Rosa", isbn: "978-8525051237", quantidade: 2, disponiveis: 2 },
  { titulo: "O Cortiço", autor: "Aluísio Azevedo", isbn: "978-8525051238", quantidade: 6, disponiveis: 6 },
  { titulo: "Capitães da Areia", autor: "Jorge Amado", isbn: "978-8525051239", quantidade: 7, disponiveis: 7 },
  { titulo: "Gabriela, Cravo e Canela", autor: "Jorge Amado", isbn: "978-8525051240", quantidade: 5, disponiveis: 5 },
  { titulo: "Sagarana", autor: "Guimarães Rosa", isbn: "978-8525051241", quantidade: 3, disponiveis: 3 },
  { titulo: "São Bernardo", autor: "Graciliano Ramos", isbn: "978-8525051242", quantidade: 4, disponiveis: 4 },
  { titulo: "Vidas Secas", autor: "Graciliano Ramos", isbn: "978-8525051243", quantidade: 5, disponiveis: 5 },
  { titulo: "Macunaíma", autor: "Mário de Andrade", isbn: "978-8525051244", quantidade: 3, disponiveis: 3 },
  { titulo: "O Primo Basílio", autor: "Eça de Queiroz", isbn: "978-8525051245", quantidade: 2, disponiveis: 2 },
  { titulo: "Iracema", autor: "José de Alencar", isbn: "978-8525051246", quantidade: 4, disponiveis: 4 },
  { titulo: "O Guarani", autor: "José de Alencar", isbn: "978-8525051247", quantidade: 3, disponiveis: 3 },
  { titulo: "Senhora", autor: "José de Alencar", isbn: "978-8525051248", quantidade: 4, disponiveis: 4 },
  { titulo: "O Seminarista", autor: "Bernardo Guimarães", isbn: "978-8525051249", quantidade: 2, disponiveis: 2 },
  { titulo: "O Encoberto", autor: "Autran Dourado", isbn: "978-8525051250", quantidade: 3, disponiveis: 3 },
  { titulo: "A Hora da Estrela", autor: "Clarice Lispector", isbn: "978-8525051251", quantidade: 4, disponiveis: 4 },
  { titulo: "A Paixão Segundo G.H.", autor: "Clarice Lispector", isbn: "978-8525051252", quantidade: 5, disponiveis: 5 },
  { titulo: "Cumplicidade", autor: "Fernando Pessoa", isbn: "978-8525051253", quantidade: 3, disponiveis: 3 }
];

async function popular() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const colecao = db.collection("livros");
    
    // Limpar livros antigos
    const deletar = await colecao.deleteMany({});
    console.log(`🗑️  ${deletar.deletedCount} livros removidos`);
    
    // Inserir novos livros
    const resultado = await colecao.insertMany(livros);
    console.log(`✅ ${resultado.insertedCount} livros adicionados com sucesso!`);
    
    // Listar os livros inseridos
    const livrosInseridos = await colecao.find().toArray();
    console.log("\n📚 Livros cadastrados:");
    livrosInseridos.forEach((livro, index) => {
      console.log(`${index + 1}. ${livro.titulo} - ${livro.autor}`);
    });
    
  } catch (erro) {
    console.error("❌ Erro:", erro.message);
  } finally {
    await client.close();
  }
}

popular();
// test