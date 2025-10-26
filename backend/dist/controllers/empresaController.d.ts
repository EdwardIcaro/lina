import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    usuarioId?: string;
    empresaId?: string;
}
/**
 * Criar nova empresa
 */
export declare const createEmpresa: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Listar todas as empresas do usuário logado
 */
export declare const getEmpresas: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const toggleEmpresaStatus: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=empresaController.d.ts.map