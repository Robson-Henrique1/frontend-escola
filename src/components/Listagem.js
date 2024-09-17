import React, { useState, useEffect, useContext } from 'react';
import DataTable from 'react-data-table-component'; 
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Modal from 'react-modal'; // Importar o Modal
import Swal from 'sweetalert2'; // Importar o SweetAlert
import EditForm from './EditForm'; // Importar o formulário de edição
import '../styles/Listagem.css';

Modal.setAppElement('#root'); // Defina o elemento root para o modal

const Listagem = ({ type }) => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null); // Estado para armazenar o item sendo editado
  const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para controlar a abertura do modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await api.get(`api/${type}`, { headers });

        if (Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else {
          setError(''); // Caso nao retornada nada ou estiver vazia
        }
      } catch (error) {
        setError(''); //Caso jwt for invalido
      }
    };

    fetchData();
  }, [token, type]);

  const handleEdit = (item) => {
    setEditItem(item); // Armazena o item a ser editado
    setModalIsOpen(true); // Abre o modal de edição
  };

  const handleDelete = async (id) => {
    // Substituição do window.confirm pelo SweetAlert
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter isso!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          await api.delete(`api/${type}/${id}`, { headers });
          setData(data.filter(item => item.id !== id));
          Swal.fire('Excluído!', 'O item foi excluído com sucesso.', 'success');
        } catch (error) {
          Swal.fire('Erro!', 'Não foi possível excluir o item.', 'error');
        }
      }
    });
  };

  const handleFormClose = () => {
    setModalIsOpen(false); // Fecha o modal de edição
    setEditItem(null); // Limpa o item a ser editado
  };

  // Definição das colunas para a DataTable
  const columns = [
    {
      name: 'Nome',
      selector: row => row.nome,
      sortable: true,
    },
    {
      name: 'CPF',
      selector: row => row.cpf,
      sortable: true,
      omit: type === 'escola',
    },
    {
      name: 'Data de Nascimento',
      selector: row => row.data_nascimento,
      sortable: true,
      omit: type === 'escola',
    },
    {
      name: 'Endereço',
      selector: row => row.endereco,
      sortable: true,
      omit: type !== 'escola',
    },
    {
      name: 'Ações',
      cell: row => (
        <>
          <button onClick={() => handleEdit(row)} className="edit-button">
            <FaEdit />
          </button>
          <button onClick={() => handleDelete(row.id)} className="delete-button">
            <FaTrash />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="listagem">
      <DataTable
        title={`Listagem de ${type}`}
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        striped
        noHeader
      />
      {error && <p className="error">{error}</p>}

      {/* Modal para edição */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleFormClose}
        contentLabel="Edit Item"
        className="modal"
        overlayClassName="overlay"
      >
        <EditForm
          type={type}
          initialData={editItem} // Passa os dados do item para o formulário
          onClose={handleFormClose} // Função para fechar o modal
          token={token} // Passa o token para o formulário
        />
      </Modal>
    </div>
  );
};

export default Listagem;
