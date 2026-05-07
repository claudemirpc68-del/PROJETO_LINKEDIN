import json
import os

def extract_files(json_path):
    if not os.path.exists(json_path):
        print(f"Erro: O arquivo {json_path} não foi encontrado.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    files = data.get('files', {})
    if not files:
        print("Nenhum arquivo encontrado no campo 'files'.")
        return

    for filepath, content in files.items():
        # Ignorar arquivos de controle ou vazios se necessário
        if not filepath or filepath == ".git":
            continue
            
        # Garantir que o diretório pai existe
        os.makedirs(os.path.dirname(filepath) if os.path.dirname(filepath) else '.', exist_ok=True)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Extraído: {filepath}")
        except Exception as e:
            print(f"Erro ao extrair {filepath}: {e}")

if __name__ == "__main__":
    extract_files('PROJETO_LINKEDIN.json')
