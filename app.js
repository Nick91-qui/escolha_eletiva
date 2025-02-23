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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Função para carregar as turmas
async function carregarTurmas() {
    const turmasRef = db.collection("alunos");
    const snapshot = await turmasRef.get();
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
    const eletivasRef = db.collection("eletiva");
    const snapshot = await eletivasRef.get();
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
    const alunosRef = db.collection("alunos");
    const querySnapshot = await alunosRef.where("turma", "==", turma).get();

    let nomeValido = false;

    // Verifica se algum aluno corresponde à turma e nome
    querySnapshot.forEach(doc => {
        const aluno = doc.data();
        if (aluno) {
            const nomeAluno = aluno.nomealuno;
            const turmaAluno = aluno.turma;

            // Verificação para garantir que temos os dados necessários
            if (nomeAluno && turmaAluno) {
                console.log("Aluno encontrado:", nomeAluno, turmaAluno); // Depuração para ver os dados
                if (nomeAluno.toLowerCase() === nome.toLowerCase()) {
                    nomeValido = true;
                }
            } else {
                console.log("Dados do aluno incompletos:", aluno); // Depuração
            }
        }
    });

    return nomeValido;
}



// Função para inscrever o aluno
async function inscreverAluno(nome, turma, eletiva) {
    const inscricaoRef = db.collection("inscricao");
    const novaInscricao = {
        nomeAluno: nome,
        turma: turma,
        nomeEletiva: eletiva
    };
    await inscricaoRef.add(novaInscricao);
    alert("Inscrição realizada com sucesso!");
}

// Função para carregar as inscrições
async function carregarInscricoes() {
    const inscricoesRef = db.collection("inscricao");
    const snapshot = await inscricoesRef.get();
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
