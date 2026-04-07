# Design System & Architecture - 007: CRM Expanded, Vendas & N8N Agent

## Backend / Supabase MCP Context
Devemos aplicar os seguintes DDLS no Supabase. É fundamental avisar o usuário para gerir no seu Editor SQL:

```sql
ALTER TABLE clientes_crm ADD COLUMN IF NOT EXISTS motivo_perda TEXT;
ALTER TABLE clientes_crm ADD COLUMN IF NOT EXISTS valor_contrato DECIMAL(10,2);
ALTER TABLE clientes_crm ADD COLUMN IF NOT EXISTS tempo_contrato_meses INTEGER;
ALTER TABLE clientes_crm ADD COLUMN IF NOT EXISTS data_vencimento TIMESTAMPTZ;
```

A política de RLS já deve estar com permissão total, mas deve-se repassar aos métodos de client-side (`updateClienteStatus`) o spread `{ ...optionalUpdates }` para salvar esses campos no `.update({...})`.

## Frontend / Stitch MCP Context
### O Design 2026 
Devemos garantir o *Maximalismo Tátil* e *Liquid Glass*: 
- Na nova `ListaClientesPage`, evitar datatables sem graça. Usaremos paddings generosos, badges arredondados do Funil (já temos), cores de fundo ricas no dark theme e ícones dinâmicos ao listar a data de vencimento.
- Nos `Modals` de "Venda Ganha" e "Venda Perdida", usar backgrounds com blur translúcido pesado (`backdrop-blur-xl`), anéis de feedback brilhosos no success, sombras ricas `shadow-[0_0_..._rgba(..)]`.
- Na nova página `N8nToolsPage`, apresentar o código fonte em um editor estilo mock (um bloco `pre` estético), onde há um painel copiável. Design altamente voltado para Desenvolvedores/Operações (`#09090b` de background interno).

### Interceptadores no Kanban
Em `KanbanPage.tsx`:
Será criado o State:
```tsx
const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string, newStatus: string } | null>(null);
```
Quando o DND onDragEnd terminar para "FECHADO" ou "PERDIDO", ele interrompe e joga no state `pendingStatusChange`, ativando o modal. Ao submeter o formulário dos Modals, a função `handleFinishStatusChange(formData)` irá persistir tudo e fechar.

### A Página do Agente (N8N)
A nova página `/ia-agente` exibirá, de forma amigável, como plugar os tools do CRM no Node `AI Agent` do N8n.
Vai prover 3 schemas padrão prontos:
1. `Criar_Lead_Tool`
2. `Consultar_Lead_Tool`
3. `Mover_Status_Tool`

Isso encerra o loop perfeito do produto como uma plataforma modular para IAs.
