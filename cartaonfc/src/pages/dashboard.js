// =========================================================
//  WYC CONNECT – Dashboard / Empresas Page
// =========================================================

import { getEmpresas, saveEmpresa, deleteEmpresa, getCartoes, genId, getUser, saveUser } from '../utils/store.js';
import { toast, confirm, openModal, initials, esc } from '../utils/ui.js';
import { renderCartoesPage } from './cartoes.js';

// ── Sidebar ────────────────────────────────────────────── */
function buildSidebar(active = 'empresas') {
  const user  = getUser();
  const name  = user.name  || 'Usuário WYC';
  const email = user.email || '';
  const cartoes = getCartoes().slice(0, 8);

  return `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">WC</div>
      <div class="logo-text">Wyc <span>Connect</span></div>
    </div>
    <div class="sidebar-section-label">Menu</div>
    <div class="nav-item ${active==='empresas'?'active':''}" data-page="empresas">
      <span class="nav-icon">🏢</span> Empresas
    </div>
    <div class="nav-item" style="padding-left:20px;font-size:.8rem;color:var(--text-muted);cursor:default">
      <span class="nav-icon" style="font-size:.8rem">📇</span> Meus Cartões
    </div>
    <div id="cartoes-nav-list" style="padding-left:12px"></div>
    <div class="nav-item ${active==='perfil'?'active':''}" data-page="perfil" style="margin-top:8px">
      <span class="nav-icon">👤</span> Perfil
    </div>
    <div class="nav-item" data-page="suporte">
      <span class="nav-icon">🆘</span> Suporte
    </div>
    <div class="sidebar-bottom">
      <div class="user-card" data-page="perfil" style="margin-bottom:8px">
        <div class="user-avatar">${initials(name)}</div>
        <div class="user-info">
          <div class="user-name">${esc(name)}</div>
          <div class="user-email">${esc(email || 'Clique para editar')}</div>
        </div>
        <span style="font-size:.75rem;color:var(--text-muted)">✏️</span>
      </div>
      <button id="btn-logout" style="
        width:100%;display:flex;align-items:center;gap:8px;
        padding:9px 12px;border-radius:8px;border:1px solid rgba(220,38,38,.2);
        background:rgba(220,38,38,.06);color:#dc2626;
        font-family:var(--font-body);font-size:.8rem;font-weight:600;
        cursor:pointer;transition:all .2s;
      ">
        <span>🚪</span> Sair da conta
      </button>
    </div>
  </aside>`;
}

function buildCartoesNav() {
  const cartoes = getCartoes();
  const nav = document.getElementById('cartoes-nav-list');
  if (!nav) return;
  nav.innerHTML = cartoes.slice(0, 8).map(c => `
    <div class="nav-item" style="padding:6px 20px 6px 32px;font-size:.78rem" data-page="cartao" data-id="${c.id}">
      <span style="width:7px;height:7px;border-radius:50%;background:var(--accent);display:inline-block;margin-right:4px;flex-shrink:0"></span>
      <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.nome || 'Sem nome')}</span>
    </div>`).join('');
  nav.querySelectorAll('[data-page=cartao]').forEach(el => {
    el.onclick = () => renderCartoesPage(el.dataset.id);
  });
}

// ── Empresa Modal ──────────────────────────────────────── */
function openEmpresaModal(empresa = null) {
  const isEdit = !!empresa;
  const { el } = openModal(`
    <div class="modal-header">
      <h3 class="modal-title">${isEdit ? '✏️ Editar Empresa' : '🏢 Nova Empresa'}</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="form-group">
      <label class="form-label">Nome da Empresa *</label>
      <input class="form-input" id="emp-nome" placeholder="Ex: Pastelaria da Vovozinha" value="${esc(empresa?.name||'')}">
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">CNPJ</label>
        <input class="form-input" id="emp-cnpj" placeholder="00.000.000/0001-00" value="${esc(empresa?.cnpj||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">E-mail</label>
        <input class="form-input" id="emp-email" type="email" placeholder="email@empresa.com" value="${esc(empresa?.email||'')}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Telefone</label>
      <input class="form-input" id="emp-tel" placeholder="(11) 9 0000-0000" value="${esc(empresa?.telefone||'')}">
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary modal-close">Cancelar</button>
      <button class="btn btn-primary" id="emp-save">${isEdit ? '💾 Salvar' : '➕ Criar Empresa'}</button>
    </div>
  `);

  el.querySelector('#emp-cnpj').addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g,'').slice(0,14);
    v = v.replace(/^(\d{2})(\d)/,'$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/,'.$1/$2');
    v = v.replace(/(\d{4})(\d)/,'$1-$2');
    e.target.value = v;
  });

  el.querySelector('#emp-save').onclick = () => {
    const nome = el.querySelector('#emp-nome').value.trim();
    if (!nome) { toast('Informe o nome da empresa', 'error'); return; }
    saveEmpresa({
      id: empresa?.id || genId(),
      name: nome,
      cnpj: el.querySelector('#emp-cnpj').value.trim(),
      email: el.querySelector('#emp-email').value.trim(),
      telefone: el.querySelector('#emp-tel').value.trim(),
      createdAt: empresa?.createdAt || Date.now()
    });
    toast(isEdit ? 'Empresa atualizada!' : 'Empresa criada! 🎉');
    el.remove();
    renderDashboard();
  };
}

// ── Perfil Page ────────────────────────────────────────── */
export function renderPerfilPage() {
  const app  = document.getElementById('app');
  const user = getUser();

  app.innerHTML = `
    ${buildSidebar('perfil')}
    <div class="main-content">
      <div class="topbar">
        <div>
          <div class="topbar-title">👤 Perfil Master</div>
          <div class="topbar-subtitle">Dados do administrador do sistema</div>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" id="btn-back-perfil">← Empresas</button>
          <button class="btn btn-primary" id="btn-save-perfil">💾 Salvar Perfil</button>
        </div>
      </div>
      <div class="page-content" style="max-width:640px">
        <div class="card">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
            <div id="perfil-avatar" style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-2));display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:#fff;flex-shrink:0">
              ${initials(user.name||'U')}
            </div>
            <div>
              <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--text-primary)">${esc(user.name||'Usuário WYC')}</div>
              <div style="font-size:.8rem;color:var(--text-muted)">Administrador · Wyc Connect</div>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nome Completo *</label>
              <input class="form-input" id="p-nome" placeholder="Seu nome completo" value="${esc(user.name||'')}">
            </div>
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input class="form-input" id="p-email" type="email" placeholder="email@exemplo.com" value="${esc(user.email||'')}">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">CPF / Documento</label>
              <input class="form-input" id="p-doc" placeholder="000.000.000-00" value="${esc(user.documento||'')}">
            </div>
            <div class="form-group">
              <label class="form-label">Telefone / WhatsApp</label>
              <input class="form-input" id="p-tel" placeholder="(11) 9 0000-0000" value="${esc(user.telefone||'')}">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Empresa / Organização</label>
              <input class="form-input" id="p-empresa" placeholder="Nome da sua empresa" value="${esc(user.empresa||'')}">
            </div>
            <div class="form-group">
              <label class="form-label">CNPJ da Empresa</label>
              <input class="form-input" id="p-cnpj" placeholder="00.000.000/0001-00" value="${esc(user.cnpj||'')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Observações</label>
            <textarea class="form-textarea" id="p-obs" placeholder="Informações adicionais...">${esc(user.obs||'')}</textarea>
          </div>
        </div>

        <!-- Alterar senha -->
        <div class="card" style="margin-top:16px">
          <h3 style="font-family:var(--font-display);margin-bottom:16px;display:flex;align-items:center;gap:8px">
            🔐 Alterar Senha
          </h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nova Senha</label>
              <input class="form-input" id="p-nova-senha" type="password" placeholder="Mínimo 6 caracteres">
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar Nova Senha</label>
              <input class="form-input" id="p-confirma-senha" type="password" placeholder="Repita a nova senha">
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-change-pwd" style="margin-top:4px">
            🔑 Alterar Senha
          </button>
        </div>
      </div>
    </div>`;

  document.getElementById('btn-back-perfil').onclick = () => renderDashboard();
  document.querySelectorAll('[data-page=empresas]').forEach(el => el.onclick = () => renderDashboard());
  document.querySelectorAll('[data-page=perfil]').forEach(el => el.onclick = () => renderPerfilPage());
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    import('../router.js').then(m => m.logout());
  });

  // Change password
  document.getElementById('btn-change-pwd')?.addEventListener('click', async () => {
    const nova     = document.getElementById('p-nova-senha').value;
    const confirma = document.getElementById('p-confirma-senha').value;
    if (!nova || nova.length < 6) { toast('Senha precisa ter ao menos 6 caracteres', 'error'); return; }
    if (nova !== confirma) { toast('As senhas não conferem', 'error'); return; }
    const { hashPassword, getAuthConfig, saveAuthConfig } = await import('../utils/store.js');
    const hash = await hashPassword(nova);
    const cfg  = getAuthConfig() || {};
    saveAuthConfig({ ...cfg, hash });
    document.getElementById('p-nova-senha').value = '';
    document.getElementById('p-confirma-senha').value = '';
    toast('Senha alterada com sucesso! 🔐');
  });

  document.getElementById('p-cnpj').addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g,'').slice(0,14);
    v = v.replace(/^(\d{2})(\d)/,'$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/,'.$1/$2');
    v = v.replace(/(\d{4})(\d)/,'$1-$2');
    e.target.value = v;
  });

  document.getElementById('btn-save-perfil').onclick = () => {
    const nome = document.getElementById('p-nome').value.trim();
    if (!nome) { toast('Informe seu nome', 'error'); return; }
    saveUser({
      name:      nome,
      email:     document.getElementById('p-email').value.trim(),
      documento: document.getElementById('p-doc').value.trim(),
      telefone:  document.getElementById('p-tel').value.trim(),
      empresa:   document.getElementById('p-empresa').value.trim(),
      cnpj:      document.getElementById('p-cnpj').value.trim(),
      obs:       document.getElementById('p-obs').value.trim(),
    });
    toast('Perfil salvo com sucesso! ✅');
    document.getElementById('perfil-avatar').textContent = initials(nome);
  };
}

// ── Dashboard Render ───────────────────────────────────── */
export function renderDashboard() {
  const app      = document.getElementById('app');
  const empresas = getEmpresas();
  const cartoes  = getCartoes();

  const empresaCards = empresas.length === 0 ? `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">🏢</div>
      <div class="empty-state-title">Nenhuma empresa ainda</div>
      <p class="empty-state-text">Crie sua primeira empresa para começar a gerenciar cartões digitais</p>
      <button class="btn btn-primary mt-4" id="btn-first-empresa">➕ Criar Empresa</button>
    </div>` :
    empresas.map(e => {
      const cnt = cartoes.filter(c => c.empresaId === e.id).length;
      return `
      <div class="empresa-card">
        <div class="empresa-card-top">
          <div class="empresa-avatar">${initials(e.name)}</div>
          <div class="empresa-info">
            <div class="empresa-name">${esc(e.name)}</div>
            <div class="empresa-email">${esc(e.cnpj ? e.cnpj : (e.email || '—'))}</div>
          </div>
          <span class="empresa-badge">● Ativo</span>
        </div>
        <div class="empresa-card-bottom">
          <span style="font-size:.73rem;color:var(--text-muted)">
            📇 <strong style="color:var(--accent)">${cnt}</strong> cartão(ões)
            ${e.email ? `&nbsp;·&nbsp; ✉️ ${esc(e.email)}` : ''}
          </span>
          <div class="empresa-actions">
            <button class="btn btn-secondary btn-icon btn-sm" title="Editar" data-edit="${e.id}">✏️</button>
            <button class="btn btn-secondary btn-icon btn-sm" title="Ver cartões" data-cartoes="${e.id}">📇</button>
            <button class="btn btn-danger btn-icon btn-sm" title="Excluir" data-del="${e.id}">🗑️</button>
          </div>
        </div>
      </div>`; }).join('');

  app.innerHTML = `
    ${buildSidebar('empresas')}
    <div class="main-content">
      <div class="topbar">
        <div>
          <div class="topbar-title">🏢 Empresas & Agentes</div>
          <div class="topbar-subtitle">Gerencie seus clientes e cartões digitais</div>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-primary" id="btn-nova-empresa">➕ Nova Empresa</button>
        </div>
      </div>
      <div class="page-content">
        <div class="cards-grid" id="empresas-list">${empresaCards}</div>
      </div>
    </div>`;

  document.getElementById('btn-nova-empresa')?.addEventListener('click', () => openEmpresaModal());
  document.getElementById('btn-first-empresa')?.addEventListener('click', () => openEmpresaModal());
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.onclick = e => { e.stopPropagation(); openEmpresaModal(getEmpresas().find(x => x.id === btn.dataset.edit)); };
  });
  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.onclick = e => { e.stopPropagation(); confirm('Excluir esta empresa e todos os cartões?', () => { deleteEmpresa(btn.dataset.del); toast('Empresa excluída'); renderDashboard(); }); };
  });
  document.querySelectorAll('[data-cartoes]').forEach(btn => {
    btn.onclick = e => { e.stopPropagation(); renderCartoesPage(null, btn.dataset.cartoes); };
  });
  document.querySelectorAll('[data-page=empresas]').forEach(el => el.onclick = () => renderDashboard());
  document.querySelectorAll('[data-page=perfil]').forEach(el => el.onclick = () => renderPerfilPage());
  document.querySelectorAll('[data-page=suporte]').forEach(el => el.onclick = () => toast('Suporte: suporte@wycconsultoria.com.br', 'info'));
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    import('../router.js').then(m => m.logout());
  });
  buildCartoesNav();
}
