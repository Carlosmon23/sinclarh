import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../../stores/dataStore';
import { Cargo } from '../../types';

const Cargos: React.FC = () => {
  const { cargos, competencias, addCargo, updateCargo, deleteCargo } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompetenciaModalOpen, setIsCompetenciaModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [competenciaSearchTerm, setCompetenciaSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricaoAtividade: '',
    competenciasIds: [] as string[],
    empresaId: 'emp-001',
    ativo: true
  });

  const filteredCargos = (cargos || []).filter(cargo =>
    cargo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cargo.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompetenciaToggle = (competenciaId: string) => {
    setFormData(prev => ({
      ...prev,
      competenciasIds: prev.competenciasIds.includes(competenciaId)
        ? prev.competenciasIds.filter(id => id !== competenciaId)
        : [...prev.competenciasIds, competenciaId]
    }));
  };

  const getSelectedCompetencias = () => {
    return competencias.filter(comp => formData.competenciasIds.includes(comp.id));
  };

  const getCompetenciaNames = (competenciaIds: string[]) => {
    return competenciaIds.map(id => {
      const comp = competencias.find(c => c.id === id);
      return comp ? comp.competencia : 'Competência não encontrada';
    }).join(', ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.nome) {
      toast.error('Código e Nome são obrigatórios');
      return;
    }

    if (editingCargo) {
      updateCargo(editingCargo.id, formData);
      toast.success('Cargo atualizado com sucesso!');
    } else {
      addCargo(formData);
      toast.success('Cargo criado com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ codigo: '', nome: '', descricaoAtividade: '', competenciasIds: [], empresaId: 'emp-001', ativo: true });
    setEditingCargo(null);
    setIsModalOpen(false);
  };

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setFormData({
      codigo: cargo.codigo,
      nome: cargo.nome,
      descricaoAtividade: cargo.descricaoAtividade,
      competenciasIds: cargo.competenciasIds || [],
      empresaId: cargo.empresaId,
      ativo: cargo.ativo
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
      deleteCargo(id);
      toast.success('Cargo excluído com sucesso!');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Cargos</h1>
        <p className="text-gray-600">Gerencie os cargos da organização</p>
      </div>

      {/* Formulário Superior */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingCargo ? 'Editar Cargo' : 'Novo Cargo'}
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: DEV001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Desenvolvedor Sênior"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Atividade
              </label>
              <input
                type="text"
                value={formData.descricaoAtividade}
                onChange={(e) => setFormData({ ...formData, descricaoAtividade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrição das principais atividades"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competências
              </label>
              <button
                type="button"
                onClick={() => setIsCompetenciaModalOpen(true)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-left hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {formData.competenciasIds.length === 0 
                    ? 'Selecionar competências...' 
                    : `${formData.competenciasIds.length} competência(s) selecionada(s)`
                  }
                </span>
                <Users className="w-4 h-4 text-gray-400" />
              </button>
              {formData.competenciasIds.length > 0 && (
                <div className="mt-2 space-y-1">
                  {getSelectedCompetencias().map(comp => (
                    <div key={comp.id} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded text-sm">
                      <span className="text-blue-800">{comp.competencia}</span>
                      <button
                        type="button"
                        onClick={() => handleCompetenciaToggle(comp.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-3 flex gap-2">
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
            <h2 className="text-lg font-semibold text-gray-900">Lista de Cargos</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar cargos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
        </div>
      </div>

      {/* Competency Selection Modal */}
      {isCompetenciaModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Competências</h3>
              <button
                onClick={() => setIsCompetenciaModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Pesquisar competências..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={competenciaSearchTerm}
                onChange={(e) => setCompetenciaSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-96">
              <div className="space-y-2">
                {competencias
                  .filter(comp => 
                    competenciaSearchTerm === '' || 
                    comp.competencia.toLowerCase().includes(competenciaSearchTerm.toLowerCase()) ||
                    comp.nome.toLowerCase().includes(competenciaSearchTerm.toLowerCase())
                  )
                  .map(competencia => (
                    <div key={competencia.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`comp-${competencia.id}`}
                        checked={formData.competenciasIds.includes(competencia.id)}
                        onChange={() => handleCompetenciaToggle(competencia.id)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`comp-${competencia.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium text-gray-900">{competencia.competencia}</div>
                        <div className="text-sm text-gray-500">{competencia.nome}</div>
                        <div className="text-xs text-gray-400">{competencia.pergunta}</div>
                      </label>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsCompetenciaModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setIsCompetenciaModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar ({formData.competenciasIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Competências
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCargos.map((cargo) => (
                <tr key={cargo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cargo.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cargo.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {cargo.descricaoAtividade || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {cargo.competenciasIds.length === 0 ? (
                      <span className="text-gray-400">Nenhuma competência</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 mb-1">
                          {cargo.competenciasIds.length} competência(s)
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {cargo.competenciasIds.slice(0, 3).map(compId => {
                            const comp = competencias.find(c => c.id === compId);
                            return comp ? (
                              <span key={compId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {comp.competencia}
                              </span>
                            ) : null;
                          })}
                          {cargo.competenciasIds.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{cargo.competenciasIds.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cargo)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cargo.id)}
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

        {filteredCargos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum cargo encontrado
          </div>
        )}
      </div>
    </div>
  );
};

export default Cargos;