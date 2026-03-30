const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { headerPadrao, renderError, renderSuperAdminDashboard } = require('../utils/renders');

// --- LOGIN (GET) ---
router.get('/login', (req, res) => {
    // Se já existe sessão, redireciona para o painel correspondente
    if (req.session && req.session.superadm) return res.redirect('/superadmin');
    if (req.session && req.session.user) return res.redirect('/dashboard');

    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <title>INAMET | Login</title>
            <style>
                body { font-family: 'Inter', sans-serif; overflow: hidden; }
                .glass-card { background: #ffffff; border: 1px solid #f1f5f9; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }
                .input-field { transition: all 0.2s ease; border: 1.5px solid #f1f5f9; }
                .input-field:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); outline: none; }
                .btn-primary { background-color: #1d4ed8; transition: all 0.3s ease; }
                .btn-primary:hover { background-color: #1e40af; transform: translateY(-1px); }
            </style>
        </head>
        <body class="bg-white antialiased">
            ${headerPadrao}
            <main class="h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
                <div class="w-full max-w-[440px] glass-card rounded-[3rem] p-8 animate__animated animate__fadeInUp relative">
                    <div class="mb-8 text-center">
                        <h2 class="text-3xl font-800 text-slate-800 tracking-tighter uppercase">Portal <span class="text-blue-700">Login</span></h2>
                        <div class="h-1 w-12 bg-blue-600 mx-auto mt-2 rounded-full"></div>
                    </div>
                    <form action="/login" method="POST" class="space-y-5">
                        <div>
                            <label class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">E-mail Institucional</label>
                            <input type="email" name="email" required placeholder="exemplo@inamet.gov.ao" class="input-field w-full px-5 py-3.5 rounded-2xl bg-slate-50 text-sm text-slate-700">
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-1.5 ml-1">
                                <label class="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Palavra-passe</label>
                            </div>
                            <input type="password" name="senha" required placeholder="••••••••" class="input-field w-full px-5 py-3.5 rounded-2xl bg-slate-50 text-sm text-slate-700">
                        </div>
                        <button type="submit" class="btn-primary w-full text-white py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs shadow-lg mt-2">Aceder ao Painel</button>
                    </form>

                    <div class="mt-4">
                        <button type="button" onclick="tornarMeAdmin()" class="w-full text-amber-700 border border-amber-200 bg-amber-50 px-4 py-3 rounded-2xl font-bold text-[13px] hover:bg-amber-100">Tornar-me ADM</button>
                    </div>
                    <div class="mt-8 pt-6 border-t border-slate-50 text-center flex flex-col gap-2">
                        <a href="/" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">← Voltar ao Início</a>
                        <p class="text-xs text-slate-400 font-medium">Não tem conta? <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${process.env.ADMIN_EMAIL || 'robertozua161@gmail.com'}&su=${encodeURIComponent('Solicitação de Acesso - INAMET')}&body=${encodeURIComponent('Olá Admin,\r\n\r\nGostaria de solicitar acesso ao portal INAMET.\r\n\r\nNome Completo:\r\nE-mail:\r\nDepartamento:\r\n\r\nObrigado.')}" target="_blank" class="text-blue-600 font-bold hover:underline ml-1">Solicitar Acesso</a></p>
                    </div>
                </div>
            </main>
                <script>
                function tornarMeAdmin() {
                    Swal.fire({
                        title: 'Código de Confirmação',
                        input: 'password',
                        inputPlaceholder: 'Insira o código de confirmação',
                        showCancelButton: true,
                        confirmButtonText: 'Validar',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#1d4ed8',
                        inputAttributes: { autocapitalize: 'off', autocorrect: 'off' }
                    }).then((result) => {
                        if (!result.value) return;
                        fetch('/superadmin/activate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ codigo: result.value })
                        }).then(response => {
                            if (response.redirected) {
                                window.location.href = response.url;
                                return;
                            }
                            return response.text();
                        }).then(html => {
                            if (html) { document.open(); document.write(html); document.close(); }
                        }).catch(() => {
                            Swal.fire('Erro', 'Erro de rede. Tente novamente.', 'error');
                        });
                    });
                }
                </script>
        </body>
        </html>`);
});

// --- LOGIN (POST) ---
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.send(renderError("Erro", "Utilizador não encontrado", "error"));

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) return res.send(renderError("Erro", "Senha incorreta", "error"));

        req.session.user = user;
        res.redirect('/dashboard');
    });
});

// --- REGISTO (GET) - Apenas Admin (criação de conta pelo Admin)
router.get('/registo', (req, res) => {
    // Apenas SuperAdmin pode aceder ao formulário de criação
    if (!req.session.superadm) {
        return res.send(renderError('Acesso Negado', 'Ação permitida apenas ao SuperAdmin.', 'error'));
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <title>INAMET | Criar Conta</title>
            <style>
                body { font-family: 'Inter', sans-serif; overflow: hidden; }
                .glass-card { background: #ffffff; border: 1px solid #f1f5f9; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }
                .input-field { transition: all 0.2s ease; border: 1.5px solid #f1f5f9; }
                .input-field:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); outline: none; }
                .btn-primary { background-color: #1d4ed8; transition: all 0.3s ease; }
            </style>
        </head>
        <body class="bg-white antialiased">
            ${headerPadrao}
            <main class="h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
                <div class="w-full max-w-[440px] glass-card rounded-[3rem] p-8 mt-12 animate__animated animate__fadeInUp">
                    <div class="mb-6 text-center">
                        <h2 class="text-3xl font-800 text-slate-800 tracking-tighter uppercase">Criar <span class="text-blue-700">Conta</span></h2>
                        <div class="h-1 w-12 bg-blue-600 mx-auto mt-2 rounded-full"></div>
                    </div>
                    <form action="/registo" method="POST" class="space-y-3">
                        <div>
                            <label class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1 ml-1">Nome Completo</label>
                            <input type="text" name="nome" required placeholder="Ex: João Manuel" class="input-field w-full px-5 py-3 rounded-2xl bg-slate-50 text-sm text-slate-700">
                        </div>
                        <div>
                            <label class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1 ml-1">E-mail Profissional</label>
                            <input type="email" name="email" required placeholder="exemplo@inamet.gov.ao" class="input-field w-full px-5 py-3 rounded-2xl bg-slate-50 text-sm text-slate-700">
                        </div>
                        <div>
                            <label class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1 ml-1">Definir Senha</label>
                            <input type="password" name="senha" required placeholder="••••••••" class="input-field w-full px-5 py-3 rounded-2xl bg-slate-50 text-sm text-slate-700">
                        </div>
                        <div>
                            <label class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1 ml-1">Departamento</label>
                            <select name="departamento" required class="input-field w-full px-5 py-3 rounded-2xl bg-slate-50 text-sm text-slate-500">
                                <option value="" disabled selected>Selecionar Área</option>
                                <option value="dt1">DT1</option>
                                <option value="dt2">DT2</option>
                                <option value="dt3">DT3</option>
                                <option value="dt4">DT4</option>
                                <option value="dt5">DT5</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1 ml-1">Cargo (opcional)</label>
                            <select name="cargo" class="input-field w-full px-5 py-3 rounded-2xl bg-slate-50 text-sm text-slate-500">
                                <option value="usuário" selected>usuário</option>
                                <option value="admin">admin</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary w-full text-white py-3.5 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs shadow-lg mt-2">Criar Conta</button>
                    </form>
                    <div class="mt-6 pt-6 border-t border-slate-50 text-center flex flex-col gap-2">
                        <a href="/admin/utilizadores" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">← Voltar à Gestão</a>
                    </div>
                </div>
            </main>
        </body>
        </html>
    `);
});

// --- REGISTO (POST) ---
router.post('/registo', async (req, res) => {
    // Apenas SuperAdmin pode criar contas
    if (!req.session.superadm) {
        return res.send(renderError('Acesso Negado', 'Ação permitida apenas ao SuperAdmin.', 'error'));
    }

    const { nome, email, senha, departamento, cargo } = req.body;
    const cargoFinal = cargo && cargo === 'admin' ? 'admin' : 'usuário';
    try {
        const hash = await bcrypt.hash(senha, 10);
        db.run(`INSERT INTO usuarios (nome, email, senha, departamento, cargo) VALUES (?, ?, ?, ?, ?)`,
            [nome, email, hash, departamento, cargoFinal], (err) => {
                if (err) {
                    return res.send(`
                    <html>
                    <head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
                    <body><script>
                        Swal.fire({ icon: 'warning', title: 'Erro', text: 'Falha ao criar utilizador (e-mail pode já estar em uso).', confirmButtonColor: '#1d4ed8' })
                        .then(() => { window.location.href = '/superadmin'; });
                    </script></body></html>
                `);
                }
                // Gravacao de log: quem criou e quem foi criado
                const actor = (req.session.user && req.session.user.nome) || 'SuperAdmin';
                const agora = new Date();
                const dataLog = agora.toLocaleDateString('pt-AO');
                const horaLog = agora.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
                db.run("INSERT INTO logs_atividade (usuario_nome, acao, ficheiro_nome, data_formatada, hora) VALUES (?, ?, ?, ?, ?)",
                    [actor, 'CREATE_USER', nome, dataLog, horaLog], (logErr) => {
                        if (logErr) console.error('Erro ao gravar log CREATE_USER:', logErr.message);
                        return res.send(`
                        <html>
                        <head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
                        <body><script>
                            Swal.fire({ icon: 'success', title: 'Conta Criada', text: 'Conta criada com sucesso para ${nome}.', confirmButtonColor: '#1d4ed8' })
                            .then(() => { window.location.href = '/superadmin'; });
                        </script></body></html>
                    `);
                    });
            });
    } catch (e) {
        res.send(renderError('Erro', 'Falha no servidor', 'error'));
    }
});

module.exports = router;

// --- ROTAS DO SUPER-ADMIN (ADM GERAL, SEM LOGIN) ---
// Ativação via código: seta `req.session.superadm = true`
router.post('/superadmin/activate', (req, res) => {
    const codigo = (req.body && (req.body.codigo || req.body.codigo_secreto)) || '';
    const CODIGO_SUPER = process.env.SUPER_ADMIN_CODE || 'INAMET-ADM-2026';

    if (codigo === CODIGO_SUPER) {
        req.session.superadm = true;
        req.session.save(() => { res.redirect('/superadmin'); });
    } else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(renderError('Acesso Negado', 'Código incorreto. Tenta novamente.', 'error'));
    }
});

// Página do SuperAdmin (acesso global)
router.get('/superadmin', (req, res) => {
    if (!req.session.superadm) return res.redirect('/login');

    // Pega todos os utilizadores, ficheiros e logs
    db.all('SELECT id, nome, departamento, cargo FROM usuarios ORDER BY nome ASC', [], (errUsers, users) => {
        if (errUsers) return res.send(renderError('Erro', 'Falha ao carregar utilizadores.', 'error'));

        db.all('SELECT * FROM ficheiros ORDER BY id DESC LIMIT 200', [], (errFiles, files) => {
            if (errFiles) return res.send(renderError('Erro', 'Falha ao carregar ficheiros.', 'error'));

            db.all('SELECT * FROM logs_atividade ORDER BY id DESC LIMIT 200', [], (errLogs, logs) => {
                if (errLogs) return res.send(renderError('Erro', 'Falha ao carregar logs.', 'error'));

                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.send(renderSuperAdminDashboard(users || [], files || [], logs || []));
            });
        });
    });
});

// Desativar SuperAdmin
router.get('/superadmin/logout', (req, res) => {
    req.session.superadm = false;
    req.session.save(() => res.redirect('/login'));
});