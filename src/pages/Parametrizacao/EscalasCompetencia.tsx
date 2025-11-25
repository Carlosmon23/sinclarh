import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, BarChart3, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../../stores/dataStore';
import { EscalaCompetencia, NotaEscala } from '../../types';

const EscalasCompetencia: React.FC = () => {
  const { escalasCompetencia, addEscalaCompetencia, updateEscalaCompetencia, deleteEscalaCompetencia } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEscala, setEditingEscala] = useState<EscalaCompetencia | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'AVALIACAO_DESEMPENHO' as 'AVALIACAO_DESEMPENHO' | 'AVALIACAO_DIRECIONADA' | 'ONBOARDING' | 'OFFBOARDING' | 'FEEDBACK' | 'PESQUISA',
    nome: '',
    empresaId: 'emp-001',
    ativa: true
  });
  const [notas, setNotas] = useState<Array<{ nota: string; peso: number }>>([]);

  const filteredEscalas = (escalasCompetencia || []).filter(escala =>
    escala.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    escala.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.tipo || !formData.nome) {
      toast.error('Código, Tipo e Nome são obrigatórios');
      return;
    }

    if (notas.length === 0) {
      toast.error('Adicione pelo menos uma nota à escala');
      return;
    }

    // Validar notas
    for (const nota of notas) {
      if (!nota.nota || !nota.nota.trim()) {
        toast.error('Todas as notas devem ter um nome');
        return;
      }
      if (!nota.peso || nota.peso < 1) {
        toast.error('Todas as notas devem ter um peso válido (mínimo 1)');
        return;
      }
    }

    const escalaData = {
      ...formData,
      notas: notas.map((n, index) => ({
        id: editingEscala?.notas?.[index]?.id || `temp-${Date.now()}-${index}`,
        nota: n.nota.trim(),
        peso: n.peso,
        escalaId: editingEscala?.id || '',
        criadaEm: editingEscala?.notas?.[index]?.criadaEm || new Date().toISOString(),
        atualizadaEm: new Date().toISOString()
      })) as NotaEscala[]
    };

    if (editingEscala) {
      updateEscalaCompetencia(editingEscala.id, escalaData);
      toast.success('Escala de competência atualizada com sucesso!');
    } else {
      addEscalaCompetencia(escalaData);
      toast.success('Escala de competência criada com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ codigo: '', tipo: 'AVALIACAO_DESEMPENHO' as 'AVALIACAO_DESEMPENHO' | 'AVALIACAO_DIRECIONADA' | 'ONBOARDING' | 'OFFBOARDING' | 'FEEDBACK' | 'PESQUISA', nome: '', empresaId: 'emp-001', ativa: true });
    setNotas([]);
    setEditingEscala(null);
    setIsModalOpen(false);
  };

  const handleEdit = (escala: EscalaCompetencia) => {
    setEditingEscala(escala);
    setFormData({
      codigo: escala.codigo,
      tipo: escala.tipo,
      nome: escala.nome,
      empresaId: escala.empresaId,
      ativa: escala.ativa
    });
    // Carregar notas da escala
    setNotas(escala.notas?.map(n => ({ nota: n.nota, peso: n.peso })) || []);
    setIsModalOpen(true);
  };

  const handleAddNota = () => {
    setNotas([...notas, { nota: '', peso: 1 }]);
  };

  const handleRemoveNota = (index: number) => {
    setNotas(notas.filter((_, i) => i !== index));
  };

  const handleNotaChange = (index: number, field: 'nota' | 'peso', value: string | number) => {
    const newNotas = [...notas];
    newNotas[index] = { ...newNotas[index], [field]: value };
    setNotas(newNotas);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta escala de competência?')) {
      deleteEscalaCompetencia(id);
      toast.success('Escala de competência excluída com sucesso!');
    }
  };

  const getPesoColor = (peso: number) => {
    if (peso <= 2) return 'text-red-600 bg-red-100';
    if (peso <= 4) return 'text-yellow-600 bg-yellow-100';
    if (peso <= 6) return 'text-blue-600 bg-blue-100';
    if (peso <= 8) return 'text-green-600 bg-green-100';
    return 'text-purple-600 bg-purple-100';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Escalas de Competência</h1>
        <p className="text-gray-600">Gerencie as escalas de avaliação das competências</p>
      </div>

      {/* Formulário Superior */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingEscala ? 'Editar Escala de Competência' : 'Nova Escala de Competência'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: INS, ADE, BOM, EXC"
                required
              />
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
                <option value="AVALIACAO_DESEMPENHO">Avaliação de Desempenho</option>
                <option value="AVALIACAO_DIRECIONADA">Avaliação Direcionada</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="OFFBOARDING">Offboarding</option>
                <option value="FEEDBACK">Feedback</option>
                <option value="PESQUISA">Pesquisa</option>
              </select>
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
                placeholder="Ex: Adequado, Excelente"
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
                Escala Ativa
              </label>
            </div>
            
            {/* Seção de Notas da Escala */}
            <div className="lg:col-span-3 border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notas da Escala</h3>
                <button
                  type="button"
                  onClick={handleAddNota}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Nota
                </button>
              </div>
              
              {notas.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm">Nenhuma nota adicionada. Clique em "Adicionar Nota" para começar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notas.map((nota, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nota *
                          </label>
                          <input
                            type="text"
                            value={nota.nota}
                            onChange={(e) => handleNotaChange(index, 'nota', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Ex: Insuficiente, Adequado, Bom"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Peso *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={nota.peso}
                            onChange={(e) => handleNotaChange(index, 'peso', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNota(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover nota"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
            <h2 className="text-lg font-semibold text-gray-900">Lista de Escalas de Competência</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar escalas..."
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
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
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
              {filteredEscalas.map((escala) => (
                <tr key={escala.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {escala.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {escala.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{escala.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {escala.notas && escala.notas.length > 0 ? (
                        escala.notas
                          .sort((a, b) => a.peso - b.peso)
                          .map((nota) => (
                            <span
                              key={nota.id}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPesoColor(nota.peso)}`}
                              title={`Peso: ${nota.peso}`}
                            >
                              {nota.nota} ({nota.peso})
                            </span>
                          ))
                      ) : (
                        <span className="text-xs text-gray-400">Sem notas</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      escala.ativa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {escala.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(escala)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(escala.id)}
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

        {filteredEscalas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma escala de competência encontrada
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalasCompetencia;