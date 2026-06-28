const {neon} = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function initDb() {
    await sql`
        CREATE TABLE IF NOT EXISTS torneios (
            id           SERIAL PRIMARY KEY,
            nome         TEXT    NOT NULL,
            jogo         TEXT    NOT NULL,
            formato      TEXT    NOT NULL,
            status       TEXT    DEFAULT 'aberto',
            "dataCriacao" TEXT   DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
        )
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS partidas (
            id           SERIAL PRIMARY KEY,
            "torneioId"  INTEGER NOT NULL REFERENCES torneios(id) ON DELETE CASCADE,
            "timeA"      TEXT    NOT NULL,
            "timeB"      TEXT    NOT NULL,
            "placarA"    INTEGER DEFAULT 0,
            "placarB"    INTEGER DEFAULT 0,
            "dataPartida" TEXT   NOT NULL,
            status       TEXT    DEFAULT 'agendada'
        )
    `;
}
 
module.exports = {sql,initDb};