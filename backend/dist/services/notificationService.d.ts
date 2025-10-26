export type NotificationPreference = 'ordemCriada' | 'ordemEditada' | 'ordemDeletada' | 'finalizacaoAutomatica';
interface NotificationData {
    empresaId: string;
    mensagem: string;
    link?: string;
    type: NotificationPreference;
}
/**
 * Cria uma nova notificação para uma empresa, se a preferência estiver ativa.
 * @param data - Dados da notificação (empresaId, mensagem, tipo, link opcional).
 */
export declare const createNotification: (data: NotificationData) => Promise<void>;
/**
 * Conta o número de notificações não lidas para uma empresa.
 * @param empresaId - O ID da empresa.
 * @returns O número de notificações não lidas.
 */
export declare const countUnreadNotifications: (empresaId: string) => Promise<number>;
export {};
//# sourceMappingURL=notificationService.d.ts.map