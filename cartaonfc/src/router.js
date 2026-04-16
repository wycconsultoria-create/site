// =========================================================
//  WYC CONNECT – Router (com Auth Guard)
// =========================================================

import { isAuthenticated } from './utils/store.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderPublicCard } from './pages/public-card.js';
import { renderLogin } from './pages/login.js';

export function initRouter() {
  const params = new URLSearchParams(window.location.search);
  const cardId = params.get('card');

  // Cartão público: NUNCA pede login
  if (cardId) {
    renderPublicCard(cardId);
    return;
  }

  // Painel admin: exige autenticação
  if (isAuthenticated()) {
    renderDashboard();
  } else {
    renderLogin(() => renderDashboard());
  }
}

export function logout() {
  import('./utils/store.js').then(({ clearSession }) => {
    clearSession();
    location.reload();
  });
}
