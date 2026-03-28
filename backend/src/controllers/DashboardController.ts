import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const DashboardController = {
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      // 1. Total Leads
      const totalLeads = await prisma.clientes_crm.count();

      // 2. Fechados (Vendas)
      const fechados = await prisma.clientes_crm.count({
        where: { status_funil: 'FECHADO' }
      });

      // 3. Ticket Médio (sum of planos para status FECHADO)
      const fechadosList = await prisma.clientes_crm.findMany({
        where: { status_funil: 'FECHADO', plano_id: { not: null } },
        include: { planos: true }
      });
      let totalReceita = 0;
      fechadosList.forEach((c: any) => {
        if (c.planos?.valor_mensal) totalReceita += Number(c.planos.valor_mensal);
      });
      const ticketMedio = fechados > 0 ? totalReceita / fechados : 0;

      // 4. Atividades Hoje
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      const atividadesHoje = await prisma.atividades.count({
        where: { created_at: { gte: startOfDay } }
      });

      res.json({
        totalLeads,
        vendas: fechados,
        ticketMedio,
        atividadesHoje,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar metricas de dashboard' });
    }
  }
};
