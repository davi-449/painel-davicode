import axios from 'axios';
import { prisma } from '../prismaClient';
import AppError from '../utils/AppError';

export const DispatchService = {
  dispatchN8N: async (clienteId: string) => {
    const cliente = await prisma.clientes_crm.findUnique({
      where: { id: clienteId },
      include: { planos: true },
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado para o disparo', 404);
    }

    const configs = await prisma.configuracoes.findMany({
      where: { chave: { in: ['webhook_n8n', 'prompt_agente_ia'] } },
    });

    const configMap: Record<string, string> = {};
    configs.forEach((c: any) => (configMap[c.chave] = c.valor));

    const webhookUrl = configMap['webhook_n8n'];
    const prompt = configMap['prompt_agente_ia'] || '';

    if (!webhookUrl) {
      throw new AppError('Webhook do n8n não configurado', 400);
    }

    const payload = {
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        plano: cliente.planos?.nome || 'Plano não definido',
        origem: cliente.origem,
      },
      prompt_ia: prompt,
      action: 'DISPARO_MANUAL_PAINEL',
    };

    await axios.post(webhookUrl, payload);

    await prisma.atividades.create({
      data: {
        cliente_id: cliente.id,
        tipo: 'DISPARO_N8N',
        descricao: 'Mensagem inicial disparada via n8n',
      },
    });

    return { success: true, message: 'Disparo enviado com sucesso' };
  },
};
