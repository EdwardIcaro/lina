import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
    empresa?: any;
}
/**
 * Criar novo serviço
 */
export declare const createServico: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Criar novo serviço adicional
 */
export declare const createAdicional: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Listar serviços da empresa (com paginação)
 */
export declare const getServicos: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Listar serviços da empresa (formato simples para frontend)
 */
export declare const getServicosSimple: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Listar serviços adicionais da empresa (formato simples para frontend)
 */
export declare const getAdicionaisSimple: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Listar serviços adicionais da empresa
 */
export declare const getAdicionais: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Buscar serviço por ID
 */
export declare const getServicoById: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Buscar serviço adicional por ID
 */
export declare const getAdicionalById: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Atualizar serviço
 */
export declare const updateServico: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Atualizar serviço adicional
 */
export declare const updateAdicional: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Excluir serviço
 */
export declare const deleteServico: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Excluir serviço adicional
 */
export declare const deleteAdicional: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=servicoController.d.ts.map