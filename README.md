# 🚀 Lina X - Sistema para Lava Jato

![Lina X](https://img.shields.io/badge/Lina%20X-Sistema%20para%20Lava%20Jato-7F56D9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTE5LjM2IDIuMDhsLTEuNzQgMi4xOUMxOS4wNyA1LjYyIDE5IDcuMjUgMTkgOC45OFYxOWMwIDAuNTUtMC40NSAxLTEgMWgtMWMtMC41NSAwLTEtMC40NS0xLTFWOC45OGMwLTEuMS0wLjU0LTIuMS0xLjM4LTIuNzJMOS4zMyAyLjU5Yy0wLjgxLTAuNTktMS44Ni0wNTktMi42NyAwTDQuMDQgNC4yN0MzLjUgNC44MyAzLjI1IDUuNTcgMy4yNSA2LjM1VjE5YzAgMC41NS0wLj00IDEuMDEtMC41IDEuNDlsLTAuNSAxLjQ5QzIgMjEuOTggMiA1MjIgMiA1MjJoMjBjMC0wLjAxIDAtMC4wMi0wLjA1LTAuNTFsLTAuNS0xLjQ5QzE5LjQ0IDE5Ljk5IDE5IDE5LjU1IDE5IDE5VjguOThjMC0xLjczLTAuOTMtMy4zNi0yLjM2LTMuOTJ6TTUgMTloMTBWOEMxNSAzLjU4IDEwLjczIDIgOC4xMiAyYy0xLjM4IDAtMi42MyAwLjU5LTMuNDQgMS41TDUgMy45OFYxOXoiLz48L3N2Zz4=)

O Lina X é um sistema de gestão completo e moderno para lava jatos, projetado para otimizar a operação diária, desde a criação de ordens de serviço até o acompanhamento financeiro e de desempenho dos funcionários.

## ✨ Principais Funcionalidades

*   **Gestão de Ordens de Serviço**: Crie, edite, atualize o status e gerencie o ciclo de vida completo das ordens de serviço.
*   **Fluxo de Nova Ordem Inteligente**: Um fluxo guiado que começa pela seleção do tipo de veículo (Carro, Moto, etc.) e subtipo (Hatch, Sedan, SUV), garantindo a precificação correta e agilidade no atendimento.
*   **Gestão de Clientes e Veículos**: Cadastro completo de clientes e seus veículos. A busca inteligente por placa ou nome facilita a identificação e evita duplicidade de dados.
*   **Gestão de Funcionários (Lavadores)**: Acompanhe o desempenho individual, calcule comissões e gere links públicos para que cada lavador possa visualizar suas ordens e ganhos diários.
*   **Controle Financeiro**: Dashboard com estatísticas de faturamento, ticket médio, serviços mais populares e pagamentos pendentes.
*   **Configurações Flexíveis**: Cadastre serviços, adicionais e defina preços específicos por categoria de veículo, adaptando o sistema à realidade do seu negócio.
*   **Interface Moderna**: Design inspirado no Windows 11, com cantos arredondados, efeitos de transparência e uma experiência de usuário intuitiva.

---

## 🛠️ Tecnologias Utilizadas

O projeto é dividido em duas partes principais: o backend (API) e o frontend (interface do usuário).

### Backend
*   **Node.js**: Ambiente de execução para o servidor.
*   **Express**: Framework para a construção da API REST.
*   **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
*   **Prisma**: ORM (Object-Relational Mapper) para interação com o banco de dados.
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

# 4. Execute as migrações do Prisma para criar as tabelas no banco
npx prisma migrate dev

# 5. (Opcional) Execute o seed para popular o banco com dados iniciais
npx prisma db seed

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

