// =========================================================
//  WYC CONNECT – Cartão Editor (Create / Edit)
// =========================================================

import { getCartao, saveCartao, getEmpresas, genId } from '../utils/store.js';
import { toast, esc, initials } from '../utils/ui.js';
import { CONTACT_TYPES, typeConfig } from '../utils/contacts.js';

let _onSave = null;
let _cartaoId = null;
let _empresaId = null;
let _contatos  = [];   // { id, tipo, rotulo, valor }
let _urgencia  = [];   // { id, nome, icone, numero }

// ── Contact Row ────────────────────────────────────────── */
function buildContatoRow(c) {
  const cfg = typeConfig(c.tipo);
  const tipoOptions = Object.entries(CONTACT_TYPES).map(([k,v]) =>
    `<option value="${k}" ${k===c.tipo?'selected':''}>${v.icon} ${v.label}</option>`).join('');

  return `
  <div class="contact-item" id="citem-${c.id}">
    <div style="display:flex;align-items:center;gap:8px">
      <div class="contact-type-badge" style="background:${cfg.bg};border-color:${cfg.border};color:${cfg.color};font-size:.75rem">
        <span>${cfg.icon}</span>
      </div>
      <select class="form-select" style="flex:1;padding:7px 10px;font-size:.8rem" data-field="tipo" data-id="${c.id}">
        ${tipoOptions}
      </select>
    </div>
    <input class="form-input" placeholder="Rótulo (ex: WhatsApp Comercial)" value="${esc(c.rotulo||cfg.label)}" 
           data-field="rotulo" data-id="${c.id}" style="font-size:.82rem;padding:8px 12px">
    <input class="form-input" placeholder="Valor (número, url, email...)" value="${esc(c.valor||'')}" 
           data-field="valor" data-id="${c.id}" style="font-size:.82rem;padding:8px 12px">
    <button class="contact-remove" data-remove="${c.id}" title="Remover">🗑️</button>
  </div>`;
}

// ── Urgency Row ────────────────────────────────────────── */
function buildUrgenciaRow(u) {
  return `
  <div class="contact-item" id="uitem-${u.id}" style="grid-template-columns:60px 1fr 1fr auto">
    <input class="form-input" placeholder="🚑" value="${esc(u.icone||'')}" data-ufield="icone" data-id="${u.id}" style="font-size:.82rem;padding:8px;text-align:center">
    <input class="form-input" placeholder="Nome (ex: Filho João)" value="${esc(u.nome||'')}" data-ufield="nome" data-id="${u.id}" style="font-size:.82rem;padding:8px 12px">
    <input class="form-input" placeholder="Número (ex: 11999990000)" value="${esc(u.numero||'')}" data-ufield="numero" data-id="${u.id}" style="font-size:.82rem;padding:8px 12px">
    <button class="contact-remove" data-uremove="${u.id}" title="Remover">🗑️</button>
  </div>`;
}

function renderContatosList() {
  const el = document.getElementById('contatos-list');
  if (!el) return;
  el.innerHTML = _contatos.map(buildContatoRow).join('') || 
    `<p class="text-muted text-sm" style="padding:12px">Nenhum contato adicionado.</p>`;
  bindContatoEvents();
}

function renderUrgenciaList() {
  const el = document.getElementById('urgencia-list');
  if (!el) return;
  el.innerHTML = _urgencia.map(buildUrgenciaRow).join('') ||
    `<p class="text-muted text-sm" style="padding:12px">Nenhum contato de emergência.</p>`;
  bindUrgenciaEvents();
}

function bindContatoEvents() {
  document.querySelectorAll('[data-field]').forEach(el => {
    el.oninput = el.onchange = () => {
      const c = _contatos.find(x => x.id === el.dataset.id);
      if (!c) return;
      c[el.dataset.field] = el.value;
      if (el.dataset.field === 'tipo') {
        // update icon badge
        const badge = document.querySelector(`#citem-${c.id} .contact-type-badge span`);
        if (badge) { const cfg = typeConfig(el.value); badge.textContent = cfg.icon; }
        // auto-fill rotulo if it's still default
        const rotulo = document.querySelector(`#citem-${c.id} [data-field=rotulo]`);
        if (rotulo) { const cfg = typeConfig(el.value); rotulo.value = cfg.label; c.rotulo = cfg.label; }
      }
    };
  });
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.onclick = () => { _contatos = _contatos.filter(x => x.id !== btn.dataset.remove); renderContatosList(); };
  });
}

function bindUrgenciaEvents() {
  document.querySelectorAll('[data-ufield]').forEach(el => {
    el.oninput = () => {
      const u = _urgencia.find(x => x.id === el.dataset.id);
      if (u) u[el.dataset.ufield] = el.value;
    };
  });
  document.querySelectorAll('[data-uremove]').forEach(btn => {
    btn.onclick = () => { _urgencia = _urgencia.filter(x => x.id !== btn.dataset.uremove); renderUrgenciaList(); };
  });
}

// ── Render Editor ──────────────────────────────────────── */
export function renderCartaoEditor(cartaoId, empresaId, onSave) {
  _onSave    = onSave;
  _cartaoId  = cartaoId;
  _empresaId = empresaId;

  const existing = cartaoId ? getCartao(cartaoId) : null;
  _contatos = existing ? (existing.contatos || []).map(c => ({...c})) : [];
  _urgencia = existing ? (existing.urgenciaContatos || []) : [];

  const empresas = getEmpresas();
  const empOptions = empresas.map(e => `<option value="${e.id}" ${existing?.empresaId===e.id?'selected':''}>${esc(e.name)}</option>`).join('');
  const isIdoso = existing?.tipo === 'idoso';

  const app = document.getElementById('app');
  const data = JSON.parse(localStorage.getItem('wyc_connect_data') || '{}');
  const user = data.user || {};

  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">WC</div>
        <div class="logo-text">Wyc <span>Connect</span></div>
      </div>
      <div class="sidebar-section-label">Menu</div>
      <div class="nav-item" data-page="empresas"><span class="nav-icon">🏢</span> Empresas</div>
      <div class="nav-item active"><span class="nav-icon">📝</span> ${existing ? 'Editar Cartão' : 'Novo Cartão'}</div>
    </aside>

    <div class="main-content">
      <div class="topbar">
        <div>
          <div class="topbar-title">📝 ${existing ? 'Editar Cartão' : 'Novo Cartão'}</div>
          <div class="topbar-subtitle">Configure nome, contatos e QR Code</div>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" id="btn-cancel-editor">← Voltar</button>
          <button class="btn btn-primary" id="btn-save-cartao">💾 Salvar Cartão</button>
        </div>
      </div>

      <div class="page-content" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">

        <!-- COL 1: Dados do Cartão -->
        <div>
          <div class="card mb-4">
            <h3 style="margin-bottom:18px;font-family:var(--font-display)">👤 Dados do Cartão</h3>

            <div class="form-group">
              <label class="form-label">Tipo de Cartão</label>
              <div style="display:flex;gap:10px">
                <label style="flex:1;cursor:pointer">
                  <input type="radio" name="tipo-cartao" value="profissional" ${!isIdoso?'checked':''} style="display:none" id="tipo-prof">
                  <div class="btn btn-secondary w-full" id="lbl-prof" style="${!isIdoso?'border-color:var(--accent);color:var(--accent)':''}">
                    💼 Profissional
                  </div>
                </label>
                <label style="flex:1;cursor:pointer">
                  <input type="radio" name="tipo-cartao" value="idoso" ${isIdoso?'checked':''} style="display:none" id="tipo-idoso">
                  <div class="btn btn-secondary w-full" id="lbl-idoso" style="${isIdoso?'border-color:var(--danger);color:var(--danger)':''}">
                    🧓 Idoso / Emergência
                  </div>
                </label>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Nome Completo *</label>
                <input class="form-input" id="f-nome" placeholder="João da Silva" value="${esc(existing?.nome||'')}">
              </div>
              <div class="form-group">
                <label class="form-label">Cargo / Profissão</label>
                <input class="form-input" id="f-cargo" placeholder="Ex: Gerente de Vendas" value="${esc(existing?.cargo||'')}">
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Empresa / Vinculada</label>
                <select class="form-select" id="f-empresa-id">
                  <option value="">— Nenhuma —</option>
                  ${empOptions}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Nome Empresa (exibição)</label>
                <input class="form-input" id="f-empresa" placeholder="Ex: Pastelaria da Vovozinha" value="${esc(existing?.empresa||'')}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Bio / Descrição</label>
              <textarea class="form-textarea" id="f-bio" placeholder="Uma breve descrição...">${esc(existing?.bio||'')}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Foto (URL ou base64)</label>
              <input class="form-input" id="f-foto" placeholder="https://..." value="${esc(existing?.foto||'')}">
              <div style="margin-top:8px;display:flex;align-items:center;gap:10px">
                <label class="btn btn-secondary btn-sm" style="cursor:pointer">
                  📷 Upload <input type="file" accept="image/*" id="f-foto-upload" style="display:none">
                </label>
                <div id="foto-preview" style="width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid var(--border)">
                  ${existing?.foto ? `<img src="${esc(existing.foto)}" style="width:100%;height:100%;object-fit:cover">` : '<div style="background:var(--bg-primary);width:100%;height:100%"></div>'}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Cor do Cartão</label>
              <div class="color-picker" id="color-picker">
                ${['linear-gradient(135deg,#3b82f6,#6366f1)','linear-gradient(135deg,#22c55e,#16a34a)','linear-gradient(135deg,#f59e0b,#d97706)','linear-gradient(135deg,#ef4444,#b91c1c)','linear-gradient(135deg,#8b5cf6,#7c3aed)','linear-gradient(135deg,#0ea5e9,#0284c7)','linear-gradient(135deg,#ec4899,#db2777)','linear-gradient(135deg,#64748b,#475569)'].map(bg=>`
                  <div class="color-swatch ${existing?.cor===bg?'selected':''}" style="background:${bg}" data-color="${bg}"></div>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- COL 2: Contatos -->
        <div>
          <div class="card mb-4">
            <div class="section-header" style="margin-bottom:14px">
              <h3 style="font-family:var(--font-display)">📱 Contatos</h3>
              <button class="btn btn-primary btn-sm" id="btn-add-contato">➕ Adicionar</button>
            </div>
            <p class="text-sm text-muted" style="margin-bottom:14px">Adicione múltiplos contatos do mesmo tipo (ex: 3 WhatsApps). Use o Rótulo para identificar cada um.</p>
            <div id="contatos-list"></div>
          </div>

          <div class="card" id="urgencia-section" style="${isIdoso?'':'display:none'}">
            <div class="section-header" style="margin-bottom:14px">
              <h3 style="font-family:var(--font-display);color:var(--danger)">🚨 Contatos de Emergência</h3>
              <button class="btn btn-sm" style="background:rgba(239,68,68,.15);color:var(--danger);border:1px solid rgba(239,68,68,.3)" id="btn-add-urgencia">➕ Adicionar</button>
            </div>
            <p class="text-sm text-muted" style="margin-bottom:14px">Exibidos com destaque no QR Code. Para familiares, cuidadores ou emergências.</p>
            <div id="urgencia-list"></div>
          </div>
        </div>

      </div>
    </div>`;

  // Render lists
  renderContatosList();
  renderUrgenciaList();

  // Color picker
  let selectedColor = existing?.cor || 'linear-gradient(135deg,#3b82f6,#6366f1)';
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.onclick = () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      selectedColor = sw.dataset.color;
    };
  });

  // Tipo toggle
  const tipos = document.querySelectorAll('input[name=tipo-cartao]');
  tipos.forEach(r => r.onchange = () => {
    const isI = document.getElementById('tipo-idoso').checked;
    document.getElementById('lbl-prof').style.cssText  = `border-color:${isI?'var(--border)':'var(--accent)'};color:${isI?'var(--text-secondary)':'var(--accent)'}`;
    document.getElementById('lbl-idoso').style.cssText = `border-color:${isI?'var(--danger)':'var(--border)'};color:${isI?'var(--danger)':'var(--text-secondary)'}`;
    document.getElementById('urgencia-section').style.display = isI ? '' : 'none';
  });
  document.getElementById('lbl-prof').onclick  = () => { document.getElementById('tipo-prof').checked=true;  tipos[0].dispatchEvent(new Event('change')); };
  document.getElementById('lbl-idoso').onclick = () => { document.getElementById('tipo-idoso').checked=true; tipos[1].dispatchEvent(new Event('change')); };

  // Add contato
  document.getElementById('btn-add-contato').onclick = () => {
    _contatos.push({ id: genId(), tipo: 'whatsapp', rotulo: 'WhatsApp', valor: '' });
    renderContatosList();
  };

  // Add urgencia
  document.getElementById('btn-add-urgencia')?.addEventListener('click', () => {
    _urgencia.push({ id: genId(), icone: '📞', nome: '', numero: '' });
    renderUrgenciaList();
  });

  // Photo upload
  document.getElementById('f-foto-upload').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('f-foto').value = ev.target.result;
      document.getElementById('foto-preview').innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover">`;
    };
    reader.readAsDataURL(file);
  };

  // Empresa select auto-fill
  document.getElementById('f-empresa-id').onchange = e => {
    const emp = getEmpresas().find(x => x.id === e.target.value);
    if (emp) document.getElementById('f-empresa').value = emp.name;
  };

  // Save
  document.getElementById('btn-save-cartao').onclick = () => {
    const nome = document.getElementById('f-nome').value.trim();
    if (!nome) { toast('Informe o nome!', 'error'); return; }
    const cartao = {
      id:               _cartaoId || genId(),
      empresaId:        document.getElementById('f-empresa-id').value || _empresaId || null,
      nome,
      cargo:            document.getElementById('f-cargo').value.trim(),
      empresa:          document.getElementById('f-empresa').value.trim(),
      bio:              document.getElementById('f-bio').value.trim(),
      foto:             document.getElementById('f-foto').value.trim(),
      cor:              selectedColor,
      tipo:             document.getElementById('tipo-idoso').checked ? 'idoso' : 'profissional',
      contatos:         _contatos.filter(c => c.valor || c.tipo==='site'),
      urgenciaContatos: _urgencia.filter(u => u.nome || u.numero),
      createdAt:        existing?.createdAt || Date.now()
    };
    saveCartao(cartao);
    toast('Cartão salvo com sucesso! 🎉');
    if (_onSave) _onSave(cartao);
  };

  // Cancel
  document.getElementById('btn-cancel-editor').onclick = () => { if (_onSave) _onSave(null); };
  document.querySelectorAll('[data-page=empresas]').forEach(el => el.onclick = () => {
    import('./dashboard.js').then(m => m.renderDashboard());
  });
}
