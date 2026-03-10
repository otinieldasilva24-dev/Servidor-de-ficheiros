const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("❌ Erro ao abrir BD:", err.message);
    else console.log("✅ Base de Dados INAMET Conectada.");
});

db.serialize(() => {
    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        departamento TEXT NOT NULL,
        cargo TEXT DEFAULT 'comum'
    )`);

    // Tabela de Ficheiros
    db.run(`CREATE TABLE IF NOT EXISTS ficheiros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_original TEXT,
        nome_servidor TEXT,
        departamento TEXT,
        usuario_id INTEGER,
        data_upload DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // --- NOVA TABELA: Registo de Atividades (Logs) ---
    // Esta tabela vai alimentar o quadro "Registo Recente" do Admin
    db.run(`CREATE TABLE IF NOT EXISTS logs_atividade (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_nome TEXT NOT NULL,
        acao TEXT NOT NULL, -- 'UPLOAD', 'DOWNLOAD' ou 'ELIMINAR'
        ficheiro_nome TEXT NOT NULL,
        data_formatada TEXT,
        hora TEXT
    )`);
});

module.exports = db;