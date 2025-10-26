import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
}
/**
 * Listar todos os fornecedores da empresa
 */
export declare const getFornecedores: (req: EmpresaRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=fornecedorController.d.ts.map