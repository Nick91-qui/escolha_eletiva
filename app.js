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

// Função para carregar os nomes dos alunos com base na turma selecionada
async function carregarNomes(turmaSelecionada) {
    const alunosRef = collection(db, "alunos");
    const snapshot = await getDocs(query(alunosRef, where("turma", "==", turmaSelecionada)));
    const nomeSelect = document.getElementById("nome");
    nomeSelect.innerHTML = ""; // Limpar as opções anteriores
    nomeSelect.disabled = false; // Habilitar a seleção de nome

    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            const nomeAluno = doc.data().nomealuno;
            const option = document.createElement("option");
            option.value = nomeAluno;
            option.textContent = nomeAluno;
            nomeSelect.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Nenhum aluno encontrado";
        nomeSelect.appendChild(option);
    }
}

// Função para validar o nome e turma
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

    // Event listener para carregar os alunos ao selecionar uma turma
    document.getElementById("turma").addEventListener("change", async () => {
        const turmaSelecionada = document.getElementById("turma").value;
        if (turmaSelecionada) {
            await carregarNomes(turmaSelecionada);
            document.getElementById("eletiva").disabled = true;
            document.getElementById("inscrever-btn").disabled = true;
        } else {
            document.getElementById("nome").disabled = true;
        }
    });

    // Event listener para validar nome e habilitar a seleção da eletiva
    document.getElementById("nome").addEventListener("change", async () => {
        const nome = document.getElementById("nome").value;
        const turma = document.getElementById("turma").value;

        if (nome && turma && await validarNome(nome, turma)) {
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
