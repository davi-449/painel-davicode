export const FUNIL_STAGES = [
  { id: 'NOVO', label: 'Novo', color: '#3b82f6', gradient: 'from-blue-500/20 to-transparent', ring: 'ring-blue-500/30' },
  { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', color: '#f59e0b', gradient: 'from-amber-500/20 to-transparent', ring: 'ring-amber-500/30' },
  { id: 'FOLLOWUP', label: 'Follow Up', color: '#8b5cf6', gradient: 'from-violet-500/20 to-transparent', ring: 'ring-violet-500/30' },
  { id: 'PROPOSTA_ENVIADA', label: 'Proposta', color: '#06b6d4', gradient: 'from-cyan-500/20 to-transparent', ring: 'ring-cyan-500/30' },
  { id: 'AGUARDANDO_PAGAMENTO', label: 'Aguard. Pagamento', color: '#eab308', gradient: 'from-yellow-500/20 to-transparent', ring: 'ring-yellow-500/30' },
  { id: 'FECHADO', label: 'Fechado', color: '#10b981', gradient: 'from-emerald-500/20 to-transparent', ring: 'ring-emerald-500/30' },
  { id: 'PERDIDO', label: 'Perdido', color: '#f43f5e', gradient: 'from-rose-500/20 to-transparent', ring: 'ring-rose-500/30' },
] as const;

export type FunilStatus = typeof FUNIL_STAGES[number]['id'];
