import { create } from 'zustand';
import { Usuario, Empresa, AuthState } from '../types';
import { mockUsuarios, mockEmpresa } from '../data/mockData';

interface AuthStore extends AuthState {
  login: (loginInput: string, senha: string) => Promise<boolean>;
  logout: () => void;
  initialize: () => void;
  updateEmpresa: (empresa: Empresa) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  usuario: null,
  empresa: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (loginInput: string, senha: string) => {
    try {
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email OR username, and validate status
      const usuario = mockUsuarios.find(u => 
        (u.email === loginInput || u.username === loginInput) && 
        u.senha === senha && 
        u.ativo &&
        // Validate date range if dataFim exists
        (!u.dataFim || new Date(u.dataFim) >= new Date()) &&
        new Date(u.dataInicio) <= new Date()
      );
      
      if (usuario) {
        set({
          usuario,
          empresa: mockEmpresa,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Salvar no localStorage
        localStorage.setItem('currentUser', JSON.stringify(usuario));
        localStorage.setItem('currentEmpresa', JSON.stringify(mockEmpresa));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  },

  logout: () => {
    set({
      usuario: null,
      empresa: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    // Limpar localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentEmpresa');
  },

  initialize: () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const savedEmpresa = localStorage.getItem('currentEmpresa');
      
      if (savedUser && savedEmpresa) {
        const usuario = JSON.parse(savedUser) as Usuario;
        const empresa = JSON.parse(savedEmpresa) as Empresa;
        
        set({
          usuario,
          empresa,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar auth:', error);
      set({
        isLoading: false
      });
    }
  },

  updateEmpresa: (empresa: Empresa) => {
    set({ empresa });
    localStorage.setItem('currentEmpresa', JSON.stringify(empresa));
    
    // Atualizar também no localStorage de empresas
    const empresas = JSON.parse(localStorage.getItem('empresa') || '{}');
    localStorage.setItem('empresa', JSON.stringify(empresa));
  }
}));