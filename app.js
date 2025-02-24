// Função para carregar as turmas sem repetições
async function carregarTurmas() {
    const turmasRef = collection(db, "alunos");
    const snapshot = await getDocs(turmasRef);
    const turmaSelect = document.getElementById("turma");
    
    const turmasUnicas = new Set(); // Armazena turmas únicas

    snapshot.forEach(doc => {
        const turma = doc.data().turma;
        turmasUnicas.add(turma); // Adiciona ao conjunto (evita duplicatas)
    });

    turmaSelect.innerHTML = "<option value=''>Selecione a turma</option>"; // Resetar opções

    // Preencher o select com turmas únicas
    turmasUnicas.forEach(turma => {
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
    
    nomeSelect.innerHTML = "<option value=''>Selecione o aluno</option>"; // Resetar opções
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
        nomeSelect.disabled = true; // Se não houver alunos, desabilita o campo novamente
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
    const eletivaRef = doc(db, "eletivas", eletiva);
    const eletivaDoc = await getDoc(eletivaRef);

    if (eletivaDoc.exists()) {
        let vagas = eletivaDoc.data().vagas;

        if (vagas > 0) {
            await updateDoc(eletivaRef, { vagas: vagas - 1 }); // Reduz o número de vagas

            const inscricaoRef = collection(db, "inscricao");
            const novaInscricao = {
                nomeAluno: nome,
                turma: turma,
                nomeEletiva: eletiva
            };
            await addDoc(inscricaoRef, novaInscricao);
            alert("Inscrição realizada com sucesso!");

            carregarInscricoes(); // Atualiza a lista de inscrições
            carregarEletivas(); // Atualiza as vagas no dropdown
        } else {
            alert("Esta eletiva já atingiu o limite de vagas.");
        }
    } else {
        alert("Erro: Eletiva não encontrada.");
    }
}

// Função para carregar as eletivas
async function carregarEletivas() {
    const eletivasRef = collection(db, "eletivas");
    const snapshot = await getDocs(eletivasRef);
    const eletivaSelect = document.getElementById("eletiva");

    eletivaSelect.innerHTML = "<option value=''>Selecione a eletiva</option>"; // Resetar opções

    snapshot.forEach(doc => {
        const dados = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${dados.nomeEletiva} (${dados.vagas} vagas)`;
        eletivaSelect.appendChild(option);
    });

    eletivaSelect.disabled = true; // Mantém o campo desativado até um nome ser selecionado
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
    });
};
