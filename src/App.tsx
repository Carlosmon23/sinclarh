import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';
import { useDataStore } from './stores/dataStore';
import { initializeMockData } from './data/mockData';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Páginas de Parametrização
import TiposCompetencia from './pages/Parametrizacao/TiposCompetencia';
import EscalasCompetencia from './pages/Parametrizacao/EscalasCompetencia';
import Competencias from './pages/Parametrizacao/Competencias';
import Cargos from './pages/Parametrizacao/Cargos';
import Colaboradores from './pages/Parametrizacao/Colaboradores';
import Equipes from './pages/Parametrizacao/Equipes';
import Usuarios from './pages/Parametrizacao/Usuarios';
import CiclosAvaliacao from './pages/Parametrizacao/CiclosAvaliacao';

// Páginas de Avaliação
import CriacaoAvaliacao from './pages/CriacaoAvaliacao';
import CriacaoAvaliacaoWizard from './pages/CriacaoAvaliacaoWizard';
import GerenciarAvaliacoes from './pages/GerenciarAvaliacoes';
import RespostaAvaliacao from './pages/RespostaAvaliacao';
import MinhasAvaliacoes from './pages/MinhasAvaliacoes';
import MinhaEquipe from './pages/MinhaEquipe';
import Relatorios from './pages/Relatorios';

// Páginas de Relatórios Específicos
import RelatorioDesempenho from './pages/Relatorios/RelatorioDesempenho';
import RelatorioClima from './pages/Relatorios/RelatorioClima';
import RelatorioOffboarding from './pages/Relatorios/RelatorioOffboarding';

// Páginas de Configurações
import ConfiguracoesEmpresa from './pages/Configuracoes/ConfiguracoesEmpresa';

const App: React.FC = () => {
  const { usuario, initialize: initializeAuth } = useAuthStore();
  const { initialize } = useDataStore();

  useEffect(() => {
    // Inicializar dados mock no localStorage se não existirem
    initializeMockData();
    
    // Carregar dados nos stores
    initialize();
    initializeAuth();
  }, [initialize, initializeAuth]);

  if (!usuario) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Rotas de Parametrização - Apenas para ADMIN */}
            {usuario.perfil === 'ADMIN' && (
              <>
                <Route path="parametrizacao/tipos-competencia" element={<TiposCompetencia />} />
                <Route path="parametrizacao/escalas-competencia" element={<EscalasCompetencia />} />
                <Route path="parametrizacao/competencias" element={<Competencias />} />
                <Route path="parametrizacao/cargos" element={<Cargos />} />
                <Route path="parametrizacao/colaboradores" element={<Colaboradores />} />
                <Route path="parametrizacao/equipes" element={<Equipes />} />
                <Route path="parametrizacao/usuarios" element={<Usuarios />} />
                <Route path="parametrizacao/ciclos-avaliacao" element={<CiclosAvaliacao />} />
                <Route path="configuracoes/empresa" element={<ConfiguracoesEmpresa />} />
              </>
            )}
            
            {/* Rotas de Avaliação - ADMIN e GESTOR */}
            {(usuario.perfil === 'ADMIN' || usuario.perfil === 'GESTOR') && (
              <>
                <Route path="avaliacoes/criar-wizard" element={<CriacaoAvaliacaoWizard />} />
                <Route path="avaliacoes/gerenciar" element={<GerenciarAvaliacoes />} />
              </>
            )}
            
            {/* Rota para Gestores verem sua equipe */}
            {usuario.perfil === 'GESTOR' && (
              <Route path="minha-equipe" element={<MinhaEquipe />} />
            )}
            
            {/* Rotas para todos os perfis */}
            <Route path="minhas-avaliacoes" element={<MinhasAvaliacoes />} />
            <Route path="responder-avaliacao" element={<RespostaAvaliacao />} />
            <Route path="relatorios" element={<Relatorios />} />
            
            {/* Rotas específicas de relatórios */}
            <Route path="relatorios/desempenho" element={<RelatorioDesempenho />} />
            <Route path="relatorios/clima" element={<RelatorioClima />} />
            <Route path="relatorios/offboarding" element={<RelatorioOffboarding />} />
            
            {/* Rota de fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* Rota de login para usuários autenticados */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
};

export default App;
