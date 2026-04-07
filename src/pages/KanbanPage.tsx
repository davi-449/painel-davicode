import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
import { Phone, Send, Eye, MessageCircle, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { SkeletonKanban } from '../components/ui/SkeletonKanban';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';
import { ActivityTimeline, type Activity } from '../components/ui/ActivityTimeline';
import { EditClienteModal } from '../components/ui/EditClienteModal';

// ── Types ──────────────────────────────────────────
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  status_funil: string;
  origem?: string;
  planos?: { nome: string; valor_mensal: number } | null;
  updated_at: string;
}

import { FUNIL_STAGES } from '../constants/funil';
import { useClientes } from '../hooks/useClientes';

const COLUMNS = FUNIL_STAGES;
// ── Droppable Column ──────────────────────────────
function KanbanColumn({ id, label, ring, children, count }: {
  id: string; label: string; gradient: string; ring: string; children: React.ReactNode; count: number;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-80 bg-white/[0.02] border border-white/06 rounded-2xl flex flex-col pt-4 overflow-hidden relative transition-all duration-300",
        isOver && `ring-2 ${ring} scale-[1.02] shadow-2xl`
      )}
    >
      <div className="px-4 pb-4 border-b border-white/[0.06] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", COLUMNS.find(c => c.id === id)?.ring.replace('ring-','bg-').replace('/30',''))}></span>
            <h3 className="font-semibold text-sm text-white">{label}</h3>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-white/[0.03] border border-white/[0.06] rounded-full px-2 py-0.5">
            {count}
        </div>
      </div>
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar relative z-10">
        {children}
      </div>
    </div>
  );
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `há ${Math.floor(interval)} dias`;
    interval = seconds / 3600;
    if (interval > 1) return `há ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `há ${Math.floor(interval)} minutos`;
    return 'agora mesmo';
  };

// ── Draggable Card ────────────────────────────────
function KanbanCard({ cliente, onView, onDispatch }: {
  cliente: Cliente; onView: (c: Cliente) => void; onDispatch: (id: string, e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cliente.id,
    data: { type: 'card', cliente },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all group relative overflow-hidden group-hover:-translate-y-0.5"
    >
      <p className="font-semibold text-slate-100 text-sm truncate relative z-10">{cliente.nome}</p>
      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5 relative z-10">
        <Phone className="h-3 w-3" /> {cliente.telefone}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-1.5 mt-3 relative z-10">
        <div className="flex items-center gap-1.5">
            {cliente.planos && (
            <span className="text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                {cliente.planos.nome}
            </span>
            )}
            {cliente.origem && (
            <span className="text-[10px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.1] px-2 py-0.5 rounded-full">
                {cliente.origem}
            </span>
            )}
        </div>
        <span className="text-[10px] text-slate-500">{formatTimeAgo(cliente.updated_at)}</span>
      </div>

      {/* Action buttons on hover */}
      <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/[0.06] opacity-30 md:opacity-0 md:group-hover:opacity-100 transition-opacity relative z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onView(cliente); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1 flex justify-center items-center py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 transition-colors"
          title="Ver detalhes"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDispatch(cliente.id, e); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-1 flex justify-center items-center py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
          title="Disparar no n8n"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ClienteSheet({ cliente: initialCliente, onClose, onDispatch }: { 
  cliente: Cliente | null; onClose: () => void; onDispatch: (id: string, e: React.MouseEvent) => void;
}) {
  const [cliente, setCliente] = useState<Cliente | null>(initialCliente);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingAct, setLoadingAct] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCliente(initialCliente);
  }, [initialCliente]);

  useEffect(() => {
    if (cliente) {
      setLoadingAct(true);
      supabase
        .from('atividades')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching activities:', error);
          } else {
            setActivities(data as Activity[]);
          }
          setLoadingAct(false);
        });
    }
  }, [cliente]);

  if (!cliente) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-overlay border-l border-white/[0.06] h-full overflow-y-auto shadow-2xl animate-slide-in flex flex-col" style={{ animationDuration: '250ms' }}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg">
              {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-slate-100">{cliente.nome}</h2>
              <p className="text-sm text-slate-500 -mt-1">{cliente.email || 'Sem e-mail'}</p>
              <StatusBadge status={cliente.status_funil} className="mt-2" />
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 flex-1 space-y-8 overflow-y-auto custom-scrollbar">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Contato</span>
              <span className="text-sm text-slate-200 font-mono">{cliente.telefone}</span>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">E-mail</span>
              <span className="text-sm text-slate-200 truncate block">{cliente.email || '—'}</span>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Origem</span>
              <span className="text-sm text-slate-200">{cliente.origem || '—'}</span>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Plano</span>
              <span className="text-sm text-slate-200">{cliente.planos?.nome || '—'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-100 font-heading mb-6 border-b border-white/[0.06] pb-2">Linha do Tempo</h4>
            <ActivityTimeline activities={activities} isLoading={loadingAct} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t border-white/[0.06] bg-black/20 mt-auto">
          <a
            href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <button
            onClick={(e) => onDispatch(cliente.id, e)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-colors"
          >
            <Send className="h-4 w-4" /> Disparar
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-3 rounded-xl text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] transition-colors"
          >
            Editar
          </button>
        </div>
      </div>
      
      {isEditing && cliente && (
        <EditClienteModal
          cliente={cliente}
          onClose={() => setIsEditing(false)}
          onSuccess={(updatedCliente) => {
            setCliente(updatedCliente);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
}

// ── Main Kanban Page ──────────────────────────────
export function KanbanPage() {
  const { clientes, loading, isRealtimeConnected, updateClienteStatus } = useClientes();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  
  const { success, error } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Handle openClienteId from GlobalSearch routing
  useEffect(() => {
    const openId = (location.state as any)?.openClienteId;
    if (openId && clientes.length > 0) {
      const target = clientes.find(c => c.id === openId);
      if (target) {
        setSelectedCliente(target);
      }
      // Clear state so it doesn't reopen explicitly on back-navigation
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, clientes, navigate]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const clienteId = active.id as string;
    const newStatus = over.id as string;

    const isColumn = COLUMNS.some((col) => col.id === newStatus);
    if (!isColumn) return;

    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente || cliente.status_funil === newStatus) return;

    const successUpdate = await updateClienteStatus(clienteId, newStatus);
    if (successUpdate) {
      success('Status atualizado', `${cliente.nome} movido para ${COLUMNS.find(c => c.id === newStatus)?.label}`);
    }
  };

  const handleDispatch = async (clienteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error: err } = await supabase.functions.invoke('dispatch-n8n', {
        body: { cliente_id: clienteId }
      });
      if (err) throw err;
      success('Automação disparada!', 'O ciclo do n8n foi iniciado corretamente.');
    } catch (err: any) {
      error('Erro ao disparar automação', err.message || 'Erro desconhecido');
    }
  };

  const activeCliente = clientes.find((c) => c.id === activeId) || null;

  return (
    <div className="h-full flex flex-col space-y-6 pt-4 animate-slide-in">
      <header>
        <div className="flex items-center gap-3 w-fit mb-2">
          <h2 className="text-3xl font-bold font-heading text-gradient">Kanban Realtime</h2>
          <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5", 
            isRealtimeConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isRealtimeConnected ? "bg-emerald-500" : "bg-red-500")} />
            {isRealtimeConnected ? 'CONECTADO' : 'DESCONECTADO'}
          </div>
        </div>
        <p className="text-slate-400">Gerencie todos os leads arrastando entre etapas do funil.</p>
      </header>

      {loading ? (
        <SkeletonKanban columns={5} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar flex-1 items-start">
            {COLUMNS.map((col) => {
              const columnClientes = clientes.filter((c) => c.status_funil === col.id);
              return (
                <KanbanColumn key={col.id} {...col} count={columnClientes.length}>
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
              <div className="glass-card rounded-xl p-4 shadow-2xl rotate-1 scale-105 ring-2 ring-indigo-500">
                <p className="font-semibold text-white text-sm">{activeCliente.nome}</p>
                <p className="text-xs text-slate-300 mt-1">{activeCliente.telefone}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <ClienteSheet 
        cliente={selectedCliente} 
        onClose={() => setSelectedCliente(null)} 
        onDispatch={(id, e) => handleDispatch(id, e)} 
      />
    </div>
  );
}
