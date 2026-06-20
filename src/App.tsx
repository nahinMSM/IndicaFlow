import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import styled from 'styled-components';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Referrals from './pages/Referrals';
import AIMarketing from './pages/AIMarketing';

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Sidebar = styled.div<{ $isOpen: boolean }>`
  width: 240px;
  background: white;
  padding: 24px ;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 260px;
    height: 100vh;
    z-index: 1000;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.15);
  }
`;

const SidebarOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const Logo = styled.h1`
  font-size: 20px;
  color: #333;
  margin-bottom: 32px;
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 20px;
  }
`;

const NavItem = styled.a`
  display: block;
  padding: 12px 16px;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
  &.active {
    background: #667eea;
    color: white;
  }
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px;
  }
`;

const MenuButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1001;
    background: white;
    border: none;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CloseButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: block;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    align-self: flex-end;
    padding: 8px;
    color: #666;
  }
`;

const AuthenticatedApp = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <MenuButton onClick={toggleSidebar}>☰</MenuButton>
      <SidebarOverlay $isOpen={sidebarOpen} onClick={closeSidebar} />
      <Layout>
        <Sidebar $isOpen={sidebarOpen}>
          <CloseButton onClick={closeSidebar}>✕</CloseButton>
          <Logo>🚀 <span>IndicaFlow</span></Logo>
          <NavItem href="/" onClick={closeSidebar}>📊 <span>Dashboard</span></NavItem>
          <NavItem href="/clients" onClick={closeSidebar}>👥 <span>Clientes</span></NavItem>
          <NavItem href="/referrals" onClick={closeSidebar}>🔄 <span>Indicações</span></NavItem>
          <NavItem href="/ai-marketing" onClick={closeSidebar}>🤖 <span>Marketing IA</span></NavItem>
          <NavItem onClick={() => { logout(); closeSidebar(); }} style={{ color: '#f56565', cursor: 'pointer', marginTop: '15px' }}>
            🚪 <span>Sair</span>
          </NavItem>
        </Sidebar>
        <Content>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/ai-marketing" element={<AIMarketing />} />
            <Route path="/login" element={<Navigate to="/" />} />
          </Routes>
        </Content>
      </Layout>
    </>
  );
};

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #667eea;
`;

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen>Carregando...</LoadingScreen>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return <AuthenticatedApp />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;