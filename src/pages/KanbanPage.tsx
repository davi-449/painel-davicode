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
import { COLUMNS, normalizeStatus } from '../utils/status';
import { LeadDrawer, type Cliente } from '../components/LeadDrawer';
import { toast } from '../hooks/useToast';

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
      <div className="flex gap-1 mt-2 transition-opacity">
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
      const { data } = await api.get('/clientes');
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
      await api.patch(`/clientes/${clienteId}`, { status_funil: newStatus });
    } catch (err) {
      console.error('Erro ao mover cliente', err);
      toast.error('Erro ao mover lead. A página será atualizada.');
      fetchClientes(); // Rollback
    }
  };

  const handleDispatch = async (clienteId: string) => {
    try {
      await api.post('/dispatch', { cliente_id: clienteId });
      toast.success('Disparo enviado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao disparar no n8n');
    }
  };

  const handleUpdated = (updated: Cliente) => {
    setClientes((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated, status_funil: normalizeStatus(updated.status_funil) } : c)));
  };

  const handleDeleted = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
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

      <LeadDrawer 
        cliente={selectedCliente} 
        onClose={() => setSelectedCliente(null)} 
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
