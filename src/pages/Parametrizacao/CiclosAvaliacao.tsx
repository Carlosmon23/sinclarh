import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../../stores/dataStore';
import { CicloAvaliacao } from '../../types';

const CiclosAvaliacao: React.FC = () => {
  const { ciclosAvaliacao, addCicloAvaliacao, updateCicloAvaliacao, deleteCicloAvaliacao } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCiclo, setEditingCiclo] = useState<CicloAvaliacao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'DESEMPENHO' as 'DESEMPENHO' | 'CLIMA' | 'ONBOARDING' | 'OFFBOARDING' | 'FEEDBACK' | 'PESQUISA' | 'AVALIACAO_DIRECIONADA',
    tipoAvaliacao: '360' as '90' | '180' | '360',
    dataInicio: '',
    dataLimite: '',
    dataFim: '',
    status: 'CRIADA' as 'CRIADA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA',
    incluiTecnica: true,
    incluiComportamental: true,
    escalaId: '',
    competenciasSelecionadas: [] as string[],
    instrucoes: '',
    empresaId: 'emp-001'
  });

  const filteredCiclos = (ciclosAvaliacao || []).filter(ciclo =>
    ciclo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ciclo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.dataInicio || !formData.dataFim) {
      toast.error('Nome, Data de Início e Data de Fim são obrigatórios');
      return;
    }

    // Validar datas
    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(formData.dataFim);
    
    if (dataFim <= dataInicio) {
      toast.error('Data de fim deve ser posterior à data de início');
      return;
    }

    // Verificar se nome já existe (exceto para edição do mesmo ciclo)
    const nomeExists = ciclosAvaliacao.some(c => 
      c.nome === formData.nome && (!editingCiclo || c.id !== editingCiclo.id)
    );
    if (nomeExists) {
      toast.error('Já existe um ciclo com este nome');
      return;
    }

    if (editingCiclo) {
      updateCicloAvaliacao(editingCiclo.id, formData);
      toast.success('Ciclo de avaliação atualizado com sucesso!');
    } else {
      addCicloAvaliacao(formData);
      toast.success('Ciclo de avaliação criado com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'DESEMPENHO',
      tipoAvaliacao: '360',
      dataInicio: '',
      dataLimite: '',
      dataFim: '',
      status: 'CRIADA',
      incluiTecnica: true,
      incluiComportamental: true,
      escalaId: '',
      competenciasSelecionadas: [],
      instrucoes: '',
      empresaId: 'emp-001'
    });
    setEditingCiclo(null);
    setIsModalOpen(false);
  };

  const handleEdit = (ciclo: CicloAvaliacao) => {
    setEditingCiclo(ciclo);
    setFormData({
      nome: ciclo.nome,
      descricao: ciclo.descricao || '',
      tipo: ciclo.tipo,
      tipoAvaliacao: ciclo.tipoAvaliacao,
      dataInicio: ciclo.dataInicio,
      dataLimite: ciclo.dataLimite,
      dataFim: ciclo.dataFim || ciclo.dataLimite,
      status: ciclo.status,
      incluiTecnica: ciclo.incluiTecnica,
      incluiComportamental: ciclo.incluiComportamental,
      escalaId: ciclo.escalaId,
      competenciasSelecionadas: ciclo.competenciasSelecionadas || [],
      instrucoes: ciclo.instrucoes || '',
      empresaId: ciclo.empresaId
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ciclo de avaliação?')) {
      deleteCicloAvaliacao(id);
      toast.success('Ciclo de avaliação excluído com sucesso!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANEJADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'ATIVO':
        return 'bg-green-100 text-green-800';
      case 'FINALIZADO':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANEJADO':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'ATIVO':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'FINALIZADO':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (dataFim: string) => {
    const today = new Date();
    const endDate = new Date(dataFim);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Finalizado';
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return '1 dia';
    return `${diffDays} dias`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Ciclos de Avaliação</h1>
        <p className="text-gray-600">Gerencie os períodos de avaliação de desempenho</p>
      </div>

      {/* Formulário Superior */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingCiclo ? 'Editar Ciclo' : 'Novo Ciclo'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>
        </div>

        {isModalOpen && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Ciclo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Avaliação Anual 2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PLANEJADO">Planejado</option>
                <option value="ATIVO">Ativo</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="DESEMPENHO">Avaliação de Desempenho</option>
                <option value="AVALIACAO_DIRECIONADA">Avaliação Direcionada</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="OFFBOARDING">Offboarding</option>
                <option value="FEEDBACK">Feedback</option>
                <option value="PESQUISA">Pesquisa</option>
                <option value="CLIMA">Clima</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Fim *
              </label>
              <input
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Descreva os objetivos e características deste ciclo de avaliação"
              />
            </div>
            <div className="lg:col-span-3 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabela Inferior */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Ciclos</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar ciclos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempo Restante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCiclos.map((ciclo) => (
                <tr key={ciclo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{ciclo.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{formatDate(ciclo.dataInicio)} - {formatDate(ciclo.dataFim)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ciclo.status)}`}>
                      {getStatusIcon(ciclo.status)}
                      {ciclo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getDaysRemaining(ciclo.dataFim)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {ciclo.descricao || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(ciclo)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ciclo.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCiclos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum ciclo de avaliação encontrado
          </div>
        )}
      </div>
    </div>
  );
};

export default CiclosAvaliacao;