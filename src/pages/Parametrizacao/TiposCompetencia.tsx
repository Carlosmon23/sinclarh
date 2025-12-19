import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../../stores/dataStore';
import { TipoCompetencia } from '../../types';

const TiposCompetencia: React.FC = () => {
  const { tiposCompetencia, addTipoCompetencia, updateTipoCompetencia, deleteTipoCompetencia } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoCompetencia | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const destinosDisponiveis: Array<{ value: 'DESEMPENHO' | 'AVALIACAO_DIRECIONADA' | 'ONBOARDING' | 'OFFBOARDING', label: string }> = [
    { value: 'DESEMPENHO', label: 'Avaliação de Desempenho' },
    { value: 'AVALIACAO_DIRECIONADA', label: 'Avaliação Direcionada' },
    { value: 'ONBOARDING', label: 'Onboarding' },
    { value: 'OFFBOARDING', label: 'Offboarding' }
  ];

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    destinos: [] as ('DESEMPENHO' | 'AVALIACAO_DIRECIONADA' | 'CLIMA' | 'ONBOARDING' | 'OFFBOARDING')[],
    empresaId: 'emp-001',
    ativo: true
  });

  const filteredTipos = (tiposCompetencia || []).filter(tipo =>
    tipo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formData.destinos.length === 0) {
      toast.error('Selecione pelo menos um destino para este tipo de competência');
      return;
    }

    if (editingTipo) {
      updateTipoCompetencia(editingTipo.id, formData);
      toast.success('Tipo de competência atualizado com sucesso!');
    } else {
      addTipoCompetencia(formData);
      toast.success('Tipo de competência criado com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ nome: '', descricao: '', destinos: [], empresaId: 'emp-001', ativo: true });
    setEditingTipo(null);
    setIsModalOpen(false);
  };

  const handleEdit = (tipo: TipoCompetencia) => {
    setEditingTipo(tipo);
    setFormData({
      nome: tipo.nome,
      descricao: tipo.descricao,
      destinos: tipo.destinos || [],
      empresaId: tipo.empresaId,
      ativo: tipo.ativo
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo de competência?')) {
      deleteTipoCompetencia(id);
      toast.success('Tipo de competência excluído com sucesso!');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tipos de Competência</h1>
        <p className="text-gray-600">Gerencie os tipos de competências da organização</p>
      </div>

      {/* Formulário Superior */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingTipo ? 'Editar Tipo de Competência' : 'Novo Tipo de Competência'}
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
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: TÉCNICA, COMPORTAMENTAL"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição do tipo de competência"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destino * <span className="text-gray-500 text-xs">(Tipos de avaliação onde este tipo de competência pode ser utilizado)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {destinosDisponiveis.map((destino) => (
                  <label
                    key={destino.value}
                    className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.destinos.includes(destino.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            destinos: [...formData.destinos, destino.value]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            destinos: formData.destinos.filter(d => d !== destino.value)
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{destino.label}</span>
                  </label>
                ))}
              </div>
              {formData.destinos.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Selecione pelo menos um destino</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
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
            <h2 className="text-lg font-semibold text-gray-900">Lista de Tipos de Competência</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar tipos..."
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
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTipos.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{tipo.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tipo.descricao || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {(tipo.destinos || []).length > 0 ? (
                        (tipo.destinos || []).map((destino) => (
                          <span
                            key={destino}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {destinosDisponiveis.find(d => d.value === destino)?.label || destino}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Nenhum destino definido</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(tipo)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tipo.id)}
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

        {filteredTipos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum tipo de competência encontrado
          </div>
        )}
      </div>
    </div>
  );
};

export default TiposCompetencia;