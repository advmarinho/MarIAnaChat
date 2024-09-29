from flask import Flask, render_template, request, jsonify, url_for
import PyPDF2
import os
import urllib.parse  # Mudança aqui para urllib.parse
from collections import Counter
import re
import webbrowser  # Para abrir o navegador automaticamente
from threading import Timer
from colorama import init, Fore  # Para usar cores no console

# Inicializa o colorama
init(autoreset=True)

app = Flask(__name__)

# Caminho para o PDF
NOME_PDF = 'FAQ.pdf'
PDF_PATH = os.path.join(os.path.dirname(__file__), 'static', NOME_PDF)

# Stopwords - palavras comuns que não queremos incluir no glossário
STOPWORDS = set([
    'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'por', 'para', 'com', 'um', 'uma',
    'uns', 'umas', 'no', 'na', 'nos', 'nas', 'e', 'é', 'que', 'se', 'ao', 'à', 'às', 'ou', 'ser', 'tem', 'não', 'pela', 'pelo'
])

@app.route('/')
def index():
    return render_template('index.html')

# Função para buscar um termo no PDF
@app.route('/search_pdf', methods=['POST'])
def search_pdf():
    data = request.get_json()
    search_term = data.get('term', '').strip()

    if not search_term:
        return jsonify({'response': 'Por favor, insira o termo que deseja buscar no PDF.'})

    try:
        if not os.path.exists(PDF_PATH):
            return jsonify({'response': 'Erro: O arquivo PDF não foi encontrado.'})

        # Abrir o PDF e buscar o termo
        with open(PDF_PATH, 'rb') as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            results = []

            # Ler todas as páginas do PDF
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text = page.extract_text()

                # Se o termo for encontrado no texto da página
                if search_term.lower() in text.lower():
                    # Divida o texto em linhas para obter a linha onde o termo aparece
                    lines = text.splitlines()
                    for line in lines:
                        if search_term.lower() in line.lower():
                            snippet_index = line.lower().index(search_term.lower())
                            snippet = line[max(0, snippet_index - 50):snippet_index + 200].strip()

                            # Extrair os 2 primeiros termos da linha onde o termo foi encontrado
                            first_two_words = " ".join(line.strip().split()[:2])

                            # Gera um link para a página no PDF
                            pdf_link = url_for('static', filename=NOME_PDF, _external=True) + f'#page={page_num + 1}'

                            results.append({
                                'page': page_num + 1,  # Número da página
                                'snippet': snippet,
                                'first_two_words': first_two_words,
                                'link': pdf_link  # Link para a página específica do PDF
                            })

            # Retorna os resultados encontrados
            if results:
                response = 'Aqui está o que encontrei no PDF:<br>'
                for result in results:
                    response += f'<strong>Página {result["page"]}:</strong> {result["first_two_words"]}... {result["snippet"]}...<br>'
                    response += f'Clique para visualizar: <a href="{result["link"]}" target="_blank">Página {result["page"]}</a><br>'
            else:
                response = f'Não encontrei o termo "{search_term}" no PDF.'

            return jsonify({'response': response})

    except Exception as e:
        return jsonify({'response': f'Erro ao processar o PDF: {str(e)}'})

# Função para buscar no YouTube
@app.route('/get_music', methods=['POST'])
def get_music():
    data = request.get_json()
    user_message = data.get('message', '').strip()

    if not user_message:
        return jsonify({'response': 'Por favor, insira o termo que deseja buscar no YouTube.'})

    # Codifica a mensagem do usuário para uso em URL
    query = urllib.parse.quote(user_message)
    youtube_search_url = f'https://www.youtube.com/results?search_query={query}'

    # Resposta personalizada com link clicável
    response = f'Aqui está o que encontrei no YouTube para "{user_message}": <a href="{youtube_search_url}" target="_blank">{youtube_search_url}</a>'

    return jsonify({'response': response})

# Função para abrir automaticamente o navegador ao iniciar o servidor
def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000/')

# Descritivo do bot
def show_bot_description():
    print("\n\n")
    print(Fore.GREEN + "Anderson Marinho - Igarapé Digital")
    print("\n")
    print(Fore.GREEN + "Este é o Chat MarIAna, um bot que realiza buscas em PDFs, "
          "gera glossários e também permite buscas rápidas no YouTube.")
    print(Fore.GREEN + "Desenvolvido para ajudar no gerenciamento e busca de informações!")
    print("\n\n")

if __name__ == '__main__':
    show_bot_description()  # Exibe o descritivo no console
    Timer(1, open_browser).start()  # Espera 1 segundo e abre o navegador
    app.run(debug=True)
