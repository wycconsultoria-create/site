// =========================================================
//  WYC CONNECT – QR Code Modal
// =========================================================

import { getCartao, cardUrl } from '../utils/store.js';
import { openModal, toast, esc } from '../utils/ui.js';

export async function renderQrModal(cartaoId) {
  const cartao = getCartao(cartaoId);
  if (!cartao) { toast('Cartão não encontrado', 'error'); return; }

  const url = cardUrl(cartaoId);

  const { el } = openModal(`
    <div class="modal-header">
      <h3 class="modal-title">📲 QR Code</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="qr-container">
      <p style="color:var(--text-secondary);margin-bottom:4px">
        Aponte a câmera para abrir o cartão de <strong style="color:var(--text-primary)">${esc(cartao.nome)}</strong>
      </p>
      <div class="qr-canvas-wrapper">
        <canvas id="qr-canvas"></canvas>
      </div>
      <div class="qr-url">${esc(url)}</div>

      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-secondary" id="btn-copy-link">
          📋 Copiar Link
        </button>
        <button class="btn btn-secondary" id="btn-print-qr">
          🖨️ Imprimir QR Code
        </button>
        <a href="${esc(url)}" target="_blank" class="btn btn-primary">
          🌐 Página Pública
        </a>
      </div>
    </div>
    <div class="modal-footer" style="justify-content:center">
      <p class="text-xs text-muted">Escaneie para abrir o cartão no celular</p>
    </div>
  `);

  // Generate QR
  if (typeof QRCode !== 'undefined') {
    await QRCode.toCanvas(el.querySelector('#qr-canvas'), url, {
      width: 220,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });
  } else {
    el.querySelector('.qr-canvas-wrapper').innerHTML = `
      <div style="width:220px;height:220px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border-radius:8px">
        <p style="color:#666;font-size:.8rem;text-align:center">QR Code<br>${esc(url)}</p>
      </div>`;
  }

  // Copy link
  el.querySelector('#btn-copy-link').onclick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copiado! 📋');
    } catch {
      toast('Não foi possível copiar', 'error');
    }
  };

  // Print
  el.querySelector('#btn-print-qr').onclick = () => {
    const canvas = el.querySelector('#qr-canvas');
    const imgSrc = canvas ? canvas.toDataURL() : '';
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html><head><title>QR Code - ${esc(cartao.nome)}</title>
      <style>
        body { margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#fff;color:#000 }
        img { width:240px;height:240px }
        h2 { font-size:1.4rem;margin:16px 0 4px }
        p  { color:#555;font-size:.85rem;margin:0 }
        .url { font-size:.7rem;color:#888;margin-top:12px;word-break:break-all;max-width:280px;text-align:center }
        @media print { body { -webkit-print-color-adjust:exact } }
      </style></head><body>
      <img src="${imgSrc}" alt="QR Code">
      <h2>${esc(cartao.nome)}</h2>
      ${cartao.cargo ? `<p>${esc(cartao.cargo)}</p>` : ''}
      ${cartao.empresa ? `<p style="color:#3b82f6">${esc(cartao.empresa)}</p>` : ''}
      <div class="url">${esc(url)}</div>
      <script>window.onload=()=>window.print()<\/script>
      </body></html>`);
    win.document.close();
  };
}
