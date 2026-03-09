const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { headerPadrao, renderError } = require('../utils/renders');

// --- LOGIN (GET) ---
router.get('/login', (req, res) => { 
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
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
                <div class="w-full max-w-[440px] glass-card rounded-[3rem] p-8 animate__animated animate__fadeInUp">
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
                                <a href="/recuperar-senha" class="text-[9px] font-bold text-blue-600 uppercase">Esqueceu?</a>
                            </div>
                            <input type="password" name="senha" required placeholder="••••••••" class="input-field w-full px-5 py-3.5 rounded-2xl bg-slate-50 text-sm text-slate-700">
                        </div>
                        <button type="submit" class="btn-primary w-full text-white py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs shadow-lg mt-2">Aceder ao Painel</button>
                    </form>
                    <div class="mt-8 pt-6 border-t border-slate-50 text-center flex flex-col gap-2">
                        <a href="/" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">← Voltar ao Início</a>
                        <p class="text-xs text-slate-400 font-medium">Não tem conta? <a href="/registo" class="text-blue-600 font-bold hover:underline ml-1">Solicitar Acesso</a></p>
                    </div>
                </div>
            </main>
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

// --- REGISTO (GET) ---
router.get('/registo', (req, res) => { 
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <title>INAMET | Registo</title>
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
                        <h2 class="text-3xl font-800 text-slate-800 tracking-tighter uppercase">Novo <span class="text-blue-700">Registo</span></h2>
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
                                <option value="logistica">Logística</option>
                                <option value="financeiro">Financeiro</option>
                                <option value="rh">Recursos Humanos</option>
                                <option value="ti">Tecnologia (TI)</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary w-full text-white py-3.5 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs shadow-lg mt-2">Finalizar Cadastro</button>
                    </form>
                    <div class="mt-6 pt-6 border-t border-slate-50 text-center flex flex-col gap-2">
                        <a href="/" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">← Voltar ao Início</a>
                        <p class="text-xs text-slate-400 font-medium">Já tem conta? <a href="/login" class="text-blue-600 font-bold hover:underline ml-1">Fazer Login</a></p>
                    </div>
                </div>
            </main>
        </body>
        </html>
    `);
});

// --- REGISTO (POST) ---
router.post('/registo', async (req, res) => { 
     const { nome, email, senha, departamento } = req.body;
     try {
        const hash = await bcrypt.hash(senha, 10);
        db.run(`INSERT INTO usuarios (nome, email, senha, departamento) VALUES (?, ?, ?, ?)`, 
        [nome, email, hash, departamento], (err) => {
            if (err) {
                return res.send(`
                    <html>
                    <head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
                    <body><script>
                        Swal.fire({ icon: 'warning', title: 'Utilizador já Registado', text: 'E-mail em uso.', confirmButtonColor: '#1d4ed8' })
                        .then(() => { window.location.href = '/login'; });
                    </script></body></html>
                `);
            }
            return res.send(`
                <html>
                <head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
                <body><script>
                    Swal.fire({ icon: 'success', title: 'Cadastro Realizado!', text: 'Bem-vindo ao INAMET, ${nome}.', confirmButtonColor: '#1d4ed8' })
                    .then(() => { window.location.href = '/login'; });
                </script></body></html>
            `);
        });
    } catch (e) {
        res.send(renderError('Erro', 'Falha no servidor', 'error'));
    }
});

// --- RECUPERAR SENHA (GET) ---
router.get('/recuperar-senha', (req, res) => { 
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap" rel="stylesheet">
            <title>INAMET | Recuperar Acesso</title>
            <style>
                body { font-family: 'Inter', sans-serif; overflow: hidden; }
                .glass-card { background: #ffffff; border: 1px solid #f1f5f9; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }
                .input-field { transition: all 0.2s ease; border: 1.5px solid #f1f5f9; }
                .input-field:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
            </style>
        </head>
        <body class="bg-white">
            ${headerPadrao}
            <main class="h-screen w-full flex flex-col items-center justify-center px-6">
                <div class="w-full max-w-[440px] glass-card rounded-[3rem] p-10 animate__animated animate__fadeInUp text-center">
                    <div class="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🔑</div>
                    <h2 class="text-3xl font-800 text-slate-800 tracking-tighter uppercase mb-6">Recuperar <span class="text-blue-700">Senha</span></h2>
                    <form action="/recuperar-senha" method="POST" class="space-y-6">
                        <input type="email" name="email" required placeholder="exemplo@inamet.gov.ao" class="input-field w-full px-5 py-4 rounded-2xl bg-slate-50 text-sm">
                        <button type="submit" class="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold uppercase text-xs shadow-lg">Verificar E-mail</button>
                    </form>
                    <a href="/login" class="block mt-8 text-[10px] font-bold text-slate-400 uppercase">← Voltar ao Login</a>
                </div>
            </main>
        </body>
        </html>
    `);
});

// --- RECUPERAR SENHA (POST) ---
router.post('/recuperar-senha', (req, res) => { 
    const { email } = req.body;
    db.get(`SELECT id FROM usuarios WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            return res.send(renderError('Erro', 'E-mail não encontrado no sistema.', 'error'));
        }
        res.redirect(`/nova-senha?id=${user.id}`);
    });
});

// --- NOVA SENHA (GET) ---
router.get('/nova-senha', (req, res) => { 
    const userId = req.query.id;
    if (!userId) return res.redirect('/login');
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap" rel="stylesheet">
            <title>INAMET | Nova Senha</title>
        </head>
        <body class="bg-white flex items-center justify-center h-screen">
            ${headerPadrao}
            <div class="w-full max-w-[440px] p-8 border border-slate-100 shadow-2xl rounded-[3rem]">
                <h2 class="text-2xl font-800 text-slate-800 mb-6 text-center uppercase">Definir <span class="text-blue-700">Nova Senha</span></h2>
                <form action="/atualizar-senha" method="POST" class="space-y-4">
                    <input type="hidden" name="userId" value="${userId}">
                    <input type="password" name="novaSenha" required placeholder="Nova Palavra-passe" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-600 outline-none transition-all">
                    <button type="submit" class="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold uppercase text-xs shadow-lg">Atualizar Senha</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// --- ATUALIZAR SENHA (POST) ---
router.post('/atualizar-senha', async (req, res) => { 
    const { userId, novaSenha } = req.body;
    if (!novaSenha || novaSenha.length < 6) {
        return res.send(renderError('Segurança', 'A senha deve ter pelo menos 6 caracteres.', 'warning'));
    }

    db.get(`SELECT senha FROM usuarios WHERE id = ?`, [userId], async (err, user) => {
        if (err || !user) return res.send(renderError('Erro', 'Utilizador inválido.', 'error'));

        const senhasIguais = await bcrypt.compare(novaSenha, user.senha);
        if (senhasIguais) return res.send(renderError('Segurança', 'A nova senha não pode ser igual à antiga.', 'warning'));

        const novoHash = await bcrypt.hash(novaSenha, 10);
        db.run(`UPDATE usuarios SET senha = ? WHERE id = ?`, [novoHash, userId], (updateErr) => {
            if (updateErr) return res.send(renderError('Erro', 'Falha ao salvar senha.', 'error'));
            res.send(`
                <html>
                <head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
                <body><script>
                    Swal.fire({ icon: 'success', title: 'SENHA ATUALIZADA', text: 'Pode agora aceder ao portal.', confirmButtonColor: '#1d4ed8' })
                    .then(() => { window.location.href = '/login'; });
                </script></body></html>
            `);
        });
    });
});

module.exports = router;