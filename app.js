// Não precisa do require, use diretamente as variáveis globais do Firebase
const app = firebase.initializeApp({
  apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
  authDomain: "device-streaming-9e3b934a.firebaseapp.com",
  projectId: "device-streaming-9e3b934a",
  storageBucket: "device-streaming-9e3b934a.firebasestorage.app",
  messagingSenderId: "608328398854",
  appId: "1:608328398854:web:706cf69b6dcb751930ab87"
});

const db = firebase.firestore();

// Função para inscrever aluno em uma eletiva
async function inscreverAluno(alunoId, eletivaId) {
  const alunoRef = db.collection("alunos").doc(alunoId);
  const eletivaRef = db.collection("eletivas").doc(eletivaId);

  // Verificar se a eletiva tem vagas
  const eletivaDoc = await eletivaRef.get();
  if (!eletivaDoc.exists) {
    console.log("Eletiva não encontrada");
    return;
  }
  
  const vagasDisponiveis = eletivaDoc.data().vagas;
  if (vagasDisponiveis <= 0) {
    console.log("Não há vagas disponíveis para essa eletiva");
    return;
  }

  // Verificar se o aluno já está inscrito em uma eletiva
  const alunoDoc = await alunoRef.get();
  if (alunoDoc.exists && alunoDoc.data().eletivaInscrita) {
    console.log("O aluno já está inscrito em uma eletiva");
    return;
  }

  // Registrar inscrição no Firestore
  try {
    // Inscreve aluno na eletiva
    await db.collection("inscricoes").add({
      alunoId: alunoId,
      eletivaId: eletivaId
    });

    // Atualiza o aluno com a eletiva escolhida
    await alunoRef.update({
      eletivaInscrita: eletivaId
    });

    // Atualiza o número de vagas disponíveis
    await eletivaRef.update({
      vagas: vagasDisponiveis - 1
    });

    console.log("Aluno inscrito com sucesso!");

  } catch (e) {
    console.error("Erro ao inscrever aluno: ", e);
  }
}

// Função para listar alunos inscritos em uma eletiva
async function listarInscricoesPorEletiva(eletivaId) {
  const inscricoesRef = db.collection("inscricoes");
  const querySnapshot = await inscricoesRef.where("eletivaId", "==", eletivaId).get();
  querySnapshot.forEach((doc) => {
    console.log("Aluno ID:", doc.data().alunoId);
  });
}
