# Histórico de Mudanças Recentes (Outubro 2025)

Este documento detalha as principais atualizações e melhorias implementadas no sistema Lina X, com foco no novo fluxo de ordens e na modernização da interface.

---

## ✨ Novo Design e Experiência do Usuário (UX)

A interface do sistema foi completamente redesenhada para ser mais moderna, intuitiva e alinhada com as últimas tendências de design, inspirada no Windows 11.

### Principais Melhorias Visuais:
- **Estilo Windows 11**: Adotamos um design com cantos arredondados, efeitos de transparência (glassmorphism) e sombras suaves para criar uma aparência limpa e agradável.
- **Navegação Simplificada**: O fluxo para criar uma nova ordem de serviço foi otimizado, começando pela seleção do tipo de veículo, o que torna o processo mais rápido e lógico.
- **Componentes Unificados**: Padronizamos botões, formulários e modais em todo o sistema para garantir consistência visual e funcional.
- **Feedback Visual**: Adicionamos animações e transições sutis para fornecer feedback claro sobre as ações do usuário, como cliques e salvamentos.

### Páginas Atualizadas:
- **`selecionar-tipo-veiculo.html`**: Nova tela que serve como ponto de partida para a criação de ordens, permitindo escolher entre "Carro", "Moto" e "Outros".
- **`selecionar-subtipo-carro.html`**: Tela intermediária para a categoria "Carro", onde o usuário especifica o subtipo (Hatch, Sedan, SUV, etc.), garantindo a precificação correta.
- **`novaordem.html`**: O formulário de nova ordem foi redesenhado para se adaptar dinamicamente ao tipo e subtipo de veículo selecionado, exibindo apenas os serviços e preços relevantes.
- **`clientes.html`**: A página de edição de clientes agora exibe os veículos associados, permitindo editar ou excluir placas diretamente na mesma tela, com um único botão "Salvar" para todas as alterações.

---

## 🚀 Novas Funcionalidades

### Fluxo de Ordens por Tipo de Veículo:
- **Seleção Guiada**: O novo fluxo guia o usuário passo a passo, começando pelo tipo de veículo, para filtrar serviços e preços de forma inteligente.
- **Precificação Dinâmica**: Os preços dos serviços agora são baseados na categoria do veículo (Carro, Moto) e, no caso de carros, no seu subtipo (Hatch, Sedan, etc.).
- **Serviços Personalizados ("Outros")**: Adicionamos um fluxo para serviços que não se encaixam nas categorias padrão, permitindo inserir uma descrição e um valor manualmente.

### Melhorias na Gestão de Clientes e Veículos:
- **Busca Inteligente**: Ao criar uma ordem, a busca por placa preenche automaticamente os dados do cliente e do veículo. Se a placa for nova, é possível associá-la a um cliente existente.
- **Identificação Facilitada**: Na busca de clientes por nome, o sistema agora mostra os modelos dos veículos associados (ex: "Carlos (Civic, Corolla)"), ajudando a evitar a criação de clientes duplicados.

---

## ⚡ Melhorias de Performance e Estabilidade

- **Otimização de Consultas**: As consultas ao banco de dados foram revisadas para serem mais eficientes, especialmente nos filtros de serviços por tipo de veículo.
- **Código Refatorado**: O código do frontend foi refatorado para ser mais modular e reutilizável, facilitando a manutenção e a implementação de novas funcionalidades.
- **Tratamento de Erros**: Melhoramos o tratamento de erros no backend e no frontend para fornecer mensagens mais claras e evitar que o sistema quebre inesperadamente.

---

## 🏗️ Mudanças na Estrutura do Banco de Dados

Para suportar o novo fluxo de ordens, fizemos as seguintes alterações no banco de dados:

- **Nova Tabela `TipoVeiculo`**:
  - Armazena as categorias principais ("Carro", "Moto", "Outros") e os subtipos de veículos ("Hatch", "Sedan", etc.).
  - Campos: `id`, `nome`, `categoria`, `descricao`, `ativo`.

- **Tabela `Servico` Modificada**:
  - Adicionamos a coluna `tipoVeiculoId` para associar cada serviço a um tipo de veículo específico.
  - Isso permite que o sistema filtre e exiba apenas os serviços relevantes para a seleção do usuário.

- **Nova Migration**:
  - `20250924000000_add_tipo_veiculo_to_servicos`: Migration que aplica as mudanças acima no banco de dados.

---

## 🔮 Próximos Passos

- **Dashboard Financeiro**: Aprimorar os gráficos e relatórios para refletir as novas categorias de veículos.
- **Agendamento de Serviços**: Implementar um sistema de agendamento online.
- **Aplicativo Mobile**: Iniciar o desenvolvimento de uma versão mobile do sistema para lavadores e gestores.

---
*Este changelog reflete o estado do projeto em 05 de Outubro de 2025.*
