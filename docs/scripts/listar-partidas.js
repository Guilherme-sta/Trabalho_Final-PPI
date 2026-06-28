const API_URL = "https://trabalho-final-ppi-kappa-two.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
    const botaoTema = document.getElementById('botaoTema');
    function aplicarTema(tema) {
        document.body.classList.toggle('dark', tema === 'dark');
        botaoTema.textContent = tema === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('tema', tema);
    }
    aplicarTema(localStorage.getItem('tema') || 'light');
    botaoTema.addEventListener('click', () => {
        const novoTema = document.body.classList.contains('dark') ? 'light' : 'dark';
        aplicarTema(novoTema);
    });

    const selectOrdem = document.getElementById('ordemPartidas');
    selectOrdem.value = localStorage.getItem('ordemListaPartidas') || 'data';
    selectOrdem.addEventListener('change', () => {
        localStorage.setItem('ordemListaPartidas', selectOrdem.value);
        carregarPartidas();
    });

    carregarPartidas(); 
});

async function carregarPartidas() {
    const container = document.getElementById("listaPartidas");
    try {
        // Busca todos os torneios e depois todas as partidas de cada um
        const resTorneios = await fetch(`${API_URL}/torneios`);
        if (!resTorneios.ok) throw new Error();
        const torneios = await resTorneios.json();
        if (!torneios.length) {
            container.innerHTML = '<p class="vazio">Nenhum torneio cadastrado.</p>';
            return;
        }
        const todasPartidas = await Promise.all(
            torneios.map(t =>
                fetch(`${API_URL}/torneios/${t.id}/partidas?ordem=${localStorage.getItem('ordemListaPartidas') || 'data'}`)
                    .then(r => r.json())
                    .then(partidas => partidas.map(p => ({ ...p, nomeTorneio: t.nome })))
                    .catch(() => [])
            )
        );

        const lista = todasPartidas.flat();
        renderizarPartidas(lista, container);
    } catch {
        container.innerHTML = '<p class="vazio erro">Erro ao carregar partidas.</p>';
    }
}

function renderizarPartidas(lista,container) {
    container.innerHTML = '';

    if (!lista.length) {
        container.innerHTML = '<p class="vazio">Nenhuma partida cadastrada.</p>';
        return;
    }

    const BADGE = {
        agendada : 'Agendada',
        finalizada : 'Finalizada',
        cancelada : 'Cancelada',
    };

    lista.forEach(p => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-topo">
                <h3>${p.timeA} <span style="font-weight:normal">vs</span> ${p.timeB}</h3>
                <span class="badge badge-${p.status}">${BADGE[p.status] || p.status}</span>
            </div>
            <p class="detalhe">Torneio: ${p.nomeTorneio}</p>
            <p class="detalhe">Placar: ${p.placarA} × ${p.placarB}</p>
            <p class="detalhe">Data: ${p.dataPartida}</p>
        `;
        container.appendChild(card);
    });
}