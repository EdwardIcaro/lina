"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pagamentoController_1 = require("../controllers/pagamentoController");
const router = (0, express_1.Router)();
/**
 * Criar novo pagamento
 * POST /api/pagamentos
 */
router.post('/', pagamentoController_1.createPagamento);
router.post('/quitar-pendencia', pagamentoController_1.quitarPendencia);
/**
 * Listar pagamentos de uma ordem
 * GET /api/pagamentos/ordem/:ordemId
 */
router.get('/ordem/:ordemId', pagamentoController_1.getPagamentosByOrdem);
/**
 * Atualizar status de um pagamento
 * PUT /api/pagamentos/:id/status
 */
router.put('/:id/status', pagamentoController_1.updatePagamentoStatus);
/**
 * Excluir um pagamento
 * DELETE /api/pagamentos/:id
 */
router.delete('/:id', pagamentoController_1.deletePagamento);
/**
 * Obter estatísticas de pagamento
 * GET /api/pagamentos/stats
 */
router.get('/stats', pagamentoController_1.getPaymentStats);
exports.default = router;
//# sourceMappingURL=pagamento.js.map