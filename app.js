const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./database');
const path = require('path');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'segredo-projeto-2026',
    resave: false,
    saveUninitialized: false
}));

// --- FUNÇÃO AUXILIAR: RENDERIZAR ERROS INSTITUCIONAIS ---
const renderError = (titulo, mensagem, tipo) => {
    const icon = tipo === 'error' ? '❌' : '⚠️';
    const color = tipo === 'error' ? 'text-red-500' : 'text-yellow-500';
    return `
        <script src="https://cdn.tailwindcss.com"></script>
        <div class="h-screen flex items-center justify-center bg-slate-50 font-sans">
            <div class="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 text-center max-w-md">
                <div class="text-5xl mb-4">${icon}</div>
                <h2 class="text-2xl font-black text-slate-800 uppercase mb-2">${titulo}</h2>
                <p class="text-slate-500 mb-6">${mensagem}</p>
                <button onclick="window.history.back()" class="bg-blue-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">Tentar Novamente</button>
            </div>
        </div>
    `;
};

// --- FUNÇÃO AUXILIAR: CABEÇALHO ---
const headerPadrao = `
    <header class="fixed top-0 w-full z-50 glass border-b border-slate-200 h-20 bg-white/90 backdrop-blur-md"> 
        <div class="container mx-auto px-6 h-full flex justify-between items-center">
            <div class="flex items-center gap-3">
                <img src="/img/logo-inamet.png" alt="Logo INAMET" class="h-16 w-auto object-contain py-1">
                <div class="border-l border-slate-300 pl-3 hidden sm:block">
                    <h1 class="font-black text-slate-800 leading-none tracking-tighter text-xl">INAMET</h1>
                    <p class="text-[10px] uppercase tracking-tighter text-slate-500 font-bold leading-tight">
                        Instituto Nacional de <br> Meteorologia e Geofísica
                    </p>
                </div>
            </div>
            <nav class="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
                <a href="/" class="hover:text-blue-700 transition">Início</a>
                <a href="/departamentos" class="hover:text-blue-700 transition">Departamentos</a>
                <a href="/suporte" class="hover:text-blue-700 transition">Suporte</a>
            </nav>
        </div>
    </header>
`;

// --- 1. PÁGINA INICIAL ---
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
                            Gestão segura de dados meteorológicos e geofísicos. Organize documentos por departamentos com criptografia de ponta.
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

// --- 2. DEPARTAMENTOS ---
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
                    ${['Logística', 'Financeiro', 'Recursos Humanos', 'Vendas', 'TI'].map(dept => `
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

// --- 3. SUPORTE (CORRIGIDO) ---
// --- NOVA ROTA: SUPORTE ESTILIZADA ---
app.get('/suporte', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <title>INAMET | Suporte Técnico</title>
            <style>
                body { font-family: 'Inter', sans-serif; }
                .glass-card { 
                    background: #ffffff;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
                    border-radius: 3rem;
                }
                .support-icon {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    color: #1d4ed8;
                }
            </style>
        </head>
        <body class="bg-slate-50 antialiased text-slate-900">
            ${headerPadrao}

            <main class="min-h-screen pt-32 pb-12 px-6 flex flex-col items-center">
                <div class="max-w-4xl w-full">
                    
                    <div class="text-center mb-12 animate__animated animate__fadeIn">
                        <h2 class="text-4xl font-800 text-slate-800 tracking-tighter uppercase">Central de <span class="text-blue-700">Suporte</span></h2>
                        <p class="text-slate-500 mt-2 font-medium">Como podemos ajudar a manter a sua produtividade hoje?</p>
                        <div class="h-1.5 w-16 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-8 animate__animated animate__fadeInUp">
                        <div class="glass-card p-10 flex flex-col items-center text-center group hover:border-blue-200 transition-all">
                            <div class="w-20 h-20 support-icon rounded-[2rem] flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                📧
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">E-mail Institucional</h3>
                            <p class="text-sm text-slate-500 mb-6">Para questões técnicas de acesso ou bugs no repositório.</p>
                            <span class="text-blue-700 font-bold tracking-tight bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                                suporte.ti@inamet.gov.ao
                            </span>
                        </div>

                        <div class="glass-card p-10 flex flex-col items-center text-center group hover:border-blue-200 transition-all">
                            <div class="w-20 h-20 support-icon rounded-[2rem] flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                📞
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">Linha de Apoio</h3>
                            <p class="text-sm text-slate-500 mb-6">Disponível de Segunda a Sexta, das 08h às 15h30.</p>
                            <span class="text-blue-700 font-bold tracking-tight bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                                +244 9XX XXX XXX
                            </span>
                        </div>
                    </div>

                    <div class="mt-12 glass-card p-8 flex flex-col md:flex-row items-center justify-between bg-blue-700 border-none animate__animated animate__fadeInUp animate__delay-1s">
                        <div class="text-white mb-6 md:mb-0 text-center md:text-left">
                            <h4 class="font-bold text-lg">Esqueceu a sua palavra-passe?</h4>
                            <p class="text-blue-100 text-sm">O processo de recuperação deve ser solicitado ao administrador de TI.</p>
                        </div>
                        <a href="mailto:suporte.ti@inamet.gov.ao" class="bg-white text-blue-700 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-colors">
                            Solicitar Nova Senha
                        </a>
                    </div>

                    <div class="mt-12 text-center">
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">INAMET | Departamento de Tecnologia de Informação</p>
                    </div>
                </div>
            </main>
        </body>
        </html>
    `);
});

// --- 4. LOGIN (VIEW) ---
app.get('/login', (req, res) => {
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
        </html>
    `);
});

// --- 5. REGISTO (VIEW) ---
app.get('/registo', (req, res) => {
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
                select.input-field { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.25rem center; background-size: 1rem; }
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

// --- 6. LOGICA POST ---
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.send(renderError('Acesso Negado', 'Utilizador não encontrado no sistema institucional.', 'error'));
        }
        const match = await bcrypt.compare(senha, user.senha);
        if (match) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.send(renderError('Falha na Autenticação', 'A palavra-passe inserida está incorreta.', 'warning'));
        }
    });
});

app.post('/registo', async (req, res) => {
    const { nome, email, senha, departamento } = req.body;
    const hash = await bcrypt.hash(senha, 10);
    db.run(`INSERT INTO usuarios (nome, email, senha, departamento) VALUES (?, ?, ?, ?)`, 
    [nome, email, hash, departamento], (err) => {
        if (err) {
            return res.send(`<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script><script>Swal.fire({ icon: 'error', title: 'Erro', text: 'E-mail em uso.' }).then(() => { window.history.back(); });</script>`);
        }
        res.send(`<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script><script>Swal.fire({ icon: 'success', title: 'Concluído!', text: 'Já pode fazer login.', confirmButtonColor: '#1d4ed8' }).then(() => { window.location.href = '/login'; });</script>`);
    });
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));