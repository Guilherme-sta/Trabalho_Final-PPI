const express = require('express');
const cors = require('cors');
const {sql,initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════
// TORNEIOS
// ═══════════════════════════════════════════

// GET /torneios?ordem=recentes|nome|status
app.get('/torneios',async(req,res) => {
    try {
        const ordens = {
            recentes : '"dataCriacao" DESC',
            nome : 'nome ASC',
            status : 'status ASC, "dataCriacao" DESC',
        };
        const col = ordens[req.query.ordem] || '"dataCriacao" DESC';
        const lista = await sql(`SELECT * FROM torneios ORDER BY ${col}`);
        res.json(lista);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao listar torneios', erro: e.message });
    }
});

// GET /torneios/:id
app.get('/torneios/:id',async(req,res) => {
    try {
        const [t] = await sql`SELECT * FROM torneios WHERE id = ${req.params.id}`;
        if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });
        res.json(t);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao buscar torneio', erro: e.message });
    }
});

// POST /torneios
app.post('/torneios',async(req,res) => {
    const {nome,jogo,formato } = req.body;

    if (!nome || nome.trim() === '') return res.status(400).json({ mensagem: 'Nome é obrigatório' });
    if (!jogo || jogo.trim() === '') return res.status(400).json({ mensagem: 'Jogo é obrigatório' });
    if (!formato || formato.trim() === '') return res.status(400).json({ mensagem: 'Formato é obrigatório' });

    try {
        const [novo] = await sql`
            INSERT INTO torneios (nome, jogo, formato)
            VALUES (${nome.trim()}, ${jogo.trim()}, ${formato.trim()})
            RETURNING *
        `;
        res.status(201).json(novo);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao criar torneio', erro: e.message });
    }
});

// PUT /torneios/:id
app.put('/torneios/:id',async(req,res) => {
    const {nome,jogo,formato,status} = req.body;

    if (!nome || !jogo || !formato || !status)
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios no PUT' });

    try {
        const [t] = await sql`SELECT id FROM torneios WHERE id = ${req.params.id}`;
        if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });

        const [atualizado] = await sql`
            UPDATE torneios
            SET nome = ${nome.trim()}, jogo = ${jogo.trim()},
                formato = ${formato.trim()}, status = ${status}
            WHERE id = ${req.params.id}
            RETURNING *
        `;
        res.json(atualizado);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao atualizar torneio', erro: e.message });
    }
});

// PATCH /torneios/:id/status
app.patch('/torneios/:id/status',async(req,res) => {
    const validos = ['aberto','em_andamento','encerrado'];
    const { status } = req.body;

    if (!status || !validos.includes(status))
        return res.status(400).json({ mensagem: `Status deve ser: ${validos.join(', ')}` });

    try {
        const [t] = await sql`SELECT id FROM torneios WHERE id = ${req.params.id}`;
        if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });

        const [atualizado] = await sql`
            UPDATE torneios SET status = ${status}
            WHERE id = ${req.params.id}
            RETURNING *
        `;
        res.json(atualizado);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao atualizar status', erro: e.message });
    }
});

// DELETE /torneios/:id
app.delete('/torneios/:id',async(req,res) => {
    try {
        const [t] = await sql`SELECT id FROM torneios WHERE id = ${req.params.id}`;
        if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });
        await sql`DELETE FROM torneios WHERE id = ${req.params.id}`;
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao excluir torneio', erro: e.message });
    }
});

// ═══════════════════════════════════════════
// PARTIDAS
// ═══════════════════════════════════════════

// GET /torneios/:id/partidas?ordem=data|placar|status
app.get('/torneios/:id/partidas',async(req,res) => {
    try {
        const [t] = await sql`SELECT id FROM torneios WHERE id = ${req.params.id}`;
        if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });

        const ordens = {
            data : '"dataPartida" DESC',
            placar : '("placarA" + "placarB") DESC',
            status : 'status ASC, "dataPartida" DESC',
        };
        const col = ordens[req.query.ordem] || '"dataPartida" DESC';
        const lista = await sql(`SELECT * FROM partidas WHERE "torneioId" = $1 ORDER BY ${col}`, [req.params.id]);
        res.json(lista);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao listar partidas', erro: e.message });
    }
});

// GET /torneios/:id/partidas/:pid
app.get('/torneios/:id/partidas/:pid',async(req,res) => {
    try {
        const [p] = await sql`
            SELECT * FROM partidas
            WHERE id = ${req.params.pid} AND "torneioId" = ${req.params.id}
        `;
        if (!p) return res.status(404).json({ mensagem: 'Partida não encontrada' });
        res.json(p);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao buscar partida', erro: e.message });
    }
});

// POST /torneios/:id/partidas
app.post('/torneios/:id/partidas',async(req,res) => {
    const { timeA, timeB, dataPartida } = req.body;

    if (!timeA || timeA.trim() === '')
        return res.status(400).json({ mensagem: 'Time A é obrigatório' });
    if (!timeB || timeB.trim() === '')
        return res.status(400).json({ mensagem: 'Time B é obrigatório' });
    if (!dataPartida)
        return res.status(400).json({ mensagem: 'Data da partida é obrigatória' });
    if (timeA.trim().toLowerCase() === timeB.trim().toLowerCase())
        return res.status(400).json({ mensagem: 'Time A e Time B não podem ser iguais' });

    try {
        const [t] = await sql`SELECT id FROM torneios WHERE id = ${req.params.id}`;
        if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });

        const [conflito] = await sql`
            SELECT id FROM partidas
            WHERE "torneioId" = ${req.params.id}
              AND "dataPartida" = ${dataPartida}
              AND status != 'cancelada'
              AND ("timeA" = ${timeA.trim()} OR "timeB" = ${timeA.trim()}
                OR "timeA" = ${timeB.trim()} OR "timeB" = ${timeB.trim()})
        `;
        if (conflito)
            return res.status(409).json({ mensagem: 'Um dos times já tem partida neste torneio nesta data' });

        const [nova] = await sql`
            INSERT INTO partidas ("torneioId", "timeA", "timeB", "dataPartida")
            VALUES (${req.params.id}, ${timeA.trim()}, ${timeB.trim()}, ${dataPartida})
            RETURNING *
        `;
        res.status(201).json(nova);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao criar partida', erro: e.message });
    }
});

// PATCH /torneios/:id/partidas/:pid/resultado
app.patch('/torneios/:id/partidas/:pid/resultado',async(req,res) => {
    const { placarA, placarB } = req.body;

    if (placarA === undefined || placarB === undefined)
        return res.status(400).json({ mensagem: 'placarA e placarB são obrigatórios' });
    if (Number(placarA) < 0 || Number(placarB) < 0)
        return res.status(400).json({ mensagem: 'Placar não pode ser negativo' });

    try {
        const [p] = await sql`
            SELECT * FROM partidas
            WHERE id = ${req.params.pid} AND "torneioId" = ${req.params.id}
        `;
        if (!p) return res.status(404).json({ mensagem: 'Partida não encontrada' });
        if (p.status === 'cancelada')
            return res.status(409).json({ mensagem: 'Partida cancelada não pode ter resultado' });

        const [atualizada] = await sql`
            UPDATE partidas
            SET "placarA" = ${Number(placarA)}, "placarB" = ${Number(placarB)}, status = 'finalizada'
            WHERE id = ${p.id}
            RETURNING *
        `;
        res.json(atualizada);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao registrar resultado', erro: e.message });
    }
});

// PATCH /torneios/:id/partidas/:pid/cancelar
app.patch('/torneios/:id/partidas/:pid/cancelar',async(req,res) => {
    try {
        const [p] = await sql`
            SELECT * FROM partidas
            WHERE id = ${req.params.pid} AND "torneioId" = ${req.params.id}
        `;
        if (!p) return res.status(404).json({ mensagem: 'Partida não encontrada' });
        if (p.status === 'finalizada')
            return res.status(409).json({ mensagem: 'Partida já finalizada não pode ser cancelada' });

        const [atualizada] = await sql`
            UPDATE partidas SET status = 'cancelada'
            WHERE id = ${p.id}
            RETURNING *
        `;
        res.json(atualizada);
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao cancelar partida', erro: e.message });
    }
});

// DELETE /torneios/:id/partidas/:pid
app.delete('/torneios/:id/partidas/:pid',async(req,res) => {
    try {
        const [p] = await sql`
            SELECT id FROM partidas
            WHERE id = ${req.params.pid} AND "torneioId" = ${req.params.id}
        `;
        if (!p) return res.status(404).json({ mensagem: 'Partida não encontrada' });
        await sql`DELETE FROM partidas WHERE id = ${p.id}`;
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ mensagem: 'Erro ao excluir partida', erro: e.message });
    }
});

// Rota não encontrada
app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada' }));

// Inicializa tabelas e sobe o servidor
initDb()
    .then(() => app.listen(PORT, () => console.log(`ArenADS rodando na porta ${PORT}`)))
    .catch(e => { console.error('Erro ao inicializar banco:', e); process.exit(1); });