const API_URL   = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const TORNEIO_ID = params.get('torneioId');
    const NOME = decodeURIComponent(params.get('nome') || 'Torneio');

    document.getElementById('subtitulo').textContent = NOME;

    // Data atual como padrão no campo de data
    document.getElementById('dataPartida').valueAsDate = new Date();

    // Tema Dark 
    function aplicarTema(tema) {
        document.body.classList.toggle('dark', tema === 'dark');
        document.getElementById('botaoTema').textContent = tema === 'dark' ? 'Light' : 'Dark';
        localStorage.setItem('tema', tema);
    };

    aplicarTema(localStorage.getItem('tema') || 'light');

    document.getElementById('botaoTema').addEventListener('click', () => {
        const novo = document.body.classList.contains('dark') ? 'light': 'dark';
        aplicarTema(novo)
    });


    // Listar Partidas
    async function carregarPartidas() {
        const ordem = localStorage.getItem('ordemPartidas') || 'data';
        try {
            const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas?ordem=${ordem}`);
            if (!response.ok) throw new Error();
            const lista = await response.json();
            renderizarPartidas(lista);
        } catch {
            mostrarMensagem('Sem conexão com o servidor', 'aviso');
        }
    }

    // Agendar Partidas - Post
    document.getElementById('agendar').addEventListener('click', async () => {
        const timeA = document.getElementById('timeA').value.trim();
        const timeB = document.getElementById('timeB').value.trim();
        const dataPartida = document.getElementById('dataPartida').value;

        if (!timeA) {
            mostrarMensagem('Time A é obrigatório', 'erro');
            return;
        }
        if(!timeB) {
            mostrarMensagem('Time B é obrigatório', 'erro');
            return;
        }
        if(!dataPartida) {
            mostrarMensagem('Data é obrigatório', 'erro');
            return;
        }

        try{
            const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas`, {
                method : 'POST',
                headers : {'Content-Type' : 'application/json'},
                body : JSON.stringify({timeA, timeB, dataPartida}),
            });
            const data = await response.json();
            if (!response.ok) {
                mostrarMensagem(data.mensagem, 'erro');
                return;
            }

            document.getElementById('timeA').value = '';
            document.getElementById('timeB').value = '';
            mostrarMensagem('Partida agendada com sucesso', 'sucesso');
        } catch {
            mostrarMensagem('Erro de conexão', 'erro');
        }

    });

    const BADGE_P = {
        agendada  : 'Agendada',
        finalizada: 'Finalizada',
        cancelada : 'Cancelada',
    };

    // Renderizar Partidas
    function renderizarPartidas(lista) {
        const area = document.getElementById('partidas');
        area.innerHTML = '';

        if (!lista.length){
            area.innerHTML = '<p class="vazio">Nenhuma partida agendada.</p>';
            return;
        }

        lista.forEach(p => {
            const item = document.createElement('div');
            item.className = `card-partida status-${p.status}`;
            
            const placarTexto = p.status === 'finalizada'
                ? `${p.placarA} x ${p.placarB}`
                : 'VS';
            
            const dataFormatada = new Date(p.dataPartida + 'T12:00:00')
                .toLocaleDateString('pt-BR');
            
            item.innerHTML = `
                <div class="placar">
                    <span class="time">${p.timeA}</span>
                    <span class="vs">${placarTexto}</span>
                    <span class="time">${p.timeB}</span>
                </div>
                <div class="info-partida">
                    <small>${dataFormatada}</small>
                    <span class="badge badge-${p.status}">${BADGE_P[p.status]}</span>
                </div>
                ${p.status === 'agendada' ? `
                <div class="form-resultado">
                    <input type="number" class="inp-pa" placeholder="Pts ${p.timeA}" min="0" value="0">
                    <input type="number" class="inp-pb" placeholder="Pts ${p.timeB}" min="0" value="0">
                    <button class="btn-resultado">Finalizar</button>
                    <button class="btn-cancelar">Cancelar</button>
                </div>` : ''}
                <div class="acoes-partida">
                    <button class="btn-del-p">🗑️ Excluir</button>
                </div>
            `;    

            // Finalizar uma partida
            if (p.status === 'agendada') {
                item.querySelector('.btn-resultado').addEventListener('click', async () =>{
                    const pa = Number(item.querySelector('.inp-pa').value);
                    const pb = Number(item.querySelector('.inp-pb').value);
                    if (pa < 0 || pb < 0) {
                        mostrarMensagem('Placar não pode ser negativo!', 'error');
                        return;
                    }

                    try {
                        const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas/${p.id}/resultado`, {
                            method : 'PATCH',
                            headers : {'Content-Type' : 'application/json'},
                            body : JSON.stringify({placarA: pa, placarB: pb}),
                        });
                        const data = await response.json();
                        if (!response.ok){
                            mostrarMensagem(data.mensagem, 'erro');
                        }
                        mostrarMensagem('Resultado Registrado', 'sucesso')
                        carregarPartidas();
                    } catch {
                        mostrarMensagem('Error ao registrar resultado', 'erro');
                    }
                });

                // Cancelar Partida
                item.querySelector('.btn-cancelar').addEventListener('click', async () => {
                    if (!confirm('Cancelar Partida?')) return;
                    try {
                        const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas/${p.id}/cancelar`, {
                            method: 'PATCH',
                        });
                        const data = await response.json();
                        if (!response.ok) {
                            mostrarMensagem(data.mensagem, 'erro');
                            return;
                        }
                        mostrarMensagem('Partida Cancelada', 'aviso');
                        carregarPartidas();
                    } catch {
                        mostrarMensagem('Erro ao cancelar partida', 'erro');
                    }
                });
            }

            item.querySelector('.btn-del-p').addEventListener('click', async () => {
                if (!confirm('Excluir este registro de partida?')) return;
                try {
                    const response = await fetch(`${API_URL}/torneios/${TORNEIO_ID}/partidas/${p.id}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) throw new Error();
                    item.remove();
                    mostrarMensagem('Partida excluída', 'sucesso');

                } catch {
                    mostrarMensagem('Erro ao excluir partida', 'erro');
                }
            })

            area.appendChild(item);
        });
    }

    // Mensagens
    function mostrarMensagem(texto, tipo = '') {
        const el = document.getElementById('mensagem');
        el.textContent = texto;
        el.className   = 'mensagem ' + tipo;
        if (tipo !== 'aviso') setTimeout(() => { el.textContent = ''; el.className = 'mensagem'; }, 4000);
    }

    // Ordenação das Partidas
    const selectOrdem = document.getElementById('ordemPartidas');
    selectOrdem.value = localStorage.getItem('ordemPartidas') || 'data';
    selectOrdem.addEventListener('change', () => {
        localStorage.setItem('ordemPartidas', selectOrdem.value);
        carregarPartidas();
    });

    carregarPartidas();
});