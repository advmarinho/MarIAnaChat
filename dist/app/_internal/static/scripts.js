let nome = '';
let matricula = '';
let etapa = 'coleta_matricula';  // Etapas: coleta_matricula, coleta_nome, escolha_opcao, youtube, pdf

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const historyBox = document.getElementById('history-box');  // Referência ao histórico

// Lista de usuários para buscar nome pela matrícula
const usuarios = {
    '13205': 'ERIKA LIMA',
    '15405': 'ANDREIA MATARUCO',
    '16534': 'SARAH GOULART',
    '16759': 'MARCELA SANCHEZ',
    '18469': 'MARIANA SILVA',
    '18825': 'RACHEL ROSA',
    '19146': 'FERNANDO KOPROVSKI',
    '19287': 'ANDERSON MARINHO',
    '19010': 'MARIANA LANCELOTT',
    '42999': 'Asimov'
};

// Lista de palavras ofensivas/pejorativas para validar o nome
const palavrasProibidas = ['ofensa1', 'ofensa2', 'palavraofensiva'];  // Adicione termos indesejáveis aqui

// Função para validar o nome
function validarNome(nome) {
    console.log(`Validando o nome: ${nome}`);  // Log para validação do nome
    const regexNomeValido = /^[A-Za-zÀ-ú ]+$/;
    const nomeLimpo = nome.toLowerCase().trim();
    if (!regexNomeValido.test(nome)) {
        return false;
    }
    if (palavrasProibidas.some(palavra => nomeLimpo.includes(palavra))) {
        return false;
    }
    return true;
}

// Função para validar a matrícula (somente números)
function validarMatricula(matricula) {
    console.log(`Validando a matrícula: ${matricula}`);  // Log para validação da matrícula
    const regexMatriculaValida = /^[0-9]+$/;
    return regexMatriculaValida.test(matricula);
}

// Função para buscar nome com base na matrícula
function buscarNomePelaMatricula(matricula) {
    console.log(`Buscando nome para a matrícula: ${matricula}`);  // Log para busca do nome pela matrícula
    return usuarios[matricula] || null;
}

// Função para adicionar uma mensagem ao chat
function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.innerHTML = message;  // Permite HTML nas mensagens (para links)
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;  // Rolar para a última mensagem

    // Atualizar o histórico
    updateHistory(message, sender);
}

// Função para atualizar o histórico de conversas
function updateHistory(message, sender) {
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');
    historyItem.innerHTML = `<strong>${sender === 'user' ? 'Você' : 'Bot'}:</strong> ${message}`;
    historyBox.appendChild(historyItem);
    historyBox.scrollTop = historyBox.scrollHeight;  // Rolar para a última mensagem no histórico
}

// Função para exibir a barra de progresso no chat
function showProgressInChat() {
    const progressElement = document.createElement('div');
    const uniqueId = `progress-bar-fill-${Date.now()}`; // Cria um ID único para a barra de progresso
    progressElement.classList.add('bot-message');
    progressElement.innerHTML = `
        <div class="progress-message">Aguarde, estamos processando sua solicitação...</div>
        <div class="progress-bar">
            <div class="progress-bar-fill" id="${uniqueId}"></div>
        </div>`;
    chatBox.appendChild(progressElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    simulateProgressInChat(uniqueId); // Passa o ID único para a função de progresso
}

// Função para simular o progresso no chat
function simulateProgressInChat(progressBarId) {
    const progressBarFill = document.getElementById(progressBarId);
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += 5;  // Incrementa o progresso em 5%
            progressBarFill.style.width = width + '%';
        }
    }, 500);  // Atualiza a cada 500ms
    return interval;
}

// Função para enviar a mensagem do usuário
function sendMessage() {
    const userMessage = userInput.value.trim();

    if (userMessage === '') return;

    console.log(`Mensagem do usuário: ${userMessage}`);  // Log para mensagem do usuário

    // Adiciona a mensagem do usuário no chat
    addMessage(userMessage, 'user');

    // Limpa o campo de entrada
    userInput.value = '';

    // Processar a resposta do bot
    setTimeout(() => {
        processMessage(userMessage);
    }, 500);  // Simula o tempo de resposta
}

// Função para processar a mensagem e gerar a resposta do bot
function processMessage(message) {
    let botResponse = '';

    if (etapa === 'coleta_matricula') {
        if (!validarMatricula(message)) {
            botResponse = 'Por favor, insira uma matrícula válida (somente números).';
            addMessage(botResponse, 'bot');
            return;
        }
        matricula = message;
        nome = buscarNomePelaMatricula(matricula);
        if (!nome) {
            botResponse = 'Matrícula não encontrada. Por favor, insira uma matrícula válida.';
            addMessage(botResponse, 'bot');
            return;
        }
        console.log(`Matrícula confirmada, nome do usuário: ${nome}`);  // Log após matrícula confirmada

        // Se a matrícula for "42asimov", chama a função de glossário
        if (matricula === '42999') {
            showProgressInChat();  // Exibe a barra de progresso
            fetch('/matricula', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ matricula: matricula })
            })
            .then(response => response.json())
            .then(data => {
                addMessage(data.response, 'bot');
            })
            .catch(error => {
                console.error('Erro:', error);
                addMessage('Desculpe, ocorreu um erro ao processar sua solicitação.', 'bot');
            });
        } else {
            botResponse = `Matrícula confirmada! Olá, <strong>${nome}</strong>! O que você gostaria de fazer agora?<br>
            1. Procurar no YouTube<br>
            2. Buscar um termo no PDF.`;
            etapa = 'escolha_opcao';
            addMessage(botResponse, 'bot');
        }
    } else if (etapa === 'escolha_opcao') {
        if (message === '1') {
            botResponse = 'Digite o nome do termo que você deseja buscar no YouTube.';
            etapa = 'youtube';
            addMessage(botResponse, 'bot');
        } else if (message === '2') {
            botResponse = 'Digite o termo que você deseja buscar no PDF.';
            etapa = 'pdf';
            addMessage(botResponse, 'bot');
        } else {
            botResponse = 'Por favor, escolha uma opção válida:<br>1. YouTube<br>2. PDF';
            addMessage(botResponse, 'bot');
        }
    } else if (etapa === 'youtube') {
        console.log('Iniciando busca no YouTube...');  // Log antes de iniciar a busca no YouTube
        fetch('/get_music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            addMessage(data.response, 'bot');
            // Perguntar se deseja voltar para as opções
            addMessage('Deseja realizar outra ação?<br>Digite <strong>1</strong> para YouTube<br>Digite <strong>2</strong> para PDF.', 'bot');
            etapa = 'escolha_opcao';
        })
        .catch(error => {
            console.error('Erro:', error);
            addMessage('Desculpe, ocorreu um erro ao processar sua solicitação.', 'bot');
        });
    } else if (etapa === 'pdf') {
        console.log('Iniciando busca no PDF...');  // Log antes de iniciar a busca no PDF
        showProgressInChat();  // Exibe a barra de progresso
        fetch('/search_pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ term: message })
        })
        .then(response => response.json())
        .then(data => {
            addMessage(data.response, 'bot');
            // Perguntar se deseja voltar para as opções
            addMessage('Deseja realizar outra ação?<br>Digite <strong>1</strong> para YouTube<br>Digite <strong>2</strong> para PDF.', 'bot');
            etapa = 'escolha_opcao';
        })
        .catch(error => {
            console.error('Erro:', error);
            addMessage('Desculpe, ocorreu um erro ao processar sua solicitação.', 'bot');
        });
    }
}

// Adiciona um listener para o Enter
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Saudar o usuário assim que a página carrega
window.onload = function () {
    setTimeout(() => {
        console.log('Página carregada, iniciando interação...');  // Log para indicar o carregamento da página
        addMessage('Olá! Sou o chat da Igarape Digital. Por favor, insira sua matrícula para continuar.', 'bot');
    }, 500);
};
