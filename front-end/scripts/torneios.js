const API_URL = "http://localhost:3000/torneios";

const grade = document.getElementById("gradeTorneios");
const mensagem = document.getElementById("mensagem");

const popup = document.getElementById("popup");
const abrirTorneio = document.getElementById("abrirTorneio");
const fechar = document.getElementById("botaoFechar");
const salvar = document.getElementById("salvar");

const nome = document.getElementById("nome");
const jogo = document.getElementById("jogo");
const formato = document.getElementById("formato");

abrirTorneio.addEventListener("click", () => {
    popup.classList.remove("popup-escondido");
});

fechar.addEventListener("click", () => {
    popup.classList.add("popup-escondido");
})

async function carregarTorneios() {
    try {
        mensagem.textContent = "Carregando torneios..."

        const resposta = await fetch(API_URL);
        const torneios = await resposta.json();

        grade.innerHTML = " ";

        if (torneios.lenght === 0) {
            mensagem.textContent = "Nenhum torneio cadastrado";
            return;
        }

        mensagem.textContent = "";

        torneios.forEach((torneio) => {
            const card = document.createElement("div");

            card.innerHTML = `
                <h3>${torneio.nome}</h3>
                <p>Jogo: ${torneio.jogo}</p>
                <p>Formato: ${torneio.formato}</p>
            `;

            grade.appendChild(card);
        });
    } catch (erro) {
        mensagem.textContent = "Erro ao carregar torneios";
        console.error(erro);
    }
}

carregarTorneios();