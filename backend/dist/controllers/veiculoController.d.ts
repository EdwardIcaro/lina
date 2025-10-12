import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
    empresa?: any;
}
/**
 * Criar novo veículo
 */
export declare const createVeiculo: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Listar veículos da empresa
 */
export declare const getVeiculos: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Buscar veículo por ID
 */
export declare const getVeiculoById: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Atualizar veículo
 */
export declare const updateVeiculo: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Excluir veículo
 */
export declare const deleteVeiculo: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=veiculoController.d.ts.map