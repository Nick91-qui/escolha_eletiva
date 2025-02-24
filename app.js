 <!-- Scripts do Firebase -->

        // Importar as funções necessárias do SDK do Firebase
// Importar as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, addDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
    authDomain: "device-streaming-9e3b934a.firebaseapp.com",
    databaseURL: "https://device-streaming-9e3b934a-default-rtdb.firebaseio.com",
    projectId: "device-streaming-9e3b934a",
    storageBucket: "device-streaming-9e3b934a.firebasestorage.app",
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

    turmaSelect.innerHTML = "<option value=''>Selecione a turma</option>"; // Limpar antes de adicionar

    const turmas = new Set(); // Garantir que não haja turmas duplicadas
    snapshot.forEach(doc => turmas.add(doc.data().turma));

    turmas.forEach(turma => {
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

    eletivaSelect.innerHTML = "<option value=''>Selecione a eletiva</option>"; // Limpar antes de adicionar

    snapshot.forEach(doc => {
        const eletiva = doc.data().nomeEletiva;
        const vagas = doc.data().vagas;
        const option = document.createElement("option");
        option.value = eletiva;
        option.textContent = ${eletiva} (${vagas} vagas);
        eletivaSelect.appendChild(option);
    });
}

// Função para verificar se o nome existe no Firebase
async function validarNome(turma, nome) {
    const alunosRef = collection(db, "alunos");
    const q = query(alunosRef, where("turma", "==", turma), where("nomealuno", "==", nome));
    const snapshot = await getDocs(q);

    return !snapshot.empty; // Retorna true se o nome existir
}

// Função para inscrever o aluno
async function inscreverAluno(nome, turma, eletiva) {
    const inscricaoRef = collection(db, "inscricao");
    await addDoc(inscricaoRef, {
        nomeAluno: nome,
        turma: turma,
        nomeEletiva: eletiva
    });
    alert("Inscrição realizada com sucesso!");
}

// Função para carregar as inscrições
async function carregarInscricoes() {
    const inscricoesRef = collection(db, "inscricao");
    const snapshot = await getDocs(inscricoesRef);
    const listaInscricoes = document.getElementById("inscricoes-list").getElementsByTagName('tbody')[0];

    listaInscricoes.innerHTML = ""; // Limpar a tabela
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

    const turmaSelect = document.getElementById("turma");
    const nomeInput = document.getElementById("nome");
    const eletivaSelect = document.getElementById("eletiva");
    const inscreverBtn = document.getElementById("inscrever-btn");

    // Habilitar a eletiva somente após validar o nome
    nomeInput.addEventListener("input", async () => {
        const turma = turmaSelect.value;
        const nome = nomeInput.value.trim();

        if (turma && nome) {
            const nomeValido = await validarNome(turma, nome);
            if (nomeValido) {
                eletivaSelect.disabled = false;
                inscreverBtn.disabled = false;
                nomeInput.style.borderColor = "green"; // Indicar que o nome é válido
            } else {
                eletivaSelect.disabled = true;
                inscreverBtn.disabled = true;
                nomeInput.style.borderColor = "red"; // Indicar erro
            }
        } else {
            eletivaSelect.disabled = true;
            inscreverBtn.disabled = true;
        }
    });

    // Event listener para inscrição
    document.getElementById("inscricao-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = nomeInput.value.trim();
        const turma = turmaSelect.value;
        const eletiva = eletivaSelect.value;

        await inscreverAluno(nome, turma, eletiva);
        carregarInscricoes();
    });
};


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
        option.textContent = ${dados.nomeEletiva} (${dados.vagas} vagas);
        eletivaSelect.appendChild(option);
    });

    eletivaSelect.disabled = true; // Mantém o campo desativado até um nome ser validado
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

    // Event listener para limpar nome e bloquear eletiva ao mudar de turma
    document.getElementById("turma").addEventListener("change", () => {
        document.getElementById("nome").value = "";
        document.getElementById("eletiva").disabled = true;
        document.getElementById("inscrever-btn").disabled = true;
    });

    // Event listener para validar nome ao digitar
    document.getElementById("nome").addEventListener("input", async () => {
        const nome = document.getElementById("nome").value;
        const turma = document.getElementById("turma").value;

        if (nome && turma && await validarNome(nome, turma)) {
            document.getElementById("eletiva").disabled = false;
            document.getElementById("inscrever-btn").disabled = false;
        } else {
            document.getElementById("eletiva").disabled = true;
            document.getElementById("inscrever-btn").disabled = true;
        }
    });

    // Event listener para inscrição
    document.getElementById("inscricao-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = document.getElementById("nome").value;
        const turma = document.getElementById("turma").value;
        const eletiva = document.getElementById("eletiva").value;

        if (await validarNome(nome, turma)) {
            await inscreverAluno(nome, turma, eletiva);
        } else {
            alert("Nome não encontrado ou não corresponde à turma.");
        }
    });
};
