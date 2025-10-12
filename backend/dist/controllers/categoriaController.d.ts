import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
}
/**
 * Listar categorias de veículo.
 * Cria as categorias padrão se não existirem para a empresa.
 */
export declare const getCategorias: (req: EmpresaRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=categoriaController.d.ts.map