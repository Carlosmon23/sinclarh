import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../../stores/dataStore';
import { Competencia } from '../../types';

const Competencias: React.FC = () => {
  const { competencias, tiposCompetencia, addCompetencia, updateCompetencia, deleteCompetencia, cargos } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetencia, setEditingCompetencia] = useState<Competencia | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tipoCompetenciaId: '',
    competencia: '',
    perguntaParaAvaliar: '',
    nome: '',
    pergunta: '',
    empresaId: 'emp-001',
    ativa: true
  });

  const filteredCompetencias = (competencias || []).filter(comp =>
    comp.competencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.perguntaParaAvaliar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipoCompetenciaId || !formData.competencia || !formData.perguntaParaAvaliar) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (editingCompetencia) {
      updateCompetencia(editingCompetencia.id, formData);
      toast.success('Competência atualizada com sucesso!');
    } else {
      addCompetencia(formData);
      toast.success('Competência criada com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      tipoCompetenciaId: '', 
      competencia: '', 
      perguntaParaAvaliar: '',
      nome: '',
      pergunta: '',
      empresaId: 'emp-001',
      ativa: true
    });
    setEditingCompetencia(null);
    setIsModalOpen(false);
  };

  const handleEdit = (competencia: Competencia) => {
    setEditingCompetencia(competencia);
    setFormData({
      tipoCompetenciaId: competencia.tipoCompetenciaId,
      competencia: competencia.competencia,
      perguntaParaAvaliar: competencia.perguntaParaAvaliar,
      nome: competencia.nome || competencia.competencia,
      pergunta: competencia.pergunta || competencia.perguntaParaAvaliar,
      empresaId: competencia.empresaId,
      ativa: competencia.ativa
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Check if competency is linked to any cargo
    const linkedCargos = cargos.filter(cargo => cargo.competenciasIds && cargo.competenciasIds.includes(id));
    
    if (linkedCargos.length > 0) {
      const cargoNames = linkedCargos.map(cargo => cargo.nome).join(', ');
      toast.error(`Esta competência não pode ser excluída pois está vinculada a ${linkedCargos.length} cargo(s): ${cargoNames}`);
      return;
    }

    // Use the store method to check if can be deleted (checks evaluation history)
    const canDelete = useDataStore.getState().canDeleteCompetencia(id);
    
    if (!canDelete) {
      toast.error('Esta competência não pode ser excluída pois foi utilizada em avaliações anteriores (histórico)');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir esta competência?')) {
      deleteCompetencia(id);
      toast.success('Competência excluída com sucesso!');
    }
  };

  const getTipoNome = (tipoId: string) => {
    const tipo = tiposCompetencia.find(t => t.id === tipoId);
    return tipo ? tipo.nome : 'Tipo não encontrado';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Competências</h1>
        <p className="text-gray-600">Gerencie as competências e suas perguntas de avaliação</p>
      </div>

      {/* Formulário Superior */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingCompetencia ? 'Editar Competência' : 'Nova Competência'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Competência *
                </label>
                <select
                  value={formData.tipoCompetenciaId}
                  onChange={(e) => setFormData({ ...formData, tipoCompetenciaId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {tiposCompetencia.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Competência *
                </label>
                <input
                  type="text"
                  value={formData.competencia}
                  onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Adaptabilidade, Liderança"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pergunta para Avaliar *
              </label>
              <textarea
                value={formData.perguntaParaAvaliar}
                onChange={(e) => setFormData({ ...formData, perguntaParaAvaliar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Como você avalia a capacidade do colaborador de se adaptar a mudanças?"
                rows={3}
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativa"
                checked={formData.ativa}
                onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativa" className="text-sm font-medium text-gray-700">
                Competência Ativa
              </label>
            </div>
            <div className="flex gap-2">
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
            <h2 className="text-lg font-semibold text-gray-900">Lista de Competências</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar competências..."
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
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Competência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pergunta para Avaliar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompetencias.map((competencia) => (
                <tr key={competencia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getTipoNome(competencia.tipoCompetenciaId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{competencia.competencia}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                    <div className="truncate" title={competencia.perguntaParaAvaliar}>
                      {competencia.perguntaParaAvaliar}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      competencia.ativa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {competencia.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(competencia)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(competencia.id)}
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

        {filteredCompetencias.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma competência encontrada
          </div>
        )}
      </div>
    </div>
  );
};

export default Competencias;