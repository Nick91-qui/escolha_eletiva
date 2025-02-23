// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
  authDomain: "device-streaming-9e3b934a.firebaseapp.com",
  projectId: "device-streaming-9e3b934a",
  storageBucket: "device-streaming-9e3b934a.firebasestorage.app",
  messagingSenderId: "608328398854",
  appId: "1:608328398854:web:706cf69b6dcb751930ab87"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Função para verificar se o aluno já se inscreveu em alguma eletiva
async function verificarInscricao(alunoNome) {
  const inscritosRef = db.collection("inscricoes");
  const snapshot = await inscritosRef.where("nome", "==", alunoNome).get();
  return !snapshot.empty; // Se já houver uma inscrição, retorna true
}

// Função para verificar as vagas restantes
async function verificarVagas() {
  const eletivasRef = db.collection("eletivas");
  const snapshot = await eletivasRef.get();
  let vagas = {};

  snapshot.forEach((doc) => {
    vagas[doc.id] = doc.data().vagas;
  });

  // Atualiza as vagas na interface
  document.getElementById("vagasEletiva1").innerText = vagas["Eletiva1"] || 0;
  document.getElementById("vagasEletiva2").innerText = vagas["Eletiva2"] || 0;
  document.getElementById("vagasEletiva3").innerText = vagas["Eletiva3"] || 0;

  return vagas;
}

// Função para fazer a inscrição do aluno
async function inscreverAluno(turma, alunoNome, eletivaSelecionada) {
  const vagas = await verificarVagas();

  // Verifica se o aluno já está inscrito
  if (await verificarInscricao(alunoNome)) {
    alert("Este aluno já está inscrito em uma eletiva!");
    return;
  }

  // Verifica se há vagas disponíveis para a eletiva
  if (vagas[eletivaSelecionada] <= 0) {
    alert("Não há vagas disponíveis para esta eletiva!");
    return;
  }

  // Cria a inscrição no Firestore
  await db.collection("inscricoes").add({
    turma: turma,
    nome: alunoNome,
    eletiva: eletivaSelecionada
  });

  // Atualiza o número de vagas
  await db.collection("eletivas").doc(eletivaSelecionada).update({
    vagas: firebase.firestore.FieldValue.increment(-1) // Diminui 1 vaga
  });

  alert("Inscrição realizada com sucesso!");
  listarInscricoes();
  verificarVagas();
}

// Função para listar as inscrições na interface
async function listarInscricoes() {
  const inscritosRef = db.collection("inscricoes");
  const snapshot = await inscritosRef.get();
  const inscricoesList = document.getElementById("inscricoesList");
  inscricoesList.innerHTML = ""; // Limpa a lista antes de atualizar

  snapshot.forEach((doc) => {
    const li = document.createElement("li");
    const data = doc.data();
    li.textContent = `${data.nome} - ${data.turma} - ${data.eletiva}`;
    inscricoesList.appendChild(li);
  });
}

// Inicializa a página e carrega as inscrições
document.addEventListener("DOMContentLoaded", async () => {
  await listarInscricoes();
  await verificarVagas();
});

// Manipulador de evento do formulário
document.getElementById("inscricaoForm").addEventListener("submit", (event) => {
  event.preventDefault(); // Evita o envio do formulário

  const alunoNome = document.getElementById("alunoNome").value;
  const turma = document.getElementById("turma").value;
  const eletivaSelecionada = document.getElementById("eletiva").value;

  // Inscreve o aluno
  inscreverAluno(turma, alunoNome, eletivaSelecionada);
});
