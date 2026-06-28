const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════
// TORNEIOS
// ═══════════════════════════════════════════

// GET /torneios?ordem=recentes|nome|status
app.get('/torneios', (req, res) => {
    const ordens = {
        recentes : 'dataCriacao DESC',
        nome     : 'nome ASC',
        status   : 'status ASC, dataCriacao DESC',
    };
    const col = ordens[req.query.ordem] || 'dataCriacao DESC';
    const lista = db.prepare(`SELECT * FROM torneios ORDER BY ${col}`).all();
    res.json(lista);
});

// GET /torneios/:id
app.get('/torneios/:id', (req, res) => {
    const t = db.prepare('SELECT * FROM torneios WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });
    res.json(t);
});

// POST /torneios
app.post('/torneios', (req, res) => {
    const { nome, jogo, formato } = req.body;

    if (!nome   || nome.trim()    === '') return res.status(400).json({ mensagem: 'Nome é obrigatório' });
    if (!jogo   || jogo.trim()    === '') return res.status(400).json({ mensagem: 'Jogo é obrigatório' });
    if (!formato|| formato.trim() === '') return res.status(400).json({ mensagem: 'Formato é obrigatório' });

    const result = db
        .prepare('INSERT INTO torneios (nome, jogo, formato) VALUES (?, ?, ?)')
        .run(nome.trim(), jogo.trim(), formato.trim());

    const novo = db.prepare('SELECT * FROM torneios WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(novo);
});

// PUT /torneios/:id — substituição completa
app.put('/torneios/:id', (req, res) => {
    const { nome, jogo, formato, status } = req.body;

    if (!nome || !jogo || !formato || !status)
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios no PUT' });

    const t = db.prepare('SELECT id FROM torneios WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });

    db.prepare('UPDATE torneios SET nome=?, jogo=?, formato=?, status=? WHERE id=?')
        .run(nome.trim(), jogo.trim(), formato.trim(), status, req.params.id);

    res.json(db.prepare('SELECT * FROM torneios WHERE id = ?').get(req.params.id));
});

// PATCH /torneios/:id/status — atualiza só o status
app.patch('/torneios/:id/status', (req, res) => {
    const validos = ['aberto', 'em_andamento', 'encerrado'];
    const { status } = req.body;

    if (!status || !validos.includes(status))
        return res.status(400).json({ mensagem: `Status deve ser: ${validos.join(', ')}` });

    const t = db.prepare('SELECT id FROM torneios WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });

    db.prepare('UPDATE torneios SET status=? WHERE id=?').run(status, req.params.id);
    res.json(db.prepare('SELECT * FROM torneios WHERE id = ?').get(req.params.id));
});

// DELETE /torneios/:id
app.delete('/torneios/:id', (req, res) => {
    const t = db.prepare('SELECT id FROM torneios WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });
    db.prepare('DELETE FROM torneios WHERE id = ?').run(req.params.id);
    res.status(204).send();
});

// ═══════════════════════════════════════════
// PARTIDAS
// ═══════════════════════════════════════════

// GET /torneios/:id/partidas?ordem=data|placar|status
app.get('/torneios/:id/partidas', (req, res) => {
    const t = db.prepare('SELECT id FROM torneios WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });

    const ordens = {
        data   : 'dataPartida DESC',
        placar : '(placarA + placarB) DESC',
        status : 'status ASC, dataPartida DESC',
    };
    const col = ordens[req.query.ordem] || 'dataPartida DESC';
    const lista = db
        .prepare(`SELECT * FROM partidas WHERE torneioId = ? ORDER BY ${col}`)
        .all(req.params.id);
    res.json(lista);
});

// GET /torneios/:id/partidas/:pid
app.get('/torneios/:id/partidas/:pid', (req, res) => {
    const p = db
        .prepare('SELECT * FROM partidas WHERE id = ? AND torneioId = ?')
        .get(req.params.pid, req.params.id);
    if (!p) return res.status(404).json({ mensagem: 'Partida não encontrada' });
    res.json(p);
});

// POST /torneios/:id/partidas
app.post('/torneios/:id/partidas', (req, res) => {
    const { timeA, timeB, dataPartida } = req.body;

    if (!timeA || timeA.trim() === '')
        return res.status(400).json({ mensagem: 'Time A é obrigatório' });
    if (!timeB || timeB.trim() === '')
        return res.status(400).json({ mensagem: 'Time B é obrigatório' });
    if (!dataPartida)
        return res.status(400).json({ mensagem: 'Data da partida é obrigatória' });
    if (timeA.trim().toLowerCase() === timeB.trim().toLowerCase())
        return res.status(400).json({ mensagem: 'Time A e Time B não podem ser iguais' });

    const t = db.prepare('SELECT id FROM torneios WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ mensagem: 'Torneio não encontrado' });

    // REGRA DE NEGÓCIO (só no servidor): mesmo time não pode jogar duas vezes no mesmo torneio/dia
    const conflito = db.prepare(`
        SELECT id FROM partidas
        WHERE torneioId = ? AND dataPartida = ? AND status != 'cancelada'
        AND (timeA = ? OR timeB = ? OR timeA = ? OR timeB = ?)
    `).get(req.params.id, dataPartida, timeA.trim(), timeA.trim(), timeB.trim(), timeB.trim());

    if (conflito)
        return res.status(409).json({ mensagem: 'Um dos times já tem partida neste torneio nesta data' });

    const result = db
        .prepare('INSERT INTO partidas (torneioId, timeA, timeB, dataPartida) VALUES (?, ?, ?, ?)')
        .run(req.params.id, timeA.trim(), timeB.trim(), dataPartida);

    const nova = db.prepare('SELECT * FROM partidas WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(nova);
});

// PATCH /torneios/:id/partidas/:pid/resultado
app.patch('/torneios/:id/partidas/:pid/resultado', (req, res) => {
    const { placarA, placarB } = req.body;

    if (placarA === undefined || placarB === undefined)
        return res.status(400).json({ mensagem: 'placarA e placarB são obrigatórios' });
    if (Number(placarA) < 0 || Number(placarB) < 0)
        return res.status(400).json({ mensagem: 'Placar não pode ser negativo' });

    const p = db
        .prepare('SELECT * FROM partidas WHERE id = ? AND torneioId = ?')
        .get(req.params.pid, req.params.id);
    if (!p) return res.status(404).json({ mensagem: 'Partida não encontrada' });
    if (p.status === 'cancelada')
        return res.status(409).json({ mensagem: 'Partida cancelada não pode ter resultado' });

    db.prepare("UPDATE partidas SET placarA=?, placarB=?, status='finalizada' WHERE id=?")
        .run(Number(placarA), Number(placarB), p.id);

    res.json(db.prepare('SELECT * FROM partidas WHERE id = ?').get(p.id));
});

// PATCH /torneios/:id/partidas/:pid/cancelar
app.patch('/torneios/:id/partidas/:pid/cancelar', (req, res) => {
    const p = db
        .prepare('SELECT * FROM partidas WHERE id = ? AND torneioId = ?')
        .get(req.params.pid, req.params.id);
    if (!p) return res.status(404).json({ mensagem: 'Partida não encontrada' });
    if (p.status === 'finalizada')
        return res.status(409).json({ mensagem: 'Partida já finalizada não pode ser cancelada' });

    db.prepare("UPDATE partidas SET status='cancelada' WHERE id=?").run(p.id);
    res.json(db.prepare('SELECT * FROM partidas WHERE id = ?').get(p.id));
});

// DELETE /torneios/:id/partidas/:pid
app.delete('/torneios/:id/partidas/:pid', (req, res) => {
    const p = db
        .prepare('SELECT id FROM partidas WHERE id = ? AND torneioId = ?')
        .get(req.params.pid, req.params.id);
    if (!p) return res.status(404).json({ mensagem: 'Partida não encontrada' });
    db.prepare('DELETE FROM partidas WHERE id = ?').run(p.id);
    res.status(204).send();
});

// Rota não encontrada
app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada' }));

app.listen(PORT, () => console.log(`ArenADS rodando na porta ${PORT}`));
