const { headerPadrao, renderDashboard, renderError } = require('./utils/renders');
const express = require('express');
const session = require('express-session');
const db = require('./config/database');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// 1. IMPORTAR AS ROTAS DE AUTENTICAÇÃO (O ficheiro que criámos antes)
const authRoutes = require('./routes/auth');

const app = express();

// --- GARANTIR QUE A PASTA UPLOADS EXISTE ---
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// --- CONFIGURAÇÕES DO SERVIDOR ---
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Para conseguires abrir os ficheiros depois
app.use(express.urlencoded({ extended: true }));
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

// --- 5. SUPORTE ---
app.get('/suporte', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>INAMET | Suporte</title>
        </head>
        <body class="bg-slate-50 pt-32 font-sans">
            ${headerPadrao}
            <div class="container mx-auto px-6 flex justify-center">
                <div class="max-w-2xl bg-white p-12 rounded-[3rem] shadow-xl text-center">
                    <h2 class="text-4xl font-black text-slate-800 mb-6 uppercase">Suporte <span class="text-blue-700">Técnico</span></h2>
                    <p class="text-slate-500 mb-8 leading-relaxed">Problemas com o acesso? Entre em contacto com o departamento de TI através do e-mail institucional.</p>
                    <div class="p-6 bg-blue-50 rounded-2xl border border-blue-100 font-bold text-blue-700">
                        suporte.ti@inamet.gov.ao
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// --- 6. DASHBOARD (PROJETADO PARA O OTINIEL E EQUIPA) ---
app.get('/dashboard', (req, res) => {
    // PROTEÇÃO: Se não houver utilizador na sessão, manda para o Login
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const usuario = req.session.user;

    // Buscamos os ficheiros do departamento do utilizador logado ou Gerais
    db.all(`SELECT * FROM ficheiros WHERE departamento = ? OR departamento = 'Geral'`, 
    [usuario.departamento], (err, ficheiros) => {
        if (err) return res.send("Erro ao carregar ficheiros.");

        // Renderizamos o Dashboard passando os dados REAIS da sessão
        const html = renderDashboard(usuario, ficheiros, req.query); 
        res.send(html);
    });
});

// --- 7. PROCESSAR UPLOAD DE FICHEIROS ---
app.post('/upload', upload.single('ficheiro'), (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    if (!req.file) return res.status(400).send("Nenhum ficheiro selecionado.");

    const { nome_exibicao, departamento } = req.body;
    const usuario_id = req.session.user.id;
    const nome_original = nome_exibicao || req.file.originalname;
    const nome_servidor = req.file.filename;

    const sql = `INSERT INTO ficheiros (nome_original, nome_servidor, departamento, usuario_id) 
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [nome_original, nome_servidor, departamento, usuario_id], function(err) {
        if (err) return res.status(500).send("Erro ao gravar na base de dados.");
        res.redirect('/dashboard');
    });
});

// --- 8. TORNAR CHEFE (ADMIN) ---
app.post('/tornar-chefe', (req, res) => {
    const { codigo_secreto, usuario_id } = req.body;
    const CODIGO_DE_TI = "1234"; 

    if (codigo_secreto === CODIGO_DE_TI) {
        db.run(`UPDATE usuarios SET cargo = 'admin' WHERE id = ?`, [usuario_id], (err) => {
            if (err) return res.send("Erro ao atualizar cargo.");
            // Atualizamos a sessão também para o utilizador ver as mudanças na hora
            if (req.session.user && req.session.user.id == usuario_id) {
                req.session.user.cargo = 'admin';
            }
            res.redirect('/dashboard');
        });
    } else {
        res.redirect('/dashboard?erro=1');
    }
});

// --- 9. LOGOUT (SAIR DO SISTEMA) ---
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000, () => console.log("Servidor INAMET rodando em http://localhost:3000"));