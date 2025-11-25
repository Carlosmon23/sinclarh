import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  ClipboardList, 
  BarChart3, 
  Users, 
  Target,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';

const Dashboard: React.FC = () => {
  const { usuario } = useAuthStore();
  const { avaliacoesCiclo, avaliacaoParticipantes, colaboradores } = useDataStore();

  // Estatísticas baseadas nos dados mock
  const stats = {
    avaliacoesAtivas: avaliacoesCiclo.filter(a => a.status === 'EM_ANDAMENTO').length,
    avaliacoesPendentes: avaliacaoParticipantes.filter(p => p.status === 'PENDENTE').length,
    avaliacoesConcluidas: avaliacaoParticipantes.filter(p => p.status === 'CONCLUIDA').length,
    totalColaboradores: colaboradores.filter(c => c.situacao === 'ATIVO').length
  };

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo, {usuario?.nome}!
        </h1>
        <p className="text-blue-100 mb-6">
          Qual avaliação deseja criar hoje?
        </p>
        <Link
          to="/avaliacoes/criar-wizard"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Criar Avaliação
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avaliações Ativas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avaliacoesAtivas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avaliacoesPendentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avaliacoesConcluidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Colaboradores</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalColaboradores}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
          <div className="space-y-4">
            <Link
              to="/avaliacoes/criar-wizard"
              className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium ml-4">Criar Nova Avaliação</span>
            </Link>
            <Link
              to="/parametrizacao/colaboradores"
              className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium ml-4">Gerenciar Colaboradores</span>
            </Link>
            <Link
              to="/relatorios"
              className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-all group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium ml-4">Ver Relatórios</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Avaliações Recentes</h3>
          <div className="space-y-4">
            {avaliacoesCiclo.slice(0, 3).map((avaliacao) => (
              <div key={avaliacao.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{avaliacao.nome}</p>
                  <p className="text-sm text-gray-500">{avaliacao.tipo}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  avaliacao.status === 'EM_ANDAMENTO' 
                    ? 'bg-blue-100 text-blue-800'
                    : avaliacao.status === 'FINALIZADA'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {avaliacao.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGestorDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo, {usuario?.nome}!
        </h1>
        <p className="text-gray-600">
          Gerencie as avaliações da sua equipe
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Minhas Avaliações</p>
              <p className="text-2xl font-bold text-gray-900">
                {avaliacaoParticipantes.filter(p => p.avaliadorId === usuario?.colaboradorId).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {avaliacaoParticipantes.filter(p => 
                  p.avaliadorId === usuario?.colaboradorId && p.status === 'PENDENTE'
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">
                {avaliacaoParticipantes.filter(p => 
                  p.avaliadorId === usuario?.colaboradorId && p.status === 'CONCLUIDA'
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Link
            to="/minhas-avaliacoes"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium">Minhas Avaliações</p>
              <p className="text-sm text-gray-500">Ver avaliações pendentes</p>
            </div>
          </Link>
          <Link
            to="/relatorios"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <p className="font-medium">Relatórios da Equipe</p>
              <p className="text-sm text-gray-500">Acompanhar desempenho</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderColaboradorDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo, {usuario?.nome}!
        </h1>
        <p className="text-gray-600">
          Acompanhe suas avaliações e desenvolvimento
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Minhas Avaliações</p>
              <p className="text-2xl font-bold text-gray-900">
                {avaliacaoParticipantes.filter(p => 
                  p.avaliadorId === usuario?.colaboradorId || p.avaliadoId === usuario?.colaboradorId
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Progresso</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="space-y-3">
          <Link
            to="/minhas-avaliacoes"
            className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium">Minhas Avaliações</p>
              <p className="text-sm text-gray-500">Responder avaliações pendentes</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (usuario?.perfil) {
      case 'ADMIN':
        return renderAdminDashboard();
      case 'GESTOR':
        return renderGestorDashboard();
      case 'COLABORADOR':
        return renderColaboradorDashboard();
      default:
        return <div>Perfil não reconhecido</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;