// ============================================================
// CONFIGURAÇÃO GLOBAL DO SISTEMA DE LICITAÇÕES
// ============================================================

// Configuração do ambiente
const APP_CONFIG = {
    // URL base do sistema (usado para navegação)
    basePath: '/site/',
    
    // URLs dos sistemas
    urls: {
        index: '/site/index.html',
        repositorio: '/site/funil/repositorio.html',
        boletins: '/site/funil/boletins.html',
        licitacoes: '/site/licitacoes/index.html',
        sistemas: '/site/sistemas.html'
    },
    
    // Função para obter URL correta
    getUrl: function(path) {
        // Remove duplicatas de barras
        if (this.basePath && path) {
            return this.basePath.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
        }
        return path || '/';
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}

// Se estiver no Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
