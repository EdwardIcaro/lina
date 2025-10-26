import { Request, Response, NextFunction } from 'express';
interface EmpresaRequest extends Request {
    empresaId?: string;
    empresa?: any;
}
/**
 * Middleware de multi-empresa para isolamento de dados
 * Extrai o empresaId do header e valida se a empresa existe
 */
export declare const multiEmpresaMiddleware: (req: EmpresaRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware de autenticação simples.
 * Em um app real, aqui você validaria um token JWT.
 * Por agora, apenas garantimos que o multiEmpresaMiddleware foi executado.
 */
export declare const authMiddleware: (req: EmpresaRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para validar senha chave da empresa
 * Usado no login e em operações sensíveis
 */
export declare const validateSenhaChave: (req: EmpresaRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Helper para criar filtro de empresa para queries Prisma
 */
export declare const createEmpresaFilter: (empresaId: string) => {
    empresaId: string;
};
/**
 * Helper para verificar permissão de acesso a dados
 */
export declare const checkEmpresaPermission: (data: any, empresaId: string) => boolean;
export {};
//# sourceMappingURL=multiEmpresa.d.ts.map