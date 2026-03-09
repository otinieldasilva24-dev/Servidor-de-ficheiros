// 1. O Cabeçalho que aparece em todas as páginas
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

// 2. Função para o Dashboard Principal
function renderDashboard(user, files, queryParams = {}) {
    const ehChefe = user.cargo === 'admin';
    const temErro = queryParams.erro === '1';

    return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
            .glass-card { background: white; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fadeIn 0.4s ease-out; }
            .modal-bg { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); }
        </style>
        <title>INAMET | Dashboard</title>
    </head>
    <body class="min-h-screen">
        <div class="fixed top-0 w-full z-50">${headerPadrao}</div>
        
        <main class="max-w-6xl mx-auto pt-32 pb-16 px-6">
            ${temErro ? `
            <div id="alertErro" class="animate-fade mb-8 flex items-center p-5 bg-white border-l-[6px] border-amber-500 rounded-2xl shadow-lg">
                <div class="flex-shrink-0 bg-amber-500 p-2 rounded-xl">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div class="ml-5 flex-1">
                    <h3 class="text-xs font-900 text-amber-600 uppercase tracking-widest mb-1">Acesso Negado</h3>
                    <p class="text-slate-600 text-sm">Código de autorização incorreto para o setor de <b>${user.departamento}</b>.</p>
                </div>
                <button onclick="window.location.href='/dashboard'" class="text-slate-300 hover:text-slate-500 text-2xl font-light px-4">×</button>
            </div>` : ''}

            <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <p class="text-[10px] font-extrabold text-blue-600 uppercase tracking-[0.3em] mb-2">Painel de Gestão</p>
                    <h2 class="text-4xl font-800 text-slate-800 tracking-tighter italic">Olá, <span class="text-blue-600">${user.nome}</span></h2>
                    <p class="text-slate-500 text-sm mt-1 font-medium italic">Setor: <span class="uppercase font-bold text-slate-700">${user.departamento}</span></p>
                </div>
                <div class="flex gap-3">
                    ${!ehChefe ? 
                        `<button onclick="abrirModalChefe()" class="border-2 border-blue-600 text-blue-600 px-6 py-4 rounded-2xl font-bold text-[10px] uppercase hover:bg-blue-50 transition-all active:scale-95">Tornar-me chefe</button>` : 
                        `<form action="/deixar-chefe" method="POST"><input type="hidden" name="usuario_id" value="${user.id}"><button type="submit" class="border-2 border-slate-200 text-slate-400 px-6 py-4 rounded-2xl font-bold text-[10px] uppercase hover:text-red-500 transition-colors">Deixar de ser chefe</button></form>`
                    }
                    <button onclick="abrirModal()" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-3 hover:bg-blue-700 transition-all">+ CARREGAR ARQUIVO</button>
                </div>
            </div>

            <div class="glass-card rounded-[3rem] overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th class="px-10 py-6 text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Documento</th>
                            <th class="px-10 py-6 text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${files.length > 0 ? files.map(f => `
                        <tr class="hover:bg-blue-50/20 transition-all">
                            <td class="px-10 py-6 font-semibold text-slate-700 text-sm">${f.nome_original}</td>
                            <td class="px-10 py-6 text-center flex justify-center gap-4">
                                <a href="/uploads/${f.nome_servidor}" download="${f.nome_original}" class="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white transition-all">Download</a>
                                ${ehChefe ? `<button onclick="eliminarFicheiro(${f.id})" class="text-red-500 font-bold text-[10px] uppercase hover:underline">Eliminar</button>` : ''}
                            </td>
                        </tr>`).join('') : `<tr><td colspan="2" class="px-10 py-24 text-center text-slate-400 italic text-lg font-medium">Nenhum ficheiro disponível no departamento de ${user.departamento}.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </main>

        <div id="modalUpload" class="fixed inset-0 modal-bg z-[100] hidden flex items-center justify-center p-6">
            <div class="bg-white w-full max-w-md rounded-[2.5rem] p-10 animate-fade">
                <h3 class="text-2xl font-800 text-slate-800 mb-6 uppercase tracking-tight">Carregar <span class="text-blue-600">Ficheiro</span></h3>
                <form action="/upload" method="POST" enctype="multipart/form-data" class="space-y-5">
                    <input type="hidden" name="departamento" value="${user.departamento}">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Nome de Exibição</label>
                        <input type="text" name="nome_exibicao" placeholder="Ex: Relatório Mensal Março" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-600 transition-all">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Selecionar Ficheiro</label>
                        <input type="file" name="ficheiro" required class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="fecharModal()" class="flex-1 px-6 py-4 border border-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-400 hover:bg-slate-50">Cancelar</button>
                        <button type="submit" class="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg shadow-blue-100">Confirmar Envio</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="modalChefe" class="fixed inset-0 modal-bg z-[100] hidden flex items-center justify-center p-6">
            <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-10 animate-fade text-center">
                <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">🛡️</div>
                <h3 class="text-2xl font-800 text-slate-800 mb-2 uppercase tracking-tight">Modo <span class="text-blue-600">Chefe</span></h3>
                <p class="text-slate-500 text-sm mb-8 font-medium italic">Insira o código de autorização do seu departamento.</p>
                <form action="/tornar-chefe" method="POST" class="space-y-5">
                    <input type="hidden" name="usuario_id" value="${user.id}">
                    <input type="password" name="codigo_secreto" required placeholder="Código Secreto" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-lg font-bold tracking-[0.5em] outline-none focus:border-blue-600 transition-all">
                    <div class="flex gap-3">
                        <button type="button" onclick="fecharModalChefe()" class="flex-1 px-6 py-4 text-slate-400 font-bold text-[10px] uppercase">Fechar</button>
                        <button type="submit" class="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg">Validar</button>
                    </div>
                </form>
            </div>
        </div>

        <script>
            function abrirModal() { document.getElementById('modalUpload').classList.remove('hidden'); }
            function fecharModal() { document.getElementById('modalUpload').classList.add('hidden'); }
            function abrirModalChefe() { document.getElementById('modalChefe').classList.remove('hidden'); }
            function fecharModalChefe() { document.getElementById('modalChefe').classList.add('hidden'); }
            function eliminarFicheiro(id) { 
                if(confirm('Atenção: Eliminar este ficheiro permanentemente?')) {
                    window.location.href = '/eliminar/' + id; 
                }
            }
            
            // Fechar modais ao clicar fora deles
            window.onclick = function(event) {
                const mu = document.getElementById('modalUpload');
                const mc = document.getElementById('modalChefe');
                if (event.target == mu) fecharModal();
                if (event.target == mc) fecharModalChefe();
            }
        </script>
    </body>
    </html>
    `;
}

// 3. Função para Erros Institucionais (SweetAlert2)
function renderError(titulo, mensagem, icone) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
            <style>body { font-family: 'Inter', sans-serif; }</style>
        </head>
        <body class="bg-slate-50">
            <script>
                Swal.fire({
                    icon: '${icone}',
                    title: '${titulo.toUpperCase()}',
                    text: '${mensagem}',
                    confirmButtonColor: '#1d4ed8',
                    confirmButtonText: 'Tentar Novamente'
                }).then(() => { 
                    window.history.back(); 
                });
            </script>
        </body>
        </html>
    `;
}

module.exports = { headerPadrao, renderDashboard, renderError };