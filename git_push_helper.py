import subprocess
import os

def run_git():
    try:
        # Adicionar arquivos
        subprocess.run(["git", "add", "."], check=True)
        # Commit
        subprocess.run(["git", "commit", "-m", "fix: remove duplicate handleNewChat and prepare for deploy"], check=True)
        # Push
        subprocess.run(["git", "push", "origin", "main"], check=True)
        print("Push realizado com sucesso!")
    except Exception as e:
        print(f"Erro ao executar git: {e}")

if __name__ == "__main__":
    run_git()
