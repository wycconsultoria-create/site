// =========================================================
//  WYC CONNECT – UI Helpers
// =========================================================

// ── Toast ──────────────────────────────────────────────── */
export function toast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || '✅'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all .3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ── Confirm Dialog ─────────────────────────────────────── */
export function confirm(msg, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:380px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
      <h3 class="modal-title" style="margin-bottom:10px">Confirmar</h3>
      <p style="color:var(--text-secondary);margin-bottom:24px">${msg}</p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-secondary" id="confirm-cancel">Cancelar</button>
        <button class="btn btn-danger" id="confirm-ok">Confirmar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#confirm-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); onConfirm(); };
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
}

// ── Modal ──────────────────────────────────────────────── */
export function openModal(html, opts = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal ${opts.wide ? 'modal-wide' : ''}">${html}</div>`;
  document.body.appendChild(overlay);
  overlay.onclick = e => { if (e.target === overlay && !opts.noClose) overlay.remove(); };
  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = () => overlay.remove();
  return {
    el: overlay,
    close: () => overlay.remove()
  };
}

// ── Format Date ─────────────────────────────────────────── */
export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
}

// ── initials ───────────────────────────────────────────── */
export function initials(name = '') {
  return name.trim().split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() || '?';
}

// ── Escape HTML ─────────────────────────────────────────── */
export function esc(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
