import prisma from '../db';

// Adicionando um tipo para as preferências de notificação
export type NotificationPreference = 'ordemCriada' | 'ordemEditada' | 'ordemDeletada' | 'finalizacaoAutomatica';

interface NotificationData {
  empresaId: string;
  mensagem: string;
  link?: string;
  type: NotificationPreference; // Novo campo obrigatório
}

/**
 * Cria uma nova notificação para uma empresa, se a preferência estiver ativa.
 * @param data - Dados da notificação (empresaId, mensagem, tipo, link opcional).
 */
export const createNotification = async (data: NotificationData) => {
  try {
    // 1. Buscar a empresa e suas preferências
    const empresa = await prisma.empresa.findUnique({
      where: { id: data.empresaId },
      select: { notificationPreferences: true },
    });

    // Se não encontrar a empresa, não faz nada.
    if (!empresa) {
      console.log(`Empresa ${data.empresaId} não encontrada para checar preferências de notificação.`);
      return;
    }

    // Garante que prefs seja um objeto, mesmo que notificationPreferences seja nulo ou não seja um objeto.
    const prefs: Record<string, boolean> = typeof empresa.notificationPreferences === 'object' && empresa.notificationPreferences !== null ? (empresa.notificationPreferences as Record<string, boolean>) : {};

    // Por padrão, a notificação é ativa, a menos que seja explicitamente desativada.
    // A exceção é 'ordemDeletada', que é desativada por padrão.
    const isEnabled = data.type === 'ordemDeletada' 
      ? prefs.ordemDeletada === true 
      : prefs[data.type] !== false;

    // Se a preferência para este tipo de notificação estiver desativada, não cria a notificação.
    if (!isEnabled) {
      console.log(`Notificação do tipo "${data.type}" desativada para a empresa ${data.empresaId}.`);
      return;
    }

    // 3. Criar a notificação
    await prisma.notificacao.create({
      data: {
        empresaId: data.empresaId,
        mensagem: data.mensagem,
        link: data.link,
        type: data.type,
      },
    });
    console.log(`Notificação criada para a empresa ${data.empresaId}: "${data.mensagem}"`);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    // Não lançamos o erro para não quebrar o fluxo principal que a chamou
  }
};

/**
 * Conta o número de notificações não lidas para uma empresa.
 * @param empresaId - O ID da empresa.
 * @returns O número de notificações não lidas.
 */
export const countUnreadNotifications = async (empresaId: string): Promise<number> => {
  try {
    const count = await prisma.notificacao.count({
      where: {
        empresaId: empresaId,
        lida: false,
      },
    });
    return count;
  } catch (error) {
    console.error(`Erro ao contar notificações não lidas para a empresa ${empresaId}:`, error);
    return 0; // Retorna 0 em caso de erro para não quebrar o cliente.
  }
};