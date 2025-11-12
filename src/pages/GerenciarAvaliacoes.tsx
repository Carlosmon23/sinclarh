import React, { useState } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  Search,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';

const GerenciarAvaliacoes: React.FC = () => {
  const { avaliacoesCiclo, avaliacaoParticipantes, colaboradores, equipes } = useDataStore();
  const { usuario } = useAuthStore();
  
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Filtrar avaliações baseado no perfil do usuário
  const avaliacoesFiltradas = (avaliacoesCiclo || []).filter(avaliacao => {
    // Se for gestor, mostrar apenas avaliações da sua equipe
    if (usuario?.perfil === 'GESTOR') {
      const minhaEquipe = (equipes || []).find(e => e.gestorId === usuario.colaboradorId);
      if (!minhaEquipe) return false;
      
      // Verificar se há participantes da equipe nesta avaliação
      const temParticipanteDaEquipe = (avaliacaoParticipantes || []).some(p => 
        p.avaliacaoCicloId === avaliacao.id && 
        (minhaEquipe.membros || []).some(m => m.id === p.avaliadoId)
      );
      
      if (!temParticipanteDaEquipe) return false;
    }

    // Filtros de status
    if (filtroStatus !== 'TODOS' && avaliacao.status !== filtroStatus) return false;
    
    // Filtros de tipo
    if (filtroTipo !== 'TODOS' && avaliacao.tipo !== filtroTipo) return false;
    
    // Busca por nome
    if (termoBusca && !avaliacao.nome.toLowerCase().includes(termoBusca.toLowerCase())) return false;
    
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRIADA': return 'bg-gray-100 text-gray-800';
      case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800';
      case 'FINALIZADA': return 'bg-green-100 text-green-800';
      case 'CANCELADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRIADA': return <Clock className="w-4 h-4" />;
      case 'EM_ANDAMENTO': return <CheckCircle className="w-4 h-4" />;
      case 'FINALIZADA': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELADA': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getParticipantesInfo = (avaliacaoId: string) => {
    const participantes = (avaliacaoParticipantes || []).filter(p => p.avaliacaoCicloId === avaliacaoId);
    const concluidas = participantes.filter(p => p.status === 'CONCLUIDA').length;
    const total = participantes.length;
    
    return { concluidas, total, participantes };
  };

  const handleExcluirAvaliacao = (avaliacaoId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      // Implementar exclusão
      toast.success('Avaliação excluída com sucesso!');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Avaliações</h1>
            <p className="text-gray-600">
              {usuario?.perfil === 'ADMIN' 
                ? 'Gerencie todas as avaliações da empresa' 
                : 'Gerencie as avaliações da sua equipe'
              }
            </p>
          </div>
          {(usuario?.perfil === 'ADMIN' || usuario?.perfil === 'GESTOR') && (
            <Link
              to="/avaliacoes/criar"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Avaliação
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nome da avaliação..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="CRIADA">Criada</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TODOS">Todos os Tipos</option>
                <option value="DESEMPENHO">Desempenho</option>
                <option value="CLIMA">Clima</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="OFFBOARDING">Offboarding</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltroStatus('TODOS');
                  setFiltroTipo('TODOS');
                  setTermoBusca('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {avaliacoesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {termoBusca || filtroStatus !== 'TODOS' || filtroTipo !== 'TODOS'
                ? 'Tente ajustar os filtros para encontrar avaliações.'
                : 'Você ainda não criou nenhuma avaliação.'
              }
            </p>
            {(usuario?.perfil === 'ADMIN' || usuario?.perfil === 'GESTOR') && (
              <Link
                to="/avaliacoes/criar"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeira Avaliação
              </Link>
            )}
          </div>
        ) : (
          avaliacoesFiltradas.map((avaliacao) => {
            const { concluidas, total, participantes } = getParticipantesInfo(avaliacao.id);
            const progresso = total > 0 ? (concluidas / total) * 100 : 0;

            return (
              <div key={avaliacao.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {avaliacao.nome}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(avaliacao.status)}`}>
                        {getStatusIcon(avaliacao.status)}
                        <span className="ml-1">{avaliacao.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(avaliacao.dataInicio).toLocaleDateString()} - {new Date(avaliacao.dataLimite).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {total} participante{total !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {avaliacao.tipo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/avaliacoes/detalhes/${avaliacao.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {(usuario?.perfil === 'ADMIN' || usuario?.perfil === 'GESTOR') && (
                      <>
                        <Link
                          to={`/avaliacoes/editar/${avaliacao.id}`}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleExcluirAvaliacao(avaliacao.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progresso das Respostas
                    </span>
                    <span className="text-sm text-gray-600">
                      {concluidas}/{total} ({Math.round(progresso)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                </div>

                {/* Lista de Participantes */}
                {participantes.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Participantes ({participantes.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {participantes.slice(0, 6).map((participante) => {
                        const colaborador = (colaboradores || []).find(c => c.id === participante.avaliadoId);
                        return (
                          <div key={participante.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">
                              {colaborador?.nome || 'Colaborador não encontrado'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              participante.status === 'CONCLUIDA' 
                                ? 'bg-green-100 text-green-800' 
                                : participante.status === 'EM_RASCUNHO'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {participante.status === 'CONCLUIDA' ? 'Concluída' : 
                               participante.status === 'EM_RASCUNHO' ? 'Em Rascunho' : 'Pendente'}
                            </span>
                          </div>
                        );
                      })}
                      {participantes.length > 6 && (
                        <div className="flex items-center justify-center p-2 bg-gray-50 rounded text-sm text-gray-500">
                          +{participantes.length - 6} mais
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GerenciarAvaliacoes;