# ArenaADS — Sistema de Gerenciamento de Torneios

## 1. Descricao do Projeto

ArenaADS e um sistema web para gerenciamento de torneios e partidas. A aplicacao permite cadastrar torneios, acompanhar seu status, agendar partidas entre times, registrar resultados e manter um historico completo de cada competicao.

Este projeto foi desenvolvido como trabalho final da disciplina de Programacao para Internet, ministrada pelo professor Ely Miranda, pelos seguintes integrantes:

- Nicolas Damasceno
- Guilherme Alves
- Marcos Gabriel

---

## 2. Tecnologias Utilizadas

**Front-end**

- HTML5 — estrutura das paginas
- CSS3 — estilizacao e tema dark/light
- JavaScript — logica de interacao e consumo da API
- DOM API — manipulacao dinamica da interface
- localStorage — persistencia de preferencias do usuario e cache offline

**Back-end**
- Node.js — ambiente de execucao
- Express — framework para criacao da API REST
- @neondatabase/serverless — driver de conexao com o PostgreSQL
- cors — liberacao de requisicoes entre origens diferentes

**Banco de Dados**
- PostgreSQL (Neon) — banco de dados relacional na nuvem

**Hospedagem**
- Vercel — deploy da API
- GitHub Pages — hospedagem do front-end

---

## 3. Estrutura de Arquivos

```
/
├── back-end/
│   ├── db.js          # Configuracao e criacao das tabelas do banco de dados
│   ├── index.js       # Servidor Express com todos os endpoints da API
│   ├── package.json   # Dependencias do back-end
│   └── arena_ads.db   # Banco de dados SQLite (gerado automaticamente, nao versionado)
│
├── front-end/
│   ├── index.html         # Pagina principal — listagem e gerenciamento de torneios
│   ├── partidas.html      # Pagina de partidas de um torneio
│   ├── estilos.css        # Estilizacao global e tema dark/light
│   └── scripts/
│       ├── torneios.js    # Logica da pagina de torneios
│       └── partidas.js    # Logica da pagina de partidas
│
└── .gitignore
```

---

## 4. Tabelas do Banco de Dados

### torneios

| Coluna      | Tipo    | Descricao                                          |
|-------------|---------|-----------------------------------------------------|
| id          | INTEGER | Chave primaria, autoincrementada                   |
| nome        | TEXT    | Nome do torneio (obrigatorio)                      |
| jogo        | TEXT    | Jogo do torneio (obrigatorio)                      |
| formato     | TEXT    | Formato da competicao (obrigatorio)                |
| status      | TEXT    | Status atual: aberto, em_andamento ou encerrado    |
| dataCriacao | TEXT    | Data e hora de criacao (preenchida automaticamente)|

### partidas

| Coluna      | Tipo    | Descricao                                               |
|-------------|---------|----------------------------------------------------------|
| id          | INTEGER | Chave primaria, autoincrementada                        |
| torneioId   | INTEGER | Chave estrangeira referenciando torneios(id)            |
| timeA       | TEXT    | Nome do primeiro time (obrigatorio)                     |
| timeB       | TEXT    | Nome do segundo time (obrigatorio)                      |
| placarA     | INTEGER | Pontuacao do time A (padrao 0)                          |
| placarB     | INTEGER | Pontuacao do time B (padrao 0)                          |
| dataPartida | TEXT    | Data da partida (obrigatorio)                           |
| status      | TEXT    | Status: agendada, finalizada ou cancelada               |

---

## 5. Endpoints da API

Base URL: `http://localhost:3000`

### Torneios

| Metodo | Rota                     | Descricao                                          |
|--------|--------------------------|----------------------------------------------------|
| GET    | /torneios                | Lista todos os torneios. Aceita `?ordem=recentes`, `nome` ou `status` |
| GET    | /torneios/:id            | Retorna um torneio pelo ID                         |
| POST   | /torneios                | Cria um novo torneio                               |
| PUT    | /torneios/:id            | Atualiza todos os dados de um torneio              |
| PATCH  | /torneios/:id/status     | Atualiza apenas o status de um torneio             |
| DELETE | /torneios/:id            | Remove um torneio e todas as suas partidas         |

### Partidas

| Metodo | Rota                                          | Descricao                                        |
|--------|-----------------------------------------------|--------------------------------------------------|
| GET    | /torneios/:id/partidas                        | Lista partidas de um torneio. Aceita `?ordem=data`, `placar` ou `status` |
| GET    | /torneios/:id/partidas/:pid                   | Retorna uma partida pelo ID                      |
| POST   | /torneios/:id/partidas                        | Agenda uma nova partida                          |
| PATCH  | /torneios/:id/partidas/:pid/resultado         | Registra o placar e finaliza a partida           |
| PATCH  | /torneios/:id/partidas/:pid/cancelar          | Cancela uma partida agendada                     |
| DELETE | /torneios/:id/partidas/:pid                   | Remove uma partida                               |

---

## 6. Como Iniciar o Projeto Localmente

**Pre-requisitos**

- Node.js instalado (versao 18 ou superior)
- npm instalado

**Passos**

1. Clone o repositorio:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

2. Instale as dependencias do back-end:

```bash
cd back-end
npm install
```

3. Inicie o servidor:

```bash
node index.js
```

O servidor estara rodando em `http://localhost:3000`. O banco de dados `arena_ads.db` sera criado automaticamente na primeira execucao.

4. Abra o front-end:

Abra o arquivo `front-end/index.html` diretamente no navegador ou utilize a extensao Live Server do VS Code apontando para a pasta `front-end`.

---

## 7. Links do Projeto

- Video de apresentacao: (adicionar link aqui)
- Site hospedado: (adicionar link aqui)
