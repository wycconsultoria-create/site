// =========================================================
//  WYC CONNECT – Data Store (localStorage)
// =========================================================

const STORE_KEY = 'wyc_connect_data';

const DEFAULT_DATA = {
  user: {
    name: 'Usuário WYC',
    email: 'user@wycconsultoria.com.br',
    avatar: null
  },
  empresas: [],   // { id, name, email, cor, createdAt }
  cartoes: []     // { id, empresaId, nome, cargo, empresa, bio, telefone, foto, cor, contatos[], tipo:'profissional'|'idoso', urgenciaContatos[], createdAt }
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    return { ...structuredClone(DEFAULT_DATA), ...JSON.parse(raw) };
  } catch { return structuredClone(DEFAULT_DATA); }
}

export function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function getData() {
  return loadData();
}

// ── Empresas ───────────────────────────────────────────── */
export function getEmpresas() {
  return loadData().empresas;
}

export function saveEmpresa(empresa) {
  const data = loadData();
  const idx  = data.empresas.findIndex(e => e.id === empresa.id);
  if (idx >= 0) data.empresas[idx] = empresa;
  else          data.empresas.push(empresa);
  saveData(data);
}

export function deleteEmpresa(id) {
  const data = loadData();
  data.empresas  = data.empresas.filter(e => e.id !== id);
  data.cartoes   = data.cartoes.filter(c => c.empresaId !== id);
  saveData(data);
}

// ── Cartões ────────────────────────────────────────────── */
export function getCartoes(empresaId = null) {
  const data = loadData();
  if (empresaId) return data.cartoes.filter(c => c.empresaId === empresaId);
  return data.cartoes;
}

export function getCartao(id) {
  return loadData().cartoes.find(c => c.id === id) || null;
}

export function saveCartao(cartao) {
  const data = loadData();
  const idx  = data.cartoes.findIndex(c => c.id === cartao.id);
  if (idx >= 0) data.cartoes[idx] = cartao;
  else          data.cartoes.push(cartao);
  saveData(data);
}

export function deleteCartao(id) {
  const data = loadData();
  data.cartoes = data.cartoes.filter(c => c.id !== id);
  saveData(data);
}

// ── User ───────────────────────────────────────────────── */
export function getUser() { return loadData().user; }
export function saveUser(user) {
  const data = loadData();
  data.user = user;
  saveData(data);
}

// ── Utils ──────────────────────────────────────────────── */
export function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Gera URL do cartão (local ou remoto)
export function cardUrl(cartaoId) {
  const base = window.location.origin + window.location.pathname.replace(/\/$/, '');
  return `${base}?card=${cartaoId}`;
}

// ── Auth ───────────────────────────────────────────────── */
const AUTH_KEY     = 'wyc_auth';
const SESSION_KEY  = 'wyc_session';
const SESSION_TTL  = 8 * 60 * 60 * 1000; // 8 horas

// Hash SHA-256 via WebCrypto (async)
export async function hashPassword(password) {
  const enc  = new TextEncoder().encode(password);
  const buf  = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

export function getAuthConfig() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
  catch { return null; }
}

export function saveAuthConfig(cfg) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(cfg));
}

export function isAuthenticated() {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (!s) return false;
    if (Date.now() - s.ts > SESSION_TTL) { sessionStorage.removeItem(SESSION_KEY); return false; }
    return true;
  } catch { return false; }
}

export function setSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
