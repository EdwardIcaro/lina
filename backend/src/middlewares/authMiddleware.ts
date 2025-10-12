import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  usuarioId?: string;
  empresaId?: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // O ID do usuário logado é enviado no header 'x-usuario-id'
  const usuarioId = req.headers['x-usuario-id'] as string;
  // O ID da empresa selecionada é enviado no header 'x-empresa-id'
  const empresaId = req.headers['x-empresa-id'] as string;

  if (!usuarioId) {
    return res.status(401).json({ error: 'Acesso não autorizado: ID do usuário ausente.' });
  }

  // Anexa os IDs à requisição para que possam ser usados nos controllers
  req.usuarioId = usuarioId;

  // O empresaId é opcional para algumas rotas (como criar a primeira empresa)
  if (empresaId) {
    req.empresaId = empresaId;
  }

  next();
};

export default authMiddleware;