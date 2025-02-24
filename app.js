// Importar as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, addDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
    authDomain: "device-streaming-9e3b934a.firebaseapp.com",
    projectId: "device-streaming-9e3b934a",
    storageBucket: "device-streaming-9e3b934a.appspot.com",
    messagingSenderId: "608328398854",
    appId: "1:608328398854:web:706cf69b6dcb751930ab87"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para carregar as turmas
async function carregarTurmas() {
    const turmasRef = collection(db, "alunos");
    const snapshot = await getDocs(turmasRef);
    const turmaSelect = document.getElementById("turma");
    
    turmaSelect.innerHTML = "<option value=''>Selecione a turma</option>";
    const turmasUnicas = new Set();

    snapshot.forEach(doc => turmasUnicas.add(doc.data().turma));
    turmasUnicas.forEach(turma => {
        const option = document.createElement("option");
        option.value = turma;
        option.textContent = turma;
        turmaSelect.appendChild(option);
    });
}

// Função para carregar as eletivas
async function carregarEletivas() {
    const eletivasRef = collection(db, "eletivas");
    const snapshot = await getDocs(eletivasRef);
    const eletivaSelect = document.getElementById("eletiva");
    
    eletivaSelect.innerHTML = "<option value=''>Selecione a eletiva</option>";
    snapshot.forEach(doc => {
        const dados = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${dados.nomeEletiva} (${dados.vagas} vagas)`;
        eletivaSelect.appendChild(option);
    });
    eletivaSelect.disabled = true;
}

// Função para validar o nome e turma
async function validarNome(nome, turma) {
    const alunosRef = collection(db, "alunos");
    const q = query(alunosRef, where("turma", "==", turma), where("nomeAluno", "==", nome));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}

// Função para inscrever o aluno
async function inscreverAluno(nome, turma, eletiva) {
    const eletivaRef = doc(db, "eletivas", eletiva);
    const eletivaDoc = await getDoc(eletivaRef);

    if (eletivaDoc.exists()) {
        let vagas = eletivaDoc.data().vagas;
        if (vagas > 0) {
            await updateDoc(eletivaRef, { vagas: vagas - 1 });
            await addDoc(collection(db, "inscricao"), { nomeAluno: nome, turma: turma, nomeEletiva: eletiva });
            alert("Inscrição realizada com sucesso!");
            carregarInscricoes();
            carregarEletivas();
        } else {
            alert("Esta eletiva já atingiu o limite de vagas.");
        }
    } else {
        alert("Erro: Eletiva não encontrada.");
    }
}

// Função para carregar as inscrições
async function carregarInscricoes() {
    const inscricoesRef = collection(db, "inscricao");
    const snapshot = await getDocs(inscricoesRef);
    const listaInscricoes = document.getElementById("inscricoes-list").getElementsByTagName('tbody')[0];
    
    listaInscricoes.innerHTML = "";
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

    document.getElementById("turma").addEventListener("change", () => {
        document.getElementById("nome").value = "";
        document.getElementById("eletiva").disabled = true;
        document.getElementById("inscrever-btn").disabled = true;
    });

    document.getElementById("nome").addEventListener("input", async () => {
        const nome = document.getElementById("nome").value.trim();
        const turma = document.getElementById("turma").value;
        
        if (nome && turma && await validarNome(nome, turma)) {
            document.getElementById("eletiva").disabled = false;
            document.getElementById("inscrever-btn").disabled = false;
        } else {
            document.getElementById("eletiva").disabled = true;
            document.getElementById("inscrever-btn").disabled = true;
        }
    });

    document.getElementById("inscricao-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = document.getElementById("nome").value.trim();
        const turma = document.getElementById("turma").value;
        const eletiva = document.getElementById("eletiva").value;

        if (await validarNome(nome, turma)) {
            await inscreverAluno(nome, turma, eletiva);
        } else {
            alert("Nome não encontrado ou não corresponde à turma.");
        }
    });
};
