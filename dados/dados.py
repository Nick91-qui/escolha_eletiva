import csv
import firebase_admin
from firebase_admin import credentials, firestore

# Configurar credenciais do Firebase (substitua pelo caminho do seu arquivo JSON)
cred = credentials.Certificate("seu-arquivo-de-chave.json")
firebase_admin.initialize_app(cred)

# Conectar ao Firestore
db = firestore.client()

# Nome do arquivo CSV
arquivo_csv = "alunos.csv"  # Substitua pelo nome correto do seu arquivo

# Abrir o CSV e enviar os dados para o Firebase
with open(arquivo_csv, newline="", encoding="utf-8") as file:
    leitor = csv.DictReader(file)  # Lê o CSV como dicionário
    for linha in leitor:
        doc_ref = db.collection("alunos").add({
            "nomeAluno": linha["aluno"],
            "turma": linha["turma"],
            "eletiva": "",
            "inscrito": False
        })
        print(f"Aluno {linha['aluno']} da turma {linha['turma']} adicionado!")

print("Importação concluída!")

