"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countUnreadNotifications = exports.createNotification = void 0;
const db_1 = __importDefault(require("../db"));
/**
 * Cria uma nova notificação para uma empresa, se a preferência estiver ativa.
 * @param data - Dados da notificação (empresaId, mensagem, tipo, link opcional).
 */
const createNotification = async (data) => {
    try {
        // 1. Buscar a empresa e suas preferências
        const empresa = await db_1.default.empresa.findUnique({
            where: { id: data.empresaId },
            select: { notificationPreferences: true },
        });
        // Se não encontrar a empresa, não faz nada.
        if (!empresa) {
            console.log(`Empresa ${data.empresaId} não encontrada para checar preferências de notificação.`);
            return;
        }
        // Garante que prefs seja um objeto, mesmo que notificationPreferences seja nulo ou não seja um objeto.
        const prefs = typeof empresa.notificationPreferences === 'object' && empresa.notificationPreferences !== null ? empresa.notificationPreferences : {};
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
        await db_1.default.notificacao.create({
            data: {
                empresaId: data.empresaId,
                mensagem: data.mensagem,
                link: data.link,
                type: data.type,
            },
        });
        console.log(`Notificação criada para a empresa ${data.empresaId}: "${data.mensagem}"`);
    }
    catch (error) {
        console.error('Erro ao criar notificação:', error);
        // Não lançamos o erro para não quebrar o fluxo principal que a chamou
    }
};
exports.createNotification = createNotification;
/**
 * Conta o número de notificações não lidas para uma empresa.
 * @param empresaId - O ID da empresa.
 * @returns O número de notificações não lidas.
 */
const countUnreadNotifications = async (empresaId) => {
    try {
        const count = await db_1.default.notificacao.count({
            where: {
                empresaId: empresaId,
                lida: false,
            },
        });
        return count;
    }
    catch (error) {
        console.error(`Erro ao contar notificações não lidas para a empresa ${empresaId}:`, error);
        return 0; // Retorna 0 em caso de erro para não quebrar o cliente.
    }
};
exports.countUnreadNotifications = countUnreadNotifications;
//# sourceMappingURL=notificationService.js.map