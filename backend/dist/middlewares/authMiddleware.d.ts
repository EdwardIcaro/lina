import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    usuarioId?: string;
    empresaId?: string;
}
declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default authMiddleware;
//# sourceMappingURL=authMiddleware.d.ts.map