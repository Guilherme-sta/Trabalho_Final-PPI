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
│   ├── db.js        # Configuracao e criacao das tabelas do banco de dados
│   └── index.js     # Servidor Express com todos os endpoints da API
│
├── docs/
│   ├── index.html            # Pagina principal — listagem e gerenciamento de torneios
│   ├── partidas.html         # Pagina de partidas de um torneio especifico
│   ├── listar-partidas.html  # Pagina com todas as partidas de todos os torneios
│   ├── estilos.css           # Estilizacao global e tema dark/light
│   └── scripts/
│       ├── torneios.js         # Logica da pagina de torneios
│       ├── partidas.js         # Logica da pagina de partidas
│       └── listar-partidas.js  # Logica da pagina de listagem geral
│
├── vercel.json    # Configuracao de deploy da API na Vercel
├── package.json   # Dependencias do projeto
├── package-lock.json   
└── .gitignore
```

---

## 4. Tabelas do Banco de Dados

### torneios

| Coluna      | Tipo   | Descricao                                           |
|-------------|--------|-----------------------------------------------------|
| id          | SERIAL | Chave primaria, autoincrementada                    |
| nome        | TEXT   | Nome do torneio (obrigatorio)                       |
| jogo        | TEXT   | Jogo do torneio (obrigatorio)                       |
| formato     | TEXT   | Formato da competicao (obrigatorio)                 |
| status      | TEXT   | Status atual: aberto, em_andamento ou encerrado     |
| dataCriacao | TEXT   | Data e hora de criacao (preenchida automaticamente) |

### partidas

| Coluna      | Tipo    | Descricao                                    |
|-------------|---------|----------------------------------------------|
| id          | SERIAL  | Chave primaria, autoincrementada             |
| torneioId   | INTEGER | Chave estrangeira referenciando torneios(id) |
| timeA       | TEXT    | Nome do primeiro time (obrigatorio)          |
| timeB       | TEXT    | Nome do segundo time (obrigatorio)           |
| placarA     | INTEGER | Pontuacao do time A (padrao 0)               |
| placarB     | INTEGER | Pontuacao do time B (padrao 0)               |
| dataPartida | TEXT    | Data da partida (obrigatorio)                |
| status      | TEXT    | Status: agendada, finalizada ou cancelada    |

---

## 5. Endpoints da API

Base URL: `https://trabalho-final-ppi-kappa-two.vercel.app`

### Torneios

| Metodo | Rota                 | Descricao                                                              |
|--------|----------------------|------------------------------------------------------------------------|
| GET    | /torneios            | Lista todos os torneios. Aceita `?ordem=recentes`, `nome` ou `status` |
| GET    | /torneios/:id        | Retorna um torneio pelo ID                                             |
| POST   | /torneios            | Cria um novo torneio                                                   |
| PUT    | /torneios/:id        | Atualiza todos os dados de um torneio                                  |
| PATCH  | /torneios/:id/status | Atualiza apenas o status de um torneio                                 |
| DELETE | /torneios/:id        | Remove um torneio e todas as suas partidas                             |

### Partidas

| Metodo | Rota                                  | Descricao                                                             |
|--------|---------------------------------------|-----------------------------------------------------------------------|
| GET    | /torneios/:id/partidas                | Lista partidas de um torneio. Aceita `?ordem=data`, `placar` ou `status` |
| GET    | /torneios/:id/partidas/:pid           | Retorna uma partida pelo ID                                           |
| POST   | /torneios/:id/partidas                | Agenda uma nova partida                                               |
| PATCH  | /torneios/:id/partidas/:pid/resultado | Registra o placar e finaliza a partida                                |
| PATCH  | /torneios/:id/partidas/:pid/cancelar  | Cancela uma partida agendada                                          |
| DELETE | /torneios/:id/partidas/:pid           | Remove uma partida                                                    |

---

## 6. Como Iniciar o Projeto Localmente

**Pre-requisitos**
- Node.js instalado (versao 18 ou superior)
- npm instalado
- Uma connection string do Neon (ou outro PostgreSQL)

**Passos**

1. Clone o repositorio:

```bash
git clone https://github.com/Guilherme-sta/Trabalho_Final-PPI.git
cd Trabalho_Final-PPI
```

2. Instale as dependencias:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz com a connection string do banco:

DATABASE_URL = `postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require`

4. Inicie o servidor:

```bash
node back-end/index.js
```

O servidor estara rodando em `http://localhost:3000`. As tabelas sao criadas automaticamente na primeira execucao.

5. Abra o front-end:

Abra o arquivo `docs/index.html` diretamente no navegador ou utilize a extensao Live Server do VS Code apontando para a pasta `docs`.

---

## 7. Links do Projeto

- Video de apresentacao: https://drive.google.com/file/d/13-YVLUFt9VPFjtihKb-Sd3XWdqtaATGf/view?usp=sharing
- Site hospedado: https://guilherme-sta.github.io/Trabalho_Final-PPI/
