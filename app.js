// Importar as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
    authDomain: "device-streaming-9e3b934a.firebaseapp.com",
    projectId: "device-streaming-9e3b934a",
    storageBucket: "device-streaming-9e3b934a.appspot.com",
    messagingSenderId: "608328398854",
    appId: "1:608328398854:web:706cf69b6dcb751930ab87"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos do formulário
const turmaSelect = document.getElementById("turma");
const nomeInput = document.getElementById("nome");
const eletivaContainer = document.getElementById("eletiva-container");
const inscreverBtn = document.getElementById("inscrever-btn");
const verificarBtn = document.getElementById("verificar-btn");

// Função para exibir alertas
function alertSuave(mensagem) {
    const alerta = document.createElement("div");
    alerta.textContent = mensagem;
    alerta.style.position = "fixed";
    alerta.style.top = "20px";
    alerta.style.left = "50%";
    alerta.style.transform = "translateX(-50%)";
    alerta.style.background = "#007bff";
    alerta.style.color = "white";
    alerta.style.padding = "10px";
    alerta.style.borderRadius = "5px";
    alerta.style.zIndex = "1000";
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}

// Carregar turmas
async function carregarTurmas() {
    try {
        const alunosSnapshot = await getDocs(collection(db, "alunos"));
        let turmas = new Set();

        alunosSnapshot.forEach(doc => turmas.add(doc.data().turma));

        if (turmas.size === 0) {
            alertSuave("Nenhuma turma encontrada no banco de dados.");
        }

        turmaSelect.innerHTML = '<option value="">Selecione a turma</option>';

        // Converter para array, ordenar e preencher o select
        [...turmas].sort().forEach(turma => {
            const option = document.createElement("option");
            option.value = turma;
            option.textContent = turma;
            turmaSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar as turmas:", error);
        alertSuave("Erro ao carregar as turmas. Tente novamente.");
    }
}

// Carregar eletivas
async function carregarEletivas() {
    eletivaContainer.innerHTML = ""; // Limpar conteúdo antes de carregar novas opções

    const eletivasSnapshot = await getDocs(collection(db, "eletivas"));

    eletivasSnapshot.forEach(doc => {
        const eletiva = doc.data();
        const eletivaId = doc.id;

        // Criar um elemento para a opção de eletiva
        const label = document.createElement("label");
        label.style.display = "block";
        label.style.marginBottom = "5px";

        // Criar o botão de rádio
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "eletiva";
        radio.value = eletivaId;

        if (eletiva.vagas === 0) {
            radio.disabled = true; // Desativar caso não tenha vagas
        }

        // Adicionar o texto com o nome da eletiva e número de vagas
        label.appendChild(radio);
        label.appendChild(document.createTextNode(` ${eletiva.nomeEletiva} (${eletiva.vagas} vagas)`));

        eletivaContainer.appendChild(label);
    });

    inscreverBtn.disabled = false;
}

// Tratar nome
function tratarNome(nome) {
    return nome.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ç/g, "c");
}

// Verificar nome
async function verificarNome(event) {
    event.preventDefault();
    let nomeDigitado = tratarNome(nomeInput.value.trim());
    const turmaSelecionada = turmaSelect.value;

    if (!nomeDigitado || !turmaSelecionada) {
        alertSuave("Preencha todos os campos corretamente!");
        return;
    }

    const q = query(collection(db, "alunos"), where("nomeAluno", "==", nomeDigitado), where("turma", "==", turmaSelecionada));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const alunoData = querySnapshot.docs[0].data();
        if (!alunoData.inscrito) {
            inscreverBtn.disabled = false;
            carregarEletivas();
        } else {
            alertSuave("Você já está inscrito!");
            nomeInput.value = "";
            inscreverBtn.disabled = true;
        }
    } else {
        alertSuave("Nome não encontrado!");
        inscreverBtn.disabled = true;
    }
}

// Evento de verificação do nome
verificarBtn.addEventListener("click", verificarNome);

// Inscrição
async function inscreverAluno(event) {
    event.preventDefault();
    const nomeDigitado = tratarNome(nomeInput.value.trim());
    const turmaSelecionada = turmaSelect.value;

    // Capturar a eletiva selecionada
    const eletivaSelecionada = document.querySelector('input[name="eletiva"]:checked');

    if (!nomeDigitado || !turmaSelecionada || !eletivaSelecionada) {
        alertSuave("Escolha uma eletiva antes de se inscrever!");
        return;
    }

    const eletivaId = eletivaSelecionada.value;

    try {
        const q = query(collection(db, "alunos"), where("nomeAluno", "==", nomeDigitado), where("turma", "==", turmaSelecionada));
        const alunoSnapshot = await getDocs(q);

        if (!alunoSnapshot.empty) {
            const alunoRef = doc(db, "alunos", alunoSnapshot.docs[0].id);
            const alunoData = alunoSnapshot.docs[0].data();
            if (!alunoData.inscrito) {
                const eletivaRef = doc(db, "eletivas", eletivaId);
                const eletivaSnapshot = await getDoc(eletivaRef);
                if (eletivaSnapshot.exists()) {
                    await updateDoc(alunoRef, { eletiva: eletivaSnapshot.data().nomeEletiva, inscrito: true });
                    await updateDoc(eletivaRef, { vagas: eletivaSnapshot.data().vagas - 1 });
                    alertSuave("Inscrição realizada com sucesso!");
                    nomeInput.value = "";
                    turmaSelect.value = "";
                    eletivaContainer.innerHTML = "";
                    inscreverBtn.disabled = true;
                } else alertSuave("Eletiva não encontrada!");
            } else alertSuave("Você já está inscrito!");
        }
    } catch (error) {
        console.error("Erro ao inscrever:", error);
        alertSuave("Erro ao realizar inscrição.");
    }
}

document.getElementById("inscricao-form").addEventListener("submit", inscreverAluno);
carregarTurmas();

  /*
async function carregarInscricoes() {
    const tbody = document.querySelector("#inscricoes-list tbody");
    tbody.innerHTML = "";

    const alunosSnapshot = await getDocs(collection(db, "alunos"));
    const inscricoes = [];

    alunosSnapshot.forEach(doc => {
        const aluno = doc.data();
        if (aluno.inscrito) {
            inscricoes.push({
                eletiva: aluno.eletiva,
                turma: aluno.turma,
                nomeAluno: aluno.nomeAluno
            });
        }
    });

    // Ordenar por eletiva para melhor visualização (opcional)
    inscricoes.sort((a, b) => a.eletiva.localeCompare(b.eletiva));

    // Preencher a tabela com a nova ordem: Eletiva - Turma - Aluno
    inscricoes.forEach(inscricao => {
        tbody.innerHTML += `<tr>
            <td>${inscricao.eletiva}</td>
            <td>${inscricao.turma}</td>
            <td>${inscricao.nomeAluno}</td>
        </tr>`;
    });
}


carregarInscricoes();
*/
  