// Importar as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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

// Inscrição com timestamp
async function inscreverAluno(event) {
    event.preventDefault();
    const nomeDigitado = tratarNome(nomeInput.value.trim());
    const turmaSelecionada = turmaSelect.value;
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
                    const eletivaData = eletivaSnapshot.data();

                    if (eletivaData.vagas > 0) {  
                        await updateDoc(alunoRef, { 
                            eletiva: eletivaData.nomeEletiva, 
                            inscrito: true,
                            timestamp: serverTimestamp() // Adiciona a data e hora da inscrição
                        });
                        await updateDoc(eletivaRef, { vagas: eletivaData.vagas - 1 });

                        alertSuave("Inscrição realizada com sucesso!");
                        nomeInput.value = "";
                        turmaSelect.value = "";
                        eletivaContainer.innerHTML = "";
                        inscreverBtn.disabled = true;
                    } else {
                        alertSuave("Não há mais vagas para essa eletiva!");
                    }
                } else {
                    alertSuave("Eletiva não encontrada!");
                }
            } else {
                alertSuave("Você já está inscrito!");
            }
        }
    } catch (error) {
        console.error("Erro ao inscrever:", error);
        alertSuave("Erro ao realizar inscrição.");
    }
}

// Evento de verificação do nome
verificarBtn.addEventListener("click", verificarNome);
document.getElementById("inscricao-form").addEventListener("submit", inscreverAluno);


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
  