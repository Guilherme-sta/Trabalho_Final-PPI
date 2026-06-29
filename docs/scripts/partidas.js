const API_URL = "https://trabalho-final-ppi-kappa-two.vercel.app";

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const TORNEIO_ID = params.get('torneioId');
    const NOME = params.get('nome') ? decodeURIComponent(params.get('nome')) : '';

    const subtitulo = document.getElementById('subtitulo');
    if (subtitulo) subtitulo.textContent = NOME;

    const campoData = document.getElementById('dataPartida');
    if (campoData) campoData.valueAsDate = new Date();

    // Tema
    const botaoTema = document.getElementById('botaoTema');
    function aplicarTema(tema) {
        const modoEscuro = tema === 'dark';
        document.body.classList.toggle('dark', modoEscuro);
        botaoTema.textContent = modoEscuro ? '☀️' : '🌙';
        botaoTema.title = modoEscuro ? 'Alternar para tema claro' : 'Alternar para tema escuro';
        localStorage.setItem('tema', tema);
    }

    aplicarTema(localStorage.getItem('tema') || 'light');

    botaoTema.addEventListener('click', () => {
        const novoTema = document.body.classList.contains('dark') ? 'light' : 'dark';
        aplicarTema(novoTema);
    });

    // Ordenação
    const selectOrdem = document.getElementById('ordemPartidas');
    if (selectOrdem) {
        selectOrdem.value = localStorage.getItem('ordemPartidas') || 'data';
        selectOrdem.addEventListener('change', () => {
            localStorage.setItem('ordemPartidas', selectOrdem.value);
            carregarPartidas();
        });
    }

    const mensagem = document.getElementById('mensagem');
    function mostrarMensagem(texto,tipo = '') {
        mensagem.textContent = texto;
        mensagem.className = 'mensagem ' + tipo;
        if (texto && tipo !== 'aviso')
            setTimeout(() => { mensagem.textContent = ''; mensagem.className = 'mensagem'; }, 4000);
    }

    // Carregar partidas
    async function carregarPartidas() {
        if (!TORNEIO_ID) {
            mostrarMensagem('Torneio não identificado. Volte à página inicial.', 'erro');
            return;
        }
        const ordem = localStorage.getItem('ordemPartidas') || 'data';
        try {
            const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas?ordem=${ordem}`);
            if (!response.ok) throw new Error();
            const dados = await response.json();
            renderizarPartidas(dados);
        } catch {
            mostrarMensagem('Erro ao carregar partidas.', 'erro');
        }
    }

    // Renderizar partidas
    const BADGE_PARTIDA = {
        agendada : 'Agendada',
        finalizada : 'Finalizada',
        cancelada : 'Cancelada',
    };

    function renderizarPartidas(lista) {
        const container = document.getElementById('partidas');
        container.innerHTML = '';

        if (!lista.length) {
            container.innerHTML = '<p class="vazio">Nenhuma partida cadastrada.</p>';
            return;
        }

        lista.forEach(p => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-topo">
                    <h3>${p.timeA} <span style="font-weight:normal">vs</span> ${p.timeB}</h3>
                    <span class="badge badge-${p.status}">${BADGE_PARTIDA[p.status] || p.status}</span>
                </div>
                <p class="detalhe">Placar: ${p.placarA} × ${p.placarB}</p>
                <p class="detalhe">Data: ${p.dataPartida}</p>
                <div class="acoes">
                    ${p.status !== 'finalizada' && p.status !== 'cancelada'
                        ? `<button class="btn-resultado">Resultado</button>
                           <button class="btn-cancelar">Cancelar</button>`
                        : ''}
                    <button class="btn-del">Excluir</button>
                </div>
            `;

            const btnResultado = card.querySelector('.btn-resultado');
            if (btnResultado) btnResultado.addEventListener('click', () => registrarResultado(p, card));

            const btnCancelar = card.querySelector('.btn-cancelar');
            if (btnCancelar) btnCancelar.addEventListener('click', () => cancelarPartida(p, card));

            card.querySelector('.btn-del').addEventListener('click', () => excluirPartida(p, card));

            container.appendChild(card);
        });
    }

    // Agendar partida
    const btnAgendar = document.getElementById('agendar');
    if (btnAgendar) {
        btnAgendar.addEventListener('click', async () => {
            const timeA = document.getElementById('timeA').value.trim();
            const timeB = document.getElementById('timeB').value.trim();
            const dataPartida = document.getElementById('dataPartida').value;

            if (!timeA) { mostrarMensagem('Time A é obrigatório', 'erro');          return; }
            if (!timeB) { mostrarMensagem('Time B é obrigatório', 'erro');          return; }
            if (!dataPartida) { mostrarMensagem('Data da partida é obrigatória', 'erro'); return; }

            try {
                const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas`, {
                    method : 'POST',
                    headers : { 'Content-Type': 'application/json' },
                    body : JSON.stringify({ timeA, timeB, dataPartida }),
                });
                const data = await response.json();
                if (!response.ok) { mostrarMensagem(data.mensagem, 'erro'); return; }
                mostrarMensagem('Partida agendada!', 'sucesso');
                document.getElementById('timeA').value = '';
                document.getElementById('timeB').value = '';
                carregarPartidas();
            } catch {
                mostrarMensagem('Erro de conexão.', 'erro');
            }
        });
    }

    // Registrar resultado
    async function registrarResultado(p,card) {
        const placarA = prompt(`Placar de ${p.timeA}:`);
        const placarB = prompt(`Placar de ${p.timeB}:`);
        if (placarA === null || placarB === null) return;

        try {
            const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas/${p.id}/resultado`, {
                method : 'PATCH',
                headers : { 'Content-Type': 'application/json' },
                body : JSON.stringify({ placarA: Number(placarA), placarB: Number(placarB) }),
            });
            const data = await response.json();
            if (!response.ok) { mostrarMensagem(data.mensagem, 'erro'); return; }
            mostrarMensagem('Resultado registrado!', 'sucesso');
            carregarPartidas();
        } catch {
            mostrarMensagem('Erro ao registrar resultado.', 'erro');
        }
    }

    // Cancelar partida
    async function cancelarPartida(p,card) {
        if (!confirm(`Cancelar a partida ${p.timeA} vs ${p.timeB}?`)) return;
        try {
            const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas/${p.id}/cancelar`, {
                method: 'PATCH',
            });
            if (!response.ok) throw new Error();
            mostrarMensagem('Partida cancelada.', 'sucesso');
            carregarPartidas();
        } catch {
            mostrarMensagem('Erro ao cancelar partida.', 'erro');
        }
    }

    // Excluir partida
    async function excluirPartida(p,card) {
        if (!confirm(`Excluir a partida ${p.timeA} vs ${p.timeB}?`)) return;
        try {
            const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas/${p.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error();
            card.remove();
            mostrarMensagem('Partida excluída.', 'sucesso');
        } catch {
            mostrarMensagem('Erro ao excluir partida.', 'erro');
        }
    }

    carregarPartidas();
});
