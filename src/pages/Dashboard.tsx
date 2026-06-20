import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getClients } from '../services/clientService';
import { getReferrals, getReferralStats } from '../services/referralService';
import { Client, Referral } from '../types';
import styled from 'styled-components';
import { Chart } from '../components/Dashboard/Chart';

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
  margin-bottom: 8px;
  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 24px;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
`;

const StatCard = styled.div<{ color?: string }>`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.color || '#667eea'};
  @media (max-width: 480px) {
    padding: 14px;
  }
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
  margin-top: 4px;
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({ total: 0, converted: 0, conversionRate: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [clientsData, referralsData, statsData] = await Promise.all([
        getClients(user.uid),
        getReferrals(user.uid),
        getReferralStats(user.uid)
      ]);
      setClients(clientsData);
      setReferrals(referralsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <Container>Carregando...</Container>;
  }

  return (
    <Container>
      <Title>📊 Dashboard</Title>
      <Subtitle>Visão geral do seu negócio</Subtitle>

      <Grid>
        <StatCard color="#667eea">
          <StatValue>{clients.length}</StatValue>
          <StatLabel>Clientes</StatLabel>
        </StatCard>
        <StatCard color="#48bb78">
          <StatValue>{referrals.length}</StatValue>
          <StatLabel>Indicações</StatLabel>
        </StatCard>
        <StatCard color="#ed8936">
          <StatValue>{stats.converted}</StatValue>
          <StatLabel>Convertidas</StatLabel>
        </StatCard>
        <StatCard color="#f56565">
          <StatValue>{stats.conversionRate.toFixed(0)}%</StatValue>
          <StatLabel>Conversão</StatLabel>
        </StatCard>
        <StatCard color="#9f7aea">
          <StatValue>R$ {stats.totalValue.toFixed(2)}</StatValue>
          <StatLabel>Valor Gerado</StatLabel>
        </StatCard>
      </Grid>

      <Chart clients={clients} referrals={referrals} />
    </Container>
  );
};

export default Dashboard;