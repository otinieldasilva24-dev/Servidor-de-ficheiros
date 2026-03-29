const bcrypt = require('bcrypt');
const { renderDashboard, renderPerfil, renderError, renderGestaoUtilizadores, headerPadrao } = require('./utils/renders');
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
                    
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=suporte.ti@inamet.gov.ao&su=Suporte Técnico - INAMET" 
                       target="_blank"
                       class="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-6 bg-blue-700 rounded-2xl font-bold text-white shadow-lg hover:bg-blue-800 transition-all duration-300 overflow-hidden">
                        <span class="relative z-10">suporte.ti@inamet.gov.ao</span>
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
    const query = "SELECT * FROM ficheiros WHERE departamento = ?";

    db.all(query, [user.departamento], (err, files) => {
        if (err) {
            console.error("Erro na BD:", err);
            return res.status(500).send("Erro ao carregar dados reais.");
        }

        // 3. Configurar UTF-8 para evitar o erro de "ecrÃ£"
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        // 4. Enviar para o renders.js (O user agora está definido aqui dentro!)
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

    // Passo A: Inserir o ficheiro na tabela de ficheiros (Como já tinhas)
    const sqlFicheiro = "INSERT INTO ficheiros (nome_original, nome_servidor, departamento, usuario_id, data_upload) VALUES (?, ?, ?, ?, ?)";
    const paramsFicheiro = [nomeOriginal, req.file.filename, req.body.departamento, user.id, agora.toISOString()];

    db.run(sqlFicheiro, paramsFicheiro, function (err) {
        if (err) {
            console.error("Erro ao guardar ficheiro:", err.message);
            return res.send("Erro ao guardar na BD");
        }

        // Passo B: ESCREVER O LOG (A parte nova para o Admin)
        // Criamos os dados formatados para Angola (pt-AO)
        const dataLog = agora.toLocaleDateString('pt-AO');
        const horaLog = agora.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });

        const sqlLog = "INSERT INTO logs_atividade (usuario_nome, acao, ficheiro_nome, data_formatada, hora) VALUES (?, ?, ?, ?, ?)";
        const paramsLog = [user.nome, 'UPLOAD', nomeOriginal, dataLog, horaLog];

        db.run(sqlLog, paramsLog, (errLog) => {
            if (errLog) console.error("⚠️ Erro ao gravar Log de Upload:", errLog.message);

            // Redireciona apenas após tentar gravar o log
            res.redirect('/dashboard');
        });
    });
});

// --- 8. TORNAR CHEFE (ADMIN) ---
app.post('/tornar-chefe', (req, res) => {
    const { codigo_secreto } = req.body;
    const user = req.session.user;

    // DEFINA AQUI O SEU CÓDIGO REAL (Exemplo: '1234')
    const CODIGO_CORRETO = '1234';

    if (!user) return res.redirect('/login');

    if (codigo_secreto === CODIGO_CORRETO) {
        // CASO CERTO: Atualiza a sessão e volta à dashboard
        req.session.user.cargo = 'admin';

        // Garantir que a sessão é gravada antes do redirect
        req.session.save(() => {
            res.redirect('/dashboard');
        });
    } else {
        // CASO ERRADO: Usa a função renderError do teu renders.js
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const htmlErro = renderError(
            'Acesso Negado',
            'O código secreto inserido está incorreto. Tenta novamente.',
            'error'
        );
        res.send(htmlErro);
    }
});

// --- ROTA: SAIR DO MODO CHEFE (VOLTAR A UTILIZADOR COMUM) ---
app.get('/sair-modo-chefe', (req, res) => {
    // 1. Verificar se existe um utilizador na sessão
    if (!req.session.user) return res.redirect('/login');

    const userId = req.session.user.id;

    // 2. Atualizar permanentemente na Base de Dados para 'comum'
    const sql = "UPDATE usuarios SET cargo = 'comum' WHERE id = ?";

    db.run(sql, [userId], function (err) {
        if (err) {
            console.error("Erro ao sair do modo chefe:", err.message);
            return res.send(renderError("Erro", "Não foi possível alterar o cargo.", "error"));
        }

        // 3. Atualizar a SESSÃO para 'comum'
        // Isso remove imediatamente os botões de "Eliminar" e "Equipa" da Dashboard
        req.session.user.cargo = 'comum';

        // 4. Gravar a sessão e redirecionar para a Dashboard limpa
        req.session.save(() => {
            res.redirect('/dashboard');
        });
    });
});

app.get('/admin/alterar-cargo/:id/:novoCargo', (req, res) => {
    // 1. Verificação de segurança
    if (!req.session.user || req.session.user.cargo !== 'admin') {
        return res.send(renderError("Acesso Negado", "Não tens permissão.", "error"));
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
        res.redirect('/admin/utilizadores');
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
    return res.redirect('/perfil');
});

// Eliminar conta (POST) — exige confirmação de senha
app.post('/eliminar-conta', (req, res) => {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    const { senha_confirmacao } = req.body;
    if (!senha_confirmacao) return res.send(renderError('Erro', 'É necessário inserir a senha para confirmar.', 'warning'));

    const userId = user.id;

    db.get('SELECT senha FROM usuarios WHERE id = ?', [userId], async (err, row) => {
        if (err || !row) return res.send(renderError('Erro', 'Utilizador inválido.', 'error'));

        try {
            const valido = await bcrypt.compare(senha_confirmacao, row.senha);
            if (!valido) return res.send(renderError('Erro', 'Senha incorreta. A conta não foi eliminada.', 'error'));

            db.run('DELETE FROM usuarios WHERE id = ?', [userId], function (delErr) {
                if (delErr) {
                    console.error(delErr.message);
                    return res.send(renderError('Erro', 'Não foi possível eliminar a conta.', 'error'));
                }

                req.session.destroy((sessErr) => {
                    if (sessErr) console.error('Erro ao destruir sessão após eliminação:', sessErr.message);
                    res.redirect('/login?status=deleted');
                });
            });
        } catch (e) {
            return res.send(renderError('Erro', 'Falha na verificação da senha.', 'error'));
        }
    });
});

app.post('/perfil/atualizar', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const { nome, password } = req.body; // 'password' vem do nome do campo no teu HTML
    const userId = req.session.user.id;

    // 1. Procurar os dados atuais usando a coluna correta 'senha'
    db.get("SELECT senha FROM usuarios WHERE id = ?", [userId], async (err, row) => {
        if (err) {
            console.error("❌ ERRO BD SELECT:", err.message);
            return res.send(renderError("Erro", "Erro ao aceder à base de dados.", "error"));
        }

        let sql;
        let params;
        let mensagemSucesso = "As tuas informações foram guardadas!";

        try {
            // Caso o usuário queira mudar a senha
            if (password && password.trim() !== "") {

                // Validação de tamanho
                if (password.length < 6) {
                    return res.send(renderError("Senha Curta", "A nova palavra-passe deve ter pelo menos 6 caracteres.", "warning"));
                }

                // Comparação usando BCRYPT (como a senha na BD é um hash)
                const senhasIguais = await bcrypt.compare(password, row.senha);
                if (senhasIguais) {
                    return res.send(renderError("Atenção", "A nova palavra-passe não pode ser igual à atual.", "info"));
                }

                // Gerar novo Hash para segurança
                const novoHash = await bcrypt.hash(password, 10);
                sql = "UPDATE usuarios SET nome = ?, senha = ? WHERE id = ?";
                params = [nome, novoHash, userId];
                mensagemSucesso = "Perfil e Palavra-Passe atualizados com sucesso!";
            } else {
                // Atualiza apenas o nome
                sql = "UPDATE usuarios SET nome = ? WHERE id = ?";
                params = [nome, userId];
            }

            // 2. Executar a atualização final
            db.run(sql, params, function (err) {
                if (err) {
                    console.error("❌ ERRO SQL UPDATE:", err.message);
                    return res.send(renderError("Erro", "Não foi possível atualizar os dados.", "error"));
                }

                // Atualizar nome na sessão para refletir no header
                req.session.user.nome = nome;

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
                                    text: '${mensagemSucesso}',
                                    confirmButtonColor: '#1d4ed8'
                                }).then(() => { window.location.href = '/perfil'; });
                            </script>
                        </body>
                        </html>
                    `);
                });
            });
        } catch (e) {
            res.send(renderError("Erro", "Erro ao processar segurança da senha.", "error"));
        }
    });
});

// ROTA: Listar utilizadores E registos de atividade para o Chefe
app.get('/admin/utilizadores', (req, res) => {
    const userLogado = req.session.user; // Pega os dados de quem está logado

    if (!userLogado) return res.redirect('/login');

    // FILTRO: Só seleciona utilizadores do MESMO departamento que o admin logado
    const sqlUsers = "SELECT id, nome, departamento, cargo FROM usuarios WHERE departamento = ? ORDER BY nome ASC";

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
            res.send(renderGestaoUtilizadores(users, logs || []));
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