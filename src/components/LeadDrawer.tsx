import { useEffect, useState } from 'react';
import api from '../lib/api';
import { getStatusInfo, COLUMNS } from '../utils/status';
import { toast } from '../hooks/useToast';
import { ConfirmModal } from './ConfirmModal';
import {
  X, Phone, Send, Trash2, Save, Loader2, User, Mail,
  MessageSquare, Clock, Calendar, Activity
} from 'lucide-react';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  status_funil: string;
  origem?: string;
  plano_id?: string;
  resumo_lead?: string;
  proximo_followup?: string;
  updated_at: string;
  created_at?: string;
  planos?: { id: string; nome: string; valor_mensal: number } | null;
  atividades?: Atividade[];
}

interface Atividade {
  id: string;
  tipo: string;
  descricao: string;
  created_at: string;
}

interface Plano {
  id: string;
  nome: string;
  valor_mensal: number;
  ativo: boolean;
}

type Tab = 'dados' | 'atividades' | 'followup';

interface LeadDrawerProps {
  cliente: Cliente | null;
  onClose: () => void;
  onUpdated: (updated: Cliente) => void;
  onDeleted: (id: string) => void;
}

const TIPO_ICONS: Record<string, string> = {
  CRIACAO: '🌱',
  MUDANCA_FASE: '🔀',
  FOLLOWUP: '📞',
  DISPARO: '📤',
  NOTA: '📝',
};

export function LeadDrawer({ cliente, onClose, onUpdated, onDeleted }: LeadDrawerProps) {
  const [tab, setTab] = useState<Tab>('dados');
  const [detail, setDetail] = useState<Cliente | null>(null);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [form, setForm] = useState<Partial<Cliente>>({});
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [nota, setNota] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!cliente) return;
    setTab('dados');
    setDetail(null);
    setForm({});
    setFollowupDate('');
    setNota('');

    // Fetch full detail + activities
    api.get(`/clientes/${cliente.id}`).then((r) => {
      setDetail(r.data);
      setForm(r.data);
      if (r.data.proximo_followup) {
        const d = new Date(r.data.proximo_followup);
        setFollowupDate(d.toISOString().slice(0, 16));
      }
    });

    api.get('/planos').then((r) => setPlanos(r.data.filter((p: Plano) => p.ativo)));
  }, [cliente?.id]);

  if (!cliente) return null;

  const statusInfo = getStatusInfo(form.status_funil ?? cliente.status_funil);
  const currentStatusIdx = COLUMNS.findIndex((c) => c.id === statusInfo.id);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        status_funil: form.status_funil,
        plano_id: form.plano_id || null,
        resumo_lead: form.resumo_lead,
        origem: form.origem,
      };
      const { data } = await api.put(`/clientes/${cliente.id}`, payload);
      onUpdated(data);
      toast.success('Lead salvo com sucesso!');
    } catch {
      toast.error('Erro ao salvar lead.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await api.delete(`/clientes/${cliente.id}`);
    onDeleted(cliente.id);
    onClose();
    toast.success('Lead removido.');
  };

  const handleDispatch = async () => {
    try {
      await api.post('/dispatch', { cliente_id: cliente.id });
      toast.success('Disparo enviado para o n8n!');
    } catch {
      toast.error('Erro ao disparar automação.');
    }
  };

  const handleSaveFollowup = async () => {
    setSaving(true);
    try {
      await api.put(`/clientes/${cliente.id}`, { proximo_followup: followupDate ? new Date(followupDate).toISOString() : null });
      toast.success('Follow-up agendado!');
    } catch {
      toast.error('Erro ao salvar follow-up.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNota = async () => {
    if (!nota.trim()) return;
    setSavingNote(true);
    try {
      await api.post(`/clientes/${cliente.id}/atividades`, { tipo: 'NOTA', descricao: nota });
      const r = await api.get(`/clientes/${cliente.id}`);
      setDetail(r.data);
      setNota('');
      toast.success('Nota registrada!');
    } catch {
      toast.error('Erro ao salvar nota.');
    } finally {
      setSavingNote(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dados', label: 'Dados', icon: <User className="h-3.5 w-3.5" /> },
    { id: 'atividades', label: `Atividades${detail?.atividades?.length ? ` (${detail.atividades.length})` : ''}`, icon: <Activity className="h-3.5 w-3.5" /> },
    { id: 'followup', label: 'Follow-up', icon: <Calendar className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-[480px] bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-zinc-800 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg font-bold text-white truncate">{cliente.nome}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusInfo.border} ${statusInfo.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
                {cliente.planos && (
                  <span className="text-xs text-zinc-500">{cliente.planos.nome}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                  tab === t.id
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">

            {/* ── TAB: Dados ── */}
            {tab === 'dados' && (
              <div className="p-5 space-y-4">
                <Field label="Nome" icon={<User className="h-3.5 w-3.5 text-zinc-500" />}>
                  <input
                    value={form.nome ?? ''}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Email" icon={<Mail className="h-3.5 w-3.5 text-zinc-500" />}>
                  <input
                    type="email"
                    value={form.email ?? ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Telefone" icon={<Phone className="h-3.5 w-3.5 text-zinc-500" />}>
                  <input
                    value={form.telefone ?? ''}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="input-field font-mono"
                  />
                </Field>
                <Field label="Status no Funil">
                  <select
                    value={form.status_funil ?? ''}
                    onChange={(e) => setForm({ ...form, status_funil: e.target.value })}
                    className="input-field"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Plano">
                  <select
                    value={form.plano_id ?? ''}
                    onChange={(e) => setForm({ ...form, plano_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Nenhum</option>
                    {planos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome} — R$ {Number(p.valor_mensal).toFixed(2)}/mês</option>
                    ))}
                  </select>
                </Field>
                <Field label="Origem">
                  <select
                    value={form.origem ?? ''}
                    onChange={(e) => setForm({ ...form, origem: e.target.value })}
                    className="input-field"
                  >
                    {['WHATSAPP_DIRETO', 'MANUAL', 'WHATSAPP', 'INSTAGRAM', 'INDICACAO', 'SITE'].map((o) => (
                      <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Resumo / Observações" icon={<MessageSquare className="h-3.5 w-3.5 text-zinc-500" />}>
                  <textarea
                    rows={3}
                    value={form.resumo_lead ?? ''}
                    onChange={(e) => setForm({ ...form, resumo_lead: e.target.value })}
                    className="input-field resize-none"
                  />
                </Field>

                {/* Jornada no funil */}
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Jornada no Funil</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {COLUMNS.map((col, idx) => (
                      <div key={col.id} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${idx <= currentStatusIdx ? col.dot : 'bg-zinc-700'}`} />
                        {idx < COLUMNS.length - 1 && (
                          <div className={`w-4 h-0.5 ${idx < currentStatusIdx ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Etapa {currentStatusIdx + 1} de {COLUMNS.length} — <span className={statusInfo.text}>{statusInfo.label}</span>
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: Atividades ── */}
            {tab === 'atividades' && (
              <div className="p-5 space-y-4">
                {/* Adicionar nota */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nova Nota</label>
                  <textarea
                    rows={2}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Escreva uma observação sobre o lead..."
                    className="input-field resize-none text-sm"
                  />
                  <button
                    onClick={handleSaveNota}
                    disabled={savingNote || !nota.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
                  >
                    {savingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Registrar nota
                  </button>
                </div>

                {/* Feed */}
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  {!detail?.atividades?.length ? (
                    <p className="text-sm text-zinc-500 text-center py-6">Nenhuma atividade registrada.</p>
                  ) : (
                    [...(detail.atividades ?? [])].reverse().map((a) => (
                      <div key={a.id} className="flex gap-3">
                        <div className="text-lg shrink-0 mt-0.5">{TIPO_ICONS[a.tipo] ?? '📌'}</div>
                        <div className="flex-1">
                          <p className="text-sm text-zinc-200">{a.descricao}</p>
                          <p className="text-xs text-zinc-600 flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(a.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: Follow-up ── */}
            {tab === 'followup' && (
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Próximo Follow-up
                  </label>
                  <input
                    type="datetime-local"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="input-field"
                  />
                  <p className="text-xs text-zinc-500">
                    Defina quando o próximo contato deve ser feito. Esse dado fica visível na lista de clientes.
                  </p>
                </div>
                <button
                  onClick={handleSaveFollowup}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                  Agendar Follow-up
                </button>

                {detail?.proximo_followup && (
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                    <p className="text-xs text-zinc-400">Follow-up agendado para:</p>
                    <p className="text-sm font-semibold text-indigo-300 mt-1">
                      {new Date(detail.proximo_followup).toLocaleString('pt-BR', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 flex gap-2 shrink-0">
            {tab === 'dados' && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </button>
            )}
            <a
              href={`https://wa.me/55${(cliente.telefone ?? '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              onClick={handleDispatch}
              title="Disparar automação n8n"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              title="Deletar lead"
              className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Deletar Lead?"
          message={`Isso irá remover permanentemente "${cliente.nome}" e todo o seu histórico de atividades.`}
          danger
          confirmLabel="Sim, deletar"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

// ── Helper ──────────────────────────────────────────
function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
