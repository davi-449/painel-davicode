import { prisma } from '../prismaClient';

export const FinancasService = {
  getResumo: async () => {
    const clientesFechados = await prisma.clientes_crm.findMany({
      where: { status_funil: 'FECHADO' },
      include: { planos: true },
    });

    const receitaTotal = clientesFechados.reduce((acc: number, c: any) => acc + (c.planos?.valor_mensal || 0), 0);
    const despesaTotal = 1500; // Mock
    const saldo = receitaTotal - despesaTotal;

    return {
      receita: { current: receitaTotal, trend: 15 }, // Mock trend
      despesa: { current: despesaTotal, trend: -5 }, // Mock trend
      saldo: { current: saldo, trend: 20 }, // Mock trend
      historico: [
        { month: 'Jan', receita: 8000, despesa: 1200 }, // Mock
        { month: 'Fev', receita: 9500, despesa: 1400 }, // Mock
        { month: 'Mar', receita: receitaTotal, despesa: 1500 },
      ],
    };
  },
};
