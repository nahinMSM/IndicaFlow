import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addReferral, getReferrals } from '../services/referralService';
import { getClients } from '../services/clientService';
import { Client, Referral } from '../types';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 24px;
  @media (max-width: 768px) {
    padding: 12px;
    margin-top: 40px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: #333;
  margin-bottom: 24px;
`;

const Form = styled.form`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
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

const Button = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
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

const Badge = styled.span<{ converted: boolean }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => (props.converted ? '#48bb78' : '#f56565')};
  color: white;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const Referrals: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    referrerId: '',
    referredName: '',
    referredPhone: '',
    converted: false,
    saleValue: ''
  });

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [clientsData, referralsData] = await Promise.all([
        getClients(user.uid),
        getReferrals(user.uid)
      ]);
      setClients(clientsData);
      setReferrals(referralsData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const referrer = clients.find(c => c.id === formData.referrerId);
    if (!referrer) {
      toast.error('Selecione um cliente');
      return;
    }

    try {
      await addReferral({
        userId: user.uid,
        referrerClientId: formData.referrerId,
        referrerName: referrer.name,
        referredName: formData.referredName,
        referredPhone: formData.referredPhone,
        converted: formData.converted,
        saleValue: formData.converted ? parseFloat(formData.saleValue) || 0 : undefined
      });
      toast.success('Indicação registrada!');
      setFormData({
        referrerId: '',
        referredName: '',
        referredPhone: '',
        converted: false,
        saleValue: ''
      });
      loadData();
    } catch (error) {
      toast.error('Erro ao registrar indicação');
    }
  };

  if (loading) {
    return <Container>Carregando...</Container>;
  }

  return (
    <Container>
      <Title>🔄 Indicações</Title>

      <Form onSubmit={handleSubmit}>
        <Select
          value={formData.referrerId}
          onChange={(e) => setFormData({ ...formData, referrerId: e.target.value })}
          required
        >
          <option value="">Quem indicou?</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Nome do indicado *"
          value={formData.referredName}
          onChange={(e) => setFormData({ ...formData, referredName: e.target.value })}
          required
        />
        <Input
          placeholder="WhatsApp do indicado *"
          value={formData.referredPhone}
          onChange={(e) => setFormData({ ...formData, referredPhone: e.target.value })}
          required
        />
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={formData.converted}
            onChange={(e) => setFormData({ ...formData, converted: e.target.checked })}
          />
          O indicado já comprou?
        </CheckboxLabel>
        {formData.converted && (
          <Input
            placeholder="Valor da compra (R$)"
            type="number"
            step="0.01"
            value={formData.saleValue}
            onChange={(e) => setFormData({ ...formData, saleValue: e.target.value })}
          />
        )}
        <Button type="submit">Registrar Indicação</Button>
      </Form>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Cliente que Indicou</Th>
              <Th>Indicado</Th>
              <Th>WhatsApp</Th>
              <Th>Status</Th>
              <Th>Valor</Th>
              <Th>Data</Th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <Td colSpan={6}>
                  <EmptyState>Nenhuma indicação registrada ainda</EmptyState>
                </Td>
              </tr>
            ) : (
              referrals.map(ref => (
                <tr key={ref.id}>
                  <Td>{ref.referrerName}</Td>
                  <Td>{ref.referredName}</Td>
                  <Td>{ref.referredPhone}</Td>
                  <Td>
                    <Badge converted={ref.converted}>
                      {ref.converted ? '✅ Convertido' : '⏳ Pendente'}
                    </Badge>
                  </Td>
                  <Td>
                    {ref.converted ? `R$ ${(ref.saleValue || 0).toFixed(2)}` : '-'}
                  </Td>
                  <Td>{new Date(ref.createdAt).toLocaleDateString()}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrapper>
    </Container>
  );
};

export default Referrals;