import { Request, Response } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
}
export declare const createLavador: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLavadores: (req: EmpresaRequest, res: Response) => Promise<void>;
export declare const getLavadoresSimple: (req: EmpresaRequest, res: Response) => Promise<void>;
export declare const updateLavador: (req: EmpresaRequest, res: Response) => Promise<void>;
export declare const deleteLavador: (req: EmpresaRequest, res: Response) => Promise<void>;
/**
 * Gera um token JWT para a página pública do lavador.
 */
export declare const gerarTokenPublico: (req: EmpresaRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=lavadorController.d.ts.map