// =========================================================
//  WYC CONNECT – Login / Setup Page
// =========================================================

import { getAuthConfig, saveAuthConfig, hashPassword, setSession, saveUser } from '../utils/store.js';
import { toast } from '../utils/ui.js';

export function renderLogin(onSuccess) {
  const cfg     = getAuthConfig();
  const isSetup = !cfg;

  document.getElementById('app').innerHTML = `
    <div id="login-root" style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background: linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #e8f0fe 100%);
      padding:20px;
      font-family: var(--font-body);
    ">
      <div style="position:fixed;top:-80px;left:-80px;width:320px;height:320px;border-radius:50%;background:rgba(37,99,235,.08);pointer-events:none"></div>
      <div style="position:fixed;bottom:-60px;right:-60px;width:280px;height:280px;border-radius:50%;background:rgba(99,102,241,.07);pointer-events:none"></div>

      <div style="
        background:#fff;
        border:1px solid rgba(37,99,235,.15);
        border-radius:24px;
        padding:40px 36px;
        width:100%;
        max-width:400px;
        box-shadow: 0 8px 40px rgba(37,99,235,.1), 0 2px 8px rgba(0,0,0,.04);
        position:relative;
        z-index:1;
        animation: slideUp .3s ease;
      ">
        <div style="text-align:center;margin-bottom:28px">
          <div style="
            width:52px;height:52px;
            background:linear-gradient(135deg,#2563eb,#6366f1);
            border-radius:14px;
            display:inline-flex;align-items:center;justify-content:center;
            font-family:var(--font-display);font-weight:800;font-size:1rem;color:#fff;
            box-shadow:0 4px 16px rgba(37,99,235,.35);
            margin-bottom:14px;
          ">WC</div>
          <div style="font-family:var(--font-display);font-weight:700;font-size:1.4rem;color:#0f172a">
            Wyc <span style="color:#2563eb">Connect</span>
          </div>
          <div style="font-size:.82rem;color:#64748b;margin-top:4px">
            ${isSetup
              ? '🔧 Primeira vez? Configure seu acesso abaixo'
              : '🔐 Acesso restrito · Entre com suas credenciais'}
          </div>
        </div>

        <div id="login-form">
          ${isSetup ? `
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px;margin-bottom:18px;font-size:.8rem;color:#1d4ed8">
            👋 <strong>Bem-vindo!</strong> Configure seu usuário e senha para proteger o painel.
          </div>
          <div style="margin-bottom:14px">
            <label style="display:block;font-size:.75rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#475569;margin-bottom:6px">Seu Nome</label>
            <input id="l-nome" class="form-input" placeholder="Nome do administrador" style="background:#f8faff;border-color:#e2e8f0;color:#0f172a">
          </div>
          <div style="margin-bottom:14px">
            <label style="display:block;font-size:.75rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#475569;margin-bottom:6px">E-mail</label>
            <input id="l-email" class="form-input" type="email" placeholder="seu@email.com" style="background:#f8faff;border-color:#e2e8f0;color:#0f172a">
          </div>` : ''}

          <div style="margin-bottom:14px">
            <label style="display:block;font-size:.75rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#475569;margin-bottom:6px">
              ${isSetup ? 'Criar Senha' : 'Senha'}
            </label>
            <div style="position:relative">
              <input id="l-senha" class="form-input" type="password"
                placeholder="${isSetup ? 'Mínimo 6 caracteres' : 'Digite sua senha'}"
                style="background:#f8faff;border-color:#e2e8f0;color:#0f172a;padding-right:44px"
                autocomplete="${isSetup ? 'new-password' : 'current-password'}">
              <button id="toggle-pwd" type="button" style="
                position:absolute;right:10px;top:50%;transform:translateY(-50%);
                background:none;border:none;cursor:pointer;font-size:1.1rem;color:#64748b;padding:4px;line-height:1
              ">👁️</button>
            </div>
          </div>

          ${isSetup ? `
          <div style="margin-bottom:20px">
            <label style="display:block;font-size:.75rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#475569;margin-bottom:6px">Confirmar Senha</label>
            <div style="position:relative">
              <input id="l-confirm" class="form-input" type="password" placeholder="Repita a senha"
                style="background:#f8faff;border-color:#e2e8f0;color:#0f172a;padding-right:44px"
                autocomplete="new-password">
              <button id="toggle-pwd2" type="button" style="
                position:absolute;right:10px;top:50%;transform:translateY(-50%);
                background:none;border:none;cursor:pointer;font-size:1.1rem;color:#64748b;padding:4px;line-height:1
              ">👁️</button>
            </div>
          </div>` : `
          <div style="margin-bottom:20px">
            <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:.82rem;color:#475569">
              <input type="checkbox" id="l-remember" style="accent-color:#2563eb">
              Manter conectado
            </label>
          </div>`}

          <button id="btn-login" style="
            width:100%;padding:12px;
            background:linear-gradient(135deg,#2563eb,#6366f1);
            color:#fff;border:none;border-radius:10px;
            font-family:var(--font-body);font-weight:700;font-size:.92rem;
            cursor:pointer;
            box-shadow:0 4px 16px rgba(37,99,235,.35);
            transition:all .2s;
            display:flex;align-items:center;justify-content:center;gap:8px;
          ">
            <span id="btn-login-icon">${isSetup ? '🔧' : '🔐'}</span>
            <span id="btn-login-text">${isSetup ? 'Criar Conta & Entrar' : 'Entrar'}</span>
          </button>
        </div>

        <div style="margin-top:20px;text-align:center;font-size:.72rem;color:#94a3b8">
          🔒 Dados armazenados localmente · Wyc Connect v1.0
        </div>
      </div>
    </div>`;

  // Toggle visibilidade senha
  document.getElementById('toggle-pwd')?.addEventListener('click', () => {
    const inp = document.getElementById('l-senha');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('toggle-pwd2')?.addEventListener('click', () => {
    const inp = document.getElementById('l-confirm');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  // Enter submete
  document.getElementById('login-root').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-login').click();
  });

  // Submit
  document.getElementById('btn-login').addEventListener('click', async () => {
    const btn     = document.getElementById('btn-login');
    const btnText = document.getElementById('btn-login-text');
    const btnIcon = document.getElementById('btn-login-icon');
    const senha   = document.getElementById('l-senha').value;

    btn.disabled = true;
    btnText.textContent = 'Aguarde...';
    btnIcon.textContent = '⏳';

    try {
      if (isSetup) {
        // ── PRIMEIRA CONFIGURAÇÃO ─────────────────────────── */
        const nome    = document.getElementById('l-nome').value.trim();
        const email   = document.getElementById('l-email').value.trim();
        const confirm = document.getElementById('l-confirm').value;

        if (!nome) {
          toast('Informe seu nome', 'error');
          btn.disabled = false; btnText.textContent = 'Criar Conta & Entrar'; btnIcon.textContent = '🔧';
          return;
        }
        if (!senha || senha.length < 6) {
          toast('Senha precisa ter ao menos 6 caracteres', 'error');
          btn.disabled = false; btnText.textContent = 'Criar Conta & Entrar'; btnIcon.textContent = '🔧';
          return;
        }
        if (senha !== confirm) {
          toast('As senhas não conferem', 'error');
          btn.disabled = false; btnText.textContent = 'Criar Conta & Entrar'; btnIcon.textContent = '🔧';
          return;
        }

        const hash = await hashPassword(senha);
        saveAuthConfig({ hash, nome, email, createdAt: Date.now() });
        saveUser({ name: nome, email });
        setSession();
        toast('Conta criada! Bem-vindo(a) 🎉', 'success');
        setTimeout(() => onSuccess(), 600);

      } else {
        // ── LOGIN NORMAL ──────────────────────────────────── */
        if (!senha) {
          toast('Digite sua senha', 'error');
          btn.disabled = false; btnText.textContent = 'Entrar'; btnIcon.textContent = '🔐';
          return;
        }

        const hash = await hashPassword(senha);

        if (hash !== cfg.hash) {
          const form = document.getElementById('login-form');
          form.style.animation = 'none';
          setTimeout(() => { form.style.animation = 'shake .4s ease'; }, 10);
          setTimeout(() => { form.style.animation = ''; }, 420);
          toast('Senha incorreta ❌', 'error');
          btn.disabled = false; btnText.textContent = 'Entrar'; btnIcon.textContent = '🔐';
          document.getElementById('l-senha').value = '';
          document.getElementById('l-senha').focus();
          return;
        }

        setSession();
        toast(`Bem-vindo(a), ${cfg.nome || 'Admin'}! 👋`);
        setTimeout(() => onSuccess(), 500);
      }

    } catch (err) {
      console.error('Login error:', err);
      toast('Erro inesperado. Tente novamente.', 'error');
      btn.disabled = false;
      btnText.textContent = isSetup ? 'Criar Conta & Entrar' : 'Entrar';
      btnIcon.textContent = isSetup ? '🔧' : '🔐';
    }
  });
}
