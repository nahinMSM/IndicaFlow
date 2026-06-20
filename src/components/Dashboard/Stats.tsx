import React from 'react';
import styled from 'styled-components';
import { Client, Referral } from '../../types';

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-top: 16px;
`;

const Title = styled.h3`
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: #666;
`;

const Value = styled.span`
  font-weight: 600;
  color: #333;
`;

interface StatsProps {
  clients: Client[];
  referrals: Referral[];
}

export const Stats: React.FC<StatsProps> = ({ clients, referrals }) => {
  const totalSpent = clients.reduce((sum, c) => sum + c.purchaseValue, 0);
  const avgTicket = clients.length > 0 ? totalSpent / clients.length : 0;
  const converted = referrals.filter(r => r.converted).length;

  return (
    <Container>
      <Title>📈 Análise Detalhada</Title>
      <Row>
        <Label>Ticket Médio</Label>
        <Value>R$ {avgTicket.toFixed(2)}</Value>
      </Row>
      <Row>
        <Label>Faturamento Total</Label>
        <Value>R$ {totalSpent.toFixed(2)}</Value>
      </Row>
      <Row>
        <Label>Clientes que Indicaram</Label>
        <Value>{referrals.length}</Value>
      </Row>
      <Row>
        <Label>Indicações que Venderam</Label>
        <Value>{converted}</Value>
      </Row>
      <Row>
        <Label>Retorno em Vendas (Indicações)</Label>
        <Value>R$ {referrals.reduce((sum, r) => sum + (r.converted ? (r.saleValue || 0) : 0), 0).toFixed(2)}</Value>
      </Row>
    </Container>
  );
};