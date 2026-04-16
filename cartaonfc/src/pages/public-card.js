// =========================================================
//  WYC CONNECT – Public Card View
// =========================================================

import { getCartao } from '../utils/store.js';
import { typeConfig, buildHref, URGENCY_CONTACTS } from '../utils/contacts.js';
import { initials, esc } from '../utils/ui.js';

export function renderPublicCard(cardId) {
  // Remove all chrome – full screen card view
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.background = 'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#0a0f1e 100%)';

  const cartao = getCartao(cardId);

  if (!cartao) {
    document.getElementById('app').innerHTML = `
      <div class="public-card-wrapper">
        <div class="public-card">
          <div class="public-card-header">
            <div style="font-size:4rem;margin-bottom:16px">😕</div>
            <div class="public-card-name">Cartão não encontrado</div>
            <p class="public-card-bio">Este cartão pode ter sido removido ou o link está incorreto.</p>
          </div>
          <div class="public-card-footer">
            <span>Powered by</span>
            <strong style="color:var(--accent)">Wyc Connect</strong>
          </div>
        </div>
      </div>`;
    return;
  }

  const isIdoso = cartao.tipo === 'idoso';
  const contatos = cartao.contatos || [];
  const urgencia = cartao.urgenciaContatos || [];

  // Build contact buttons
  const contatosBtns = contatos.map(c => {
    const cfg  = typeConfig(c.tipo);
    const href = buildHref(c.tipo, c.valor);
    const label = c.rotulo || cfg.label;
    const sub   = c.valor || '';

    return `
      <a href="${esc(href)}" target="_blank" rel="noopener" 
         class="public-contact-btn"
         style="background:${cfg.bg};border:1px solid ${cfg.border};color:${cfg.color}">
        <span class="public-contact-icon">${cfg.icon}</span>
        <span class="public-contact-label">
          <span style="display:block">${esc(label)}</span>
          <span class="public-contact-sublabel">${esc(sub)}</span>
        </span>
        <span style="opacity:.6;font-size:.9rem">→</span>
      </a>`;
  }).join('');

  // Urgency contacts (idoso mode)
  const urgenciaBtns = isIdoso && urgencia.length > 0 ? `
    <div style="margin-top:16px;padding:0 20px 16px">
      <div style="font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--danger);margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span style="width:8px;height:8px;border-radius:50%;background:var(--danger);display:inline-block;animation:pulse 1.5s infinite"></span>
        CONTATOS DE EMERGÊNCIA
      </div>
      ${urgencia.map(u => {
        const href = `tel:${u.numero}`;
        return `
          <a href="${esc(href)}" class="public-contact-btn"
             style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);color:#ef4444;margin-bottom:8px">
            <span class="public-contact-icon">${esc(u.icone||'📞')}</span>
            <span class="public-contact-label">
              <span style="display:block">${esc(u.nome)}</span>
              <span class="public-contact-sublabel">${esc(u.numero)}</span>
            </span>
            <span style="font-size:.75rem;background:rgba(239,68,68,.2);padding:2px 8px;border-radius:99px;font-weight:700">LIGAR</span>
          </a>`;
      }).join('')}
    </div>` : '';

  // Emergency defaults (idoso mode without custom urgency)
  const urgenciaDefault = isIdoso && urgencia.length === 0 ? `
    <div style="margin-top:16px;padding:0 20px 16px">
      <div style="font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--danger);margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span style="width:8px;height:8px;border-radius:50%;background:var(--danger);display:inline-block;animation:pulse 1.5s infinite"></span>
        EMERGÊNCIA
      </div>
      ${[{n:'192',label:'SAMU',icon:'🚑'},{n:'193',label:'Bombeiros',icon:'🚒'},{n:'190',label:'Polícia',icon:'🚓'}].map(e=>`
        <a href="tel:${e.n}" class="public-contact-btn"
           style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);color:#ef4444;margin-bottom:8px">
          <span class="public-contact-icon">${e.icon}</span>
          <span class="public-contact-label">
            <span style="display:block">${e.label}</span>
            <span class="public-contact-sublabel">${e.n}</span>
          </span>
          <span style="font-size:.75rem;background:rgba(239,68,68,.2);padding:2px 8px;border-radius:99px;font-weight:700">LIGAR</span>
        </a>`).join('')}
    </div>` : '';

  const avatarHtml = cartao.foto
    ? `<img src="${esc(cartao.foto)}" class="public-card-avatar" alt="${esc(cartao.nome)}">`
    : `<div class="public-card-avatar-placeholder" style="background:${cartao.cor||'linear-gradient(135deg,#3b82f6,#6366f1)'}">
         ${initials(cartao.nome||'?')}
       </div>`;

  const tag = isIdoso
    ? `<div class="public-card-tag" style="background:rgba(239,68,68,.15);color:#ef4444;border-color:rgba(239,68,68,.35)">🧓 IDOSO</div>`
    : `<div class="public-card-tag">✅ PROFISSIONAL</div>`;

  document.getElementById('app').innerHTML = `
    <div class="public-card-wrapper">
      <div class="public-card">
        <div class="public-card-header">
          ${tag}
          ${avatarHtml}
          <div class="public-card-name">${esc(cartao.nome||'Sem nome')}</div>
          ${cartao.cargo    ? `<div class="public-card-company">${esc(cartao.cargo)}</div>` : ''}
          ${cartao.empresa  ? `<div class="public-card-company" style="color:var(--accent)">${esc(cartao.empresa)}</div>` : ''}
          ${cartao.bio      ? `<div class="public-card-bio" style="margin-top:8px">${esc(cartao.bio)}</div>` : ''}
        </div>
        <div class="public-card-contacts">
          ${contatosBtns || '<p style="text-align:center;color:var(--text-muted);font-size:.82rem">Nenhum contato cadastrado</p>'}
        </div>
        ${urgenciaBtns}
        ${urgenciaDefault}
        <div class="public-card-footer">
          <span>🔐 Cartão verificado</span>
          <strong style="color:var(--accent)">Wyc Connect</strong>
        </div>
      </div>
    </div>`;
}
