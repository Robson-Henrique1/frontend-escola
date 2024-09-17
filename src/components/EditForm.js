import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Importar o SweetAlert
import api from '../services/api';
import '../styles/EditForm.css'; // Certifique-se de criar este arquivo

const EditForm = ({ type, initialData, onClose, token }) => {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Confirmação para salvar as alterações usando SweetAlert
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Você está prestes a salvar as alterações.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, salvar!',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const updatedData = { ...formData };

        // Se o tipo for "professores" e o campo senha não estiver vazio
        if (type === 'professores' && !updatedData.senha) {
          delete updatedData.senha; // Remove senha se não for preenchida
        }

        const response = await api.put(`api/${type}/${formData.id}`, updatedData, { headers });
        Swal.fire('Sucesso!', response.data.message, 'success');
        onClose(); // Fecha o modal após a atualização
      } catch (error) {
        const errorMessage = error.response?.data?.message?.senha || 
                             error.response?.data?.message?.cpf || 
                             error.response?.data?.message?.nome || 
                             error.response?.data?.message?.endereco ||
                             'Erro ao salvar as alterações.';
        Swal.fire('Erro!', errorMessage, 'error'); // SweetAlert para mostrar erros
      }
    }
  };

  const handleClose = () => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'As alterações não salvas serão perdidas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        onClose(); // Fecha o modal apenas se o usuário confirmar
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <h2>Editar {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
      <label>
        Nome:
        <input
          type="text"
          name="nome"
          value={formData.nome || ''}
          onChange={handleChange}
          required
        />
      </label>
      {type !== 'escola' && (
        <>
          <label>
            CPF:
            <input
              type="text"
              name="cpf"
              value={formData.cpf || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Data de Nascimento:
            <input
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento || ''}
              onChange={handleChange}
              required
            />
          </label>
        </>
      )}
      {type === 'escola' && (
        <label>
          Endereço:
          <input
            type="text"
            name="endereco"
            value={formData.endereco || ''}
            onChange={handleChange}
            required
          />
        </label>
      )}
      {type === 'professores' && (
        <label>
          Nova Senha:
          <input
            type="password"
            name="senha"
            value={formData.senha || ''} // Certifica-se de que 'senha' não seja undefined
            onChange={handleChange}
          />
        </label>
      )}
      <div className="form-buttons">
        <button type="submit" className="save-button">Salvar</button>
        <button type="button" onClick={handleClose} className="cancel-button">Cancelar</button>
      </div>
    </form>
  );
};

export default EditForm;
