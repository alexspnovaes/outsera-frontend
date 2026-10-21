# Golden Raspberry Awards — Frontend

Aplicação web para consultar os indicados e vencedores da categoria Pior Filme do Golden Raspberry Awards. Desenvolvida com React, TypeScript e Vite, consome uma API REST e apresenta os dados em duas telas: visão geral e lista de filmes.

## Funcionalidades

A visão geral reúne quatro painéis:

- Anos em que mais de um filme venceu a premiação.
- Os três estúdios com mais vitórias, ordenados pelo total de filmes vencedores.
- Produtores com o maior e o menor intervalo entre vitórias consecutivas, incluindo todos os empates retornados pela API.
- Consulta dos filmes vencedores de um ano informado.

A lista de filmes apresenta 15 registros por página e permite combinar os filtros de ano e vencedor. Alterar ou limpar um filtro retorna à primeira página. O ano deve ter quatro dígitos, entre 1000 e 9999; entradas incompletas ou inválidas não geram consultas. No painel de vencedores, a busca ocorre ao enviar o formulário.

Cada consulta possui estados de carregamento, erro e ausência de resultados. Em caso de erro, o botão **Tentar novamente** repete a consulta. Os painéis da visão geral carregam de forma independente.

## Requisitos

- Node.js 22.12 ou superior na linha 22, ou Node.js 24.
- npm, incluído na instalação do Node.js.
- API disponível: o [backend Go deste projeto](https://github.com/alexspnovaes/outsera-backend) ou um serviço compatível com os mesmos endpoints.

## Execução local

Clone o repositório e instale as dependências a partir do arquivo de lock:

```sh
git clone https://github.com/alexspnovaes/outsera-frontend.git
cd outsera-frontend
npm ci
npm run dev
```

Com a porta padrão disponível, acesse `http://localhost:5173`. Inicie também o backend Go em `http://localhost:8080`, seguindo as instruções do repositório correspondente.

A configuração padrão consulta `/api/movies`. Durante o desenvolvimento, o proxy configurado em `vite.config.ts` encaminha as requisições de `/api` ao backend em `http://localhost:8080`.

## Configuração da API

Para utilizar outra API, copie `.env.example` para `.env.local`.

No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

No Linux ou macOS:

```sh
cp .env.example .env.local
```

Defina a URL base completa do recurso de filmes. Por exemplo, para consultar o serviço remoto da avaliação:

```dotenv
VITE_API_BASE_URL=https://challenge.outsera.tech/api/movies
```

Para voltar ao backend local, utilize:

```dotenv
VITE_API_BASE_URL=/api/movies
```

Reinicie o Vite após alterar o arquivo de ambiente. Uma API em outro domínio precisa permitir as requisições do navegador por CORS. Variáveis com o prefixo `VITE_` são públicas e incorporadas ao código enviado ao navegador; não devem conter senhas, tokens ou outros segredos.

## Organização do código

- `src/App.tsx`: estrutura da aplicação e navegação entre `#dashboard` e `#movies`, com suporte a links diretos e ao histórico do navegador.
- `src/screens/Dashboard.tsx`: os quatro painéis da visão geral e a validação da consulta por ano.
- `src/screens/MovieList.tsx`: listagem, filtros combinados e paginação.
- `src/api.ts`: cliente HTTP centralizado, parâmetros de consulta e URL base da API.
- `src/types.ts`: contratos TypeScript das respostas da API.
- `src/hooks/useResource.ts`: ciclo das consultas, cancelamento e repetição após falha.
- `src/components/DataState.tsx`: apresentação dos estados de carregamento, erro e resultado vazio.
- `src/components/MovieTable.tsx`: tabela de filmes compartilhada pelas telas.
- `src/styles.css`: estilos e adaptação da interface a diferentes tamanhos de tela.
- `src/test/`: testes automatizados, dados de exemplo e configuração do ambiente de testes.

O estado permanece nos componentes que o utilizam, sem biblioteca adicional de gerenciamento de estado. A navegação utiliza o fragmento da URL e dispensa uma dependência de roteamento. Os componentes compartilham o cliente HTTP e o hook de consulta para manter o tratamento de respostas consistente.

O hook `useResource` utiliza `AbortController` para cancelar consultas ao alterar filtros ou desmontar a tela. Uma guarda adicional ignora respostas que perderam validade, evitando que uma resposta antiga substitua os dados da consulta atual.

A interface utiliza tabelas semânticas, rótulos associados aos filtros, indicadores de estado e navegação por teclado, incluindo um atalho para o conteúdo principal.

## Testes e verificações

Execute os testes, a verificação de formatação e o build:

```sh
npm test
npm run format:check
npm run build
```

Os testes utilizam Vitest e React Testing Library. Cobrem o contrato do cliente HTTP, paginação, filtros, busca por ano, empates, navegação, estados vazios, falhas, repetição de consultas e respostas fora de ordem. O `fetch` é simulado, permitindo executar a suíte sem depender da disponibilidade da API externa.

Para executar os testes em modo de acompanhamento:

```sh
npm run test:watch
```

O build verifica os tipos com TypeScript e gera os arquivos estáticos em `dist/`. Para conferir o resultado localmente após o build:

```sh
npm run preview
```

Com a porta padrão disponível, a prévia abre em `http://localhost:4173`. A configuração atual do Vite também aplica o proxy de `/api` à prévia, portanto o backend local precisa estar em execução quando essa for a URL base selecionada.

## Publicação

Publique o conteúdo de `dist/` em um servidor de arquivos estáticos. A URL definida em `VITE_API_BASE_URL` é incorporada durante o build; alterações nessa configuração exigem um novo `npm run build`.

Para utilizar uma API em outro domínio, configure a URL pública antes do build e habilite CORS na API. Para manter a URL relativa `/api/movies`, configure o servidor de hospedagem para encaminhar `/api` ao backend. O proxy do Vite atende ao desenvolvimento e à prévia local; a hospedagem de `dist/` precisa ter seu próprio encaminhamento.
