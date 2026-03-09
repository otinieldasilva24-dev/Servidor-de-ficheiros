// ==========================================
// 1. COMPONENTES REUTILIZÁVEIS (HEADER)
// ==========================================
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
                <a href="/dashboard" class="hover:text-blue-700 transition">Início</a>
                <a href="/departamentos" class="hover:text-blue-700 transition">Departamentos</a>
                <a href="/suporte" class="hover:text-blue-700 transition">Suporte</a>
            </nav>
        </div>
    </header>
`;

// ==========================================
// 2. MODAIS (UPLOAD E MODO CHEFE)
// ==========================================
const renderModais = (user) => {
    return `
        <div id="modalUpload" class="fixed inset-0 modal-bg z-[100] hidden flex items-center justify-center p-6">
            <div class="bg-white w-full max-w-md rounded-[2.5rem] p-10 animate-fade text-center">
                <h3 class="text-2xl font-800 text-slate-800 mb-6 uppercase tracking-tight">Enviar <span class="text-blue-600">Documento</span></h3>
                <form action="/upload" method="POST" enctype="multipart/form-data" class="space-y-5">
                    <input type="hidden" name="departamento" value="${user.departamento}">
                    <div class="p-8 border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 transition-all bg-slate-50/50">
                        <label class="cursor-pointer block">
                            <span class="block text-4xl mb-3">📁</span>
                            <span id="fileNameDisplay" class="text-sm font-semibold text-blue-600 italic">Escolher do PC</span>
                            <input type="file" name="ficheiro" required class="hidden" onchange="document.getElementById('fileNameDisplay').innerText = this.files[0].name">
                        </label>
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
                <p class="text-slate-500 text-sm mb-8 font-medium italic">Insira o código de autorização.</p>
                <form action="/tornar-chefe" method="POST" class="space-y-5">
                    <input type="password" name="codigo_secreto" required class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-lg font-bold tracking-[0.5em] outline-none focus:border-blue-600 transition-all">
                    <div class="flex gap-3">
                        <button type="button" onclick="fecharModalChefe()" class="flex-1 px-6 py-4 text-slate-400 font-bold text-[10px] uppercase">Fechar</button>
                        <button type="submit" class="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg">Validar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// ==========================================
// 3. PÁGINA: GESTÃO DE UTILIZADORES
// ==========================================
const renderGestaoUtilizadores = (users) => {
    const rows = users.map(u => `
        <tr class="hover:bg-slate-50/50 transition-all">
            <td class="px-10 py-6">
                <span class="font-bold text-slate-700 block">${u.nome}</span>
                <span class="text-[10px] text-slate-400 uppercase font-medium">ID: ${u.id}</span>
            </td>
            <td class="px-10 py-6 text-slate-500 text-sm font-medium">${u.departamento}</td>
            <td class="px-10 py-6 text-center">
                <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${u.cargo === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}">
                    ${u.cargo === 'admin' ? '🛡️ Administrador' : '👤 Comum'}
                </span>
            </td>
            <td class="px-10 py-6 text-center">
                <a href="/admin/alterar-cargo/${u.id}/${u.cargo === 'admin' ? 'comum' : 'admin'}" 
                   class="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all 
                   ${u.cargo === 'admin' ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}">
                    ${u.cargo === 'admin' ? 'Retirar Admin' : 'Tornar Admin'}
                </a>
            </td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestão de Equipa - INAMET</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); }
            @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fade 0.4s ease-out forwards; }
        </style>
    </head>
    <body class="bg-slate-50 min-h-screen">
        ${headerPadrao}
        <main class="container mx-auto px-6 pt-32 pb-20 animate-fade">
            <div class="flex items-center justify-between mb-10">
                <div>
                    <h2 class="text-3xl font-900 text-slate-800 tracking-tight">Gestão de <span class="text-blue-600">Utilizadores</span></h2>
                    <p class="text-slate-500 font-medium italic">Administre as permissões e cargos da equipa.</p>
                </div>
                <a href="/dashboard" class="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase hover:bg-slate-50 transition-all text-slate-500">
                    ← Painel Principal
                </a>
            </div>
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Utilizador</th>
                            <th class="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Departamento</th>
                            <th class="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Acesso Atual</th>
                            <th class="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">${rows}</tbody>
                </table>
            </div>
        </main>
    </body>
    </html>`;
};

// ==========================================
// 4. PÁGINA: DASHBOARD PRINCIPAL (BLINDADA)
// ==========================================
const renderDashboard = (user, files = []) => {
    const ehChefe = user.cargo === 'admin';
    const totalFicheiros = files.length;

    const fileRows = files.length > 0 ? files.map(f => `
        <tr class="hover:bg-blue-50/30 transition-colors group">
            <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                    <div class="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-xl group-hover:bg-white transition-colors shadow-sm">
                        ${f.nome_original.toLowerCase().endsWith('.pdf') ? '📄' : '📁'}
                    </div>
                    <div>
                        <span class="font-bold text-slate-800 text-sm block leading-tight">${f.nome_original}</span>
                        <span class="text-[9px] text-blue-500 uppercase font-black tracking-widest">${f.nome_original.split('.').pop()}</span>
                    </div>
                </div>
            </td>
            <td class="px-8 py-5 text-slate-500 text-xs font-semibold italic">
                ${f.data_upload ? new Date(f.data_upload).toLocaleDateString('pt-AO') : '---'}
            </td>
            <td class="px-8 py-5 text-center">
                <div class="flex justify-center items-center gap-2">
                    <a href="/uploads/${f.nome_servidor}" download="${f.nome_original}" class="h-10 px-5 flex items-center bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all cursor-pointer border-none">Download</a>
                    ${ehChefe ? `<button onclick="confirmarEliminacao('${f.id}', '${f.nome_original}')" class="h-10 px-5 flex items-center bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all cursor-pointer border-none shadow-none">Eliminar</button>` : ''}
                </div>
            </td>
        </tr>`).join('') : `<tr><td colspan="3" class="px-10 py-32 text-center text-slate-400 italic font-medium">Nenhum documento encontrado.</td></tr>`;

    return `<!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard - INAMET</title>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); }
            .modal-bg { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); }
            @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fade 0.4s ease-out forwards; }
            .swal2-popup { border-radius: 2.5rem !important; padding: 3rem !important; }
            .swal2-confirm { border-radius: 1.25rem !important; font-weight: 800 !important; text-transform: uppercase !important; font-size: 11px !important; padding: 1rem 2rem !important; }
        </style>
    </head>
    <body class="bg-slate-50 min-h-screen font-sans antialiased">
        ${headerPadrao}
        <main class="container mx-auto px-6 pt-32 pb-20">
            <div class="flex flex-col gap-8 mb-10">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 class="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">Painel de <span class="text-blue-600">Documentos</span></h2>
                        <div class="flex items-center gap-3 mt-3">
                            <span class="text-slate-500 font-medium text-sm italic">${user.nome} • ${user.departamento}</span>
                            ${ehChefe ? '<span class="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black uppercase tracking-widest">Acesso Admin</span>' : ''}
                            <span class="h-4 w-[1px] bg-slate-300 mx-1"></span>
                            <span class="text-blue-600 text-[10px] font-black uppercase tracking-widest">${totalFicheiros} Ficheiros</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <a href="/perfil" class="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-blue-50 transition-all text-lg cursor-pointer">👤</a>
                        ${ehChefe ? `
                            <a href="/admin/utilizadores" class="h-12 flex items-center gap-2 bg-white border border-slate-200 px-5 rounded-2xl text-[11px] font-bold uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer whitespace-nowrap">Equipa</a>
                            <a href="/sair-modo-chefe" class="h-12 flex items-center gap-2 bg-amber-50 border border-amber-200 px-5 rounded-2xl text-[11px] font-bold uppercase text-amber-600 hover:bg-amber-100 transition-all shadow-sm cursor-pointer whitespace-nowrap">Sair Chefe</a>
                        ` : `<button onclick="abrirModalChefe()" class="h-12 flex items-center gap-2 bg-white border border-slate-200 px-5 rounded-2xl text-[11px] font-bold uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer">🛡️ Modo Chefe</button>`}
                        <button onclick="abrirModal()" class="h-12 flex items-center gap-2 bg-blue-600 text-white px-6 rounded-2xl text-[11px] font-bold uppercase shadow-lg hover:bg-blue-700 transition-all cursor-pointer">📤 Carregar</button>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-fade">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50/80 border-b border-slate-100 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                            <th class="px-8 py-6">Documento</th><th class="px-8 py-6">Data de Upload</th><th class="px-8 py-6 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-slate-700">${fileRows}</tbody>
                </table>
            </div>
        </main>
        ${renderModais(user)}
        <script>
            function abrirModal() { document.getElementById('modalUpload').classList.remove('hidden'); }
            function fecharModal() { document.getElementById('modalUpload').classList.add('hidden'); }
            function abrirModalChefe() { document.getElementById('modalChefe').classList.remove('hidden'); }
            function fecharModalChefe() { document.getElementById('modalChefe').classList.add('hidden'); }
            function confirmarEliminacao(id, nomeFicheiro) {
                Swal.fire({
                    title: 'ELIMINAR?',
                    text: 'Desejas apagar ' + nomeFicheiro + '?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    confirmButtonText: 'Sim, apagar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => { if (result.isConfirmed) { window.location.href = "/eliminar/" + id; } });
            }
        </script>
    </body>
    </html>`;
};

// ==========================================
// 5. PERFIL
// ==========================================
const renderPerfil = (user, estatisticas) => {
    return `<!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Perfil | INAMET</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .profile-card { border-top: 4px solid #1d4ed8; }
            .input-focus:focus { border-color: #1d4ed8; ring: 2px; ring-color: #1d4ed8; }
        </style>
    </head>
    <body class="bg-slate-50 min-h-screen font-sans">
        ${headerPadrao}

        <main class="container mx-auto px-6 pt-32 pb-10">
            <div class="max-w-4xl mx-auto">
                
                <div class="grid md:grid-cols-3 gap-8">
                    
                    <div class="md:col-span-1">
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 profile-card text-center">
                            <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-200">
                                <span class="text-3xl text-slate-400 font-bold">${user.nome.charAt(0)}</span>
                            </div>
                            <h2 class="text-xl font-bold text-slate-800">${user.nome}</h2>
                            <p class="text-slate-500 text-sm mb-4">${user.departamento}</p>
                            
                            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span class="text-xs font-bold text-blue-700 uppercase">Uploads</span>
                                <span class="text-lg font-black text-blue-700">${estatisticas.uploads || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div class="md:col-span-2">
                        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                            <h3 class="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Definições da Conta</h3>
                            
                            <form action="/perfil/atualizar" method="POST" class="space-y-5">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Nome de Utilizador</label>
                                    <input type="text" name="nome" value="${user.nome}" required 
                                        class="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg outline-none input-focus text-slate-700 transition-all">
                                </div>

                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Nova Palavra-Passe</label>
                                    <input type="password" name="password" placeholder="Preencher apenas se quiser alterar" 
                                        class="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg outline-none input-focus text-slate-700 transition-all">
                                    <p class="text-[10px] text-slate-400 mt-2 italic">* Deixe em branco para manter a senha atual.</p>
                                </div>

                                <div class="pt-4 flex items-center gap-4">
                                    <button type="submit" class="bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-800 transition-all">
                                        Guardar Alterações
                                    </button>
                                    <a href="/dashboard" class="text-slate-500 text-sm font-semibold hover:text-slate-800">
                                        Voltar
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    </body>
    </html>`;
};

function renderError(titulo, mensagem, icone) {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-50">
        <script>
            Swal.fire({
                icon: '${icone}',
                title: '${titulo.toUpperCase()}',
                text: '${mensagem}',
                confirmButtonColor: '#1d4ed8'
            }).then(() => { window.history.back(); });
        </script>
    </body>
    </html>`;
}

// ==========================================
// 6. EXPORTAÇÃO
// ==========================================
module.exports = { 
    headerPadrao, 
    renderModais,
    renderDashboard, 
    renderPerfil, 
    renderError,
    renderGestaoUtilizadores 
};