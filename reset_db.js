const db = require('./config/database');

// Tabelas na ordem correta para evitar conflitos de chaves
const tabelas = ['ficheiros', 'logs_atividade', 'usuarios'];

db.serialize(() => {
    console.log("-----------------------------------------");
    console.log("INAMET: Iniciando limpeza de dados...");
    console.log("-----------------------------------------");

    tabelas.forEach(tabela => {
        // 1. Apaga todos os registos da tabela (as colunas continuam lá)
        db.run(`DELETE FROM ${tabela}`, (err) => {
            if (err) {
                console.error(`❌ Erro ao limpar ${tabela}:`, err.message);
            } else {
                console.log(`✓ Dados da tabela [${tabela}] removidos.`);
            }
        });

        // 2. Reseta o contador de ID (Auto-incremento) para 1
        // O SQLite usa a tabela interna 'sqlite_sequence' para isso
        db.run(`DELETE FROM sqlite_sequence WHERE name='${tabela}'`, (err) => {
            if (err) {
                // Não te preocupes se der erro aqui, às vezes a tabela de sequência 
                // só é criada após o primeiro insert.
            }
        });
    });

    console.log("-----------------------------------------");
    console.log("Limpeza concluída! IDs resetados para 1.");
    console.log("-----------------------------------------");
});