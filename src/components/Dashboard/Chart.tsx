import React from 'react';
import styled from 'styled-components';
import { Client, Referral } from '../../types';

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 16px;
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Title = styled.h3`
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  height: 180px;
  gap: 6px;
  padding: 12px 0;
  border-bottom: 2px solid #e2e8f0;
  @media (max-width: 480px) {
    height: 140px;
    gap: 4px;
  }
`;

const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
`;

const Bar = styled.div<{ height: number; color: string }>`
  width: 100%;
  max-width: 40px;
  height: ${props => props.height}%;
  background: ${props => props.color};
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  min-height: 4px;
  @media (max-width: 480px) {
    max-width: 24px;
    min-height: 3px;
  }
`;

const BarLabel = styled.span`
  font-size: 10px;
  color: #666;
  margin-top: 4px;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
  @media (max-width: 480px) {
    padding: 20px;
    font-size: 12px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatItem = styled.div`
  text-align: center;
  @media (max-width: 480px) {
    flex: 1;
    min-width: 70px;
  }
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #333;
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

interface ChartProps {
  clients: Client[];
  referrals: Referral[];
}

export const Chart: React.FC<ChartProps> = ({ clients, referrals }) => {
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const referralsByDay = last7Days.map(day => {
    const dayStr = day.toDateString();
    const count = referrals.filter(ref => {
      const refDate = new Date(ref.createdAt);
      return refDate.toDateString() === dayStr;
    }).length;
    return { date: day, count };
  });

  const clientsByDay = last7Days.map(day => {
    const dayStr = day.toDateString();
    const count = clients.filter(client => {
      const clientDate = new Date(client.createdAt);
      return clientDate.toDateString() === dayStr;
    }).length;
    return { date: day, count };
  });

  const maxValue = Math.max(
    ...referralsByDay.map(d => d.count),
    ...clientsByDay.map(d => d.count),
    1
  );

  const colors = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565', '#9f7aea', '#4299e1'];

  if (clients.length === 0 && referrals.length === 0) {
    return (
      <Container>
        <Title>📊 Evolução dos Últimos 7 Dias</Title>
        <EmptyState>
          Sem dados para exibir.
          <br />
          <small>Cadastre clientes e registre indicações para ver o gráfico.</small>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>📊 Evolução dos Últimos 7 Dias</Title>

      <ChartContainer>
        {last7Days.map((day, index) => {
          const referralCount = referralsByDay[index].count;
          const clientCount = clientsByDay[index].count;
          const totalCount = referralCount + clientCount;
          const heightPercent = maxValue > 0 ? (totalCount / maxValue) * 100 : 0;

          return (
            <BarWrapper key={day.toISOString()}>
              <Bar 
                height={Math.max(heightPercent, 4)} 
                color={colors[index % colors.length]}
              />
              <BarLabel>
                {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </BarLabel>
            </BarWrapper>
          );
        })}
      </ChartContainer>

      <StatsRow>
        <StatItem>
          <StatValue>{referrals.length}</StatValue>
          <StatLabel>Total Indicações</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{clients.length}</StatValue>
          <StatLabel>Total Clientes</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{referrals.filter(r => r.converted).length}</StatValue>
          <StatLabel>Convertidas</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>
            {referrals.length > 0 
              ? Math.round((referrals.filter(r => r.converted).length / referrals.length) * 100) 
              : 0}%
          </StatValue>
          <StatLabel>Taxa Conversão</StatLabel>
        </StatItem>
      </StatsRow>
    </Container>
  );
};