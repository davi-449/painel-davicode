export const COLUMNS = [
  { id: 'NOVO', label: 'Novo', color: 'bg-blue-500', dot: 'bg-blue-500', border: 'border-blue-500/30', text: 'text-blue-400' },
  { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', color: 'bg-amber-500', dot: 'bg-amber-500', border: 'border-amber-500/30', text: 'text-amber-400' },
  { id: 'FOLLOWUP', label: 'Follow Up', color: 'bg-purple-500', dot: 'bg-purple-500', border: 'border-purple-500/30', text: 'text-purple-400' },
  { id: 'PROPOSTA_ENVIADA', label: 'Proposta', color: 'bg-cyan-500', dot: 'bg-cyan-500', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  { id: 'AGUARDANDO_PAGAMENTO', label: 'Aguard. Pagamento', color: 'bg-yellow-500', dot: 'bg-yellow-500', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { id: 'FECHADO', label: 'Fechado', color: 'bg-green-500', dot: 'bg-green-500', border: 'border-green-500/30', text: 'text-green-400' },
  { id: 'PERDIDO', label: 'Perdido', color: 'bg-red-500', dot: 'bg-red-500', border: 'border-red-500/30', text: 'text-red-400' },
];

export const normalizeStatus = (status?: string | null): string => {
  if (!status) return 'NOVO';
  const s = status.toUpperCase().trim();
  if (s === 'EM ATENDIMENTO' || s === 'EM_ATENDIMENTO') return 'EM_ATENDIMENTO';
  if (s === 'FOLLOW UP' || s === 'FOLLOW_UP' || s === 'FOLLOWUP') return 'FOLLOWUP';
  if (s === 'PROPOSTA' || s === 'PROPOSTA ENVIADA' || s === 'PROPOSTA_ENVIADA') return 'PROPOSTA_ENVIADA';
  if (s === 'PAGAMENTO' || s === 'AGUARDANDO PAGAMENTO' || s === 'AGUARDANDO_PAGAMENTO') return 'AGUARDANDO_PAGAMENTO';
  return s.replace(/\s+/g, '_');
};

export const getStatusInfo = (status?: string | null) => {
  const id = normalizeStatus(status);
  return COLUMNS.find((c) => c.id === id) ?? COLUMNS[0];
};
