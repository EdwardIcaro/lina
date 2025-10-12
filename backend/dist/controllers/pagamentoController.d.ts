import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
    empresa?: any;
}
/**
 * Criar novo pagamento
 */
export declare const createPagamento: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Listar pagamentos de uma ordem
 */
export declare const getPagamentosByOrdem: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Atualizar status de um pagamento
 */
export declare const updatePagamentoStatus: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Excluir um pagamento
 */
export declare const deletePagamento: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obter estatísticas de pagamento
 */
export declare const getPaymentStats: (req: EmpresaRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=pagamentoController.d.ts.map