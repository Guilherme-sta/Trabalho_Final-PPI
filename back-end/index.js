const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/torneios', (req,res) => {
    const torneios = db
    .prepare('SELECT * FROM torneios ORDER BY dataCriacao DESC')
    .all();

    res.json(torneios);
});

app.post('/torneios', (req,res) =>{
    const { nome, jogo, formato } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ mensagem: 'Nome é obrigatório '});
    }

    if (!jogo || jogo.trim() === '') {
        return res.status(400).json ({ mensagem: 'Jogo é obrigatório' });
    }

    if (!formato || formato.trim() === ''){
        return res.status(400).json({ mensagem: 'Formato é obrigatório'})
    }

    const resultado = db
        .prepare('INSERT INTO torneios (nome, jogo, formato) VALUES (?,?,?)')
        .run(nome.trim(), jogo.trim(), formato.trim());

    const torneio = db
        .prepare('SELECT * FROM torneios WHERE id = ?')
        .get(resultado.lastInsertRowid);

    res.status(201).json(torneio);
});

app.use((req, res) => {
    res.status(404).json({ mensagem: 'Rota não encontada'});
});

app.listen(PORT, () => {
    console.log(`ArenADS rodando na porta ${PORT}`);
});