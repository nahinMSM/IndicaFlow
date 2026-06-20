import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h3`
  color: #333;
  margin-bottom: 8px;
  font-size: 18px;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const Buttons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  background: ${props => (props.variant === 'danger' ? '#f56565' : '#667eea')};
  color: white;
  &:hover {
    opacity: 0.9;
  }
`;

const ButtonCancel = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  background: #e2e8f0;
  color: #4a5568;
  &:hover {
    background: #cbd5e0;
  }
`;

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Confirmar',
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={e => e.stopPropagation()}>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <Buttons>
          <ButtonCancel onClick={onCancel}>Cancelar</ButtonCancel>
          <Button variant="danger" onClick={onConfirm}>
            Confirmar
          </Button>
        </Buttons>
      </Modal>
    </Overlay>
  );
};