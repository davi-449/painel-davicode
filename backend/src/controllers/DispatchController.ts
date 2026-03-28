import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { prisma } from '../prismaClient';

export const DispatchController = {
  async dispatchN8N(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { cliente_id } = req.body;

    if (!cliente_id) {
      res.status(400).json({ error: 'cliente_id é obrigatório' });
      return;
    }

    try {
      const cliente = await prisma.clientes_crm.findUnique({
        where: { id: cliente_id },
        include: { planos: true }
      });

      if (!cliente) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Buscar configuração do webhook e prompt
      const configs = await prisma.configuracoes.findMany({
        where: { chave: { in: ['webhook_n8n', 'prompt_agente_ia'] } }
      });

      const configMap: Record<string, string> = {};
      configs.forEach((c: any) => configMap[c.chave] = c.valor);

      const webhookUrl = configMap['webhook_n8n'];
      const prompt = configMap['prompt_agente_ia'] || '';

      if (!webhookUrl) {
        res.status(400).json({ error: 'Webhook do n8n não configurado nas configurações (chave: webhook_n8n)' });
        return;
      }

      // Enviar pro webhook
      const payload = {
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,
          email: cliente.email,
          plano: cliente.planos?.nome || cliente.plano,
          origem: cliente.origem
        },
        prompt_ia: prompt,
        action: 'DISPARO_MANUAL_PAINEL'
      };

      await axios.post(webhookUrl, payload);

      // Registrar atividade
      await prisma.atividades.create({
        data: {
          cliente_id: cliente.id,
          tipo: 'DISPARO_N8N',
          descricao: 'Mensagem inicial disparada via n8n'
        }
      });

      res.json({ success: true, message: 'Disparo enviado com sucesso' });
    } catch (error: any) {
      console.error('[Dispatch ERROR]', error.message);
      next(error);
    }
  }
};
