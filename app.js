const { useState, useEffect } = React;

const eletivasIniciais = [
  { nome: "Arte Digital", vagas: 1 },
  { nome: "Astronomia", vagas: 1 },
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
];

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
  const [eletivas, setEletivas] = useState(eletivasIniciais);

  useEffect(() => {
    // Recupera inscrições do Firestore quando o componente for carregado
    fetchInscricoes();
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

  const handleInscricao = () => {
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

      // Chama a função para adicionar a inscrição no Firestore
      handleInscricao(turmaSelecionada, alunoNome, eletivaSelecionada);

      setAlunoNome("");
      setEletivaSelecionada("");
      setNomeValido(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <div className="card-content">
          <h2>Inscrição nas Eletivas</h2>
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

          {erroNome && <p className="error">{erroNome}</p>}
          {erroInscricao && <p className="error">{erroInscricao}</p>}

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

          <button onClick={handleInscricao} disabled={!turmaSelecionada || !nomeValido || !eletivaSelecionada}>
            Inscrever-se
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <h2>Lista de Eletivas</h2>
          <ul className="eletivas-lista">
            {eletivas.map(({ nome, vagas }) => (
              <li key={nome} className={vagas === 0 ? "esgotado" : ""}>
                {nome} - {vagas} vagas
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <h2>Lista de Inscritos</h2>
          <table>
            <thead>
              <tr>
                <th>Eletiva</th>
                <th>Nome</th>
                <th>Turma</th>
              </tr>
            </thead>
            <tbody>
              {inscricoes.map(({ eletiva, nome, turma }, index) => (
                <tr key={index}>
                  <td>{eletiva}</td>
                  <td>{nome}</td>
                  <td>{turma}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<InscricaoEletivas />);
