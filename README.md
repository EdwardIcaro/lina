# 🚀 Lina X - Sistema para Lava Jato

O Lina X é um sistema de gestão completo e moderno para lava jatos, projetado para otimizar a operação diária, desde a criação de ordens de serviço até o acompanhamento financeiro e de desempenho dos funcionários.

## ✨ Principais Funcionalidades

*   **Dashboard Inteligente**: Visão geral do dia com faturamento, total de ordens, ordens em andamento e concluídas.
*   **Gestão de Ordens de Serviço**: Ciclo completo de ordens, desde a criação até a finalização e pagamento, com status visuais (Pendente, Em Andamento, Finalizado).
*   **Fluxo de Nova Ordem Otimizado**: Processo guiado que começa pela seleção do tipo e subtipo de veículo, garantindo a precificação correta e agilidade no atendimento.
*   **Gestão de Clientes (CRM)**: Cadastro completo de clientes e seus veículos. Ficha detalhada com histórico de gastos, última visita, serviços mais utilizados e pendências.
*   **Gestão de Funcionários (Lavadores)**:
    *   Acompanhamento de desempenho individual.
    *   Cálculo e fechamento de comissões, com abatimento automático de adiantamentos.
    *   Geração de links públicos para que cada lavador visualize suas ordens e ganhos diários.
*   **Controle Financeiro Completo**:
    *   Registro de entradas (pagamentos de OS) e saídas (despesas, sangrias, adiantamentos).
    *   Fechamento de caixa diário com conferência de valores (Dinheiro, PIX, Cartão).
    *   Histórico de movimentações com filtros avançados por data, tipo e forma de pagamento.
    *   Gestão de pagamentos pendentes com opção de quitação direta na tela financeira.
*   **Configurações Flexíveis**:
    *   Cadastro de serviços e adicionais com preços específicos por categoria de veículo.
    *   Definição do horário de funcionamento do lava jato para alinhamento dos relatórios.
*   **Interface Moderna e Intuitiva**: Design inspirado no Windows 11, com tema claro e escuro, focado na usabilidade e com notificações "toast" para feedback do usuário.

---

## 🛠️ Tecnologias Utilizadas

O projeto é dividido em duas partes principais: o backend (API) e o frontend (interface do usuário).

### Backend
*   **Node.js**: Ambiente de execução para o servidor.
*   **Express**: Framework para a construção da API REST.
*   **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
*   **Prisma**: ORM (Object-Relational Mapper) moderno para interação com o banco de dados.
*   **PostgreSQL**: Banco de dados relacional utilizado para persistir os dados.

### Frontend
*   **HTML5, CSS3, JavaScript (ES6+)**: A base da interface do usuário, sem a necessidade de frameworks complexos.
*   **Font Awesome**: Biblioteca de ícones para uma interface mais rica.
*   **API Fetch**: Utilizada para a comunicação com o backend.

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e rodar o Lina X em seu ambiente local.

### Pré-requisitos

*   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
*   [PostgreSQL](https://www.postgresql.org/download/) instalado e em execução.
*   Um editor de código, como o [VS Code](https://code.visualstudio.com/).

### 1. Configuração do Backend

```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Instale as dependências do projeto
npm install

# 3. Configure o arquivo .env com a string de conexão do seu banco de dados
# Exemplo de .env:
# DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/linax?schema=public"
# SECRET_KEY="sua-chave-secreta-para-jwt"

# 4. Aplique o schema do Prisma ao seu banco de dados.
npx prisma db push

# 5. (Opcional) Gere o cliente Prisma manualmente se necessário
npx prisma generate

# 6. Inicie o servidor em modo de desenvolvimento
npm run dev
```
O servidor backend estará rodando em `http://localhost:3001`.

### 2. Execução do Frontend

O frontend é composto por arquivos estáticos (`.html`, `.css`, `.js`).

1.  Navegue até a pasta `DESKTOPV2`.
2.  A maneira mais fácil de executar é usando uma extensão de servidor local no seu editor, como o **Live Server** para VS Code.
3.  Com o Live Server, clique com o botão direito no arquivo `login.html` e selecione "Open with Live Server".
4.  O sistema será aberto no seu navegador.

---

## 📁 Estrutura do Projeto
```
LinaX/
├── backend/         # Contém toda a lógica da API (Node.js, Express, Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── ...
│   └── prisma/
│       ├── migrations/
│       └── schema.prisma
├── DESKTOPV2/       # Contém todos os arquivos da interface do usuário (Frontend)
│   ├── js/
│   ├── index.html
│   ├── ordens.html
│   └── ...
└── README.md        # Este arquivo
```
