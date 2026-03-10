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

// Função Auxiliar para Ícones Dinâmicos
function getFileInfo(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        'pdf': { icon: '📄', bg: 'bg-red-50', text: 'text-red-500' },
        'docx': { icon: '📝', bg: 'bg-blue-50', text: 'text-blue-500' },
        'doc': { icon: '📝', bg: 'bg-blue-50', text: 'text-blue-500' },
        'xlsx': { icon: '📊', bg: 'bg-green-50', text: 'text-green-500' },
        'xls': { icon: '📊', bg: 'bg-green-50', text: 'text-green-500' },
        'png': { icon: '🖼️', bg: 'bg-purple-50', text: 'text-purple-500' },
        'jpg': { icon: '🖼️', bg: 'bg-purple-50', text: 'text-purple-500' },
        'jpeg': { icon: '🖼️', bg: 'bg-purple-50', text: 'text-purple-500' },
        'zip': { icon: '📦', bg: 'bg-amber-50', text: 'text-amber-500' },
        'rar': { icon: '📦', bg: 'bg-amber-50', text: 'text-amber-500' }
    };
    return map[ext] || { icon: '📁', bg: 'bg-slate-100', text: 'text-slate-500' };
}

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
const renderGestaoUtilizadores = (users, logs = []) => {
    // Renderização da Tabela de Usuários (Membros da Equipa)
    const rows = users.map(u => `
        <tr class="hover:bg-slate-50/50 transition-all group">
            <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                        ${u.nome.charAt(0)}
                    </div>
                    <div>
                        <span class="font-bold text-slate-700 block text-sm">${u.nome}</span>
                        <span class="text-[9px] text-slate-400 uppercase font-black tracking-widest">ID: ${u.id}</span>
                    </div>
                </div>
            </td>
            <td class="px-8 py-5 text-slate-500 text-xs font-semibold">${u.departamento}</td>
            <td class="px-8 py-5 text-center">
                <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.cargo === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}">
                    ${u.cargo === 'admin' ? '🛡️ Chefe' : '👤 Membro'}
                </span>
            </td>
            <td class="px-8 py-5 text-center">
                <a href="/admin/alterar-cargo/${u.id}/${u.cargo === 'admin' ? 'comum' : 'admin'}" 
                   class="px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all border border-slate-200 text-slate-400 hover:border-blue-600 hover:text-blue-600">
                    Alternar Cargo
                </a>
            </td>
        </tr>
    `).join('');

    // Renderização dos Logs de Auditoria
    const logRows = logs.length > 0 ? logs.map(l => `
        <div class="log-item flex items-start gap-4 p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-all" data-tipo="${l.acao}">
            <div class="w-2 h-2 rounded-full mt-1.5 ${l.acao === 'DOWNLOAD' ? 'bg-amber-400' : 'bg-green-400'}"></div>
            <div class="flex-1">
                <p class="text-xs text-slate-700 leading-relaxed">
                    <span class="font-black text-slate-900">${l.usuario_nome}</span> 
                    fez <span class="font-bold ${l.acao === 'DOWNLOAD' ? 'text-amber-600' : 'text-green-600'}">${l.acao}</span> do ficheiro 
                    <span class="italic text-slate-500">"${l.ficheiro_nome}"</span>
                </p>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">${l.data_formatada} • ${l.hora}</span>
            </div>
        </div>
    `).join('') : '<div class="p-10 text-center text-slate-400 italic text-xs font-medium">Sem atividades registadas recentemente.</div>';

    return `<!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestão e Auditoria - INAMET</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fade 0.4s ease-out forwards; }
            
            /* Scrollbar Interna Personalizada */
            .custom-scroll::-webkit-scrollbar { width: 4px; }
            .custom-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

            /* Estilo dos Botões de Filtro */
            .filter-btn { background: #f8fafc; color: #94a3b8; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.3s; }
            .filter-btn.active { background: #1d4ed8; color: white; border-color: #1d4ed8; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2); }
        </style>
    </head>
    <body class="bg-slate-50 min-h-screen overflow-x-hidden text-slate-900">
        ${headerPadrao}
        
        <main class="container mx-auto px-6 pt-32 pb-10 animate-fade">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 class="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Gestão e <span class="text-blue-600">Auditoria</span></h2>
                    <p class="text-slate-500 font-medium italic mt-2 text-sm">Monitorização de atividades do departamento.</p>
                </div>
                <div class="flex gap-3">
                    <div class="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm text-center">
                        <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Equipa</span>
                        <span class="text-xl font-black text-slate-800">${users.length}</span>
                    </div>
                    <a href="/dashboard" class="h-14 flex items-center bg-blue-600 text-white px-8 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                        Voltar ao Painel
                    </a>
                </div>
            </div>

            <div class="grid lg:grid-cols-3 gap-8 items-start">
                
                <div class="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div class="p-6 border-b border-slate-50 bg-slate-50/30">
                        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Membros do Departamento</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <tbody class="divide-y divide-slate-50">${rows}</tbody>
                        </table>
                    </div>
                </div>

                <div class="lg:col-span-1">
                    <div class="bg-white rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden flex flex-col h-[480px] sticky top-32">
                        
                        <div class="p-6 border-b border-slate-50 bg-slate-50/30 space-y-4">
                            <div class="flex justify-between items-center">
                                <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Registo Recente</h3>
                                <div class="flex items-center gap-2">
                                    <span class="text-[8px] font-bold text-green-500 uppercase tracking-widest"></span>
                                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                </div>
                            </div>
                            
                            <div class="flex gap-1.5">
                                <button onclick="filtrarLogs('TODOS')" id="btn-todos" class="filter-btn active flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Todos</button>
                                <button onclick="filtrarLogs('UPLOAD')" id="btn-upload" class="filter-btn flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Uploads</button>
                                <button onclick="filtrarLogs('DOWNLOAD')" id="btn-download" class="filter-btn flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Downloads</button>
                            </div>
                        </div>

                        <div id="container-logs" class="overflow-y-auto flex-1 custom-scroll bg-white">
                            ${logRows}
                        </div>
                    </div>
                </div>

            </div>
        </main>

        <script>
            function filtrarLogs(tipo) {
                const logs = document.querySelectorAll('.log-item');
                const botoes = document.querySelectorAll('.filter-btn');

                // Atualiza visual dos botões
                botoes.forEach(btn => btn.classList.remove('active'));
                document.getElementById('btn-' + tipo.toLowerCase()).classList.add('active');

                // Filtra os itens na lista
                logs.forEach(log => {
                    if (tipo === 'TODOS' || log.getAttribute('data-tipo') === tipo) {
                        log.style.display = 'flex';
                    } else {
                        log.style.display = 'none';
                    }
                });
            }
        </script>
    </body>
    </html>`;
};
// ==========================================
// 4. PÁGINA: DASHBOARD PRINCIPAL (ATUALIZADA PARA AUDITORIA)
// ==========================================
const renderDashboard = (user, files = []) => {
    const ehChefe = user.cargo === 'admin';
    const totalFicheiros = files.length;

    const fileRows = files.length > 0 ? files.map(f => {
        const info = getFileInfo(f.nome_original);
        const dataObj = new Date(f.data_upload);
        const dataFormatada = dataObj.toLocaleDateString('pt-AO');
        const horaFormatada = dataObj.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });

        return `
        <tr class="hover:bg-blue-50/30 transition-colors group">
            <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl ${info.bg} ${info.text} flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-sm">
                        ${info.icon}
                    </div>
                    <div>
                        <span class="font-bold text-slate-800 text-sm block leading-tight">${f.nome_original}</span>
                        <span class="text-[9px] ${info.text} uppercase font-black tracking-widest">${f.nome_original.split('.').pop()}</span>
                    </div>
                </div>
            </td>
            <td class="px-8 py-5">
                <div class="flex flex-col">
                    <span class="text-slate-600 text-xs font-bold">${dataFormatada}</span>
                    <span class="text-[10px] text-slate-400 font-medium uppercase italic">às ${horaFormatada}</span>
                </div>
            </td>
            <td class="px-8 py-5 text-center">
                <div class="flex justify-center items-center gap-2">
                    <a href="/download/${f.id}" class="h-10 px-5 flex items-center bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer">
                        Download
                    </a>
                    
                    ${ehChefe ? `
                        <button onclick="confirmarEliminacao('${f.id}', '${f.nome_original}')" 
                                class="h-10 px-5 flex items-center bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all cursor-pointer border-none">
                            Eliminar
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>`;
    }).join('') : `<tr><td colspan="3" class="px-10 py-32 text-center text-slate-400 italic font-medium">Nenhum documento encontrado.</td></tr>`;

    // O restante do retorno HTML permanece igual ao seu código original...
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
                        <a href="/perfil" title="Meu Perfil" class="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-blue-50 transition-all text-lg cursor-pointer">👤</a>
                        
                        <button onclick="confirmarSair()" title="Sair do Sistema" 
                            class="h-12 px-4 flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm group cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-1 transition-transform">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span class="text-[11px] font-black uppercase tracking-widest">Sair</span>
                        </button>

                        ${ehChefe ? `
                            <a href="/admin/utilizadores" class="h-12 flex items-center gap-2 bg-white border border-slate-200 px-5 rounded-2xl text-[11px] font-bold uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer">Equipa</a>
                            <a href="/sair-modo-chefe" class="h-12 flex items-center gap-2 bg-amber-50 border border-amber-200 px-5 rounded-2xl text-[11px] font-bold uppercase text-amber-600 hover:bg-amber-100 transition-all shadow-sm cursor-pointer">Sair Chefe</a>
                        ` : `<button onclick="abrirModalChefe()" class="h-12 flex items-center gap-2 bg-white border border-slate-200 px-5 rounded-2xl text-[11px] font-bold uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer">🛡️ Modo Chefe</button>`}
                        
                        <button onclick="abrirModal()" class="h-12 flex items-center gap-2 bg-blue-600 text-white px-6 rounded-2xl text-[11px] font-bold uppercase shadow-lg hover:bg-blue-700 transition-all cursor-pointer">📤 Carregar</button>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-fade">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50/80 border-b border-slate-100 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                            <th class="px-8 py-6">Documento</th><th class="px-8 py-6">Upload Realizado</th><th class="px-8 py-6 text-center">Ações</th>
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
            function confirmarSair() {
    Swal.fire({
        title: '<span style="font-weight:900; letter-spacing:-1px; color:#1e293b;">TERMINAR SESSÃO?</span>',
        text: "Terás de fazer login novamente para aceder ao painel.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1d4ed8', // Azul INAMET
        cancelButtonColor: '#e2e8f0',  // Slate-200 (Cinza claro para contraste)
        confirmButtonText: 'SIM, SAIR AGORA',
        cancelButtonText: '<span style="color:#475569;">CANCELAR</span>', // Texto escuro no cancelar
        reverseButtons: true,
        customClass: {
            popup: 'rounded-[2.5rem] border border-slate-100',
            confirmButton: 'rounded-xl font-bold text-[10px] px-8 py-4 shadow-lg shadow-blue-100',
            cancelButton: 'rounded-xl font-bold text-[10px] px-8 py-4'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.replace("/login");
        }
    });
}
        </script>
    </body>
    </html>`;
};

// ==========================================
// 5. PERFIL (AJUSTADO PARA DASHBOARD)
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
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 profile-card text-center">
                            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <span class="text-3xl text-slate-300 font-bold">${user.nome.charAt(0)}</span>
                            </div>
                            <h2 class="text-xl font-bold text-slate-800">${user.nome}</h2>
                            <p class="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-4">${user.departamento}</p>
                            <div class="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
                                <span class="text-[10px] font-black text-blue-700 uppercase tracking-tighter">Uploads Realizados</span>
                                <span class="text-xl font-black text-blue-700">${estatisticas.uploads || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div class="md:col-span-2">
                        <div class="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                            <h3 class="text-lg font-black text-slate-800 mb-6 border-b border-slate-50 pb-4 uppercase tracking-tight">Definições da Conta</h3>
                            <form action="/perfil/atualizar" method="POST" class="space-y-6">
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nome de Utilizador</label>
                                    <input type="text" name="nome" value="${user.nome}" required 
                                        class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-700 font-bold">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nova Palavra-Passe</label>
                                    <input type="password" name="password" placeholder="Preencher apenas se quiser alterar" 
                                        class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-700 font-bold">
                                    <p class="text-[10px] text-slate-400 mt-2 italic">* Deixe em branco para manter a senha atual.</p>
                                </div>
                                <div class="pt-4 flex items-center gap-6">
                                    <button type="submit" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                                        Guardar Alterações
                                    </button>
                                    <a href="/dashboard" class="text-slate-400 text-[10px] font-black uppercase hover:text-slate-800 tracking-widest">
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
                confirmButtonColor: '#1d4ed8',
                customClass: { popup: 'rounded-[2rem]' }
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