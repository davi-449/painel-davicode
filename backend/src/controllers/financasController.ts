import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getResumoFinancas = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    // Calculando métricas mockadas já que os pagamentos não estão mapeados no prisma detalhadamente 
    // ou buscando os clientes FECHADOS para ter um baseline.
    const clientesFechados = await prisma.clientes_crm.findMany({
      where: { status_funil: 'FECHADO' },
      include: { planos: true }
    });

    const receitaTotal = clientesFechados.reduce((acc: number, c: any) => acc + (c.planos?.valor_mensal || 497), 0);
    const despesaTotal = 1500; // Valor fixo para exemplo
    const saldo = receitaTotal - despesaTotal;

    res.json({
      receita: { current: receitaTotal, trend: 15 },
      despesa: { current: despesaTotal, trend: -5 },
      saldo: { current: saldo, trend: 20 },
      historico: [
        { month: 'Jan', receita: 3000, despesa: 1200 },
        { month: 'Fev', receita: 4500, despesa: 1400 },
        { month: 'Mar', receita: receitaTotal, despesa: 1500 },
      ]
    });
  } catch (error) {
    console.error('Erro em getResumoFinancas', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de finanças' });
  }
};
