import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import api from '../services/api';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext'; // Importe o AuthContext
import { maskCPF, isValidDate, isStrongPassword } from '../utils/utils';
import { HTTP_STATUS } from '../utils/httpStatusCodes';

const Login = () => {
  const navigate = useNavigate();
  const { updateToken,updateName  } = useContext(AuthContext); // Use o contexto
  const [isSignup, setIsSignup] = useState(false);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [data_nascimento, setDataNascimento] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [dataNascimentoError, setDataNascimentoError] = useState('');
  const [cpfFormatted, setCpfFormatted] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('api/logar', { cpf, senha });

      if (response.status === HTTP_STATUS.OK) {
        const token = response.data.data.token;
        const name = response.data.data.nome;
        updateName(name);
        updateToken(token); // Atualiza o token no contexto
        navigate('/dashboard');
        setLoginError('');
      } else {
        setLoginError(response.data.data.message || 'Erro ao tentar fazer login.');
        setTimeout(() => setLoginError(''), 10000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao tentar fazer login. Verifique suas credenciais.';
      setLoginError(typeof errorMessage === 'string' ? errorMessage : 'Erro ao tentar fazer login.');
      setTimeout(() => setLoginError(''), 10000);
      console.error('Erro ao tentar fazer login:', error);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    let isValid = true;

    // Validação da senha
    if (!isStrongPassword(senha)) {
      setSenhaError('A senha deve ter pelo menos 8 caracteres, incluir letras maiúsculas e minúsculas, números e caracteres especiais.');
      isValid = false;
    } else {
      setSenhaError('');
    }

    // Validação da data de nascimento
    if (!isValidDate(data_nascimento)) {
      setDataNascimentoError('Data de nascimento inválida.');
      isValid = false;
    } else {
      setDataNascimentoError('');
    }

    if (!isValid) return;

    try {
      const response = await api.post('api/registrar', { cpf, senha, nome, data_nascimento });

      if (response.status === HTTP_STATUS.CREATED) {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Cadastro realizado com sucesso!',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
        setIsSignup(false);
        setSignupError('');
      } else {
        const message = response.data.message;
        let formattedMessage = 'Erro ao tentar registrar.';
        if (message && typeof message === 'object') {
          formattedMessage = Object.values(message).join(' ');
        }
        setSignupError(formattedMessage);
        setTimeout(() => setSignupError(''), 10000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao tentar registrar. Verifique suas informações.';
      let formattedErrorMessage = '';
      if (typeof errorMessage === 'object') {
        formattedErrorMessage = Object.values(errorMessage).join(' ');
      } else {
        formattedErrorMessage = errorMessage;
      }
      setSignupError(formattedErrorMessage);
      setTimeout(() => setSignupError(''), 10000);
      console.error('Erro ao tentar registrar:', error);
    }
  };

  const handleCpfChange = (e) => {
    const value = e.target.value;
    setCpf(value.replace(/\D/g, '')); // Remove non-numeric characters for validation
    setCpfFormatted(maskCPF(value));
  };

  return (
    <div className="login-page">
    <div className={`login-container ${isSignup ? 'active' : ''}`}>
      <div className="form-container sign-up">
        <form onSubmit={handleSignup}>
          <h1>Criar Conta</h1>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="CPF"
            value={cpfFormatted}
            onChange={handleCpfChange}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Data de Nascimento"
            value={data_nascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            required
          />
          <button type="submit">Registrar</button>
          {signupError && <p className="error">{signupError}</p>}
          {senhaError && <p className="error">{senhaError}</p>}
          {dataNascimentoError && <p className="error">{dataNascimentoError}</p>}
        </form>
      </div>
      <div className="form-container sign-in">
        <form onSubmit={handleLogin}>
          <h1>Entrar</h1>
          <input
            type="text"
            placeholder="CPF"
            value={cpfFormatted}
            onChange={handleCpfChange}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
          {loginError && <p className="error">{loginError}</p>}
        </form>
      </div>
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Bem-vindo de volta!</h1>
            <p>Entre com seus dados pessoais para usar todas as funcionalidades do site</p>
            <button id="login" onClick={() => setIsSignup(false)}>Entrar</button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Olá, Amigo!</h1>
            <p>Registre-se com seus dados pessoais para usar todas as funcionalidades do site</p>
            <button id="register" onClick={() => setIsSignup(true)}>Registrar</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
