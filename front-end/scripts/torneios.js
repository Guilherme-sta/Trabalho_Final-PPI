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

}

carregarTorneios();