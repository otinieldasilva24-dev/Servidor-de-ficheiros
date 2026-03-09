const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../sistema.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite do INAMET (Raiz).');
    }
});

db.serialize(() => {
    // 1. Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        departamento TEXT NOT NULL,
        cargo TEXT DEFAULT 'comum'
    )`);

    // 2. Tabela de Ficheiros
    db.run(`CREATE TABLE IF NOT EXISTS ficheiros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_original TEXT NOT NULL,
        nome_servidor TEXT NOT NULL,
        departamento TEXT NOT NULL,
        usuario_id INTEGER,
        data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);
});

module.exports = db;