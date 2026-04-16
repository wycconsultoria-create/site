# 📇 Wyc Connect

Cartão digital com QR Code, NFC e gestão de contatos — totalmente local, sem custo de publicação.

---

## 🚀 Rodando Localmente

```bash
# 1. Clone ou baixe o repositório
git clone https://github.com/SEU_USUARIO/wyc-connect.git
cd wyc-connect

# 2. Inicie um servidor local (qualquer um abaixo funciona)

# Python (já instalado no macOS/Linux)
python3 -m http.server 3000

# Node.js (npx, sem instalação)
npx serve .

# VS Code: instale a extensão "Live Server" e clique em "Open with Live Server"

# 3. Acesse no navegador
# http://localhost:3000
```

---

## 🌐 Deploy no seu domínio (www.wyconsultoria.com.br/cartaonfc)

### Opção A — Upload FTP/cPanel
1. Faça build (não é necessário — é HTML puro!)
2. Suba **todos os arquivos** para a pasta `public_html/cartaonfc/`
3. Acesse `https://www.wyconsultoria.com.br/cartaonfc`

### Opção B — GitHub Pages (gratuito)
```bash
git init
git add .
git commit -m "feat: wyc connect v1"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/wyc-connect.git
git push -u origin main
# Ative GitHub Pages em Settings > Pages > Branch: main
```

### Opção C — Netlify (gratuito, recomendado)
1. Arraste a pasta do projeto em [app.netlify.com/drop](https://app.netlify.com/drop)
2. URL gerada automaticamente. Depois configure domínio personalizado.

---

## 📲 Como funciona o QR Code

- Cada cartão gera uma URL única: `https://seudominio.com/cartaonfc?card=ID`
- Ao escanear, abre a página pública **sem barra de navegação** (Chrome/Safari no celular)
- Para abrir em modo quiosque/sem UI: adicione à Tela Inicial no iPhone ou Android

### Para NFC (usar com tag NFC):
1. Instale app **NFC Tools** (Android/iOS)
2. Escreva a URL do cartão na tag NFC
3. Ao aproximar o celular, abre o cartão automaticamente

---

## 📂 Estrutura do Projeto

```
wyc-connect/
├── index.html              # Entry point
├── src/
│   ├── app.js              # Bootstrap
│   ├── router.js           # Roteamento (admin vs cartão público)
│   ├── styles/
│   │   └── main.css        # Design system completo
│   ├── utils/
│   │   ├── store.js        # Persistência localStorage
│   │   ├── contacts.js     # Tipos de contato (WhatsApp, Instagram etc)
│   │   └── ui.js           # Toast, Modal, helpers
│   ├── pages/
│   │   ├── dashboard.js    # Tela de Empresas
│   │   ├── cartoes.js      # Lista de cartões
│   │   └── public-card.js  # Cartão público (via QR/NFC)
│   └── components/
│       ├── cartao-editor.js # Formulário criar/editar cartão
│       └── qr-modal.js      # Modal QR Code + impressão
└── README.md
```

---

## ✨ Funcionalidades

- ✅ Gestão de Empresas
- ✅ Múltiplos cartões por empresa
- ✅ Múltiplos contatos do mesmo tipo (ex: 3 WhatsApps)
- ✅ Rótulos personalizados por contato
- ✅ Tipos: WhatsApp, E-mail, Site, Instagram, Telefone, LinkedIn, Facebook, TikTok, Outro
- ✅ Modo **Idoso / Emergência**: destaca contatos de urgência com visual vermelho
- ✅ Botões de emergência padrão (SAMU 192, Bombeiros 193, Polícia 190)
- ✅ QR Code gerado automaticamente
- ✅ Impressão do QR Code
- ✅ Foto do cartão via URL ou upload
- ✅ Cores personalizáveis
- ✅ Cartão público sem barra de navegação (fullscreen)
- ✅ Dados salvos localmente (localStorage)

---

## 🔮 Roadmap Futuro

- [ ] Backend (Firebase / Supabase gratuito) para dados na nuvem
- [ ] Compartilhamento via NFC com escrita de tag
- [ ] Analytics: quantas vezes o QR foi escaneado
- [ ] Múltiplos idiomas
- [ ] Tema claro

---

## 📄 Licença
MIT — Use livremente. Desenvolvido para WYC Consultoria.
