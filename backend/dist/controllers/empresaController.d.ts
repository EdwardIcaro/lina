import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
    empresa?: any;
}
/**
 * Criar nova empresa
 */
export declare const createEmpresa: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Listar todas as empresas (apenas para admin)
 */
export declare const getEmpresas: (req: Request, res: Response) => Promise<void>;
/**
 * Buscar empresa por ID
 */
export declare const getEmpresaById: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Atualizar empresa
 */
export declare const updateEmpresa: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Desativar/ativar empresa
 */
export declare const toggleEmpresaStatus: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Autenticar empresa (login)
 */
export declare const authenticateEmpresa: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=empresaController.d.ts.map