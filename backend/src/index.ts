import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma';

import { getOrdensByLavadorPublic } from './controllers/publicController';
import usuarioRoutes from './routes/usuario';
// Importar rotas
import empresaRoutes from './routes/empresa';
import clienteRoutes from './routes/cliente';
import veiculoRoutes from './routes/veiculo';
import lavadorRoutes from './routes/lavador';
import servicoRoutes from './routes/servico';
import ordemRoutes from './routes/ordem';
import pagamentoRoutes from './routes/pagamento';
import tipoVeiculoRoutes from './routes/tipoVeiculo';

// Importar middleware
import authMiddleware from './middlewares/authMiddleware';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas públicas (cadastro e login de usuário)
app.use('/api/usuarios', usuarioRoutes);

// Rota pública para visualização do lavador
app.get('/api/public/lavador/:id/ordens', getOrdensByLavadorPublic);

// Middleware de autenticação para rotas protegidas
app.use('/api/empresas', authMiddleware, empresaRoutes);
app.use('/api/clientes', authMiddleware, clienteRoutes);
app.use('/api/veiculos', authMiddleware, veiculoRoutes);
app.use('/api/lavadores', authMiddleware, lavadorRoutes);
app.use('/api/servicos', authMiddleware, servicoRoutes);
app.use('/api/ordens', authMiddleware, ordemRoutes);
app.use('/api/pagamentos', authMiddleware, pagamentoRoutes);
app.use('/api/tipos-veiculo', authMiddleware, tipoVeiculoRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lina X API - Sistema de Gestão para Lava Jato',
    version: '1.0.0',
    endpoints: {
      empresas: '/api/empresas',
      clientes: '/api/clientes',
      veiculos: '/api/veiculos',
      lavadores: '/api/lavadores',
      servicos: '/api/servicos',
      ordens: '/api/ordens'
    }
  });
});

// Tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Lina X rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Exportar prisma para uso em outros arquivos
export { prisma };
