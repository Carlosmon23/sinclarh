import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../../stores/dataStore';
import { Colaborador } from '../../types';

const Colaboradores: React.FC = () => {
  const { colaboradores, cargos, equipes, filiais, addColaborador, updateColaborador, deleteColaborador } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    cpf: '',
    email: '',
    equipeId: '',
    setor: '',
    filialId: '',
    dataAdmissao: '',
    dataDemissao: '',
    situacao: 'ATIVO' as 'ATIVO' | 'DESLIGADO',
    cargoId: '',
    gestor: false,
    isGestor: false,
    gestorId: undefined,
    empresaId: 'emp-001'
  });

  const filteredColaboradores = (colaboradores || []).filter(colab =>
    colab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colab.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colab.cpf.includes(searchTerm) ||
    colab.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colab.setor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.matricula || !formData.nome || !formData.cpf || !formData.email || !formData.cargoId) {
      toast.error('Matrícula, Nome, CPF, Email e Cargo são obrigatórios');
      return;
    }

    // Validar Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    // Validar CPF (formato básico)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.cpf)) {
      toast.error('CPF deve estar no formato 000.000.000-00');
      return;
    }

    if (editingColaborador) {
      updateColaborador(editingColaborador.id, formData);
      toast.success('Colaborador atualizado com sucesso!');
    } else {
      addColaborador(formData);
      toast.success('Colaborador criado com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      matricula: '',
      nome: '',
      cpf: '',
      email: '',
      equipeId: '',
      setor: '',
      filialId: '',
      dataAdmissao: '',
      dataDemissao: '',
      situacao: 'ATIVO',
      cargoId: '',
      gestor: false,
      isGestor: false,
      gestorId: undefined,
      empresaId: 'emp-001'
    });
    setEditingColaborador(null);
    setIsModalOpen(false);
  };

  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setFormData({
      matricula: colaborador.matricula,
      nome: colaborador.nome,
      cpf: colaborador.cpf,
      email: colaborador.email,
      equipeId: colaborador.equipeId || '',
      setor: colaborador.setor || '',
      filialId: colaborador.filialId || '',
      dataAdmissao: colaborador.dataAdmissao,
      dataDemissao: colaborador.dataDemissao || '',
      situacao: colaborador.situacao,
      cargoId: colaborador.cargoId,
      gestor: colaborador.gestor,
      isGestor: colaborador.isGestor,
      gestorId: colaborador.gestorId,
      empresaId: colaborador.empresaId
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      deleteColaborador(id);
      toast.success('Colaborador excluído com sucesso!');
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getEquipeNome = (equipeId: string) => {
    const equipe = equipes.find(e => e.id === equipeId);
    return equipe ? equipe.nome : 'Sem equipe';
  };

  const getCargoNome = (cargoId: string) => {
    const cargo = cargos.find(c => c.id === cargoId);
    return cargo ? cargo.nome : 'Cargo não encontrado';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Colaboradores</h1>
        <p className="text-gray-600">Gerencie os colaboradores da organização</p>
      </div>

      {/* Formulário Superior */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
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
                Matrícula *
              </label>
              <input
                type="text"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 001234"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome completo do colaborador"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="colaborador@empresa.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipe
              </label>
              <select
                value={formData.equipeId}
                onChange={(e) => setFormData({ ...formData, equipeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma equipe</option>
                {equipes.map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor
              </label>
              <input
                type="text"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: TI, RH, Vendas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filial
              </label>
              <select
                value={formData.filialId}
                onChange={(e) => setFormData({ ...formData, filialId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.nome} ({filial.codigo})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Admissão *
              </label>
              <input
                type="date"
                value={formData.dataAdmissao}
                onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Demissão
              </label>
              <input
                type="date"
                value={formData.dataDemissao}
                onChange={(e) => setFormData({ ...formData, dataDemissao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Situação *
              </label>
              <select
                value={formData.situacao}
                onChange={(e) => setFormData({ ...formData, situacao: e.target.value as 'ATIVO' | 'DESLIGADO' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="ATIVO">Ativo</option>
                <option value="DESLIGADO">Desligado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo *
              </label>
              <select
                value={formData.cargoId}
                onChange={(e) => setFormData({ ...formData, cargoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isGestor"
                checked={formData.isGestor}
                onChange={(e) => setFormData({ ...formData, isGestor: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isGestor" className="ml-2 block text-sm text-gray-900">
                É Gestor
              </label>
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
            <h2 className="text-lg font-semibold text-gray-900">Lista de Colaboradores</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar colaboradores..."
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
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Setor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Situação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColaboradores.map((colaborador) => (
                <tr key={colaborador.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {colaborador.matricula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {colaborador.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {colaborador.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {colaborador.cpf}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getEquipeNome(colaborador.equipeId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {colaborador.setor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {colaborador.filialId ? filiais.find(f => f.id === colaborador.filialId)?.nome || '-' : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCargoNome(colaborador.cargoId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      colaborador.situacao === 'ATIVO' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {colaborador.situacao}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {colaborador.isGestor && (
                      <div className="flex items-center text-blue-600">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-xs font-medium">Gestor</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(colaborador)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(colaborador.id)}
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

        {filteredColaboradores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum colaborador encontrado
          </div>
        )}
      </div>
    </div>
  );
};

export default Colaboradores;