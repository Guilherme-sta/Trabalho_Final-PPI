const API_URL = "https://trabalho-final-ppi-kappa-two.vercel.app"; 

document.addEventListener('DOMContentLoaded', () => {

    const grade = document.getElementById("gradeTorneios");
    const mensagem = document.getElementById("mensagem");
    const popup = document.getElementById("popup");
    const botaoTema = document.getElementById("botaoTema");
    const selectOrdem = document.getElementById('ordem');

    // Tema Dark
   function aplicarTema(tema) {

    const modoEscuro = tema === "dark";

    document.body.classList.toggle("dark", modoEscuro);

    botaoTema.textContent = modoEscuro ? "☀️" : "🌙";

    botaoTema.title = modoEscuro
        ? "Alternar para tema claro"
        : "Alternar para tema escuro";

    localStorage.setItem("tema", tema);

}

aplicarTema(localStorage.getItem("tema") || "light");

botaoTema.addEventListener("click", () => {

    const novoTema = document.body.classList.contains("dark")
        ? "light"
        : "dark";

    aplicarTema(novoTema);

});

    // Ordenação 
    selectOrdem.value = localStorage.getItem('ordemTorneios') || 'recentes';
    selectOrdem.addEventListener('change', () => {
        localStorage.setItem('ordemTorneios', selectOrdem.value);
        carregarTorneios();
    })

    // Cache Offline 
    function salvarCache(dados) {
        localStorage.setItem('cacheTorneios', JSON.stringify(dados));
    }

    function lerCache() {
        const c = localStorage.getItem('cacheTorneios');
        return c ? JSON.parse(c) : null;
    }

    // Listar Torneios - Carregar
    async function carregarTorneios() {
        const ordem = localStorage.getItem('ordemTorneios') || 'recentes';
        try {
            const response = await fetch(`${API_URL}/torneios?ordem=${ordem}`);
            if (!response.ok) throw new Error();
            const dados = await response.json();
            salvarCache(dados);
            renderizarTorneios(dados);
            mostrarMensagem('');
        } catch {
            const cache = lerCache();
            if (cache) {
                renderizarTorneios(cache);
                mostrarMensagem('Sem conexão - Dados em cache', 'aviso');
            } else {
                mostrarMensagem('Sem conexão - Sem Dados cache...', 'erro');
            }
        }
    }

    // Renderizar Card
    const BADGE = {
        aberto       : 'Aberto',
        em_andamento : 'Em andamento',
        encerrado    : 'Encerrado',
    };

    function renderizarTorneios(lista) {
        grade.innerHTML = '';
        grade.className = '';

        if (!lista.length) {
            grade.innerHTML = '<p class="vazio">Nenhum torneio cadastrado.</p>';
            return;
        }

        grade.className = 'grade';

        lista.forEach(t => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-topo">
                    <h3>${t.nome}</h3>
                    <span class="badge badge-${t.status}">${BADGE[t.status] || t.status}</span>
                </div>
                <p class="detalhe">${t.jogo}</p>
                <p class="detalhe">${t.formato}</p>
                <div class="acoes">
                    <button class="btn-ver">Partidas</button>
                    <button class="btn-status">Status</button>
                    <button class="btn-edit">Editar</button>
                    <button class="btn-del">Excluir</button>
                </div>
            `;

            card.querySelector('.btn-ver').addEventListener('click', () => {
                window.location.href = `partidas.html?torneioId=${t.id}&nome=${encodeURIComponent(t.nome)}`
                
            });
            card.querySelector('.btn-status').addEventListener('click', () => alterarStatus(t));
            card.querySelector('.btn-edit').addEventListener('click', () => abrirEdicao(t));
            card.querySelector('.btn-del').addEventListener('click', () => excluirTorneio(t, card));

            grade.appendChild(card);
        });
    }

    // Alterar Status (patch)
    async function alterarStatus(t) {
        const ciclo = ['aberto', 'em_andamento', 'encerrado'];
        const novo  = ciclo[(ciclo.indexOf(t.status) + 1) % ciclo.length];
        try {
            const response = await fetch(`${API_URL}/torneios/${t.id}/status`, {
                method  : 'PATCH',
                headers : { 'Content-Type': 'application/json' },
                body    : JSON.stringify({ status: novo }),
            });
            if (!response.ok) throw new Error();
            mostrarMensagem(`Status atualizado para: ${novo}`, 'sucesso');
            carregarTorneios();
        } catch {
            mostrarMensagem('Erro ao atualizar status', 'erro');
        }
    }

    // Salvar Torneio - POST / PUT
    document.getElementById('salvar').addEventListener('click', async () => {
        const nome = document.getElementById('nome').value.trim();
        const jogo = document.getElementById('jogo').value.trim();
        const formato = document.getElementById('formato').value;
        const status = document.getElementById('status').value;
        const editId = document.getElementById('id').value;

        if (!nome) {
            mostrarMensagem('Nome é obrigatório', 'erro');
            return;
        }
        if (!jogo) {
            mostrarMensagem('Jogo é obrigatório', 'erro');
            return;
        }
        if (!formato) {
            mostrarMensagem('Selecione um formato', 'erro');
            return;
        }

        const dados = {nome, jogo, formato, status};
        const url = editId ? `${API_URL}/torneios/${editId}` : `${API_URL}/torneios`;
        const method = editId ? 'PUT' : 'POST';

        try {
            const response  = await fetch(url, {
                method,
                headers : { 'Content-Type': 'application/json' },
                body    : JSON.stringify(dados),
            });
            const data = await response.json();
            if (!response.ok) { 
                mostrarMensagem(data.mensagem, 'erro'); 
                return; 
            }
            fecharPopup();
            mostrarMensagem(editId ? 'Torneio atualizado!' : 'Torneio criado!', 'sucesso');
            carregarTorneios();
        } catch {
            mostrarMensagem('Erro de conexão.', 'erro');
        }
    })

    // Excluir Torneio
    async function excluirTorneio(t, card) {
        if (!confirm(`Excluir "${t.nome}" e todas as suas partidas?`)) return;
        try {
            const response = await fetch(`${API_URL}/torneios/${t.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error();
            card.remove();
            mostrarMensagem('Torneio excluído.', 'sucesso');
        } catch {
            mostrarMensagem('Erro ao excluir torneio.', 'erro');
        }
    }

    // PopUp
    function fecharPopup() {
        popup.classList.add('popup-escondido');
    }

    document.getElementById('botaoFechar').addEventListener('click', fecharPopup);


    document.getElementById('abrirTorneio').addEventListener('click', () => {
        popup.classList.remove('popup-escondido');

        document.getElementById('id').value = '';
        document.getElementById('titulo').textContent = 'Novo Torneio';
        document.getElementById('blocoStatus').style.display = 'none';
        document.getElementById('nome').value = '';
        document.getElementById('jogo').value = '';
        document.getElementById('formato').value = '';
    });

    function abrirEdicao(t) {
        popup.classList.remove('popup-escondido');

        document.getElementById('titulo').textContent = 'Editar Torneio';
        document.getElementById('id').value = t.id;
        document.getElementById('nome').value = t.nome;
        document.getElementById('jogo').value = t.jogo;
        document.getElementById('formato').value = t.formato;
        document.getElementById('status').value = t.status;

        document.getElementById('blocoStatus').style.display = 'block';
    }

    function mostrarMensagem(texto, tipo = '') {
        mensagem.textContent = texto;
        mensagem.className   = 'mensagem ' + tipo;

        if (texto && tipo !== 'aviso') setTimeout(() => 
            { mensagem.textContent = ''; mensagem.className = 'mensagem'; }, 4000);
    }


    carregarTorneios();

});