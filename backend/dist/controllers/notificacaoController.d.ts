import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
}
/**
 * Busca as notificações da empresa logada, com paginação.
 */
export declare const getNotificacoes: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Marca uma notificação específica como lida.
 */
export declare const marcarComoLida: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Marca todas as notificações não lidas de uma empresa como lidas.
 */
export declare const marcarTodasComoLidas: (req: EmpresaRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=notificacaoController.d.ts.map