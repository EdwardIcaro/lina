import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
    empresa?: any;
}
/**
 * Criar novo cliente
 */
export declare const createCliente: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Listar clientes da empresa
 */
export declare const getClientes: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Buscar cliente por ID
 */
export declare const getClienteById: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Atualizar cliente
 */
export declare const updateCliente: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Excluir cliente
 */
export declare const deleteCliente: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Buscar cliente por placa do veículo
 */
export declare const getClienteByPlaca: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=clienteController.d.ts.map