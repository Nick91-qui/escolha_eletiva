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
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Carregar turmas
async function carregarTurmas() {
    const alunosSnapshot = await getDocs(collection(db, "aluno"));
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

// Habilitar campo de eletivas ao digitar o nome corretamente
nomeInput.addEventListener("input", async () => {
    const nomeDigitado = nomeInput.value.trim();
    const turmaSelecionada = turmaSelect.value;
    
    if (nomeDigitado && turmaSelecionada) {
        const q = query(collection(db, "aluno"), where("nomeAluno", "==", nomeDigitado), where("turma", "==", turmaSelecionada));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const alunoData = querySnapshot.docs[0].data();
            if (!alunoData.inscrito) {
                eletivaSelect.disabled = false;
                inscreverBtn.disabled = false;
                carregarEletivas();
            } else {
                alert("Você já está inscrito em uma eletiva!");
                nomeInput.value = "";
                eletivaSelect.disabled = true;
                inscreverBtn.disabled = true;
            }
        } else {
            alert("Nome não encontrado na turma selecionada!");
            eletivaSelect.disabled = true;
            inscreverBtn.disabled = true;
        }
    }
});

// Carregar eletivas
async function carregarEletivas() {
    eletivaSelect.innerHTML = '<option value="">Selecione a eletiva</option>';
    const eletivasSnapshot = await getDocs(collection(db, "eletivas"));

    eletivasSnapshot.forEach(doc => {
        const eletiva = doc.data();
        if (eletiva.vagas > 0) {
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = `${eletiva.nomeEletiva} (${eletiva.vagas} vagas)`;
            eletivaSelect.appendChild(option);
        }
    });
}

// Inscrição
document.getElementById("inscricao-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nomeDigitado = nomeInput.value.trim();
    const turmaSelecionada = turmaSelect.value;
    const eletivaSelecionada = eletivaSelect.value;

    if (!eletivaSelecionada) {
        alert("Selecione uma eletiva!");
        return;
    }

    // Buscar aluno no Firebase
    const q = query(collection(db, "aluno"), where("nomeAluno", "==", nomeDigitado), where("turma", "==", turmaSelecionada));
    const alunoSnapshot = await getDocs(q);

    if (!alunoSnapshot.empty) {
        const alunoRef = doc(db, "aluno", alunoSnapshot.docs[0].id);
        const alunoData = alunoSnapshot.docs[0].data();

        if (!alunoData.inscrito) {
            // Atualizar aluno
            await updateDoc(alunoRef, {
                eletiva: eletivaSelecionada,
                inscrito: true
            });

            // Atualizar vagas da eletiva
            const eletivaRef = doc(db, "eletivas", eletivaSelecionada);
            const eletivaDoc = await getDocs(query(collection(db, "eletivas"), where("nomeEletiva", "==", eletivaSelecionada)));

            if (!eletivaDoc.empty) {
                const eletivaData = eletivaDoc.docs[0].data();
                if (eletivaData.vagas > 0) {
                    await updateDoc(eletivaRef, {
                        vagas: eletivaData.vagas - 1
                    });
                }
            }

            alert("Inscrição realizada com sucesso!");
            carregarInscricoes();
        } else {
            alert("Você já está inscrito!");
        }
    }
});

// Carregar inscrições
async function carregarInscricoes() {
    const tbody = document.querySelector("#inscricoes-list tbody");
    tbody.innerHTML = "";
    
    const alunosSnapshot = await getDocs(collection(db, "aluno"));
    alunosSnapshot.forEach(doc => {
        const aluno = doc.data();
        if (aluno.inscrito) {
            tbody.innerHTML += `<tr><td>${aluno.nomeAluno}</td><td>${aluno.turma}</td><td>${aluno.eletiva}</td></tr>`;
        }
    });
}

carregarInscricoes();
