import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {jwtDecode} from 'jwt-decode';
import Swal from 'sweetalert2';
import '../styles/Dashboard.css';
import Listagem from './Listagem';
import CadastroForm from './CadastroForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faChalkboardTeacher, faSchool, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';

// Função para verificar se o token está expirado
const checkTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decodedToken = jwtDecode(token);
    const now = Date.now() / 1000;
    return decodedToken.exp < now;
  } catch (e) {
    return true;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, logout, name } = useContext(AuthContext);
  const [alunosCount, setAlunosCount] = useState(0);
  const [professoresCount, setProfessoresCount] = useState(0);
  const [escolaCount, setEscolaCount] = useState(0);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState('');
  const [showContent, setShowContent] = useState('');
  const [perfil, setPerfil] = useState(''); // Adicionando o estado para armazenar o perfil do usuário

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (checkTokenExpired(token)) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        logout();
        navigate('/');
        return true;
      }
      return false;
    };

    const fetchData = async () => {
      if (checkTokenExpiration()) return;

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const decodedToken = jwtDecode(token);
        setPerfil(decodedToken.perfil); // Definir o perfil do usuário

        if (decodedToken.perfil == 2) {
          const alunosResponse = await api.get('api/alunos', { headers });
          setAlunosCount(alunosResponse.data.data.length);
        } else if (decodedToken.perfil == 1) {
          const [alunosResponse, professoresResponse, escolaResponse] = await Promise.all([
            api.get('api/alunos', { headers }),
            api.get('api/professores', { headers }),
            api.get('api/escola', { headers }),
          ]);
          setAlunosCount(alunosResponse.data.data.length);
          setProfessoresCount(professoresResponse.data.data.length);
          setEscolaCount(escolaResponse.data.data.length);
        }
      } catch (error) {
        setError('');
      }
    };

    fetchData();
  }, [token, logout, navigate]);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? '' : menu);
  };

  const handleMenuClick = (menuType) => {
    setShowContent(menuType);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Confirmação de Logout',
      text: 'Você realmente deseja sair?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, sair!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li>
            <button onClick={() => window.location.reload()} className="dashboard-button">
              <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
            </button>
          </li>
          {perfil == 2 && ( // Mostrar apenas "Alunos" se for perfil de professor
            <li>
              <button onClick={() => toggleMenu('alunos')}><FontAwesomeIcon icon={faUserGraduate} /> Alunos</button>
              {activeMenu === 'alunos' && (
                <ul className="submenu">
                  <li><button className="submenu-button" onClick={() => handleMenuClick('listagem-alunos')}>Ver Alunos</button></li>
                  <li><button className="submenu-button" onClick={() => handleMenuClick('cadastro-aluno')}>Criar Aluno</button></li>
                </ul>
              )}
            </li>
          )}
          {perfil == 1 && ( // Mostrar todas as opções se for perfil de administrador
            <>
              <li>
                <button onClick={() => toggleMenu('alunos')}><FontAwesomeIcon icon={faUserGraduate} /> Alunos</button>
                {activeMenu === 'alunos' && (
                  <ul className="submenu">
                    <li><button className="submenu-button" onClick={() => handleMenuClick('listagem-alunos')}>Ver Alunos</button></li>
                    <li><button className="submenu-button" onClick={() => handleMenuClick('cadastro-aluno')}>Criar Aluno</button></li>
                  </ul>
                )}
              </li>
              <li>
                <button onClick={() => toggleMenu('professores')}><FontAwesomeIcon icon={faChalkboardTeacher} /> Professores</button>
                {activeMenu === 'professores' && (
                  <ul className="submenu">
                    <li><button className="submenu-button" onClick={() => handleMenuClick('listagem-professores')}>Ver Professores</button></li>
                    <li><button className="submenu-button" onClick={() => handleMenuClick('cadastro-professor')}>Criar Professor</button></li>
                  </ul>
                )}
              </li>
              <li>
                <button onClick={() => toggleMenu('escola')}><FontAwesomeIcon icon={faSchool} /> Escolas</button>
                {activeMenu === 'escola' && (
                  <ul className="submenu">
                    <li><button className="submenu-button" onClick={() => handleMenuClick('listagem-escola')}>Ver Escolas</button></li>
                    <li><button className="submenu-button" onClick={() => handleMenuClick('cadastro-escola')}>Criar Escola</button></li>
                  </ul>
                )}
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="main-content">
        <header>
          <div className="user-info">
            <span>Bem-vindo, {name}!</span>
            <button onClick={handleLogout} className="logout-btn">Sair</button>
          </div>
        </header>
        {error && <p className="error">{error}</p>}
        {showContent === 'listagem-alunos' && <Listagem type="alunos" />}
        {showContent === 'listagem-professores' && <Listagem type="professores" />}
        {showContent === 'listagem-escola' && <Listagem type="escola" />}
        {showContent === 'cadastro-aluno' && (
          <CadastroForm
            type="alunos"
            fields={[
              { name: 'nome', label: 'Nome' },
              { name: 'cpf', label: 'CPF' },
              { name: 'dataNascimento', label: 'Data de Nascimento', type: 'date' },
            ]}
          />
        )}
        {showContent === 'cadastro-professor' && (
          <CadastroForm
            type="professores"
            fields={[
              { name: 'nome', label: 'Nome' },
              { name: 'cpf', label: 'CPF' },
              { name: 'dataNascimento', label: 'Data de Nascimento', type: 'date' },
            ]}
          />
        )}
        {showContent === 'cadastro-escola' && (
          <CadastroForm
            type="escola"
            fields={[
              { name: 'nome', label: 'Nome' },
              { name: 'endereco', label: 'Endereço' },
            ]}
          />
        )}
        {showContent === '' && (
          <div className="cards">
            <div className="card">
              <h3>Alunos</h3>
              <p>{alunosCount}</p>
            </div>
            {perfil == 1 && (
              <>
                <div className="card">
                  <h3>Professores</h3>
                  <p>{professoresCount}</p>
                </div>
                <div className="card">
                  <h3>Escolas</h3>
                  <p>{escolaCount}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
