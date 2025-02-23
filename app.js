import React, { useState } from 'react';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Configuração do Firebase (substitua pelos seus dados reais)
const firebaseConfig = {
  apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
  authDomain: "device-streaming-9e3b934a.firebaseapp.com",
  projectId: "device-streaming-9e3b934a",
  storageBucket: "device-streaming-9e3b934a.firebasestorage.app",
  messagingSenderId: "608328398854",
  appId: "1:608328398854:web:706cf69b6dcb751930ab87"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Obtém o Firestore
const db = getFirestore(app);

// Função para adicionar inscrição no Firestore
async function handleInscricao(turmaSelecionada, alunoNome, eletivaSelecionada) {
  try {
    // Adiciona o documento na coleção de "inscricoes"
    await addDoc(collection(db, "inscricoes"), {
      turma: turmaSelecionada,
      nome: alunoNome,
      eletiva: eletivaSelecionada,
    });
    console.log("Inscrição adicionada com sucesso!");
  } catch (e) {
    console.error("Erro ao adicionar inscrição: ", e);
  }
}

// Função para recuperar as inscrições do Firestore
async function fetchInscricoes() {
  try {
    const querySnapshot = await getDocs(collection(db, "inscricoes"));
    const inscricoes = [];
    querySnapshot.forEach((doc) => {
      inscricoes.push(doc.data());
    });
    return inscricoes;
  } catch (e) {
    console.error("Erro ao recuperar inscrições: ", e);
  }
}

// Componente principal do app (React)
const InscricaoEletivas = () => {
  const [turma, setTurma] = useState('');
  const [aluno, setAluno] = useState('');
  const [eletiva, setEletiva] = useState('');
  const [inscricoes, setInscricoes] = useState([]);

  // Função para adicionar inscrição
  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleInscricao(turma, aluno, eletiva);
    // Atualiza a lista de inscrições após o envio
    const novasInscricoes = await fetchInscricoes();
    setInscricoes(novasInscricoes);
  };

  return (
    <div>
      <h1>Inscrição nas Eletivas</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome do Aluno:</label>
          <input
            type="text"
            value={aluno}
            onChange={(e) => setAluno(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Turma:</label>
          <input
            type="text"
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Eletiva:</label>
          <input
            type="text"
            value={eletiva}
            onChange={(e) => setEletiva(e.target.value)}
            required
          />
        </div>
        <button type="submit">Inscrever</button>
      </form>

      <h2>Inscrições Realizadas:</h2>
      <ul>
        {inscricoes.map((inscricao, index) => (
          <li key={index}>
            {inscricao.nome} - {inscricao.turma} - {inscricao.eletiva}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InscricaoEletivas;
