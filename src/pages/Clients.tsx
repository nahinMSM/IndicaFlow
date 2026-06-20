import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addClient, getClients, deleteClient, updateClient } from '../services/clientService';
import { Client } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 24px;
  @media (max-width: 768px) {
    padding: 12px;
    margin-top: 40px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #333;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const Form = styled.form`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SubmitButton = styled(Button)`
  grid-column: 1 / -1;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  @media (max-width: 480px) {
    margin: 0 -12px;
    padding: 0 12px;
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 600px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  @media (max-width: 480px) {
    min-width: 500px;
    font-size: 13px;
  }
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  background: #f7f7f7;
  font-weight: 600;
  color: #333;
`;

const Td = styled.td`
  padding: 12px;
  border-top: 1px solid #f0f0f0;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  margin: 0 2px;
  border-radius: 4px;
  color: ${props => props.variant === 'edit' ? '#667eea' : '#f56565'};
  &:hover {
    background: ${props => props.variant === 'edit' ? '#eef2ff' : '#fee2e2'};
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const Clients: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; clientId: string | null }>({
    isOpen: false,
    clientId: null
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    instagram: '',
    email: '',
    service: '',
    purchaseValue: ''
  });

  const loadClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getClients(user.uid);
      setClients(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // 🔥 Função para abrir edição
  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      instagram: client.instagram || '',
      email: client.email || '',
      service: client.service,
      purchaseValue: client.purchaseValue.toString()
    });
    setShowForm(true);
  };

  // 🔥 Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      phone: '',
      instagram: '',
      email: '',
      service: '',
      purchaseValue: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const clientData = {
        userId: user.uid,
        name: formData.name,
        phone: formData.phone,
        instagram: formData.instagram || undefined,
        email: formData.email || undefined,
        service: formData.service,
        purchaseValue: parseFloat(formData.purchaseValue) || 0,
        lastPurchase: new Date()
      };

      if (editingClient?.id) {
        // 🔥 Atualizar cliente existente
        await updateClient(editingClient.id, clientData);
        toast.success('Cliente atualizado!');
      } else {
        // Criar novo cliente
        await addClient(clientData);
        toast.success('Cliente cadastrado!');
      }

      handleCancelEdit();
      loadClients();
    } catch (error) {
      toast.error(editingClient ? 'Erro ao atualizar cliente' : 'Erro ao cadastrar cliente');
    }
  };

  const handleDeleteClick = (clientId: string) => {
    setDeleteModal({ isOpen: true, clientId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.clientId) return;
    try {
      await deleteClient(deleteModal.clientId);
      toast.success('Cliente excluído');
      loadClients();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleteModal({ isOpen: false, clientId: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, clientId: null });
  };

  if (loading) {
    return <Container>Carregando...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>👥 Clientes</Title>
        <Button onClick={() => {
          handleCancelEdit();
          setShowForm(!showForm);
        }}>
          {showForm ? 'Fechar' : '+ Novo Cliente'}
        </Button>
      </Header>

      {showForm && (
        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <Input
              placeholder="Nome *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              placeholder="WhatsApp *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              placeholder="Instagram"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            />
            <Input
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Serviço/Produto *"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              required
            />
            <Input
              placeholder="Valor da compra (R$)"
              type="number"
              step="0.01"
              value={formData.purchaseValue}
              onChange={(e) => setFormData({ ...formData, purchaseValue: e.target.value })}
            />
            <SubmitButton type="submit">
              {editingClient ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
            </SubmitButton>
            {editingClient && (
              <SubmitButton
                type="button"
                onClick={handleCancelEdit}
                style={{ background: '#666' }}
              >
                Cancelar Edição
              </SubmitButton>
            )}
          </FormGrid>
        </Form>
      )}

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>WhatsApp</Th>
              <Th>Serviço</Th>
              <Th>Valor</Th>
              <Th>Data</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <Td colSpan={6}>
                  <EmptyState>Nenhum cliente cadastrado ainda</EmptyState>
                </Td>
              </tr>
            ) : (
              clients.map(client => (
                <tr key={client.id}>
                  <Td>{client.name}</Td>
                  <Td>{client.phone}</Td>
                  <Td>{client.service}</Td>
                  <Td>R$ {client.purchaseValue.toFixed(2)}</Td>
                  <Td>{new Date(client.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <ActionButton
                      variant="edit"
                      onClick={() => client.id && handleEditClick(client)}
                    >
                      ✏️ Editar
                    </ActionButton>
                    <ActionButton
                      variant="delete"
                      onClick={() => client.id && handleDeleteClick(client.id)}
                    >
                      🗑️ Excluir
                    </ActionButton>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrapper>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Container>
  );
};

export default Clients;