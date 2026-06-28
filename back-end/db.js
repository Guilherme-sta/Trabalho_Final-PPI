const Database = require('better-sqlite3');
const db = new Database('arena_ads.db');

db.pragma('foreign_keys = ON');

const sqlSchema = `
CREATE TABLE IF NOT EXISTS torneios (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL,
    jogo        TEXT    NOT NULL,
    formato     TEXT    NOT NULL,
    status      TEXT    DEFAULT 'aberto',
    dataCriacao TEXT    DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS partidas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    torneioId   INTEGER NOT NULL REFERENCES torneios(id) ON DELETE CASCADE,
    timeA       TEXT    NOT NULL,
    timeB       TEXT    NOT NULL,
    placarA     INTEGER DEFAULT 0,
    placarB     INTEGER DEFAULT 0,
    dataPartida TEXT    NOT NULL,
    status      TEXT    DEFAULT 'agendada'
);
`;

db.exec(sqlSchema);
module.exports = db;