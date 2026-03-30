// ==========================================
// 1. COMPONENTES REUTILIZÁVEIS (HEADER)
// ==========================================
const headerPadrao = `
    <header class="fixed top-0 w-full z-50 glass border-b border-slate-200 h-20 bg-white/90 backdrop-blur-md"> 
        <div class="container mx-auto px-6 h-full flex justify-between items-center">
            <div class="flex items-center gap-3">
                <a href="/"><img src="/img/logo-inamet.png" alt="Logo INAMET" class="h-16 w-auto object-contain py-1"></a>
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

// Função Auxiliar para Ícones Dinâmicos
function getFileInfo(filename) {
    const ext = (filename || '').split('.').pop().toLowerCase();
    const map = {
        'pdf': { icon: '📕', bg: 'bg-red-50', text: 'text-red-500' },
        'docx': { icon: '📘', bg: 'bg-blue-50', text: 'text-blue-500' },
        'xlsm': { icon: '📗', bg: 'bg-green-50', text: 'text-green-500' },
        'pptx': { icon: '📙', bg: 'bg-amber-50', text: 'text-amber-500' },
        'png': { icon: '🖼️', bg: 'bg-purple-50', text: 'text-purple-500' },
        'jpeg': { icon: '🖼️', bg: 'bg-purple-50', text: 'text-purple-500' },
        'zip': { icon: '📦', bg: 'bg-amber-50', text: 'text-amber-500' },
        'rar': { icon: '📦', bg: 'bg-amber-50', text: 'text-amber-500' }
    };
    return map[ext] || { icon: '📁', bg: 'bg-slate-100', text: 'text-slate-500' };
}

// ==========================================
// MODAIS REUTILIZÁVEIS (UPLOAD + CHEFE)
// ==========================================
function renderModais(user) {
    return `
        <div id="modalUpload" class="fixed inset-0 modal-bg z-[100] hidden flex items-center justify-center p-6">
            <div class="bg-white w-full max-w-md rounded-[2.5rem] p-10 animate-fade text-center">
                <h3 class="text-2xl font-800 text-slate-800 mb-6 uppercase tracking-tight">Enviar <span class="text-blue-600">Documento</span></h3>
                <form action="/upload" method="POST" enctype="multipart/form-data" class="space-y-5" onsubmit="return validarUpload(this)">
                    <input type="hidden" name="departamento" value="${user.departamento}">
                    <div class="p-8 border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 transition-all bg-slate-50/50">
                        <label class="cursor-pointer block">
                            <span class="block text-4xl mb-3">📁</span>
                            <span id="fileNameDisplay" class="text-sm font-semibold text-blue-600 italic">Escolher do PC</span>
                            <input type="file" name="ficheiro" required class="hidden" onchange="handleFileSelect(this)">
                        </label>
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="fecharModal()" class="flex-1 px-6 py-4 border border-slate-100 rounded-2xl font-bold text-[10px] uppercase text-slate-400 hover:bg-slate-50">Cancelar</button>
                        <button type="submit" class="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg shadow-blue-100">Confirmar Envio</button>
                    </div>
                </form>
            </div>
        </div>


        <script>
            function handleFileSelect(input) {
                if (input.files && input.files[0]) {
                    document.getElementById('fileNameDisplay').innerText = input.files[0].name;
                }
            }

            function validarUpload(form) {
                const allowed = ['pdf','docx','pptx','xlsm'];
                const input = form.querySelector('input[type=file]');
                if (!input || !input.files || input.files.length === 0) {
                    if (window.Swal) {
                        Swal.fire({ icon: 'warning', title: 'Ficheiro necessário', text: 'Por favor escolha um ficheiro para enviar.', confirmButtonColor: '#1d4ed8' });
                    } else alert('Por favor escolha um ficheiro para enviar.');
                    return false;
                }
                const name = input.files[0].name;
                const ext = name.split('.').pop().toLowerCase();
                if (!allowed.includes(ext)) {
                    const msg = 'Apenas são permitidos ficheiros: pdf, docx, pptx e xlsm.';
                    if (window.Swal) {
                        Swal.fire({ icon: 'warning', title: 'Tipo de Ficheiro Inválido', text: msg, confirmButtonColor: '#1d4ed8' });
                    } else alert(msg);
                    return false;
                }
                return true;
            }

            function abrirModal() { document.getElementById('modalUpload').classList.remove('hidden'); }
            function fecharModal() { document.getElementById('modalUpload').classList.add('hidden'); }
            // Modo Chefe promovido: remoção da opção de auto-promoção; gerir cargos apenas via SuperAdmin
          </script>
    `;
}

// ==========================================
// 3. PÁGINA: GESTÃO DE UTILIZADORES
// ==========================================
const renderGestaoUtilizadores = (users, logs = [], opts = {}) => {
    const isSuperadm = !!opts.superadm;
    // Renderização da Tabela de Usuários (Usuários da Equipa)
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
                    ${u.cargo === 'admin' ? '🛡️ Chefe' : '👤 Usuário'}
                </span>
            </td>
            <td class="px-8 py-5 text-center">
                ${isSuperadm ? `
                <a href="/admin/alterar-cargo/${u.id}/${u.cargo === 'admin' ? 'usuário' : 'admin'}" 
                   class="px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all border border-slate-200 text-slate-400 hover:border-blue-600 hover:text-blue-600">
                    Alternar Cargo
                </a>
                ` : `<span class="text-[9px] text-slate-400 font-bold uppercase">Sem permissão</span>`}
            </td>
        </tr>
    `).join('');

    // Renderização dos Logs com lógica de cores para Eliminação
    const logRows = logs.length > 0 ? logs.map(l => {
        let corBola = 'bg-green-400';
        let corTexto = 'text-green-600';
        let labelAcao = 'fez UPLOAD do';

        if (l.acao === 'DOWNLOAD') {
            corBola = 'bg-amber-400';
            corTexto = 'text-amber-600';
            labelAcao = 'fez DOWNLOAD do';
        } else if (l.acao === 'ELIMINACAO' || l.acao === 'DELETE') {
            corBola = 'bg-red-500';
            corTexto = 'text-red-600';
            labelAcao = 'ELIMINOU o';
        }

        return `
            <div class="log-item flex items-start gap-4 p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-all" data-tipo="${l.acao}">
                <div class="w-2 h-2 rounded-full mt-1.5 ${corBola}"></div>
                <div class="flex-1">
                    <p class="text-xs text-slate-700 leading-relaxed">
                        <span class="font-black text-slate-900">${l.usuario_nome}</span> 
                        <span class="font-bold ${corTexto}">${labelAcao}</span> ficheiro 
                        <span class="italic text-slate-500">"${l.ficheiro_nome}"</span>
                    </p>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">${l.data_formatada} • ${l.hora}</span>
                </div>
            </div>
        `;
    }).join('') : '<div class="p-10 text-center text-slate-400 italic text-xs font-medium">Sem atividades recentes.</div>';

    return `<!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestão e Auditoria - INAMET</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <style>
            @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fade 0.4s ease-out forwards; }
            .custom-scroll::-webkit-scrollbar { width: 4px; }
            .custom-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .filter-btn { background: #f8fafc; color: #94a3b8; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s; }
            .filter-btn.active { background: #1d4ed8; color: white; border-color: #1d4ed8; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2); }
        </style>
    </head>
    <body class="bg-slate-50 min-h-screen overflow-x-hidden">
        ${headerPadrao}
        
        <main class="container mx-auto px-6 pt-32 pb-10 animate-fade">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 class="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Gestão e <span class="text-blue-600">Auditoria</span></h2>
                    <p class="text-slate-500 font-medium italic mt-2 text-sm">Controlo de acesso e histórico de ficheiros.</p>
                </div>
                <div class="flex gap-3">
                    <div class="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm text-center">
                        <span class="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Equipa</span>
                        <span class="text-xl font-black text-slate-800">${users.length}</span>
                    </div>
                    <!-- Criar Conta removido para que apenas SuperAdmin possa criar contas -->
                    <a href="/dashboard" class="h-14 flex items-center bg-blue-600 text-white px-8 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                        Voltar
                    </a>
                </div>
            </div>

            <div class="grid lg:grid-cols-3 gap-8 items-start">
                <div class="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div class="p-6 border-b border-slate-50 bg-slate-50/30">
                        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Usuários do Departamento</h3>
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
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            </div>
                            <div class="flex gap-1.5 overflow-x-auto">
                                <button onclick="filtrarLogs('TODOS')" id="btn-todos" class="filter-btn active flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Todos</button>
                                <button onclick="filtrarLogs('UPLOAD')" id="btn-upload" class="filter-btn flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Uploads</button>
                                <button onclick="filtrarLogs('DOWNLOAD')" id="btn-download" class="filter-btn flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Downloads</button>
                                <button onclick="filtrarLogs('ELIMINACAO')" id="btn-eliminacao" class="filter-btn flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest">Apagados</button>
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
                botoes.forEach(btn => btn.classList.remove('active'));
                document.getElementById('btn-' + tipo.toLowerCase()).classList.add('active');

                logs.forEach(log => {
                    const logTipo = log.getAttribute('data-tipo');
                    if (tipo === 'TODOS' || logTipo === tipo || (tipo === 'ELIMINACAO' && logTipo === 'DELETE')) {
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
                        ` : ``}
                        
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
            window.location.href = "/logout";
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

                            <div class="mt-12 pt-6 border-t border-slate-100">
                                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Zona de Perigo</h3>
                                <p class="text-xs text-slate-500">A eliminação de contas só pode ser feita pelo Administrador Geral (SuperAdmin). Contacte o SuperAdmin para quaisquer ações administrativas.</p>
                            </div>
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
// Exportar no final do ficheiro (após todas as funções estarem declaradas)

// ==========================================
// PÁGINA: SUPER-ADMIN (ACESSO GLOBAL)
// ==========================================
function renderSuperAdminDashboard(users = [], files = [], logs = []) {
    const totalUsers = users.length;
    const totalFiles = files.length;
    const totalLogs = logs.length;

    // Prepara um mapa JSON de utilizadores para o JS preencher os modais sem problemas de escaping
    const usuariosMap = {};
    users.forEach(u => { usuariosMap[u.id] = { id: u.id, nome: u.nome, email: u.email || '', departamento: u.departamento || '', cargo: u.cargo || 'usuário' }; });

    const userRows = users.map(u => `
        <tr class="hover:bg-slate-50/50" data-user-id="${u.id}">
            <td class="px-4 py-3">${u.id}</td>
            <td class="px-4 py-3 font-bold text-slate-800">${u.nome}</td>
            <td class="px-4 py-3 text-slate-500">${u.departamento || '—'}</td>
            <td class="px-4 py-3 text-[10px] font-black">${u.cargo}</td>
            <td class="px-4 py-3">
                <div class="flex items-center justify-between">
                    <button type="button" onclick="abrirModalEditarUsuario(${u.id})" class="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100">Editar</button>
                    <button type="button" onclick="confirmarEliminarUsuario(${u.id})" class="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-black hover:bg-red-100">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="5" class="p-8 text-center text-slate-400 italic">Sem utilizadores.</td></tr>`;

    const fileRows = files.map(f => `
        <tr class="hover:bg-slate-50/50">
            <td class="px-6 py-4">${f.id}</td>
            <td class="px-6 py-4 font-bold">${f.nome_original}</td>
            <td class="px-6 py-4 text-slate-500">${f.departamento || '—'}</td>
            <td class="px-6 py-4 text-[10px]">${new Date(f.data_upload).toLocaleString('pt-AO')}</td>
        </tr>
    `).join('') || `<tr><td colspan="4" class="p-8 text-center text-slate-400 italic">Sem ficheiros.</td></tr>`;

    const logRows = logs.map(l => `
        <div class="p-3 border-b border-slate-50">
            <div class="text-sm"><span class="font-black">${l.usuario_nome}</span> · <span class="text-slate-500">${l.acao}</span></div>
            <div class="text-xs text-slate-400">${l.data_formatada} • ${l.hora} — ${l.ficheiro_nome}</div>
        </div>
    `).join('') || `<div class="p-6 text-center text-slate-400 italic">Sem registos.</div>`;

    return `<!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Geral - INAMET</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-50 min-h-screen font-sans">
        ${headerPadrao}
        <main class="container mx-auto px-6 pt-32 pb-20">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-black text-slate-800 uppercase">Admin Geral</h1>
                    <p class="text-slate-500 text-sm mt-2">Painel de controlo completo do sistema.</p>
                </div>
                <div class="flex gap-3 items-center">
                    <div class="text-center bg-white border border-slate-100 px-6 py-3 rounded-2xl">
                        <div class="text-[10px] text-slate-400 uppercase font-black">Utilizadores</div>
                        <div class="text-xl font-black text-slate-800">${totalUsers}</div>
                    </div>
                    <div class="text-center bg-white border border-slate-100 px-6 py-3 rounded-2xl">
                        <div class="text-[10px] text-slate-400 uppercase font-black">Ficheiros</div>
                        <div class="text-xl font-black text-slate-800">${totalFiles}</div>
                    </div>
                        <button onclick="abrirModalCriarConta()" class="h-12 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-2xl text-[11px] font-black uppercase shadow-sm hover:bg-green-700 transition-all">Criar Conta</button>
                        <button onclick="abrirModalGerirUtilizadores()" class="h-12 flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl text-[11px] font-black uppercase shadow-sm hover:bg-slate-50 transition-all">Gerir Utilizadores</button>
                        <a href="/superadmin/logout" class="bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl font-black text-amber-700">Sair ADM</a>
                </div>
            </div>

            <div class="grid lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div class="p-6 border-b border-slate-50">
                        <h2 class="font-black text-slate-800">Ficheiros</h2>
                        <p class="text-xs text-slate-400">Últimos ficheiros enviados.</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-50 text-slate-500 text-[10px] uppercase font-black">
                                <tr><th class="px-6 py-3">ID</th><th class="px-6 py-3">Nome</th><th class="px-6 py-3">Departamento</th><th class="px-6 py-3">Upload</th></tr>
                            </thead>
                            <tbody>${fileRows}</tbody>
                        </table>
                    </div>
                </div>

                <!-- Right column removed: use 'Gerir Utilizadores' modal instead -->
            </div>

            <div class="mt-8 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div class="p-6 border-b border-slate-50">
                    <h2 class="font-black text-slate-800">Registo de Atividades</h2>
                    <p class="text-xs text-slate-400">Últimos eventos do sistema.</p>
                </div>
                <div class="p-2 overflow-y-auto max-h-72">${logRows}</div>
            </div>
        </main>
        <!-- Modal Criar Conta para SuperAdmin -->
        <div id="modalCriarConta" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/40 p-6">
            <div class="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-black text-slate-800">Criar Conta</h3>
                    <button onclick="fecharModalCriarConta()" class="text-slate-400 hover:text-slate-700">Fechar ✕</button>
                </div>
                <form action="/registo" method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">Nome Completo</label>
                        <input name="nome" required class="w-full px-4 py-3 border border-slate-100 rounded-lg" />
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">E-mail</label>
                        <input type="email" name="email" required class="w-full px-4 py-3 border border-slate-100 rounded-lg" />
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">Senha</label>
                        <input type="password" name="senha" required class="w-full px-4 py-3 border border-slate-100 rounded-lg" />
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">Departamento</label>
                        <select name="departamento" required class="w-full px-4 py-3 border border-slate-100 rounded-lg">
                            <option value="" disabled selected>Selecionar Área</option>
                            <option value="dt1">DT1</option>
                            <option value="dt2">DT2</option>
                            <option value="dt3">DT3</option>
                            <option value="dt4">DT4</option>
                            <option value="dt5">DT5</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">Cargo</label>
                        <select name="cargo" class="w-full px-4 py-3 border border-slate-100 rounded-lg">
                            <option value="usuário">usuário</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>
                    <div class="md:col-span-2 flex justify-end gap-3 mt-2">
                        <button type="button" onclick="fecharModalCriarConta()" class="px-6 py-3 bg-slate-100 rounded-lg font-bold">Cancelar</button>
                        <button type="submit" class="px-6 py-3 bg-green-600 text-white rounded-lg font-black">Criar Conta</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal Gerir Utilizadores (lista expandida) -->
        <div id="modalGerirUtilizadores" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/40 p-6">
            <div class="bg-white w-full max-w-5xl rounded-2xl p-6 shadow-lg overflow-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-2xl font-black text-slate-800">Gerir Utilizadores</h3>
                        <div class="flex items-center gap-3">
                        <button onclick="fecharModalGerirUtilizadores()" class="px-4 py-2 bg-slate-100 rounded-md">Fechar</button>
                    </div>
                </div>
                <div class="w-full overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 text-slate-500 text-[12px] uppercase font-black">
                            <tr>
                                <th class="px-4 py-3">ID</th>
                                <th class="px-4 py-3">Nome</th>
                                <th class="px-4 py-3">E-mail</th>
                                <th class="px-4 py-3">Departamento</th>
                                <th class="px-4 py-3">Cargo</th>
                                <th class="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => `
                                <tr class="border-b border-slate-100 hover:bg-slate-50">
                                    <td class="px-4 py-3 align-top">${u.id}</td>
                                    <td class="px-4 py-3 font-bold">${u.nome}</td>
                                    <td class="px-4 py-3 text-sm text-slate-500">${u.email || '—'}</td>
                                    <td class="px-4 py-3">${u.departamento || '—'}</td>
                                    <td class="px-4 py-3 text-[12px] font-black">${u.cargo}</td>
                                    <td class="px-4 py-3 text-right">
                                        <button type="button" onclick="abrirModalEditarUsuario(${u.id})" class="px-4 py-2 mr-2 bg-blue-50 text-blue-700 rounded-md font-bold hover:bg-blue-100">Editar</button>
                                        <button type="button" onclick="confirmarEliminarUsuario(${u.id})" class="px-4 py-2 bg-red-50 text-red-600 rounded-md font-bold hover:bg-red-100">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


        <!-- Modal Editar Usuario -->
        <div id="modalEditarUsuario" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/40 p-6">
            <div class="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-black text-slate-800">Editar Utilizador</h3>
                    <button onclick="fecharModalEditarUsuario()" class="text-slate-400 hover:text-slate-700">Fechar ✕</button>
                </div>
                <form id="formEditarUsuario" action="/superadmin/editar-usuario" method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="hidden" name="id" id="edit_user_id">
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">Nome Completo</label>
                        <input id="edit_nome" name="nome" required class="w-full px-4 py-3 border border-slate-100 rounded-lg" />
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">E-mail</label>
                        <input id="edit_email" type="email" name="email" required class="w-full px-4 py-3 border border-slate-100 rounded-lg" />
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">Nova Senha (opcional)</label>
                        <input id="edit_senha" type="password" name="senha" class="w-full px-4 py-3 border border-slate-100 rounded-lg" />
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">Departamento</label>
                        <select id="edit_departamento" name="departamento" required class="w-full px-4 py-3 border border-slate-100 rounded-lg">
                            <option value="dt1">DT1</option>
                            <option value="dt2">DT2</option>
                            <option value="dt3">DT3</option>
                            <option value="dt4">DT4</option>
                            <option value="dt5">DT5</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-black text-slate-400 uppercase mb-2">Cargo</label>
                        <select id="edit_cargo" name="cargo" class="w-full px-4 py-3 border border-slate-100 rounded-lg">
                            <option value="usuário">usuário</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>
                    <div class="md:col-span-2 flex justify-end gap-3 mt-2">
                        <button type="button" onclick="fecharModalEditarUsuario()" class="px-6 py-3 bg-slate-100 rounded-lg font-bold">Cancelar</button>
                        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-black">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>

        

        <script>
            function abrirModalCriarConta(){ document.getElementById('modalCriarConta').classList.remove('hidden'); }
            function fecharModalCriarConta(){ document.getElementById('modalCriarConta').classList.add('hidden'); }

            function abrirModalGerirUtilizadores(){ document.getElementById('modalGerirUtilizadores').classList.remove('hidden'); }
            function fecharModalGerirUtilizadores(){ document.getElementById('modalGerirUtilizadores').classList.add('hidden'); }

            // Mapa de dados dos utilizadores (inserido pelo server-side)
            const usuariosData = ${JSON.stringify(usuariosMap)};

            function abrirModalEditarUsuario(id){
                const u = usuariosData[id];
                if(!u) return Swal.fire({ icon: 'error', title: 'Erro', text: 'Utilizador não encontrado.' });
                document.getElementById('modalEditarUsuario').classList.remove('hidden');
                document.getElementById('edit_user_id').value = u.id;
                document.getElementById('edit_nome').value = u.nome || '';
                document.getElementById('edit_email').value = u.email || '';
                document.getElementById('edit_departamento').value = u.departamento || '';
                document.getElementById('edit_cargo').value = u.cargo || 'usuário';
                document.getElementById('edit_senha').value = '';
            }
            function fecharModalEditarUsuario(){ document.getElementById('modalEditarUsuario').classList.add('hidden'); }

            function confirmarEliminarUsuario(id){
                Swal.fire({
                    title: 'Eliminar Utilizador?',
                    text: 'Esta ação é irreversível. Deseja continuar?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Sim, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (!result.isConfirmed) return;
                    // Create and submit a form so the POST follows server redirects naturally
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = '/superadmin/eliminar-usuario/' + id;
                    document.body.appendChild(form);
                    form.submit();
                });
            }
        </script>
    </body>
    </html>`;
}

// Exportar funções
module.exports = {
    headerPadrao,
    renderModais,
    renderDashboard,
    renderPerfil,
    renderError,
    renderGestaoUtilizadores,
    renderSuperAdminDashboard
};