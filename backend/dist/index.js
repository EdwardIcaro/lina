"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./generated/prisma");
// Importar rotas
const empresa_1 = __importDefault(require("./routes/empresa"));
const cliente_1 = __importDefault(require("./routes/cliente"));
const veiculo_1 = __importDefault(require("./routes/veiculo"));
const lavador_1 = __importDefault(require("./routes/lavador"));
const servico_1 = __importDefault(require("./routes/servico"));
const ordem_1 = __importDefault(require("./routes/ordem"));
const pagamento_1 = __importDefault(require("./routes/pagamento"));
const categoria_1 = __importDefault(require("./routes/categoria"));
// Importar middleware
const multiEmpresa_1 = require("./middleware/multiEmpresa");
// Carregar variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new prisma_1.PrismaClient();
exports.prisma = prisma;
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas públicas (sem middleware de multi-empresa)
app.use('/api/empresas', empresa_1.default);
// Middleware de multi-empresa (isolamento de dados) para rotas específicas
app.use('/api/clientes', multiEmpresa_1.multiEmpresaMiddleware, cliente_1.default);
app.use('/api/veiculos', multiEmpresa_1.multiEmpresaMiddleware, veiculo_1.default);
app.use('/api/lavadores', multiEmpresa_1.multiEmpresaMiddleware, lavador_1.default);
app.use('/api/servicos', multiEmpresa_1.multiEmpresaMiddleware, servico_1.default);
app.use('/api/ordens', multiEmpresa_1.multiEmpresaMiddleware, ordem_1.default);
app.use('/api/pagamentos', multiEmpresa_1.multiEmpresaMiddleware, pagamento_1.default);
app.use('/api/categorias', multiEmpresa_1.multiEmpresaMiddleware, categoria_1.default);
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
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Lina X rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=index.js.map