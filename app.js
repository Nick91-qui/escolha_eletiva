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
const eletivaSelect = document.getElementById("eletiva");
const inscreverBtn = document.getElementById("inscrever-btn");

// Função para exibir alertas de forma suave
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

    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

// Carregar turmas
async function carregarTurmas() {
    try {
        const alunosSnapshot = await getDocs(collection(db, "alunos"));
        const turmas = new Set();

        alunosSnapshot.forEach(doc => turmas.add(doc.data().turma));

        if (turmas.size === 0) {
            alertSuave("Nenhuma turma encontrada no banco de dados.");
        }

        turmaSelect.innerHTML = '<option value="">Selecione a turma</option>';
        turmas.forEach(turma => {
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
    eletivaSelect.innerHTML = '<option value="">Selecione a eletiva</option>';
    const eletivasSnapshot = await getDocs(collection(db, "eletivas"));

    eletivasSnapshot.forEach(doc => {
        const eletiva = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${eletiva.nomeEletiva} (${eletiva.vagas} vagas)`;

        if (eletiva.vagas === 0) {
            option.disabled = true; 
        }

        eletivaSelect.appendChild(option);
    });
}

// Função para verificar o nome
async function verificarNome() {
    let nomeDigitado = nomeInput.value.trim();
    const turmaSelecionada = turmaSelect.value;

    if (!nomeDigitado || !turmaSelecionada) {
        alertSuave("Preencha todos os campos corretamente!");
        return;
    }

    // Função para tratar o nome (remover acento, caixa alta, etc.)
    function tratarNome(nome) {
        nome = nome.toUpperCase();
        nome = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
        nome = nome.replace(/ç/g, "c"); 
        return nome;
    }

    nomeDigitado = tratarNome(nomeDigitado);

    const q = query(collection(db, "alunos"), where("nomeAluno", "==", nomeDigitado), where("turma", "==", turmaSelecionada));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const alunoData = querySnapshot.docs[0].data();
        if (!alunoData.inscrito) {
            eletivaSelect.disabled = false;
            inscreverBtn.disabled = false;
            carregarEletivas();
        } else {
            alertSuave("Você já está inscrito em uma eletiva!");
            nomeInput.value = "";
            eletivaSelect.disabled = true;
            inscreverBtn.disabled = true;
        }
    } else {
        alertSuave("Nome não encontrado na turma selecionada!");
        eletivaSelect.disabled = true;
        inscreverBtn.disabled = true;
    }
}

// Evento de verificação do nome
document.getElementById("verificar-btn").addEventListener("click", verificarNome);

// Inscrição do aluno
document.getElementById("inscricao-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomeDigitado = nomeInput.value.trim();
    const turmaSelecionada = turmaSelect.value;
    const eletivaSelecionada = eletivaSelect.value;

    // Verificar se o nome foi validado corretamente e se a eletiva foi selecionada
    if (!nomeDigitado || !turmaSelecionada || !eletivaSelecionada) {
        return;  
    }

    try {
        const q = query(collection(db, "alunos"), where("nomeAluno", "==", nomeDigitado), where("turma", "==", turmaSelecionada));
        const alunoSnapshot = await getDocs(q);

        if (!alunoSnapshot.empty) {
            const alunoRef = doc(db, "alunos", alunoSnapshot.docs[0].id);
            const alunoData = alunoSnapshot.docs[0].data();

            if (!alunoData.inscrito) {
                const eletivaRef = doc(db, "eletivas", eletivaSelecionada);
                const eletivaSnapshot = await getDoc(eletivaRef);

                if (eletivaSnapshot.exists()) {
                    const eletivaData = eletivaSnapshot.data();

                    await updateDoc(alunoRef, {
                        eletiva: eletivaData.nomeEletiva,
                        inscrito: true
                    });

                    await updateDoc(eletivaRef, {
                        vagas: eletivaData.vagas - 1 
                    });

                    alertSuave("Inscrição realizada com sucesso!");
                    nomeInput.value = "";
                    turmaSelect.value = "";
                    eletivaSelect.value = "";
                    eletivaSelect.disabled = true;
                    inscreverBtn.disabled = true;
                } else {
                    alert("Eletiva não encontrada!");
                }
            } else {
                alertSuave("Você já está inscrito!");
            }
        }
    } catch (error) {
        console.error("Erro ao inscrever:", error);
        alertSuave("Erro ao realizar inscrição. Tente novamente.");
    }
});

// Carregar turmas ao iniciar a página
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
  