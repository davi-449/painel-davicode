import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2, Phone, Send, Eye } from 'lucide-react';

// ── Types ──────────────────────────────────────────
interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  status_funil: string;
  origem?: string;
  planos?: { nome: string; valor_mensal: number } | null;
  updated_at: string;
}

const COLUMNS = [
  { id: 'NOVO', label: 'Novo', color: 'bg-blue-500', border: 'border-blue-500/30' },
  { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', color: 'bg-amber-500', border: 'border-amber-500/30' },
  { id: 'FOLLOWUP', label: 'Follow Up', color: 'bg-purple-500', border: 'border-purple-500/30' },
  { id: 'PROPOSTA_ENVIADA', label: 'Proposta', color: 'bg-cyan-500', border: 'border-cyan-500/30' },
  { id: 'AGUARDANDO_PAGAMENTO', label: 'Pagamento', color: 'bg-yellow-500', border: 'border-yellow-500/30' },
  { id: 'FECHADO', label: 'Fechado', color: 'bg-green-500', border: 'border-green-500/30' },
  { id: 'PERDIDO', label: 'Perdido', color: 'bg-red-500', border: 'border-red-500/30' },
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

// ── Droppable Column ──────────────────────────────
function KanbanColumn({ id, label, color, border, children, count }: {
  id: string; label: string; color: string; border: string; children: React.ReactNode; count: number;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-zinc-900/50 rounded-xl border ${
        isOver ? 'border-indigo-500 bg-indigo-500/5' : `border-zinc-800 ${border}`
      } transition-colors flex flex-col max-h-[calc(100vh-220px)]`}
    >
      <div className="p-3 flex items-center gap-2 border-b border-zinc-800">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="font-semibold text-zinc-200 text-sm">{label}</h3>
        <span className="ml-auto text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">{count}</span>
      </div>
      <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}

// ── Draggable Card ────────────────────────────────
function KanbanCard({ cliente, onView, onDispatch }: {
  cliente: Cliente; onView: (c: Cliente) => void; onDispatch: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cliente.id,
    data: { type: 'card', cliente },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-zinc-700 transition-colors group"
    >
      <p className="font-medium text-white text-sm truncate">{cliente.nome}</p>
      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
        <Phone className="h-3 w-3" /> {cliente.telefone}
      </p>
      {cliente.planos && (
        <span className="inline-block mt-2 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
          {cliente.planos.nome}
        </span>
      )}
      {cliente.origem && (
        <span className="inline-block mt-1 ml-1 text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
          {cliente.origem}
        </span>
      )}
      {/* Action buttons on hover */}
      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onView(cliente); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Ver detalhes"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDispatch(cliente.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 rounded-md bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 transition-colors"
          title="Disparar no n8n"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Client Detail Sheet ───────────────────────────
function ClienteSheet({ cliente, onClose, onDispatch }: { 
  cliente: Cliente | null; onClose: () => void; onDispatch: (id: string) => void;
}) {
  if (!cliente) return null;

  const normalizedStatus = normalizeStatus(cliente.status_funil);
  const statusIndex = COLUMNS.findIndex((c) => c.id === normalizedStatus);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto shadow-2xl animate-slide-in flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl">✕</button>
          <h3 className="text-xl font-bold text-white">{cliente.nome}</h3>
          <p className="text-sm text-zinc-500 mt-1">{cliente.email || 'Sem email'}</p>
        </div>

        {/* Info */}
        <div className="p-6 space-y-3 text-sm border-b border-zinc-800">
          <div className="flex justify-between">
            <span className="text-zinc-400">Telefone</span>
            <a href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
               className="text-green-400 font-mono hover:underline flex items-center gap-1">
              <Phone className="h-3 w-3" /> {cliente.telefone}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Status</span>
            <span className="text-indigo-400 font-medium">{COLUMNS.find(c => c.id === normalizedStatus)?.label || normalizedStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Plano</span>
            <span className="text-white">{cliente.planos?.nome || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Origem</span>
            <span className="text-white">{cliente.origem || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Última atualização</span>
            <span className="text-white text-xs">{new Date(cliente.updated_at).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Funnel Timeline */}
        <div className="p-6 flex-1">
          <h4 className="text-sm font-semibold text-zinc-300 mb-4">Jornada no Funil</h4>
          <div className="space-y-0">
            {COLUMNS.map((col, idx) => {
              const isPast = idx < statusIndex;
              const isCurrent = idx === statusIndex;
              return (
                <div key={col.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      isCurrent ? `${col.color} border-transparent ring-2 ring-offset-1 ring-offset-zinc-900 ring-indigo-500` :
                      isPast ? 'bg-zinc-600 border-zinc-600' :
                      'bg-transparent border-zinc-700'
                    }`} />
                    {idx < COLUMNS.length - 1 && (
                      <div className={`w-0.5 h-6 ${isPast || isCurrent ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
                    )}
                  </div>
                  <p className={`text-sm pb-4 -mt-0.5 ${
                    isCurrent ? 'text-white font-semibold' :
                    isPast ? 'text-zinc-500' :
                    'text-zinc-700'
                  }`}>
                    {col.label} {isCurrent && '←'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-zinc-800 flex gap-3">
          <a
            href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            <Phone className="h-4 w-4" /> WhatsApp
          </a>
          <button
            onClick={() => onDispatch(cliente.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <Send className="h-4 w-4" /> Disparar n8n
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Kanban Page ──────────────────────────────
export function KanbanPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const normalizedData = data.map((c: Cliente) => ({ ...c, status_funil: normalizeStatus(c.status_funil) }));
      setClientes(normalizedData);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const clienteId = active.id as string;
    const newStatus = over.id as string;

    // Only process if dropping on a column (not on another card)
    const isColumn = COLUMNS.some((col) => col.id === newStatus);
    if (!isColumn) return;

    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente || cliente.status_funil === newStatus) return;

    // Optimistic update
    setClientes((prev) =>
      prev.map((c) => (c.id === clienteId ? { ...c, status_funil: newStatus } : c))
    );

    try {
      await api.patch(
        `/clientes/${clienteId}`,
        { status_funil: newStatus }
      );
    } catch (err) {
      console.error('Erro ao mover cliente', err);
      fetchClientes(); // Rollback
    }
  };

  const handleDispatch = async (clienteId: string) => {
    try {
      await api.post('/dispatch', { cliente_id: clienteId });
      alert('Disparo enviado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao disparar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-500 h-8 w-8" />
      </div>
    );
  }

  const activeCliente = clientes.find((c) => c.id === activeId) || null;

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 w-fit">
        CRM — Funil de Vendas
      </h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {COLUMNS.map((col) => {
            const columnClientes = clientes.filter((c) => c.status_funil === col.id);
            return (
              <KanbanColumn key={col.id} id={col.id} label={col.label} color={col.color} border={col.border} count={columnClientes.length}>
                <SortableContext items={columnClientes.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  {columnClientes.map((cliente) => (
                    <KanbanCard
                      key={cliente.id}
                      cliente={cliente}
                      onView={setSelectedCliente}
                      onDispatch={handleDispatch}
                    />
                  ))}
                </SortableContext>
              </KanbanColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeCliente ? (
            <div className="bg-zinc-950 border border-indigo-500 rounded-lg p-3 shadow-2xl rotate-2 scale-105">
              <p className="font-medium text-white text-sm">{activeCliente.nome}</p>
              <p className="text-xs text-zinc-500">{activeCliente.telefone}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ClienteSheet cliente={selectedCliente} onClose={() => setSelectedCliente(null)} onDispatch={handleDispatch} />
    </div>
  );
}
