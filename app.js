import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, getDoc, query, where, getDocs, doc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
  authDomain: "device-streaming-9e3b934a.firebaseapp.com",
  projectId: "device-streaming-9e3b934a",
  storageBucket: "device-streaming-9e3b934a.firebasestorage.app",
  messagingSenderId: "608328398854",
  appId: "1:608328398854:web:706cf69b6dcb751930ab87"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para inscrever aluno em uma eletiva
async function inscreverAluno(alunoId, eletivaId) {
  const alunoRef = doc(db, "alunos", alunoId);
  const eletivaRef = doc(db, "eletivas", eletivaId);

  // Verificar se a eletiva tem vagas
  const eletivaDoc = await getDoc(eletivaRef);
  if (!eletivaDoc.exists()) {
    console.log("Eletiva não encontrada");
    return;
  }
  
  const vagasDisponiveis = eletivaDoc.data().vagas;
  if (vagasDisponiveis <= 0) {
    console.log("Não há vagas disponíveis para essa eletiva");
    return;
  }

  // Verificar se o aluno já está inscrito em uma eletiva
  const alunoDoc = await getDoc(alunoRef);
  if (alunoDoc.exists() && alunoDoc.data().eletivaInscrita) {
    console.log("O aluno já está inscrito em uma eletiva");
    return;
  }

  // Registrar inscrição no Firestore
  try {
    // Inscreve aluno na eletiva
    await addDoc(collection(db, "inscricoes"), {
      alunoId: alunoId,
      eletivaId: eletivaId
    });

    // Atualiza o aluno com a eletiva escolhida
    await updateDoc(alunoRef, {
      eletivaInscrita: eletivaId
    });

    // Atualiza o número de vagas disponíveis
    await updateDoc(eletivaRef, {
      vagas: vagasDisponiveis - 1
    });

    console.log("Aluno inscrito com sucesso!");

  } catch (e) {
    console.error("Erro ao inscrever aluno: ", e);
  }
}

// Função para listar alunos inscritos em uma eletiva
async function listarInscricoesPorEletiva(eletivaId) {
  const inscricoesRef = collection(db, "inscricoes");
  const q = query(inscricoesRef, where("eletivaId", "==", eletivaId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    console.log("Aluno ID:", doc.data().alunoId);
  });
}
