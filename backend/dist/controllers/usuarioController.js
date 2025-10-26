"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUsuario = exports.generateScopedToken = exports.createUsuario = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
/**
 * Criar novo usuário
 */
const createUsuario = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
        }
        const existingUsuario = await db_1.default.usuario.findFirst({
            where: { OR: [{ nome }, { email }] },
        });
        if (existingUsuario) {
            return res.status(400).json({ error: 'Usuário ou e-mail já cadastrado' });
        }
        const hashedSenha = await bcrypt_1.default.hash(senha, 12);
        const usuario = await db_1.default.usuario.create({
            data: { nome, email, senha: hashedSenha },
            select: { id: true, nome: true, email: true, createdAt: true },
        });
        res.status(201).json({ message: 'Usuário criado com sucesso', usuario });
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createUsuario = createUsuario;
/**
 * Gera um novo token com o escopo de uma empresa específica
 */
const generateScopedToken = async (req, res) => {
    const usuarioId = req.usuarioId;
    const { empresaId } = req.body;
    if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório' });
    }
    try {
        const usuario = await db_1.default.usuario.findUnique({ where: { id: usuarioId } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, nome: usuario.nome, empresaId }, // Agora inclui o empresaId
        process.env.JWT_SECRET || 'seu_segredo_jwt_aqui', { expiresIn: '1d' });
        res.json({ token });
    }
    catch (error) {
        console.error('Erro ao gerar token com escopo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.generateScopedToken = generateScopedToken;
/**
 * Autenticar usuário (login)
 */
const authenticateUsuario = async (req, res) => {
    try {
        const { nome: identifier, senha } = req.body;
        if (!identifier || !senha) {
            return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
        }
        // Procura o usuário tanto pelo nome quanto pelo e-mail
        const usuario = await db_1.default.usuario.findFirst({
            where: { OR: [{ nome: identifier }, { email: identifier }] },
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        const isSenhaValida = await bcrypt_1.default.compare(senha, usuario.senha);
        if (!isSenhaValida) {
            return res.status(401).json({ error: 'Senha inválida' });
        }
        // Retorna dados do usuário e suas empresas associadas
        const empresas = await db_1.default.empresa.findMany({
            where: { usuarioId: usuario.id },
            select: { id: true, nome: true },
        });
        const { senha: _, ...usuarioData } = usuario;
        // Gerar token JWT
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, nome: usuario.nome }, process.env.JWT_SECRET || 'seu_segredo_jwt_aqui', // Use uma variável de ambiente!
        { expiresIn: '1d' } // Token expira em 1 dia
        );
        res.json({
            message: 'Autenticação realizada com sucesso',
            usuario: {
                ...usuarioData,
                empresas,
            },
            token, // Envia o token para o frontend
        });
    }
    catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.authenticateUsuario = authenticateUsuario;
//# sourceMappingURL=usuarioController.js.map