const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sistema.db');

db.serialize(() => {
    // Tabela de Usuários (RF01 e RF02)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,         -- Senha Hashed (RNF01)
        departamento TEXT NOT NULL,  -- logistica, financeiro, rh, vendas, ti
        cargo TEXT DEFAULT 'comum'   -- comum ou admin (RF02)
    )`);

    // Tabela de Ficheiros (RF03 e RF05)
    db.run(`CREATE TABLE IF NOT EXISTS ficheiros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_original TEXT,
        nome_servidor TEXT,
        departamento TEXT,           -- Define a "muralha" (RN01)
        usuario_id INTEGER,
        data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);
});

module.exports = db;