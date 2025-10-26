"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const caixaController_1 = require("../controllers/caixaController");
const router = (0, express_1.Router)();
router.get('/resumo-dia', caixaController_1.getResumoDia);
router.get('/ganhos-mes', caixaController_1.getGanhosDoMes);
router.get('/historico', caixaController_1.getHistorico);
router.get('/comissoes', caixaController_1.getDadosComissao);
router.get('/comissoes/historico', caixaController_1.getHistoricoComissoes);
router.get('/comissoes/fechamento/:id', caixaController_1.getFechamentoComissaoById);
router.get('/fechamento/:id', caixaController_1.getFechamentoById);
router.post('/fechamento', caixaController_1.createFechamento);
router.post('/saida', caixaController_1.createSaida);
router.post('/sangria', caixaController_1.createSangria);
router.post('/comissoes/fechar', caixaController_1.fecharComissao);
router.put('/registros/:id', caixaController_1.updateCaixaRegistro);
router.delete('/registros/:id', caixaController_1.deleteCaixaRegistro);
router.post('/comissoes/migrar-historico', caixaController_1.migrarPagamentosComissaoAntigos); // Rota para a migração
exports.default = router;
//# sourceMappingURL=caixa.js.map