// Importar as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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
    const alunosSnapshot = await getDocs(collection(db, "alunos"));
    const turmas = new Set();
    
    alunosSnapshot.forEach(doc => turmas.add(doc.data().turma));
    
    turmas.forEach(turma => {
        const option = document.createElement("option");
        option.value = turma;
        option.textContent = turma;
        turmaSelect.appendChild(option);
    });
}

carregarTurmas();

let timeout;

// Verificar nome e turma ao digitar
nomeInput.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const nomeDigitado = nomeInput.value.trim();
        const turmaSelecionada = turmaSelect.value;

        if (nomeDigitado && turmaSelecionada) {
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
    }, 1500);
});

// Carregar eletivas disponíveis
async function carregarEletivas() {
    eletivaSelect.innerHTML = '<option value="">Selecione a eletiva</option>';
    const eletivasSnapshot = await getDocs(collection(db, "eletivas"));

    eletivasSnapshot.forEach(doc => {
        const eletiva = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${eletiva.nomeEletiva} (${eletiva.vagas} vagas)`;

        if (eletiva.vagas === 0) {
            option.disabled = true; // Desativar eletivas sem vagas
        }

        eletivaSelect.appendChild(option);
    });
}

// Inscrição de aluno
document.getElementById("inscricao-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nomeDigitado = nomeInput.value.trim();
    const turmaSelecionada = turmaSelect.value;
    const eletivaSelecionada = eletivaSelect.value;

    if (!eletivaSelecionada) {
        alertSuave("Selecione uma eletiva!");
        return;
    }

    try {
        // Buscar aluno no Firebase
        const q = query(collection(db, "alunos"), where("nomeAluno", "==", nomeDigitado), where("turma", "==", turmaSelecionada));
        const alunoSnapshot = await getDocs(q);

        if (!alunoSnapshot.empty) {
            const alunoRef = doc(db, "alunos", alunoSnapshot.docs[0].id);
            const alunoData = alunoSnapshot.docs[0].data();

            if (!alunoData.inscrito) {
                // Atualizar aluno
                await updateDoc(alunoRef, {
                    eletiva: eletivaSelecionada,
                    inscrito: true
                });

                // Atualizar vagas da eletiva
                const eletivaRef = doc(db, "eletivas", eletivaSelecionada);
                const eletivaDoc = await getDocs(query(collection(db, "eletivas"), where("__name__", "==", eletivaSelecionada)));

                if (!eletivaDoc.empty) {
                    const eletivaData = eletivaDoc.docs[0].data();
                    if (eletivaData.vagas > 0) {
                        await updateDoc(eletivaRef, {
                            vagas: eletivaData.vagas - 1
                        });
                    }
                }

                alertSuave("Inscrição realizada com sucesso!");
                //carregarInscricoes();
            } else {
                alertSuave("Você já está inscrito!");
            }
        }
    } catch (error) {
        console.error("Erro ao inscrever:", error);
        alertSuave("Erro ao realizar inscrição. Tente novamente.");
    }
});
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

exports.updateSheetData = functions.https.onRequest(async (req, res) => {
    try {
      // ID da sua planilha
      const spreadsheetId = '1eTdBl8wdTfPuZovUAyt2hdv2yHl93HdAMjdSRwtBgQI'; // Substitua com o ID da sua planilha
  
      // A planilha será atualizada na faixa de células A1:D521
      const range = 'Página1!A1:D521';
  
      // Dados a serem atualizados, exemplo de atualização após inscrição
      const values = [
        // Você pode mapear o nome, turma e outras informações dos alunos
        ['Nome do aluno', 'Turma', 'Eletiva', 'Status'] // Substitua pelos dados que você deseja
      ];
  
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW', // Define como os valores serão inseridos (RAW ou USER_ENTERED)
        resource: {
          values,
        },
      });
  
      res.status(200).send('Planilha atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar a planilha:', error);
      res.status(500).send('Erro ao atualizar a planilha');
    }
  });
  