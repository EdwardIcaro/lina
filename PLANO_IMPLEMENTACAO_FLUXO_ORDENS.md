# 🚀 PLANO DE IMPLEMENTAÇÃO - FLUXO DE ORDENS POR TIPO DE VEÍCULO

## 📋 VISÃO GERAL DO PROJETO

### 🎯 Objetivo Principal
Implementar um fluxo inteligente e guiado para criação de ordens de serviço, organizado por tipo de veículo (Carro, Moto, Outros) com precificação diferenciada e experiência de usuário otimizada.

### 💡 Ideia Central
- **Fluxo Guiado**: Usuário seleciona tipo de veículo → subtipo → serviços específicos
- **Precificação Inteligente**: Preços definidos por categoria de veículo
- **Flexibilidade**: Sistema aberto para serviços personalizados (categoria "Outros")
- **Gestão Simplificada**: Adicionais globais para todos os serviços

---

## 🏗️ ESTRUTURA DO BANCO DE DADOS

### Novo Modelo: TipoVeiculo
```sql
model TipoVeiculo {
  id          String   @id @default(cuid())
  nome        String   // "Carro", "Moto", "Outros"
  categoria   String?  // "Hatch", "Sedan", "SUV", "Picapé", "Caminhonete"
  descricao   String?  // Descrição opcional
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacionamentos
  servicos    Servico[]
  
  @@map("tipo_veiculos")
}
```

### Modelo Modificado: Servico
```sql
model Servico {
  id             String        @id @default(cuid())
  nome           String        // "Lavagem Simples", "Lavagem Completa"
  descricao      String?       // Descrição do serviço
  preco          Float         // 60.00, 80.00, etc.
  tempoEstimado  Int?          // Tempo em minutos
  tipoVeiculoId  String
  tipoVeiculo    TipoVeiculo   @relation(fields: [tipoVeiculoId], references: [id])
  empresaId      String
  empresa        Empresa       @relation(fields: [empresaId], references: [id])
  ativo          Boolean       @default(true)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relacionamentos existentes (manter)
  ordemServicoItens OrdemServicoItem[]
  
  @@map("servicos")
}
```

### Migração Necessária
```sql
-- Migration: 20250924000000_add_tipo_veiculo_to_servicos
CREATE TABLE tipo_veiculos (
    id VARCHAR(191) PRIMARY KEY DEFAULT (CUID()),
    nome VARCHAR(191) NOT NULL,
    categoria VARCHAR(191),
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE servicos ADD COLUMN tipo_veiculo_id VARCHAR(191);
ALTER TABLE servicos ADD CONSTRAINT fk_servicos_tipo_veiculo 
    FOREIGN KEY (tipo_veiculo_id) REFERENCES tipo_veiculos(id);

-- Criar índices para performance
CREATE INDEX idx_servicos_tipo_veiculo ON servicos(tipo_veiculo_id);
CREATE INDEX idx_servicos_empresa_tipo ON servicos(empresa_id, tipo_veiculo_id);
```

---

## 🔄 FLUXOS DE USUÁRIO DETALHADOS

### Fluxo 1: Carro → Subtipos → Serviços
```
1. Usuário clica "Nova Ordem"
2. Tela de seleção: [CARRO] [MOTO] [OUTROS]
3. Usuário clica em CARRO
4. Tela de subtipos: [HATCH] [SEDAN] [SUV] [PICAPÉ] [CAMINHONETE]
5. Usuário clica em HATCH
6. Sistema filtra serviços disponíveis para Carro/Hatch
7. Formulário aparece com serviços pré-filtrados:
   - Lavagem Simples (R$ 60,00)
   - Lavagem Completa (R$ 80,00)
8. Usuário seleciona serviços e adicionais
9. Finaliza ordem normalmente
```

### Fluxo 2: Moto → Serviços Diretos
```
1. Usuário clica "Nova Ordem"
2. Tela de seleção: [CARRO] [MOTO] [OUTROS]
3. Usuário clica em MOTO
4. Sistema filtra serviços disponíveis para Moto
5. Formulário aparece com serviços para Moto:
   - Lavagem Simples (R$ 40,00)
   - Lavagem Completa (R$ 60,00)
6. Usuário seleciona serviços e adicionais
7. Finaliza ordem normalmente
```

### Fluxo 3: Outros → Serviços Personalizados
```
1. Usuário clica "Nova Ordem"
2. Tela de seleção: [CARRO] [MOTO] [OUTROS]
3. Usuário clica em OUTROS
4. Formulário especial aparece:
   - Campo: Nome do Cliente
   - Campo: Telefone do Cliente
   - Campo: Descrição do Serviço (ex: "Lavagem de Tapete")
   - Campo: Valor do Serviço (manual)
   - Campo: Observações
5. Usuário preenche todos os campos
6. Sistema cria ordem com serviço personalizado
7. Finaliza ordem normalmente
```

---

## 📝 FASES DE IMPLEMENTAÇÃO

### 🎯 FASE 1: ESTRUTURA BASE (2-3 horas)
**Objetivo:** Preparar o banco de dados e backend básico

#### 1.1 Banco de Dados
- [ ] Criar migration `20250924000000_add_tipo_veiculo_to_servicos`
- [ ] Executar migration no banco de dados
- [ ] Atualizar schema.prisma
- [ ] Gerar Prisma Client

#### 1.2 Backend - Modelo e Controller
- [ ] Criar `tipoVeiculoController.ts` com métodos CRUD
- [ ] Modificar `servicoController.ts` para incluir tipoVeiculoId
- [ ] Atualizar métodos existentes para compatibilidade
- [ ] Criar seed inicial com tipos de veículo básicos

#### 1.3 Backend - Rotas
- [ ] Criar `tipoVeiculo.ts` com rotas CRUD
- [ ] Atualizar `servico.ts` com novo campo tipoVeiculoId
- [ ] Adicionar middleware de validação

#### 1.4 Seed Inicial
```javascript
// Dados iniciais para tipo_veiculos
[
  { id: '1', nome: 'Carro', categoria: null, descricao: 'Veículos de passeio' },
  { id: '2', nome: 'Moto', categoria: null, descricao: 'Motocicletas' },
  { id: '3', nome: 'Outros', categoria: null, descricao: 'Serviços personalizados' }
]

// Subtipos para Carro
[
  { id: '4', nome: 'Carro', categoria: 'Hatch', descricao: 'Carros hatch' },
  { id: '5', nome: 'Carro', categoria: 'Sedan', descricao: 'Carros sedan' },
  { id: '6', nome: 'Carro', categoria: 'SUV', descricao: 'Utilitários esportivos' },
  { id: '7', nome: 'Carro', categoria: 'Picapé', descricao: 'Picapes compactas' },
  { id: '8', nome: 'Carro', categoria: 'Caminhonete', descricao: 'Caminhonetes' }
]
```

---

### 🎯 FASE 2: FLUXO DE SELEÇÃO (3-4 horas)
**Objetivo:** Implementar as telas de seleção no frontend

#### 2.1 Tela Principal de Seleção
- [ ] Criar modal/página `selecionar-tipo-veiculo.html`
- [ ] Implementar layout com 3 botões principais: Carro, Moto, Outros
- [ ] Adicionar navegação do botão "Nova Ordem" para esta tela
- [ ] Implementar responsividade

#### 2.2 Tela de Subtipos (Carro)
- [ ] Criar modal/página `selecionar-subtipo-carro.html`
- [ ] Implementar layout com 5 botões: Hatch, Sedan, SUV, Picapé, Caminhonete
- [ ] Adicionar navegação da tela principal para esta tela (quando Carro selecionado)
- [ ] Implementar botão "Voltar"

#### 2.3 Integração com novaordem.html
- [ ] Modificar `novaordem.html` para receber parâmetros de tipo e subtipo
- [ ] Implementar filtragem de serviços baseada no tipo selecionado
- [ ] Adicionar lógica para mostrar/esconder campos baseado no tipo
- [ ] Implementar formulário especial para "Outros"

#### 2.4 Lógica de Navegação
```javascript
// Estrutura de navegação
function navigateToTipoVeiculo(tipo) {
  if (tipo === 'Carro') {
    showSubtipoCarroScreen();
  } else if (tipo === 'Moto') {
    showOrdemForm('Moto', null);
  } else if (tipo === 'Outros') {
    showOrdemForm('Outros', null);
  }
}

function navigateToSubtipoCarro(subtipo) {
  showOrdemForm('Carro', subtipo);
}
```

---

### 🎯 FASE 3: SISTEMA DE CONFIGURAÇÃO (2-3 horas)
**Objetivo:** Criar interface para gestão de serviços e preços

#### 3.1 Página de Configuração de Serviços
- [ ] Criar `configurar-servicos.html`
- [ ] Implementar abas por tipo de veículo
- [ ] Adicionar formulário para criar/editar serviços
- [ ] Implementar listagem de serviços com filtros

#### 3.2 Gestão de Preços
- [ ] Criar interface para definir preços por tipo/subtipo
- [ ] Implementar validações de preço
- [ ] Adicionar campos de tempo estimado
- [ ] Implementar ativação/desativação de serviços

#### 3.3 Backend - Configuração
- [ ] Criar endpoints para gestão de serviços por tipo
- [ ] Implementar filtros por empresa e tipo
- [ ] Adicionar validações de negócio
- [ ] Implementar regras de precificação

#### 3.4 Interface de Configuração
```html
<!-- Estrutura das abas -->
<div class="tabs">
  <button class="tab active" data-tipo="Carro">Carro</button>
  <button class="tab" data-tipo="Moto">Moto</button>
  <button class="tab" data-tipo="Outros">Outros</button>
</div>

<!-- Para Carro: mostrar subtipos -->
<div class="subtipos-carro">
  <button data-subtipo="Hatch">Hatch</button>
  <button data-subtipo="Sedan">Sedan</button>
  <button data-subtipo="SUV">SUV</button>
  <button data-subtipo="Picapé">Picapé</button>
  <button data-subtipo="Caminhonete">Caminhonete</button>
</div>
```

---

### 🎯 FASE 4: INTEGRAÇÃO FINAL (1-2 horas)
**Objetivo:** Testar, ajustar e documentar

#### 4.1 Testes Integrados
- [ ] Testar fluxo completo Carro → Hatch → Serviço
- [ ] Testar fluxo completo Moto → Serviço
- [ ] Testar fluxo completo Outros → Serviço Personalizado
- [ ] Testar navegação entre telas
- [ ] Testar responsividade em diferentes dispositivos

#### 4.2 Validações e Segurança
- [ ] Validar dados em todos os formulários
- [ ] Implementar tratamento de erros
- [ ] Adicionar feedback visual para o usuário
- [ ] Testar permissões e acesso por empresa

#### 4.3 Otimizações e UX
- [ ] Adicionar animações e transições
- [ ] Implementar loading states
- [ ] Otimizar performance de carregamento
- [ ] Adicionar tooltips e ajuda contextual

#### 4.4 Documentação
- [ ] Atualizar documentação do sistema
- [ ] Criar guia de uso para usuários
- [ ] Documentar novas APIs
- [ ] Registrar decisões técnicas

---

## 🔧 REQUISITOS TÉCNICOS

### Backend
- [ ] Node.js + Express + TypeScript
- [ ] Prisma ORM com PostgreSQL
- [ ] Autenticação por empresa (empresaId)
- [ ] Validação de dados com Zod ou similar
- [ ] Tratamento de erros padronizado

### Frontend
- [ ] HTML5 + CSS3 + JavaScript (ES6+)
- [ ] Bootstrap ou framework CSS existente
- [ ] Chart.js para gráficos (se necessário)
- [ ] Fetch API para comunicação com backend
- [ ] LocalStorage para autenticação

### Banco de Dados
- [ ] PostgreSQL
- [ ] Estrutura relacional com chaves estrangeiras
- [ ] Índices para performance
- [ ] Migrações versionadas

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Pré-requisitos
- [ ] Backup do banco de dados atual
- [ ] Ambiente de desenvolvimento configurado
- [ ] Acesso ao repositório do projeto
- [ ] Permissões para modificar schema

### ✅ Fase 1 - Estrutura Base
- [ ] Migration criada e executada
- [ ] Schema.prisma atualizado
- [ ] Controllers criados/modificados
- [ ] Rotas configuradas
- [ ] Seed inicial aplicado

### ✅ Fase 2 - Fluxo de Seleção
- [ ] Tela principal de seleção funcionando
- [ ] Tela de subtipos funcionando
- [ ] Navegação integrada
- [ ] novaordem.html atualizado

### ✅ Fase 3 - Sistema de Configuração
- [ ] Página de configuração criada
- [ ] Gestão de preços funcionando
- [ ] Endpoints de configuração funcionando
- [ ] Interface intuitiva

### ✅ Fase 4 - Integração Final
- [ ] Todos os fluxos testados
- [ ] Validações implementadas
- [ ] Performance otimizada
- [ ] Documentação atualizada

---

## 🎯 CRITÉRIOS DE SUCESSO

### Funcionais
- [ ] Usuário pode criar ordem para Carro com seleção de subtipo
- [ ] Usuário pode criar ordem para Moto diretamente
- [ ] Usuário pode criar ordem para Outros com formulário personalizado
- [ ] Serviços são filtrados corretamente por tipo de veículo
- [ ] Preços são aplicados corretamente por categoria
- [ ] Adicionais funcionam globalmente

### Não Funcionais
- [ ] Interface responsiva e intuitiva
- [ ] Performance adequada (< 3s para carregar telas)
- [ ] Nenhum erro de JavaScript no console
- [ ] Dados persistidos corretamente no banco
- [ ] Segurança mantida (autenticação por empresa)

### de Negócio
- [ ] Redução de erros na criação de ordens
- [ ] Tempo médio de criação de ordem reduzido
- [ ] Satisfação do usuário aumentada
- [ ] Gestão de serviços facilitada
- [ ] Sistema preparado para expansão

---

## 📝 NOTAS IMPORTANTES

### Manutenção da Compatibilidade
- Manter todas as funcionalidades existentes
- Não quebrar ordens de serviço já criadas
- Manter estrutura de dados existente com novas colunas
- Preservar autenticação e permissões

### Performance
- Adicionar índices no banco de dados para consultas frequentes
- Implementar cache para tipos de veículo e serviços
- Otimizar queries para evitar N+1 problems
- Implementar lazy loading para telas complexas

### Segurança
- Validar todos os inputs do usuário
- Implementar sanitização de dados
- Manter autenticação por empresa em todos os endpoints
- Adicionar logs para auditoria

### Escalabilidade
- Estruturar código para fácil adição de novos tipos de veículo
- Criar componentes reutilizáveis
- Implementar sistema de permissões flexível
- Preparar para internacionalização (i18n)

---

## 🚀 PRÓXIMOS PASSOS

### Imediatos
1. Revisar este plano com o time
2. Priorizar fases baseado em disponibilidade
3. Configurar ambiente de desenvolvimento
4. Iniciar Fase 1

### Futuros
1. Adicionar integração com pagamento
2. Implementar agendamento de serviços
3. Criar dashboard analítico
4. Desenvolver app mobile
5. Adicionar integração com terceiros

---

**Documento criado em:** 24/09/2025  
**Versão:** 1.0  
**Status:** Planejamento  
**Próxima revisão:** Após implementação da Fase 1
