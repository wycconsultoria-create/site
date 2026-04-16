// =========================================================
//  WYC CONNECT – Contact Types Config
// =========================================================

export const CONTACT_TYPES = {
  whatsapp:  { label: 'WhatsApp',  icon: '💬', color: '#25d366', bg: 'rgba(37,211,102,.15)',  border: 'rgba(37,211,102,.35)',  prefix: 'https://wa.me/' },
  email:     { label: 'E-mail',    icon: '✉️',  color: '#f59e0b', bg: 'rgba(245,158,11,.15)',  border: 'rgba(245,158,11,.35)',  prefix: 'mailto:' },
  site:      { label: 'Site',      icon: '🌐', color: '#0ea5e9', bg: 'rgba(14,165,233,.15)',  border: 'rgba(14,165,233,.35)',  prefix: '' },
  instagram: { label: 'Instagram', icon: '📸', color: '#e1306c', bg: 'rgba(225,48,108,.15)',  border: 'rgba(225,48,108,.35)',  prefix: 'https://instagram.com/' },
  telefone:  { label: 'Telefone',  icon: '📞', color: '#8b5cf6', bg: 'rgba(139,92,246,.15)',  border: 'rgba(139,92,246,.35)',  prefix: 'tel:' },
  linkedin:  { label: 'LinkedIn',  icon: '💼', color: '#0077b5', bg: 'rgba(0,119,181,.15)',   border: 'rgba(0,119,181,.35)',   prefix: 'https://linkedin.com/in/' },
  facebook:  { label: 'Facebook',  icon: '👥', color: '#1877f2', bg: 'rgba(24,119,242,.15)',  border: 'rgba(24,119,242,.35)',  prefix: 'https://facebook.com/' },
  tiktok:    { label: 'TikTok',    icon: '🎵', color: '#ff0050', bg: 'rgba(255,0,80,.15)',    border: 'rgba(255,0,80,.35)',    prefix: 'https://tiktok.com/@' },
  outro:     { label: 'Outro',     icon: '🔗', color: '#64748b', bg: 'rgba(100,116,139,.15)', border: 'rgba(100,116,139,.35)', prefix: '' },
};

export function typeConfig(type) {
  return CONTACT_TYPES[type] || CONTACT_TYPES.outro;
}

export function buildHref(type, value) {
  if (!value) return '#';
  const cfg = typeConfig(type);
  if (type === 'whatsapp') {
    const clean = value.replace(/\D/g, '');
    return `https://wa.me/${clean.startsWith('55') ? clean : '55' + clean}`;
  }
  if (type === 'email')    return `mailto:${value}`;
  if (type === 'telefone') return `tel:${value.replace(/\s/g,'')}`;
  if (cfg.prefix && !value.startsWith('http') && !value.startsWith(cfg.prefix)) return cfg.prefix + value;
  return value.startsWith('http') ? value : 'https://' + value;
}

export const URGENCY_CONTACTS = [
  { id: 'samu',      label: 'SAMU',       number: '192', icon: '🚑' },
  { id: 'bombeiros', label: 'Bombeiros',  number: '193', icon: '🚒' },
  { id: 'policia',   label: 'Polícia',    number: '190', icon: '🚓' },
  { id: 'cvv',       label: 'CVV',        number: '188', icon: '💙' },
];
