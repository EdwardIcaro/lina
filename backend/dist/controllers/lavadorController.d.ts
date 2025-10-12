import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
    empresa?: any;
}
/**
 * Criar novo lavador
 */
export declare const createLavador: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Listar lavadores da empresa (com paginação)
 */
export declare const getLavadores: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Listar lavadores da empresa (formato simples para frontend)
 */
export declare const getLavadoresSimple: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Buscar lavador por ID
 */
export declare const getLavadorById: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Atualizar lavador
 */
export declare const updateLavador: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Excluir lavador
 */
export declare const deleteLavador: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Ativar/Desativar lavador
 */
export declare const toggleLavadorStatus: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=lavadorController.d.ts.map