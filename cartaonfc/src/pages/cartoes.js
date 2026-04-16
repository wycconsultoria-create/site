// =========================================================
//  WYC CONNECT – Cartões Page
// =========================================================

import { getCartoes, getCartao, saveCartao, deleteCartao, getEmpresas, genId, cardUrl } from '../utils/store.js';
import { toast, confirm, openModal, initials, esc } from '../utils/ui.js';
import { CONTACT_TYPES, typeConfig, buildHref } from '../utils/contacts.js';
import { renderDashboard } from './dashboard.js';
import { renderQrModal } from '../components/qr-modal.js';
import { renderCartaoEditor } from '../components/cartao-editor.js';

// ── Build Sidebar ──────────────────────────────────────── */
function buildSidebarSimple() {
  const data = JSON.parse(localStorage.getItem('wyc_connect_data') || '{}');
  const user  = data.user || {};
  const name  = user.name  || 'Usuário WYC';
  const email = user.email || '';
  const cartoes = (data.cartoes || []).slice(0, 8);

  return `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">WC</div>
      <div class="logo-text">Wyc <span>Connect</span></div>
    </div>
    <div class="sidebar-section-label">Menu</div>
    <div class="nav-item" data-page="empresas"><span class="nav-icon">🏢</span> Empresas</div>
    <div class="nav-item active" style="padding-left:20px;font-size:.8rem">
      <span class="nav-icon" style="font-size:.8rem">📇</span> Meus Cartões
    </div>
    ${cartoes.map(c=>`
      <div class="nav-item text-sm" style="padding:6px 20px 6px 32px;font-size:.78rem" data-cartao-id="${c.id}">
        <span style="width:7px;height:7px;border-radius:50%;background:var(--accent);display:inline-block;margin-right:4px"></span>
        ${esc(c.nome||'Sem nome')}
      </div>`).join('')}
    <div class="nav-item" data-page="perfil" style="margin-top:8px"><span class="nav-icon">👤</span> Perfil</div>
    <div class="sidebar-bottom">
      <div class="user-card">
        <div class="user-avatar">${initials(name)}</div>
        <div class="user-info">
          <div class="user-name">${esc(name)}</div>
          <div class="user-email">${esc(email)}</div>
        </div>
      </div>
    </div>
  </aside>`;
}

// ── Cartao Card ────────────────────────────────────────── */
function buildCartaoCard(c) {
  const emp = getEmpresas().find(e => e.id === c.empresaId);
  const tipos = [...new Set((c.contatos||[]).map(x=>x.tipo))];
  const tipoIcons = tipos.slice(0,5).map(t => typeConfig(t).icon).join(' ');

  return `
  <div class="empresa-card">
    <div class="empresa-card-top">
      <div class="empresa-avatar" style="background:${c.cor||'linear-gradient(135deg,#2563eb,#6366f1)'}">
        ${c.foto ? `<img src="${c.foto}" style="width:100%;height:100%;border-radius:inherit;object-fit:cover">` : initials(c.nome||'?')}
      </div>
      <div class="empresa-info">
        <div class="empresa-name">${esc(c.nome||'Sem nome')}</div>
        <div class="empresa-email">
          ${c.cargo ? esc(c.cargo) : ''}${c.cargo && emp ? ' · ' : ''}${emp ? esc(emp.name) : ''}
        </div>
      </div>
      ${c.tipo==='idoso' ? '<span class="urgency-badge" style="font-size:.65rem;padding:2px 7px">🧓</span>' : ''}
    </div>
    <div class="empresa-card-bottom">
      <span style="font-size:.73rem;color:var(--text-muted)">
        ${tipoIcons || '—'} &nbsp;${(c.contatos||[]).length} contato(s)
      </span>
      <div class="empresa-actions">
        <button class="btn btn-secondary btn-sm" style="padding:5px 10px;font-size:.75rem" data-qr="${c.id}">📲 QR</button>
        <button class="btn btn-secondary btn-icon btn-sm" data-edit="${c.id}" title="Editar">✏️</button>
        <button class="btn btn-secondary btn-icon btn-sm" data-preview="${c.id}" title="Visualizar">👁️</button>
        <button class="btn btn-danger btn-icon btn-sm" data-del="${c.id}" title="Excluir">🗑️</button>
      </div>
    </div>
  </div>`;
}

// ── Render Cartoes ─────────────────────────────────────── */
export function renderCartoesPage(highlightId = null, filterEmpresaId = null) {
  const app    = document.getElementById('app');
  const cartoes = getCartoes(filterEmpresaId);
  const emp     = filterEmpresaId ? getEmpresas().find(e => e.id === filterEmpresaId) : null;

  const listHtml = cartoes.length === 0 ? `
    <div class="empty-state">
      <div class="empty-state-icon">📇</div>
      <div class="empty-state-title">Nenhum cartão ainda</div>
      <p class="empty-state-text">Crie seu primeiro cartão digital com contatos, QR Code e link único</p>
      <button class="btn btn-primary mt-4" id="btn-first-cartao">➕ Criar Cartão</button>
    </div>` :
    cartoes.map(c => buildCartaoCard(c)).join('');

  app.innerHTML = `
    ${buildSidebarSimple()}
    <div class="main-content">
      <div class="topbar">
        <div>
          <div class="topbar-title">📇 ${emp ? esc(emp.name) : 'Meus Cartões'}</div>
          <div class="topbar-subtitle">${cartoes.length} cartão(ões) cadastrado(s)</div>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" id="btn-back">← Empresas</button>
          <button class="btn btn-primary" id="btn-novo-cartao">➕ Novo Cartão</button>
        </div>
      </div>
      <div class="page-content">
        <div class="cards-grid" id="cartoes-list">${listHtml}</div>
      </div>
    </div>`;

  // Sidebar nav
  document.querySelectorAll('[data-page=empresas]').forEach(el => el.onclick = () => renderDashboard());
  document.querySelectorAll('[data-cartao-id]').forEach(el => el.onclick = () => renderCartoesPage(el.dataset.cartaoId));

  document.getElementById('btn-back')?.addEventListener('click', () => renderDashboard());

  const openNew = () => renderCartaoEditor(null, filterEmpresaId, () => renderCartoesPage(null, filterEmpresaId));
  document.getElementById('btn-novo-cartao')?.addEventListener('click', openNew);
  document.getElementById('btn-first-cartao')?.addEventListener('click', openNew);

  document.querySelectorAll('[data-qr]').forEach(btn => {
    btn.onclick = () => renderQrModal(btn.dataset.qr);
  });
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.onclick = () => renderCartaoEditor(btn.dataset.edit, filterEmpresaId, () => renderCartoesPage(null, filterEmpresaId));
  });
  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.onclick = () => confirm('Excluir este cartão?', () => { deleteCartao(btn.dataset.del); toast('Cartão excluído'); renderCartoesPage(null, filterEmpresaId); });
  });
  document.querySelectorAll('[data-preview]').forEach(btn => {
    btn.onclick = () => {
      const url = cardUrl(btn.dataset.preview);
      window.open(url, '_blank');
    };
  });
}
