const eletivas = [
  "Arte Digital", "Astronomia", "Biotecnologia", "Cinema e Sociedade", "Design de Jogos",
  "Empreendedorismo", "Escrita Criativa", "Fotografia", "Inteligência Artificial",
  "Música", "Nutrição e Saúde", "Química Experimental", "Robótica"
];

function InscricaoEletivas() {
  const [turmas, setTurmas] = React.useState(["1A", "1B", "2A", "2B", "3A", "3B"]);
  const [alunos, setAlunos] = React.useState({ "1A": ["Ana Silva", "Bruno Souza"], "1B": ["Carlos Mendes", "Daniela Lima"] });
  const [turmaSelecionada, setTurmaSelecionada] = React.useState("");
  const [alunoNome, setAlunoNome] = React.useState("");
  const [eletivaSelecionada, setEletivaSelecionada] = React.useState("");
  const [inscricoes, setInscricoes] = React.useState([]);
  const [limites, setLimites] = React.useState({});
  const [erroNome, setErroNome] = React.useState("");
  const [erroInscricao, setErroInscricao] = React.useState("");
  const [nomeValido, setNomeValido] = React.useState(false);

  React.useEffect(() => {
    const contagem = inscricoes.reduce((acc, { eletiva }) => {
      acc[eletiva] = (acc[eletiva] || 0) + 1;
      return acc;
    }, {});
    setLimites(contagem);
  }, [inscricoes]);

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
      setErroInscricao("");
      setInscricoes([...inscricoes, { turma: turmaSelecionada, nome: alunoNome, eletiva: eletivaSelecionada }]);
      setAlunoNome("");
      setEletivaSelecionada("");
      setNomeValido(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <div className="card-content space-y-4 p-4">
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
              {eletivas.map((eletiva) => (
                <option key={eletiva} value={eletiva}>
                  {eletiva} ({1 - (limites[eletiva] || 0)} vagas restantes)
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
        <div className="card-content p-4">
          <h2 className="text-xl font-bold mb-4">Lista de Inscritos</h2>
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

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<InscricaoEletivas />);
