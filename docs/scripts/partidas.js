const API_URL = 'https://trabalho-final-ppi-kappa-two.vercel.app';

document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);

    const TORNEIO_ID = params.get('torneioId');

    const NOME = params.get('nome')
        ? decodeURIComponent(params.get('nome'))
        : '';

    // Preenche o subtítulo apenas se existir
    const subtitulo = document.getElementById('subtitulo');
    if (subtitulo) {
        subtitulo.textContent = NOME;
    }

    // Define a data atual apenas se o campo existir
    const campoData = document.getElementById('dataPartida');
    if (campoData) {
        campoData.valueAsDate = new Date();
    }

    // ==========================
    // Tema
    // ==========================

    const botaoTema = document.getElementById('botaoTema');

    function aplicarTema(tema) {

        const modoEscuro = tema === 'dark';

        document.body.classList.toggle('dark', modoEscuro);

        botaoTema.textContent = modoEscuro ? '☀️' : '🌙';

        botaoTema.title = modoEscuro
            ? 'Alternar para tema claro'
            : 'Alternar para tema escuro';

        localStorage.setItem('tema', tema);
    }

    aplicarTema(localStorage.getItem('tema') || 'light');

    botaoTema.addEventListener('click', () => {

        const novoTema = document.body.classList.contains('dark')
            ? 'light'
            : 'dark';

        aplicarTema(novoTema);

    });
});