import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
    empresa?: any;
}
/**
 * Criar nova ordem de serviço
 */
export declare const createOrdem: (req: EmpresaRequest, res: Response) => Promise<void | Response<any, Record<string, any>> | undefined>;
/**
 * Listar ordens de serviço da empresa
 */
export declare const getOrdens: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Buscar ordem de serviço por ID
 */
export declare const getOrdemById: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Atualizar ordem de serviço
 */
export declare const updateOrdem: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Cancelar ordem de serviço
 */
export declare const cancelOrdem: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obter estatísticas de ordens de serviço
 */
export declare const getOrdensStats: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Deletar ordem de serviço permanentemente
 */
export declare const deleteOrdem: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=ordemController.d.ts.map