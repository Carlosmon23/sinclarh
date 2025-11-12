import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  User, 
  Filter,
  Search,
  Play,
  Eye,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';

const MinhasAvaliacoes: React.FC = () => {
  const { avaliacoesCiclo, avaliacaoParticipantes, colaboradores } = useDataStore();
  const { usuario } = useAuthStore();
  
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Buscar avaliações onde o usuário é participante
  const minhasAvaliacoes = (avaliacaoParticipantes || []).filter(participante => {
    // Verificar se o usuário é o avaliado ou avaliador
    const isAvaliado = participante.avaliadoId === usuario?.colaboradorId;
    const isAvaliador = participante.avaliadorId === usuario?.colaboradorId;
    
    return isAvaliado || isAvaliador;
  }).map(participante => {
    const avaliacao = (avaliacoesCiclo || []).find(a => a.id === participante.avaliacaoCicloId);
    const avaliado = (colaboradores || []).find(c => c.id === participante.avaliadoId);
    const avaliador = (colaboradores || []).find(c => c.id === participante.avaliadorId);
    
    return {
      ...participante,
      avaliacao,
      avaliado,
      avaliador,
      isMinhaAutoAvaliacao: participante.avaliadoId === usuario?.colaboradorId && participante.avaliadorId === usuario?.colaboradorId,
      souAvaliador: participante.avaliadorId === usuario?.colaboradorId,
      souAvaliado: participante.avaliadoId === usuario?.colaboradorId
    };
  }).filter(item => {
    if (!item.avaliacao) return false;
    
    // Filtros
    if (filtroStatus !== 'TODOS' && item.status !== filtroStatus) return false;
    if (filtroTipo !== 'TODOS' && item.avaliacao.tipo !== filtroTipo) return false;
    if (termoBusca && !item.avaliacao.nome.toLowerCase().includes(termoBusca.toLowerCase())) return false;
    
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EM_RASCUNHO': return 'bg-blue-100 text-blue-800';
      case 'CONCLUIDA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE': return <Clock className="w-4 h-4" />;
      case 'EM_RASCUNHO': return <AlertCircle className="w-4 h-4" />;
      case 'CONCLUIDA': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getAcaoTexto = (item: any) => {
    if (item.status === 'CONCLUIDA') {
      return 'Ver Resultado';
    }
    if (item.status === 'EM_RASCUNHO') {
      return 'Continuar';
    }
    return 'Iniciar';
  };

  const getTipoAvaliacao = (item: any) => {
    if (item.isMinhaAutoAvaliacao) {
      return 'Auto Avaliação';
    }
    if (item.souAvaliador && !item.souAvaliado) {
      return `Avaliar: ${item.avaliado?.nome}`;
    }
    if (item.souAvaliado && !item.souAvaliador) {
      return `Avaliado por: ${item.avaliador?.nome}`;
    }
    return 'Avaliação';
  };

  // Estatísticas
  const stats = {
    total: minhasAvaliacoes.length,
    pendentes: minhasAvaliacoes.filter(a => a.status === 'PENDENTE').length,
    emAndamento: minhasAvaliacoes.filter(a => a.status === 'EM_RASCUNHO').length,
    concluidas: minhasAvaliacoes.filter(a => a.status === 'CONCLUIDA').length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Minhas Avaliações</h1>
        <p className="text-gray-600">
          Acompanhe suas avaliações pendentes e concluídas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emAndamento}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.concluidas}</p>
            </div>
          </div>
        </div>
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
              <option value="PENDENTE">Pendente</option>
              <option value="EM_RASCUNHO">Em Rascunho</option>
              <option value="CONCLUIDA">Concluída</option>
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

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {minhasAvaliacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-gray-500">
              {termoBusca || filtroStatus !== 'TODOS' || filtroTipo !== 'TODOS'
                ? 'Tente ajustar os filtros para encontrar avaliações.'
                : 'Você não possui avaliações no momento.'
              }
            </p>
          </div>
        ) : (
          minhasAvaliacoes.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.avaliacao?.nome}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">
                        {item.status === 'PENDENTE' ? 'Pendente' : 
                         item.status === 'EM_RASCUNHO' ? 'Em Rascunho' : 'Concluída'}
                      </span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {item.avaliacao && new Date(item.avaliacao.dataInicio).toLocaleDateString()} - {item.avaliacao && new Date(item.avaliacao.dataLimite).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {getTipoAvaliacao(item)}
                    </div>
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {item.avaliacao?.tipo}
                    </div>
                  </div>

                  {item.avaliacao?.tipoAvaliacao && (
                    <div className="text-sm text-gray-500">
                      Modalidade: {item.avaliacao.tipoAvaliacao}°
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {item.status === 'CONCLUIDA' ? (
                    <Link
                      to={`/avaliacoes/resultado/${item.id}`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Resultado
                    </Link>
                  ) : (
                    <Link
                      to={`/responder-avaliacao?participante=${item.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {getAcaoTexto(item)}
                    </Link>
                  )}
                </div>
              </div>

              {/* Progresso para avaliações em rascunho */}
              {item.status === 'EM_RASCUNHO' && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progresso
                    </span>
                    <span className="text-sm text-gray-600">
                      Em andamento
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: '45%' }}
                    />
                  </div>
                </div>
              )}

              {/* Datas importantes */}
              {item.avaliacao && (
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Data de Início: </span>
                      <span className="text-gray-600">
                        {new Date(item.avaliacao.dataInicio).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Prazo Limite: </span>
                      <span className="text-gray-600">
                        {new Date(item.avaliacao.dataLimite).toLocaleDateString()}
                      </span>
                    </div>
                    {item.dataFinalizacao && (
                      <div>
                        <span className="font-medium text-gray-700">Finalizada em: </span>
                        <span className="text-gray-600">
                          {new Date(item.dataFinalizacao).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MinhasAvaliacoes;