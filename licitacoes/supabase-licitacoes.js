// ============================================================
// CONEXÃO COM SUPABASE - LICITAÇÕES
// ============================================================

// CONFIGURAÇÃO DO SUPABASE - SUBSTITUA COM SEUS DADOS
const SUPABASE_CONFIG = {
    url: 'https://SEU_PROJETO.supabase.co',  // ← SUBSTITUA
    key: 'SUA_CHAVE_ANON_PUBLICA'            // ← SUBSTITUA
};

let supabaseClient = null;

function initSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        console.log('✅ Supabase inicializado para Licitações');
        return supabaseClient;
    } else {
        console.warn('⚠️ SDK do Supabase não carregado');
        return null;
    }
}

// Carregar SDK do Supabase
function carregarSupabaseSDK() {
    return new Promise((resolve, reject) => {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            resolve(initSupabase());
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => {
            resolve(initSupabase());
        };
        script.onerror = () => {
            console.error('❌ Erro ao carregar Supabase SDK');
            resolve(null);
        };
        document.head.appendChild(script);
    });
}

// ============================================================
// FUNÇÕES DE SINCRONIZAÇÃO
// ============================================================

function getLicitacoesLocal() {
    const raw = localStorage.getItem('licitacoes');
    return raw ? JSON.parse(raw) : [];
}

function getUsuarioSupabase() {
    return new Promise(async (resolve) => {
        if (!supabaseClient) {
            await carregarSupabaseSDK();
            if (!supabaseClient) {
                resolve(null);
                return;
            }
        }
        try {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            if (error) {
                console.warn('Usuário não autenticado');
                resolve(null);
                return;
            }
            resolve(user);
        } catch (e) {
            console.warn('Erro ao obter usuário:', e);
            resolve(null);
        }
    });
}

// Sincronizar licitações do localStorage para o Supabase
async function sincronizarLicitacoesOnline() {
    console.log('🔄 Iniciando sincronização...');
    
    if (!supabaseClient) {
        await carregarSupabaseSDK();
        if (!supabaseClient) {
            alert('❌ Não foi possível conectar ao Supabase.');
            return false;
        }
    }
    
    const user = await getUsuarioSupabase();
    if (!user) {
        // Se não tiver usuário, criar um anônimo ou pedir login
        const continuar = confirm(
            '⚠️ Você não está logado no Supabase.\n\n' +
            'Deseja continuar como usuário anônimo? (Os dados serão salvos com um ID temporário)'
        );
        if (!continuar) return false;
    }
    
    const licitacoes = getLicitacoesLocal();
    
    if (licitacoes.length === 0) {
        alert('⚠️ Nenhuma licitação para sincronizar.');
        return false;
    }
    
    const userId = user ? user.id : 'anon-' + Date.now();
    let sincronizadas = 0;
    let erros = 0;
    
    for (const lic of licitacoes) {
        try {
            // Verificar se já existe
            const { data: existente, error: checkError } = await supabaseClient
                .from('licitacoes')
                .select('id')
                .eq('id', lic.id)
                .eq('user_id', userId)
                .maybeSingle();
            
            if (checkError && !checkError.message.includes('Not Found')) {
                console.error('Erro ao verificar licitação:', checkError);
                erros++;
                continue;
            }
            
            // Preparar dados
            const dadosLicitacao = {
                id: lic.id,
                pyr: lic.pyr || 'PYR-' + lic.id,
                controle: lic.controle || '',
                orgao: lic.orgao || '',
                produto: lic.produto || '',
                item: lic.item || '',
                posicao: lic.posicao || '',
                estagio: lic.estagio || 'pendentes',
                data_pregao: lic.dataPregao || null,
                data_ganhamos: lic.dataGanhamos || null,
                data_perdemos: lic.dataPerdemos || null,
                ganhador: lic.ganhador || '',
                motivo: lic.motivo || '',
                categoria: lic.categoria || 'Acompanhamento',
                status: lic.status || 'Em Andamento',
                data_criacao: lic.dataCriacao || new Date().toISOString(),
                data_atualizacao: lic.dataAtualizacao || new Date().toISOString(),
                origem_boletim: lic.origemBoletim || false,
                boletim_produto: lic.boletimProduto || null,
                user_id: userId
            };
            
            if (existente) {
                const { error: updateError } = await supabaseClient
                    .from('licitacoes')
                    .update(dadosLicitacao)
                    .eq('id', lic.id)
                    .eq('user_id', userId);
                
                if (updateError) {
                    console.error('Erro ao atualizar:', updateError);
                    erros++;
                    continue;
                }
            } else {
                const { error: insertError } = await supabaseClient
                    .from('licitacoes')
                    .insert(dadosLicitacao);
                
                if (insertError) {
                    console.error('Erro ao inserir:', insertError);
                    erros++;
                    continue;
                }
            }
            
            // Sincronizar observações
            if (lic.observacoes && lic.observacoes.length > 0) {
                await sincronizarObservacoes(lic.id, lic.observacoes, userId);
            }
            
            // Sincronizar links
            if (lic.links && lic.links.length > 0) {
                await sincronizarLinks(lic.id, lic.links, userId);
            }
            
            // Sincronizar ganhadores
            if (lic.ganhadores && lic.ganhadores.length > 0) {
                await sincronizarGanhadores(lic.id, lic.ganhadores, userId);
            }
            
            // Sincronizar lembrete
            if (lic.lembrete && lic.lembrete.ativo) {
                await sincronizarLembrete(lic.id, lic.lembrete, userId);
            }
            
            sincronizadas++;
            
        } catch (e) {
            console.error('Erro ao sincronizar:', e);
            erros++;
        }
    }
    
    console.log(`✅ Sincronizado: ${sincronizadas} licitações, ${erros} erros`);
    alert(`✅ Sincronização concluída!\n\n${sincronizadas} licitações sincronizadas\n${erros} erros`);
    
    return sincronizadas > 0;
}

// Funções auxiliares de sincronização
async function sincronizarObservacoes(licitacaoId, observacoes, userId) {
    await supabaseClient
        .from('licitacao_observacoes')
        .delete()
        .eq('licitacao_id', licitacaoId)
        .eq('user_id', userId);
    
    for (const obs of observacoes) {
        await supabaseClient
            .from('licitacao_observacoes')
            .insert({
                licitacao_id: licitacaoId,
                data: obs.data || new Date().toISOString(),
                texto: obs.texto,
                user_id: userId
            });
    }
}

async function sincronizarLinks(licitacaoId, links, userId) {
    await supabaseClient
        .from('licitacao_links')
        .delete()
        .eq('licitacao_id', licitacaoId)
        .eq('user_id', userId);
    
    for (const link of links) {
        await supabaseClient
            .from('licitacao_links')
            .insert({
                licitacao_id: licitacaoId,
                titulo: link.titulo || link.url,
                url: link.url,
                user_id: userId
            });
    }
}

async function sincronizarGanhadores(licitacaoId, ganhadores, userId) {
    await supabaseClient
        .from('licitacao_ganhadores')
        .delete()
        .eq('licitacao_id', licitacaoId)
        .eq('user_id', userId);
    
    for (const g of ganhadores) {
        await supabaseClient
            .from('licitacao_ganhadores')
            .insert({
                licitacao_id: licitacaoId,
                classificacao: g.classificacao || 'G1',
                nome: g.nome || '',
                cnpj: g.cnpj || '',
                valor_proposta: g.valorProposta || '',
                valor_ofertado: g.valorOfertado || '',
                repositorio: g.repositorio || false,
                user_id: userId
            });
    }
}

async function sincronizarLembrete(licitacaoId, lembrete, userId) {
    await supabaseClient
        .from('licitacao_lembretes')
        .delete()
        .eq('licitacao_id', licitacaoId)
        .eq('user_id', userId);
    
    if (lembrete.ativo) {
        await supabaseClient
            .from('licitacao_lembretes')
            .insert({
                licitacao_id: licitacaoId,
                ativo: lembrete.ativo,
                data_hora: lembrete.dataHora || new Date().toISOString(),
                anotacao: lembrete.anotacao || '',
                disparado: lembrete.disparado || false,
                user_id: userId
            });
    }
}

// ============================================================
// FUNÇÕES DE CARREGAMENTO DO SUPABASE
// ============================================================

async function carregarDoSupabase() {
    if (!supabaseClient) {
        await carregarSupabaseSDK();
        if (!supabaseClient) return null;
    }
    
    const user = await getUsuarioSupabase();
    if (!user) {
        console.warn('Usuário não autenticado, usando localStorage');
        return null;
    }
    
    try {
        // Buscar licitações
        const { data: licitacoes, error: licError } = await supabaseClient
            .from('licitacoes')
            .select('*')
            .eq('user_id', user.id)
            .order('data_atualizacao', { ascending: false });
        
        if (licError) {
            console.error('Erro ao carregar licitações:', licError);
            return null;
        }
        
        if (!licitacoes || licitacoes.length === 0) {
            return [];
        }
        
        // Carregar dados relacionados
        const resultado = [];
        for (const lic of licitacoes) {
            const { data: observacoes } = await supabaseClient
                .from('licitacao_observacoes')
                .select('*')
                .eq('licitacao_id', lic.id)
                .eq('user_id', user.id)
                .order('data', { ascending: false });
            
            const { data: links } = await supabaseClient
                .from('licitacao_links')
                .select('*')
                .eq('licitacao_id', lic.id)
                .eq('user_id', user.id);
            
            const { data: ganhadores } = await supabaseClient
                .from('licitacao_ganhadores')
                .select('*')
                .eq('licitacao_id', lic.id)
                .eq('user_id', user.id)
                .order('classificacao');
            
            const { data: lembrete } = await supabaseClient
                .from('licitacao_lembretes')
                .select('*')
                .eq('licitacao_id', lic.id)
                .eq('user_id', user.id)
                .maybeSingle();
            
            resultado.push({
                id: lic.id,
                pyr: lic.pyr,
                controle: lic.controle,
                orgao: lic.orgao,
                produto: lic.produto,
                item: lic.item,
                posicao: lic.posicao,
                estagio: lic.estagio,
                dataPregao: lic.data_pregao,
                dataGanhamos: lic.data_ganhamos,
                dataPerdemos: lic.data_perdemos,
                ganhador: lic.ganhador,
                motivo: lic.motivo,
                categoria: lic.categoria,
                status: lic.status,
                dataCriacao: lic.data_criacao,
                dataAtualizacao: lic.data_atualizacao,
                origemBoletim: lic.origem_boletim,
                boletimProduto: lic.boletim_produto,
                observacoes: observacoes ? observacoes.map(o => ({ data: o.data, texto: o.texto })) : [],
                links: links ? links.map(l => ({ titulo: l.titulo, url: l.url })) : [],
                ganhadores: ganhadores ? ganhadores.map(g => ({
                    classificacao: g.classificacao,
                    nome: g.nome,
                    cnpj: g.cnpj,
                    valorProposta: g.valor_proposta,
                    valorOfertado: g.valor_ofertado,
                    repositorio: g.repositorio
                })) : [],
                lembrete: lembrete ? {
                    ativo: lembrete.ativo,
                    dataHora: lembrete.data_hora,
                    anotacao: lembrete.anotacao,
                    disparado: lembrete.disparado
                } : null
            });
        }
        
        return resultado;
        
    } catch (e) {
        console.error('Erro ao carregar dados do Supabase:', e);
        return null;
    }
}

// ============================================================
// FUNÇÃO PRINCIPAL DE SINCRONIZAÇÃO
// ============================================================

async function sincronizarOnline() {
    const btn = document.querySelector('#btn-sincronizar') || 
                document.querySelector('[onclick*="sincronizarOnline"]');
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sincronizando...';
    }
    
    try {
        await sincronizarLicitacoesOnline();
    } catch (e) {
        console.error('Erro na sincronização:', e);
        alert('❌ Erro ao sincronizar. Tente novamente.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i>Sincronizar';
        }
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

async function carregarDadosIniciais() {
    const dados = await carregarDoSupabase();
    if (dados && dados.length > 0) {
        const local = getLicitacoesLocal();
        if (local.length !== dados.length) {
            const confirmar = confirm(
                `📥 Dados do servidor (${dados.length}) diferentes dos locais (${local.length}).\n\n` +
                `Deseja carregar os dados do servidor?`
            );
            if (confirmar) {
                localStorage.setItem('licitacoes', JSON.stringify(dados));
                location.reload();
            }
        }
        return dados;
    }
    return null;
}

// Inicializar na carga da página
document.addEventListener('DOMContentLoaded', async function() {
    await carregarSupabaseSDK();
    
    // Adicionar botão de sincronização se não existir
    const header = document.querySelector('.flex-1');
    if (header) {
        const btnSync = document.createElement('button');
        btnSync.id = 'btn-sincronizar';
        btnSync.className = 'bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2';
        btnSync.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i>Sincronizar';
        btnSync.onclick = sincronizarOnline;
        btnSync.title = 'Sincronizar dados com o servidor';
        header.parentNode.insertBefore(btnSync, header.nextSibling);
    }
    
    // Tentar carregar dados do servidor
    await carregarDadosIniciais();
});

// Exportar funções
window.sincronizarOnline = sincronizarOnline;
window.carregarDoSupabase = carregarDoSupabase;
