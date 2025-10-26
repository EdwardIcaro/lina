import { Request, Response } from 'express';
/**
 * Criar novo usuário
 */
export declare const createUsuario: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Gera um novo token com o escopo de uma empresa específica
 */
export declare const generateScopedToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Autenticar usuário (login)
 */
export declare const authenticateUsuario: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=usuarioController.d.ts.map