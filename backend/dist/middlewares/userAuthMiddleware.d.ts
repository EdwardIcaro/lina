import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    usuarioId?: string;
}
declare const userAuthMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default userAuthMiddleware;
//# sourceMappingURL=userAuthMiddleware.d.ts.map