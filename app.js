import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, addDoc } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
  authDomain: "device-streaming-9e3b934a.firebaseapp.com",
  projectId: "device-streaming-9e3b934a",
  storageBucket: "device-streaming-9e3b934a.firebasestorage.app",
  messagingSenderId: "608328398854",
  appId: "1:608328398854:web:706cf69b6dcb751930ab87"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para carregar as turmas
async function carregarTurmas() {
    const turmasRef = collection(db, "alunos");
    const snapshot = await getDocs(turmasRef);
    const turmaSelect = document.getElementById("turma");

    snapshot.forEach(doc => {
        const turma = doc.data().turma;
        const option = document.createElement("option");
        option.value = turma;
        option.textContent = turma;
        turmaSelect.appendChild(option);
    });
}

// Função para carregar as eletivas
async function carregarEletivas() {
    const eletivasRef = collection(db, "eletiva");
    const snapshot = await getDocs(eletivasRef);
    const eletivaSelect = document.getElementById("eletiva");
    eletivaSelect.innerHTML = ""; // Limpar as opções anteriores

    snapshot.forEach(doc => {
        const eletiva = doc.data().nomeEletiva;
        const vagas = doc.data().vagas;
        const option = document.createElement("option");
        option.value = eletiva;
        option.textContent = `${eletiva} (${vagas} vagas)`;
        eletivaSelect.appendChild(option);
    });
}

// Função para validar o nome
async function validarNome(nome, turma) {
    const alunosRef = collection(db, "alunos");
    const querySnapshot = await getDocs(query(alunosRef, where("turma", "==", turma)));

    let nomeValido = false;

    querySnapshot.forEach(doc => {
        const aluno = doc.data();
        
        if (aluno) {
            const nomeAluno = aluno.nomealuno && aluno.nomealuno.trim().toLowerCase();
            const turmaAluno = aluno.turma && aluno.turma.trim().toLowerCase();

            if (nomeAluno === nome.trim().toLowerCase() && turmaAluno === turma.trim().toLowerCase()) {
                nomeValido = true;
            }
        }
    });

    return nomeValido;
}

// Função para inscrever o aluno
async function inscreverAluno(nome, turma, eletiva) {
    const inscricaoRef = collection(db, "inscricao");
    const novaInscricao = {
        nomeAluno: nome,
        turma: turma,
        nomeEletiva: eletiva
    };
    await addDoc(inscricaoRef, novaInscricao);
    alert("Inscrição realizada com sucesso!");
}

// Função para carregar as inscrições
async function carregarInscricoes() {
    const inscricoesRef = collection(db, "inscricao");
    const snapshot = await getDocs(inscricoesRef);
    const listaInscricoes = document.getElementById("inscricoes-list").getElementsByTagName('tbody')[0];

    listaInscricoes.innerHTML = ""; // Limpar as inscrições anteriores
    snapshot.forEach(doc => {
        const dados = doc.data();
        const row = listaInscricoes.insertRow();
        row.insertCell(0).textContent = dados.nomeAluno;
        row.insertCell(1).textContent = dados.turma;
        row.insertCell(2).textContent = dados.nomeEletiva;
    });
}

// Inicialização
window.onload = async () => {
    carregarTurmas();
    carregarEletivas();
    carregarInscricoes();

    // Event listener para validar nome e habilitar a seleção da eletiva
    document.getElementById("nome").addEventListener("blur", async () => {
        const nome = document.getElementById("nome").value;
        const turma = document.getElementById("turma").value;

        if (await validarNome(nome, turma)) {
            document.getElementById("eletiva").disabled = false;
            document.getElementById("inscrever-btn").disabled = false;
        } else {
            alert("Nome não encontrado ou não corresponde à turma.");
        }
    });

    // Event listener para inscrição
    document.getElementById("inscricao-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = document.getElementById("nome").value;
        const turma = document.getElementById("turma").value;
        const eletiva = document.getElementById("eletiva").value;

        await inscreverAluno(nome, turma, eletiva);
        carregarInscricoes();
    });
};
