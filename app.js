const bcrypt = require('bcrypt');
const { renderDashboard, renderPerfil, renderError, renderGestaoUtilizadores, headerPadrao, renderSuperAdminDashboard } = require('./utils/renders');
const express = require('express');
const session = require('express-session');
const db = require('./config/database');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const realizarBackup = require('./utils/backup');

// Realiza o backup assim que o sistema inicia
realizarBackup();

// 1. IMPORTAR AS ROTAS DE AUTENTICAÇÃO (O ficheiro que criámos antes)
const authRoutes = require('./routes/auth');

const app = express();

// --- GARANTIR QUE A PASTA UPLOADS EXISTE ---
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// --- CONFIGURAÇÕES DO SERVIDOR ---
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Para conseguires abrir os ficheiros depois
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'segredo-inamet-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Sessão dura 24 horas
}));

// --- CONFIGURAÇÃO DO MULTER (GESTÃO DE FICHEIROS) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- 2. USAR AS ROTAS DE AUTENTICAÇÃO ---
app.use('/', authRoutes);

// --- 3. PÁGINA INICIAL (LANDING PAGE) ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <title>INAMET | Repositório de Ficheiros</title>
            <style>
                .glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
                .wave-container { position: absolute; bottom: 0; width: 100%; line-height: 0; z-index: 1; }
                .file-hover { transition: all 0.3s ease; }
                .file-hover:hover { transform: translateY(-10px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
            </style>
        </head>
        <body class="bg-slate-50 font-sans antialiased text-slate-900">
            ${headerPadrao}
            <main class="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white">
                <div class="container mx-auto px-6 grid md:grid-cols-2 items-center gap-12 relative z-10 -mt-32">
                    <div class="animate__animated animate__fadeInLeft">
                        <h2 class="text-blue-700 font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2">
                            <span class="w-8 h-[2px] bg-blue-700"></span> Plataforma Interna
                        </h2>
                        <h3 class="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
                            Servidor Central <br> de <span class="text-blue-700">Ficheiros.</span>
                        </h3>
                        <p class="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
                            Gestão segura de dados meteorológicos e geofísicos do INAMET. Organize documentos por departamentos com criptografia de ponta.
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <a href="/login" class="bg-blue-700 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-blue-200 hover:bg-blue-800 hover:-translate-y-1 transition-all text-center">
                                Entrar no Sistema
                            </a>
                        </div>
                    </div>
                    <div class="relative animate__animated animate__zoomIn hidden md:block">
                        <div class="relative bg-slate-50 border border-slate-200 p-10 rounded-[2rem] shadow-2xl overflow-hidden">
                            <div class="flex gap-2 mb-8 border-b border-slate-200 pb-4">
                                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div class="w-3 h-3 rounded-full bg-green-400"></div>
                                <span class="ml-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explorador INAMET</span>
                            </div>
                            <div class="grid grid-cols-2 gap-6">
                                <div class="file-hover bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                    <div class="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mb-4 text-red-500">📄</div>
                                    <span class="text-sm font-bold text-slate-700">Relatório_Agosto.pdf</span>
                                </div>
                                <div class="file-hover bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                    <div class="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-500">📁</div>
                                    <span class="text-sm font-bold text-slate-700">Dados_Geofisicos.docx</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="wave-container">
                    <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="#1d4ed8" fill-opacity="1" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                </div>
            </main>
        </body>
        </html>
    `);
});

// --- 4. DEPARTAMENTOS ---
app.get('/departamentos', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>INAMET | Departamentos</title>
        </head>
        <body class="bg-slate-50 pt-32 font-sans">
            ${headerPadrao}
            <div class="container mx-auto px-6">
                <h2 class="text-3xl font-black text-slate-800 mb-8 border-l-4 border-blue-700 pl-4 uppercase">Estrutura Departamental</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    ${['DT1', 'DT2', 'DT3', 'DT4', 'DT5'].map(dept => `
                        <div class="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:border-blue-300 transition-all group cursor-pointer">
                            <div class="w-12 h-12 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-4 font-bold group-hover:bg-blue-700 group-hover:text-white transition">D</div>
                            <h3 class="font-bold text-xl text-slate-800">${dept}</h3>
                            <p class="text-slate-500 text-sm mt-2">Acesso restrito a funcionários autorizados deste setor.</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `);
});

// --- 5. SUPORTE ---
app.get('/suporte', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>INAMET | Suporte</title>
        </head>
        <body class="bg-slate-50 min-h-screen flex flex-col font-sans">
            
            ${headerPadrao}

            <main class="flex-grow flex items-start justify-center px-6 mt-40">
                <div class="max-w-2xl w-full bg-white p-12 rounded-[3rem] shadow-xl text-center border border-slate-100 transform hover:scale-[1.01] transition-transform duration-300">
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-700 rounded-full mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>

                    <h2 class="text-4xl font-black text-slate-800 mb-6 uppercase tracking-tight">
                        Suporte <span class="text-blue-700">Técnico</span>
                    </h2>
                    
                    <p class="text-slate-500 mb-10 leading-relaxed text-lg">
                        Problemas com o acesso ou erros no sistema? <br>
                        Clique abaixo para abrir o Gmail e falar com a equipa de TI.
                    </p>
                    
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=robertozua161@gmail.com&su=Suporte Técnico - INAMET" 
                       target="_blank"
                       class="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-6 bg-blue-700 rounded-2xl font-bold text-white shadow-lg hover:bg-blue-800 transition-all duration-300 overflow-hidden">
                        <span class="relative z-10">robertozua161@gmail.com</span>
                        <div class="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors"></div>
                    </a>
                </div>
            </main>

            <div class="h-32"></div>
        </body>
        </html>
    `);
});

// --- 6. DASHBOARD (PROJETADO PARA O OTINIEL E EQUIPA) ---
app.get('/dashboard', (req, res) => {
    // 1. Pegar os dados reais do utilizador que está na sessão
    const user = req.session.user;

    if (!user) {
        return res.redirect('/login'); // Se não houver user real, volta ao login
    }

    // 2. Consulta real à base de dados para os ficheiros
    const query = "SELECT * FROM ficheiros WHERE departamento = ? ORDER BY id DESC";

    db.all(query, [user.departamento], (err, files) => {
        if (err) {
            console.error("Erro na BD:", err);
            return res.status(500).send("Erro ao carregar dados reais.");
        }

        // 3. Configurar UTF-8 para evitar o erro de "ecrÃ£"
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        // 4. Enviar para o renders.js (marcamos se é superadm para controlar UI)
        user.superadm = !!req.session.superadm;
        res.send(renderDashboard(user, files));
    });
});

// --- 7. PROCESSAR UPLOAD DE FICHEIROS (COM REGISTO DE LOG) ---
app.post('/upload', upload.single('ficheiro'), (req, res) => {
    if (!req.file || !req.session.user) return res.send("Erro: Utilizador não autenticado ou ficheiro ausente.");

    const nomeOriginal = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    // Validação do tipo de ficheiro (extensões permitidas)
    const allowed = ['pdf','docx','pptx','xlsm'];
    const ext = nomeOriginal.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
        // Remove ficheiro guardado pelo multer
        try { fs.unlinkSync(path.join(__dirname, 'uploads', req.file.filename)); } catch (e) { /* ignore */ }
        return res.send(renderError('Tipo inválido', 'Apenas ficheiros PDF, DOCX, PPTX e XLSM são permitidos.', 'warning'));
    }

    const user = req.session.user; // Facilitar o acesso aos dados do user
    const agora = new Date();

    // Verifica duplicados por nome_original + departamento
    db.get("SELECT * FROM ficheiros WHERE nome_original = ? AND departamento = ?", [nomeOriginal, req.body.departamento], (dupErr, existing) => {
        if (dupErr) {
            console.error('Erro ao verificar duplicados:', dupErr.message);
            try { fs.unlinkSync(path.join(__dirname, 'uploads', req.file.filename)); } catch (e) { /* ignore */ }
            return res.send(renderError('Erro', 'Falha ao verificar ficheiros existentes.', 'error'));
        }

        if (existing) {
            // pergunta ao utilizador se deseja substituir ou abortar
            const servidorTemp = req.file.filename;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(`
                <!doctype html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                </head>
                <body>
                    <script>
                        Swal.fire({
                            title: 'Ficheiro Existente',
                            html: 'O ficheiro "<b>${nomeOriginal}</b>" já existe no departamento. Deseja <b>substituir</b> o ficheiro existente ou <b>cancelar</b> o upload?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Substituir',
                            cancelButtonText: 'Cancelar',
                            confirmButtonColor: '#ef4444',
                            allowOutsideClick: false
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const form = document.createElement('form');
                                form.method = 'POST';
                                form.action = '/upload/replace';
                                const inputs = {};
                                inputs['existingId'] = '${existing.id}';
                                inputs['newServerName'] = '${servidorTemp}';
                                inputs['nomeOriginal'] = '${nomeOriginal.replace(/'/g, "\\'")}';
                                inputs['departamento'] = '${(req.body.departamento||'').replace(/'/g, "\\'")}';
                                inputs['usuario_id'] = '${user.id}';
                                for (const k in inputs) {
                                    const inp = document.createElement('input');
                                    inp.type = 'hidden'; inp.name = k; inp.value = inputs[k]; form.appendChild(inp);
                                }
                                document.body.appendChild(form);
                                form.submit();
                            } else {
                                fetch('/upload/abort', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serverName: '${servidorTemp}' }) })
                                .then(() => { window.location.href = '/dashboard'; })
                                .catch(() => { window.location.href = '/dashboard'; });
                            }
                        });
                    </script>
                </body>
                </html>
            `);
        }

        // Sem duplicado: insere normalmente
        const sqlFicheiro = "INSERT INTO ficheiros (nome_original, nome_servidor, departamento, usuario_id, data_upload) VALUES (?, ?, ?, ?, ?)";
        const paramsFicheiro = [nomeOriginal, req.file.filename, req.body.departamento, user.id, agora.toISOString()];

        db.run(sqlFicheiro, paramsFicheiro, function (err) {
            if (err) {
                console.error("Erro ao guardar ficheiro:", err.message);
                return res.send("Erro ao guardar na BD");
            }

            const dataLog = agora.toLocaleDateString('pt-AO');
            const horaLog = agora.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });

            const sqlLog = "INSERT INTO logs_atividade (usuario_nome, acao, ficheiro_nome, data_formatada, hora) VALUES (?, ?, ?, ?, ?)";
            const paramsLog = [user.nome, 'UPLOAD', nomeOriginal, dataLog, horaLog];

            db.run(sqlLog, paramsLog, (errLog) => {
                if (errLog) console.error("⚠️ Erro ao gravar Log de Upload:", errLog.message);
                res.redirect('/dashboard');
            });
        });
    });
});

// Rota para abortar upload (apaga ficheiro temporário)
app.post('/upload/abort', express.json(), (req, res) => {
    const serverName = req.body && req.body.serverName;
    if (serverName) {
        try { fs.unlinkSync(path.join(__dirname, 'uploads', serverName)); } catch (e) { /* ignore */ }
    }
    res.status(200).send('OK');
});

// Rota para substituir ficheiro existente pelo novo carregado
app.post('/upload/replace', express.urlencoded({ extended: true }), (req, res) => {
    const { existingId, newServerName, nomeOriginal, departamento, usuario_id } = req.body;
    if (!existingId || !newServerName) return res.send(renderError('Erro', 'Dados incompletos para substituição.', 'error'));

    db.get('SELECT * FROM ficheiros WHERE id = ?', [existingId], (errSel, existing) => {
        if (errSel || !existing) {
            try { fs.unlinkSync(path.join(__dirname, 'uploads', newServerName)); } catch (e) { /* ignore */ }
            return res.send(renderError('Erro', 'Registo existente não encontrado.', 'error'));
        }

        // Apaga ficheiro antigo do servidor
        try { fs.unlinkSync(path.join(__dirname, 'uploads', existing.nome_servidor)); } catch (e) { /* ignore */ }

        // Atualiza o registo com o novo nome_servidor e info de upload
        const agora = new Date();
        const sqlUpdate = 'UPDATE ficheiros SET nome_servidor = ?, usuario_id = ?, data_upload = ? WHERE id = ?';
        db.run(sqlUpdate, [newServerName, usuario_id || null, agora.toISOString(), existingId], function (errUp) {
            if (errUp) {
                console.error('Erro ao atualizar ficheiro existente:', errUp.message);
                return res.send(renderError('Erro', 'Falha ao substituir ficheiro.', 'error'));
            }

            // Regista log de substituição
            const dataLog = agora.toLocaleDateString('pt-AO');
            const horaLog = agora.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
            db.run("INSERT INTO logs_atividade (usuario_nome, acao, ficheiro_nome, data_formatada, hora) VALUES (?, ?, ?, ?, ?)",
                [(req.session.user && req.session.user.nome) || 'Desconhecido', 'REPLACE', nomeOriginal, dataLog, horaLog], (errLog) => {
                    if (errLog) console.error('Erro ao gravar log de substituição:', errLog.message);
                    res.redirect('/dashboard');
                });
        });
    });
});

// --- 8. TORNAR CHEFE (ADMIN) ---
app.post('/tornar-chefe', (req, res) => {
    const { codigo_secreto } = req.body;
    const user = req.session.user;

    // Promoção para 'admin' só é permitida pelo SuperAdmin via painel central.
    if (!req.session || !req.session.superadm) {
        return res.send(renderError('Acesso Negado', 'Apenas o SuperAdmin pode promover utilizadores. Utilize o painel SuperAdmin.', 'error'));
    }

    // Se o SuperAdmin chamar esta rota manualmente, aconselhamos usar /admin/alterar-cargo.
    return res.send(renderError('Info', 'Use o painel SuperAdmin para gerir cargos (Alternar Cargo).', 'info'));
});

// --- ROTA: SAIR DO MODO CHEFE (VOLTAR A UTILIZADOR COMUM) ---
// Nota: A auto-demissão de 'chefe' foi removida — apenas SuperAdmin pode gerir cargos.

app.get('/admin/alterar-cargo/:id/:novoCargo', (req, res) => {
    // 1. Apenas o Administrador Principal (superadm) pode alterar cargos
    if (!req.session || !req.session.superadm) {
        return res.send(renderError("Acesso Negado", "Somente o administrador principal pode alterar cargos.", "error"));
    }

    const idParaAlterar = req.params.id;
    const novoCargo = req.params.novoCargo;

    const sql = "UPDATE usuarios SET cargo = ? WHERE id = ?";

    // ATENÇÃO: Usamos 'function(err)' e NÃO '(err) =>' para o 'this.changes' funcionar
    db.run(sql, [novoCargo, idParaAlterar], function (err) {
        if (err) {
            console.error("❌ Erro SQL:", err.message);
            return res.send(renderError("Erro", err.message, "error"));
        }

        // Se this.changes for 0, o ID não existe na BD
        if (this.changes === 0) {
            return res.send(renderError("Utilizador não encontrado", `O ID ${idParaAlterar} não foi achado no banco de dados.`, "error"));
        }

        console.log(`✅ Sucesso: Utilizador ${idParaAlterar} agora é ${novoCargo}`);
        res.redirect('/superadmin');
    });
});

// Rota para eliminar ficheiro (ATUALIZADA COM LOG DE AUDITORIA)
app.get('/eliminar/:id', (req, res) => {
    const user = req.session.user;

    // 1. Verificação de Permissão: Apenas chefes (admin)
    if (!user || user.cargo !== 'admin') {
        return res.send(renderError("Acesso Negado", "Apenas chefes podem eliminar ficheiros.", "error"));
    }

    const ficheiroId = req.params.id;

    // 2. Procurar o ficheiro para saber o nome (para o Log e para o disco)
    db.get(`SELECT nome_original, nome_servidor FROM ficheiros WHERE id = ?`, [ficheiroId], (err, row) => {
        if (err || !row) return res.redirect('/dashboard');

        const nomeDoFicheiroParaLog = row.nome_original;
        const filePath = path.join(__dirname, 'uploads', row.nome_servidor);
        const agora = new Date();

        // 3. Eliminar o registo da Base de Dados
        db.run(`DELETE FROM ficheiros WHERE id = ?`, [ficheiroId], (err) => {
            if (err) return res.send(renderError("Erro", "Não foi possível eliminar o registo.", "error"));

            // 4. Eliminar o ficheiro físico da pasta 'uploads'
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // --- PASSO 5: REGISTAR A ELIMINAÇÃO NO LOG (O QUE ESTAVA A FALTAR) ---
            const dataLog = agora.toLocaleDateString('pt-AO');
            const horaLog = agora.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });

            const sqlLog = "INSERT INTO logs_atividade (usuario_nome, acao, ficheiro_nome, data_formatada, hora) VALUES (?, ?, ?, ?, ?)";
            const paramsLog = [user.nome, 'ELIMINACAO', nomeDoFicheiroParaLog, dataLog, horaLog];

            db.run(sqlLog, paramsLog, (errLog) => {
                if (errLog) console.error("⚠️ Erro ao gravar Log de Eliminação:", errLog.message);

                // Redireciona para a Dashboard após tudo estar concluído
                res.redirect('/dashboard');
            });
        });
    });
});

app.get('/perfil', (req, res) => {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    // Consulta real para contar uploads do usuário
    const sqlUploads = "SELECT COUNT(*) as total FROM ficheiros WHERE usuario_id = ?";

    db.get(sqlUploads, [user.id], (err, row) => {
        const totalUploads = row ? row.total : 0;

        const estatisticas = {
            uploads: totalUploads
        };

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        // Chamando a função que estilizamos anteriormente
        res.send(renderPerfil(user, estatisticas));
    });
});

// Evita eliminação via GET: redireciona para perfil (usar POST com confirmação)
app.get('/eliminar-conta', (req, res) => {
    return res.send(renderError('Acesso Negado', 'Eliminação de contas só por SuperAdmin via painel.', 'error'));
});

// Eliminar conta (POST) — exige confirmação de senha
app.post('/eliminar-conta', (req, res) => {
    // Eliminação de contas de utilizador via UI removida — apenas SuperAdmin pode eliminar contas.
    return res.send(renderError('Acesso Negado', 'Eliminação de contas só por SuperAdmin via painel.', 'error'));
});

app.post('/perfil/atualizar', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    // Agora pegamos também a 'senha_atual' que virá do teu formulário
    const { nome, password, senha_atual } = req.body; 
    const userId = req.session.user.id;

    // 1. Procurar a senha atual (hash) na base de dados
    db.get("SELECT senha FROM usuarios WHERE id = ?", [userId], async (err, row) => {
        if (err || !row) {
            return res.send(renderError("Erro", "Erro ao verificar utilizador.", "error"));
        }

        try {
            // Caso o usuário queira mudar a senha (preencheu o campo nova senha)
            if (password && password.trim() !== "") {

                // --- VALIDAÇÃO CRÍTICA: Verificar se informou a senha atual ---
                if (!senha_atual || senha_atual.trim() === "") {
                    return res.send(renderError("Segurança", "Deves introduzir a tua palavra-passe ATUAL para autorizar a mudança.", "warning"));
                }

                // --- VALIDAÇÃO CRÍTICA: Comparar a senha atual digitada com a da BD ---
                const senhaAtualCorreta = await bcrypt.compare(senha_atual, row.senha);
                if (!senhaAtualCorreta) {
                    return res.send(renderError("Erro de Autenticação", "A palavra-passe atual está incorreta.", "error"));
                }

                // Validação de tamanho da nova senha
                if (password.length < 6) {
                    return res.send(renderError("Senha Curta", "A nova palavra-passe deve ter pelo menos 6 caracteres.", "warning"));
                }

                // Comparar se a nova é igual à antiga (opcional, mas bom)
                const senhasIguais = await bcrypt.compare(password, row.senha);
                if (senhasIguais) {
                    return res.send(renderError("Atenção", "A nova palavra-passe não pode ser igual à atual.", "info"));
                }

                // Se passou em tudo, gera o novo Hash
                const novoHash = await bcrypt.hash(password, 10);
                const sql = "UPDATE usuarios SET nome = ?, senha = ? WHERE id = ?";
                const params = [nome, novoHash, userId];
                
                executarUpdate(sql, params, "Perfil e Palavra-Passe atualizados!", res, req, nome);

            } else {
                // Atualiza apenas o nome (aqui podes decidir se pede a senha atual ou não. 
                // Geralmente para o nome não se pede, mas se quiseres ser ultra rigoroso, podes pedir também.)
                const sql = "UPDATE usuarios SET nome = ? WHERE id = ?";
                const params = [nome, userId];
                executarUpdate(sql, params, "Informações guardadas!", res, req, nome);
            }
        } catch (e) {
            res.send(renderError("Erro", "Erro ao processar segurança.", "error"));
        }
    });
});

// Função auxiliar para não repetir código de db.run
function executarUpdate(sql, params, mensagem, res, req, novoNome) {
    db.run(sql, params, function (err) {
        if (err) return res.send(renderError("Erro", "Erro ao atualizar BD.", "error"));
        
        req.session.user.nome = novoNome;
        req.session.save(() => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                </head>
                <body>
                    <script>
                        Swal.fire({
                            icon: 'success',
                            title: 'SUCESSO',
                            text: '${mensagem}',
                            confirmButtonColor: '#1d4ed8'
                        }).then(() => { window.location.href = '/perfil'; });
                    </script>
                </body>
                </html>
            `);
        });
    });
}

// ROTA: Listar utilizadores E registos de atividade para o Chefe
app.get('/admin/utilizadores', (req, res) => {
    const userLogado = req.session.user; // Pega os dados de quem está logado

    // Apenas administradores do departamento ou o superadm podem acessar
    if (!userLogado || (userLogado.cargo !== 'admin' && !req.session.superadm)) return res.redirect('/login');

    // FILTRO: Só seleciona utilizadores do MESMO departamento que o admin logado
    const sqlUsers = "SELECT id, nome, departamento, cargo FROM usuarios WHERE departamento = ? ORDER BY id ASC";

    db.all(sqlUsers, [userLogado.departamento], (err, users) => {
        if (err) return res.send("Erro ao carregar lista.");

        // FILTRO NOS LOGS: Também só mostra logs de pessoas do mesmo departamento
        const sqlLogs = `
            SELECT logs_atividade.* FROM logs_atividade 
            JOIN usuarios ON logs_atividade.usuario_nome = usuarios.nome 
            WHERE usuarios.departamento = ? 
            ORDER BY logs_atividade.id DESC LIMIT 15`;

        db.all(sqlLogs, [userLogado.departamento], (errLogs, logs) => {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(renderGestaoUtilizadores(users, logs || [], { superadm: !!req.session.superadm }));
        });
    });
});

app.get('/logout', (req, res) => {
    if (!req.session) {
        res.clearCookie('connect.sid');
        return res.redirect('/login');
    }

    req.session.destroy((err) => {
        // mesmo em caso de erro, limpar cookie e mandar para o login
        res.clearCookie('connect.sid');
        if (err) console.error('Erro ao destruir sessão:', err);
        return res.redirect('/login');
    });
});

// --- SUPERADMIN: Painel Global (listar utilizadores, ficheiros e logs) ---
app.get('/superadmin', (req, res) => {
    if (!req.session || !req.session.superadm) return res.redirect('/login');

    // Buscar utilizadores, ficheiros e logs para exibir
    const sqlUsers = "SELECT id, nome, email, departamento, cargo FROM usuarios ORDER BY id ASC";
    const sqlFiles = "SELECT id, nome_original, departamento, data_upload FROM ficheiros ORDER BY id DESC LIMIT 50";
    const sqlLogs = "SELECT * FROM logs_atividade ORDER BY id DESC LIMIT 100";

    db.all(sqlUsers, [], (errUsers, users) => {
        if (errUsers) return res.send(renderError('Erro', 'Não foi possível carregar utilizadores.', 'error'));

        db.all(sqlFiles, [], (errFiles, files) => {
            if (errFiles) return res.send(renderError('Erro', 'Não foi possível carregar ficheiros.', 'error'));

            db.all(sqlLogs, [], (errLogs, logs) => {
                if (errLogs) return res.send(renderError('Erro', 'Não foi possível carregar logs.', 'error'));

                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.send(renderSuperAdminDashboard(users || [], files || [], logs || []));
            });
        });
    });
});

// --- ROTA: Registo/Criação de conta (apenas SuperAdmin pode criar) ---
app.post('/registo', async (req, res) => {
    if (!req.session || !req.session.superadm) return res.send(renderError('Acesso Negado', 'Apenas o SuperAdmin pode criar contas.', 'error'));

    const { nome, email, senha, departamento, cargo } = req.body;
    if (!nome || !email || !senha || !departamento) return res.send(renderError('Dados em falta', 'Preencha todos os campos obrigatórios.', 'warning'));

    try {
        const hash = await bcrypt.hash(senha, 10);
        const sql = "INSERT INTO usuarios (nome, email, senha, departamento, cargo) VALUES (?, ?, ?, ?, ?)";
        db.run(sql, [nome, email, hash, departamento, cargo || 'usuário'], function (err) {
            if (err) {
                console.error('Erro ao criar utilizador:', err.message);
                return res.send(renderError('Erro', 'Não foi possível criar a conta. Verifique se o e-mail já existe.', 'error'));
            }
            return res.redirect('/superadmin');
        });
    } catch (e) {
        console.error('Erro BCRYPT:', e);
        return res.send(renderError('Erro', 'Erro ao processar a senha.', 'error'));
    }
});

// --- ROTA: Editar utilizador via SuperAdmin ---
app.post('/superadmin/editar-usuario', async (req, res) => {
    if (!req.session || !req.session.superadm) return res.send(renderError('Acesso Negado', 'Apenas o SuperAdmin pode editar utilizadores.', 'error'));

    const { id, nome, email, departamento, cargo, senha } = req.body;
    if (!id || !nome || !email || !departamento) return res.send(renderError('Dados em falta', 'Campos obrigatórios em falta.', 'warning'));

    try {
        if (senha && senha.trim() !== '') {
            const hash = await bcrypt.hash(senha, 10);
            const sql = "UPDATE usuarios SET nome = ?, email = ?, departamento = ?, cargo = ?, senha = ? WHERE id = ?";
            db.run(sql, [nome, email, departamento, cargo || 'usuário', hash, id], function (err) {
                if (err) return res.send(renderError('Erro', 'Não foi possível atualizar o utilizador.', 'error'));
                return res.redirect('/superadmin');
            });
        } else {
            const sql = "UPDATE usuarios SET nome = ?, email = ?, departamento = ?, cargo = ? WHERE id = ?";
            db.run(sql, [nome, email, departamento, cargo || 'usuário', id], function (err) {
                if (err) return res.send(renderError('Erro', 'Não foi possível atualizar o utilizador.', 'error'));
                return res.redirect('/superadmin');
            });
        }
    } catch (e) {
        console.error('Erro ao editar utilizador:', e);
        return res.send(renderError('Erro', 'Erro ao processar a requisição.', 'error'));
    }
});

// --- ROTA: Eliminar utilizador (apenas SuperAdmin) ---
app.post('/superadmin/eliminar-usuario/:id', (req, res) => {
    // 1. Verificação de Segurança (Apenas SuperAdmin)
    if (!req.session.superadm) return res.status(403).send("Acesso Negado");

    const userId = req.params.id;

    // 2. Buscar o nome do usuário antes de o eliminar para poder registar no log
    db.get('SELECT nome FROM usuarios WHERE id = ?', [userId], (err, user) => {
        if (err || !user) return res.send("Utilizador não encontrado");

        const nomeUsuarioEliminado = user.nome;

        // 3. Eliminar o utilizador da tabela 'usuarios'
        db.run('DELETE FROM usuarios WHERE id = ?', [userId], function(err) {
            if (err) return res.send("Erro ao eliminar utilizador");

            // 4. REGISTAR A ATIVIDADE: Usando o nome correto 'logs_atividade'
            const queryLog = `
                INSERT INTO logs_atividade (usuario_nome, acao, ficheiro_nome, data_formatada, hora) 
                VALUES (?, ?, ?, ?, ?)`;
            
            const agora = new Date();
            const data = agora.toLocaleDateString('pt-PT');
            const hora = agora.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

            // 'SuperAdmin' realizou a ação 'ELIMINAR' sobre o usuário 'nomeUsuarioEliminado'
            db.run(queryLog, ['SuperAdmin', 'ELIMINAR', nomeUsuarioEliminado, data, hora], (errLog) => {
                if (errLog) {
                    console.error("Erro ao gravar log no terminal:", errLog);
                }
                
                // 5. Redirecionar de volta para o painel de controlo
                res.redirect('/superadmin');
            });
        });
    });
});

// Rota para baixar ficheiro e registar a ação para o Admin
app.get('/download/:id', (req, res) => {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    const ficheiroId = req.params.id;

    // 1. Procurar os dados do ficheiro na BD
    db.get("SELECT nome_original, nome_servidor FROM ficheiros WHERE id = ?", [ficheiroId], (err, row) => {
        if (err || !row) return res.status(404).send("Ficheiro não encontrado.");

        const caminhoFisico = path.join(__dirname, 'uploads', row.nome_servidor);
        const agora = new Date();

        // 2. ESCREVER NO LOG (O que o Admin vai ver)
        const sqlLog = "INSERT INTO logs_atividade (usuario_nome, acao, ficheiro_nome, data_formatada, hora) VALUES (?, ?, ?, ?, ?)";
        const paramsLog = [
            user.nome,
            'DOWNLOAD',
            row.nome_original,
            agora.toLocaleDateString('pt-AO'),
            agora.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
        ];

        db.run(sqlLog, paramsLog, (errLog) => {
            if (errLog) console.error("Erro ao gravar log de download:", errLog.message);

            // 3. Entregar o ficheiro ao utilizador com o nome original
            res.download(caminhoFisico, row.nome_original);
        });
    });

});

app.listen(3001, () => console.log("Servidor INAMET rodando em http://localhost:3001"));