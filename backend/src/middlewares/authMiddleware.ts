import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  usuarioId?: string;
  empresaId?: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  // O ID da empresa selecionada é enviado no header 'x-empresa-id'
  const empresaId = req.headers['x-empresa-id'] as string;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido ou malformado' });
  }

  if (!empresaId) {
    return res.status(401).json({ error: 'ID da empresa não fornecido no cabeçalho' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt_aqui');
    
    // Anexa os IDs à requisição para que possam ser usados nos controllers
    req.usuarioId = decoded.id;
    req.empresaId = empresaId;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export default authMiddleware;