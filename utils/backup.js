const fs = require('fs');
const path = require('path');

function realizarBackup() {
    const dataAtual = new Date();
    // Formata a data para o nome do arquivo (Ex: 2026-03-10_15h30)
    const dataStr = dataAtual.toISOString().split('T')[0] + '_' + dataAtual.getHours() + 'h' + dataAtual.getMinutes();
    
    const origem = path.join(__dirname, '../config/database.db');
    const pastaBackup = path.join(__dirname, '../backups');
    const destino = path.join(pastaBackup, `backup_inamet_${dataStr}.db`);

    // Verifica se a pasta backup existe, se não, cria
    if (!fs.existsSync(pastaBackup)) {
        fs.mkdirSync(pastaBackup);
    }

    try {
        fs.copyFileSync(origem, destino);
        console.log(`✅ Backup realizado com sucesso: ${destino}`);
    } catch (err) {
        console.error("❌ Falha ao realizar backup:", err.message);
    }
}

module.exports = realizarBackup;