import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  @media (max-width: 480px) {
    padding: 28px 20px;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 8px;
  font-size: 28px;
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  @media (max-width: 480px) {
    padding: 14px;
    font-size: 16px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (max-width: 480px) {
    padding: 14px;
    font-size: 16px;
  }
`;

const ToggleText = styled.p`
  text-align: center;
  margin-top: 16px;
  color: #666;
  span {
    color: #667eea;
    cursor: pointer;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
        toast.success('Conta criada! Faça login');
        setIsRegister(false);
        setEmail('');
        setPassword('');
      } else {
        await login(email, password);
        toast.success('Bem-vindo!');
      }
    } catch (error) {
      console.error('Erro no submit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>🚀 IndicaFlow</Title>
        <Subtitle>{isRegister ? 'Crie sua conta' : 'Faça login'}</Subtitle>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : (isRegister ? 'Criar conta' : 'Entrar')}
          </Button>
        </form>
        <ToggleText>
          {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <span onClick={() => !loading && setIsRegister(!isRegister)}>
            {isRegister ? 'Faça login' : 'Cadastre-se'}
          </span>
        </ToggleText>
      </Card>
    </Container>
  );
};

export default Login;