const { useState, useEffect } = React;
const { initializeApp } = firebase;
const { getFirestore, collection, addDoc, getDocs } = firebase.firestore;

const firebaseConfig = {
  apiKey: "AIzaSyAqZBVNO_jIjah9v-Tp_Axy1LoMLkaINPU",
  authDomain: "device-streaming-9e3b934a.firebaseapp.com",
  projectId: "device-streaming-9e3b934a",
  storageBucket: "device-streaming-9e3b934a.firebasestorage.app",
  messagingSenderId: "608328398854",
  appId: "1:608328398854:web:706cf69b6dcb751930ab87"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function handleInscricao(turmaSelecionada, alunoNome, eletivaSelecionada) {
  try {
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

async function fetchInscricoes() {
  try {
    const querySnapshot = await getDocs(collection(db, "inscricoes"));
    let inscricoesList = [];
    querySnapshot.forEach((doc) => {
      inscricoesList.push(doc.data());
    });
    return inscricoesList;
  } catch (e) {
    console.error("Erro ao recuperar inscrições: ", e);
    return [];
  }
}

function InscricaoEletivas() {
  const [turmas] = useState(["1A", "1B", "2A", "2B", "3A", "3B"]);
  const [alunos] = useState({ "1A": ["Ana Silva", "Bruno Souza"], "1B": ["Carlos Mendes", "Daniela Lima"] });
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [alunoNome, setAlunoNome] = useState("");
  const [eletivaSelecionada, setEletivaSelecionada] = useState("");
  const [inscricoes, setInscricoes] = useState([]);
  const [erroNome, setErroNome] = useState("");
  const [erroInscricao, setErroInscricao] = useState("");
  const [nomeValido, setNomeValido] = useState(false);
  const [eletivas] = useState([
    { nome: "Arte Digital", vagas: 3 },
    { nome: "Astronomia", vagas: 2 },
    { nome: "Biotecnologia", vagas: 3 },
    { nome: "Cinema e Sociedade", vagas: 2 },
    { nome: "Design de Jogos", vagas: 3 },
    { nome: "Empreendedorismo", vagas: 2 },
    { nome: "Escrita Criativa", vagas: 3 },
    { nome: "Fotografia", vagas: 2 },
    { nome: "Inteligência Artificial", vagas: 3 },
    { nome: "Música", vagas: 3 },
    { nome: "Nutrição e Saúde", vagas: 3 },
    { nome: "Química Experimental", vagas: 2 },
    { nome: "Robótica", vagas: 2 }
  ]);

  useEffect(() => {
    // Chama a função fetchInscricoes para obter inscrições do Firestore
    fetchInscricoes().then((result) => {
      setInscricoes(result);
    });
  }, []);

  const verificarNome = (nome) => {
    setAlunoNome(nome);
    setErroInscricao("");
    if (alunos[turmaSelecionada]?.includes(nome)) {
      setErroNome("");
      setNomeValido(true);
    } else {
      setErroNome("Nome não encontrado na turma. Verifique se digitou corretamente.");
      setNomeValido(false);
    }
  };

  const handleInscricaoClick = () => {
    if (turmaSelecionada && alunoNome && eletivaSelecionada && nomeValido) {
      const alunoJaInscrito = inscricoes.some(({ nome }) => nome === alunoNome);
      if (alunoJaInscrito) {
        setErroInscricao("Você já está inscrito em uma eletiva e não pode se inscrever novamente.");
        return;
      }

      const eletiva = eletivas.find(e => e.nome === eletivaSelecionada);
      if (eletiva && eletiva.vagas === 0) {
        setErroInscricao("Esta eletiva não tem mais vagas disponíveis.");
        return;
      }

      setErroInscricao("");
      setInscricoes([...inscricoes, { turma: turmaSelecionada, nome: alunoNome, eletiva: eletivaSelecionada }]);

      handleInscricao(turmaSelecionada, alunoNome, eletivaSelecionada);

      setAlunoNome("");
      setEletivaSelecionada("");
      setNomeValido(false);
    }
  };

  return (
    <div>
      <h2>Inscrição nas Eletivas</h2>
      {/* Formulário de inscrição */}
      <select onChange={(e) => setTurmaSelecionada(e.target.value)} value={turmaSelecionada}>
        <option value="">Selecione sua turma</option>
        {turmas.map((turma) => (
          <option key={turma} value={turma}>{turma}</option>
        ))}
      </select>

      {turmaSelecionada && (
        <input
          type="text"
          placeholder="Digite seu nome completo"
          value={alunoNome}
          onChange={(e) => verificarNome(e.target.value)}
        />
      )}

      {erroNome && <p>{erroNome}</p>}
      {erroInscricao && <p>{erroInscricao}</p>}

      {nomeValido && !erroInscricao && (
        <select onChange={(e) => setEletivaSelecionada(e.target.value)} value={eletivaSelecionada}>
          <option value="">Selecione uma eletiva</option>
          {eletivas.map(({ nome, vagas }) => (
            <option key={nome} value={nome} disabled={vagas === 0}>
              {nome} ({vagas} vagas)
            </option>
          ))}
        </select>
      )}

      <button onClick={handleInscricaoClick} disabled={!turmaSelecionada || !nomeValido || !eletivaSelecionada}>
        Inscrever-se
      </button>

      {/* Lista de inscritos */}
      <h3>Lista de Inscritos</h3>
      <ul>
        {inscricoes.map(({ nome, turma, eletiva }, index) => (
          <li key={index}>{nome} - {turma} - {eletiva}</li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.render(<InscricaoEletivas />, document.getElementById("app"));
