import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../../stores/dataStore';
import { Equipe } from '../../types';

const Equipes: React.FC = () => {
  const { equipes, colaboradores, addEquipe, updateEquipe, deleteEquipe } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    gestorId: '',
    empresaId: 'emp-001',
    ativa: true,
    equipeSuperiorId: ''
  });

  // Filtrar apenas colaboradores que são gestores
  const gestores = (colaboradores || []).filter(colab => colab.isGestor && colab.situacao === 'ATIVO');

  const filteredEquipes = (equipes || []).filter(equipe =>
    equipe.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipe.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.nome || !formData.gestorId) {
      toast.error('Código, Nome e Gestor são obrigatórios');
      return;
    }

    // Check for circular reference
    const equipeId = editingEquipe?.id || '';
    if (formData.equipeSuperiorId && hasCircularReference(equipeId, formData.equipeSuperiorId)) {
      toast.error('Referência circular detectada! Não é possível definir esta equipe como superior.');
      return;
    }

    if (editingEquipe) {
      updateEquipe(editingEquipe.id, formData);
      toast.success('Equipe atualizada com sucesso!');
    } else {
      addEquipe(formData);
      toast.success('Equipe criada com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ codigo: '', nome: '', gestorId: '', empresaId: 'emp-001', ativa: true, equipeSuperiorId: '' });
    setEditingEquipe(null);
    setIsModalOpen(false);
  };

  const handleEdit = (equipe: Equipe) => {
    setEditingEquipe(equipe);
    setFormData({
      codigo: equipe.codigo,
      nome: equipe.nome,
      gestorId: equipe.gestorId,
      empresaId: equipe.empresaId,
      ativa: equipe.ativa,
      equipeSuperiorId: equipe.equipeSuperiorId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta equipe?')) {
      deleteEquipe(id);
      toast.success('Equipe excluída com sucesso!');
    }
  };

  const getGestorNome = (gestorId: string) => {
    const gestor = colaboradores.find(c => c.id === gestorId);
    return gestor ? gestor.nome : 'Gestor não encontrado';
  };

  const getEquipeSuperiorNome = (equipeSuperiorId: string) => {
    if (!equipeSuperiorId) return 'Equipe Principal';
    const equipeSuperior = equipes.find(e => e.id === equipeSuperiorId);
    return equipeSuperior ? `${equipeSuperior.codigo} - ${equipeSuperior.nome}` : 'Equipe não encontrada';
  };

  const hasCircularReference = (equipeId: string, equipeSuperiorId: string): boolean => {
    if (!equipeSuperiorId) return false;
    
    let currentEquipeId = equipeSuperiorId;
    const visited = new Set<string>();
    
    while (currentEquipeId) {
      if (visited.has(currentEquipeId)) {
        return true; // Circular reference detected
      }
      
      if (currentEquipeId === equipeId) {
        return true; // Trying to set itself as parent
      }
      
      visited.add(currentEquipeId);
      
      const currentEquipe = equipes.find(e => e.id === currentEquipeId);
      if (!currentEquipe || !currentEquipe.equipeSuperiorId) {
        break;
      }
      
      currentEquipeId = currentEquipe.equipeSuperiorId;
    }
    
    return false;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Equipes</h1>
        <p className="text-gray-600">Gerencie as equipes e seus gestores</p>
      </div>

      {/* Formulário Superior */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingEquipe ? 'Editar Equipe' : 'Nova Equipe'}
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
                placeholder="Ex: EQ001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Equipe *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Equipe de Desenvolvimento"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gestor *
              </label>
              <select
                value={formData.gestorId}
                onChange={(e) => setFormData({ ...formData, gestorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um gestor</option>
                {gestores.map((gestor) => (
                  <option key={gestor.id} value={gestor.id}>
                    {gestor.nome} - {gestor.matricula}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipe Superior
              </label>
              <select
                value={formData.equipeSuperiorId}
                onChange={(e) => setFormData({ ...formData, equipeSuperiorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Nenhuma (Equipe Principal)</option>
                {equipes.filter(equipe => equipe.id !== editingEquipe?.id).map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.codigo} - {equipe.nome}
                  </option>
                ))}
              </select>
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
            <h2 className="text-lg font-semibold text-gray-900">Lista de Equipes</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar equipes..."
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
                  Nome da Equipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gestor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipe Superior
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipes.map((equipe) => (
                <tr key={equipe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {equipe.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{equipe.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getGestorNome(equipe.gestorId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getEquipeSuperiorNome(equipe.equipeSuperiorId || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(equipe)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(equipe.id)}
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

        {filteredEquipes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma equipe encontrada
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipes;