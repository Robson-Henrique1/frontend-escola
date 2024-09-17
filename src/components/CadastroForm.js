import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/CadastroForm.css';
import { maskCPF, isValidDate, isStrongPassword } from '../utils/utils'; // Certifique-se de que essas funções estão implementadas
import { HTTP_STATUS } from '../utils/httpStatusCodes';

const CadastroForm = ({ type, onClose }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    nomeAluno: '',
    cpfAluno: '',
    dataNascimentoAluno: '',
    nomeProfessor: '',
    cpfProfessor: '',
    dataNascimentoProfessor: '',
    senhaProfessor: '',
    nomeEscola: '',
    enderecoEscola: '',
    professorId: '',
    escolaId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [professores, setProfessores] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [cpfFormatted, setCpfFormatted] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [dataNascimentoError, setDataNascimentoError] = useState('');

  useEffect(() => {
    const fetchProfessores = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get('api/professores', { headers });
        setProfessores(response.data.data || []);
      } catch (err) {
        setError(''); 
      }
    };

    const fetchEscolas = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get('api/escola', { headers });
        setEscolas(response.data.data || []);
      } catch (err) {
        setError(''); 
      }
    };

    fetchProfessores();
    fetchEscolas();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCpfChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value.replace(/\D/g, '')
    });
    setCpfFormatted(maskCPF(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;

    if (type === 'professores' && !isStrongPassword(formData.senhaProfessor)) {
      Swal.fire({
        title: 'Erro!',
        text: 'A senha deve ter pelo menos 8 caracteres, incluir letras maiúsculas e minúsculas, números e caracteres especiais.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      isValid = false;
    } else {
      setSenhaError('');
    }

    if (type === 'alunos' && !isValidDate(formData.dataNascimentoAluno)) {
      setDataNascimentoError('Data de nascimento inválida.');
      isValid = false;
    } else {
      setDataNascimentoError('');
    }

    if (!isValid) return;

    try {
      const payload = type === 'alunos' ? {
        nome: formData.nomeAluno,
        cpf: formData.cpfAluno,
        data_nascimento: formData.dataNascimentoAluno,
        professor_id: formData.professorId,
      } : type === 'professores' ? {
        nome: formData.nomeProfessor,
        cpf: formData.cpfProfessor,
        data_nascimento: formData.dataNascimentoProfessor,
        senha: formData.senhaProfessor,
        escola_id: formData.escolaId,
      } : {
        nome: formData.nomeEscola,
        endereco: formData.enderecoEscola,
      };

      const headers = { Authorization: `Bearer ${token}` };
      const response = await api.post(`api/${type}`, payload, { headers });

      if (response.status === HTTP_STATUS.CREATED) {
        setError('');

        // Exibindo alerta de sucesso
        Swal.fire({
          title: 'Sucesso!',
          text: `Cadastro de ${type.slice(0, 14)} realizado com sucesso!`,
          icon: 'success',
          confirmButtonText: 'Ok'
        });
      } else {
        const apiError = response.data.data.message;
        let errorMessage = 'Erro ao realizar o cadastro. Tente novamente.';

        if (apiError) {
          errorMessage = Object.values(apiError).join('');
        }

        setSuccess('');

        // Exibindo alerta de erro
        Swal.fire({
          title: 'Erro!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    } catch (err) {
      let errorMessage = 'Erro ao realizar o cadastro. Tente novamente.';

      if (err.response && err.response.data && err.response.data.message) {
        const apiError = err.response.data.message;
        if (apiError) {
          errorMessage = Object.values(apiError).join('');
        }
      }

      setSuccess('');

      // Exibindo alerta de erro
      Swal.fire({
        title: 'Erro!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  };

  return (
    <div className="cadastro-form">
      <h2>Cadastrar {type.slice(0, 14)}</h2>
      <form onSubmit={handleSubmit}>
        {type === 'alunos' && (
          <>
            <label>
              Nome:
              <input
                type="text"
                name="nomeAluno"
                value={formData.nomeAluno}
                onChange={handleChange}
              />
            </label>
            <label>
              CPF:
              <input
                type="text"
                name="cpfAluno"
                value={cpfFormatted}
                onChange={handleCpfChange}
              />
            </label>
            <label>
              Data de Nascimento:
              <input
                type="date"
                name="dataNascimentoAluno"
                value={formData.dataNascimentoAluno}
                onChange={handleChange}
              />
            </label>
            <label>
              Professor:
              <select
                name="professorId"
                value={formData.professorId}
                onChange={handleChange}
              >
                <option value="">Selecione um professor</option>
                {professores.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </label>
            
          </>
        )}

        {type === 'professores' && (
          <>
            <label>
              Nome:
              <input
                type="text"
                name="nomeProfessor"
                value={formData.nomeProfessor}
                onChange={handleChange}
              />
            </label>
            <label>
              CPF:
              <input
                type="text"
                name="cpfProfessor"
                value={cpfFormatted}
                onChange={handleCpfChange}
              />
            </label>
            <label>
              Data de Nascimento:
              <input
                type="date"
                name="dataNascimentoProfessor"
                value={formData.dataNascimentoProfessor}
                onChange={handleChange}
              />
            </label>
            <label>
              Senha:
              <input
                type="password"
                name="senhaProfessor"
                value={formData.senhaProfessor}
                onChange={handleChange}
              />
            </label>
            {senhaError && <p className="error">{senhaError}</p>}
            <label>
              Escola:
              <select
                name="escolaId"
                value={formData.escolaId}
                onChange={handleChange}
              >
                <option value="">Selecione uma escola</option>
                {escolas.map(escola => (
                  <option key={escola.id} value={escola.id}>
                    {escola.nome}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {type === 'escola' && (
          <>
            <label>
              Nome:
              <input
                type="text"
                name="nomeEscola"
                value={formData.nomeEscola}
                onChange={handleChange}
              />
            </label>
            <label>
              Endereço:
              <input
                type="text"
                name="enderecoEscola"
                value={formData.enderecoEscola}
                onChange={handleChange}
              />
            </label>
          </>
        )}

        <button type="submit">Cadastrar</button>
        {dataNascimentoError && <p className="error">{dataNascimentoError}</p>}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  );
};

export default CadastroForm;
