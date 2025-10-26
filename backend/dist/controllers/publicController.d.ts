import { Request, Response } from 'express';
/**
 * Retorna os dados públicos de um lavador com base em um token JWT.
 * Esta rota não requer autenticação de empresa.
 */
export declare const getLavadorPublicData: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOrdensByLavadorPublic: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=publicController.d.ts.map