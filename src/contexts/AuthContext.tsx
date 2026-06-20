import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { app } from '../services/firebase';
import toast from 'react-hot-toast';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado!');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      console.log('📝 Tentando criar conta para:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Conta criada:', result.user.email);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      let message = 'Erro ao criar conta';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Este e-mail já está em uso';
          break;
        case 'auth/invalid-email':
          message = 'E-mail inválido';
          break;
        case 'auth/weak-password':
          message = 'Senha deve ter pelo menos 6 caracteres';
          break;
        case 'auth/network-request-failed':
          message = 'Erro de rede. Verifique sua conexão';
          break;
        default:
          message = error.message;
      }
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Saiu com sucesso');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast.error('Erro ao sair');
    }
  };

  // 🔥 Valor do contexto memoizado para evitar recarregamentos desnecessários
  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { auth };