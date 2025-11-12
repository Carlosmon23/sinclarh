import React, { useState } from 'react';
import { Users, Mail, Phone, Calendar, Building, User, Shield, Search } from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';

const MinhaEquipe: React.FC = () => {
  const { colaboradores, equipes, cargos } = useDataStore();
  const { usuario } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Get manager's teams and subordinates
  const gestorColaborador = colaboradores.find(c => c.id === usuario?.colaboradorId);
  const minhasEquipes = equipes.filter(e => e.gestorId === gestorColaborador?.id);
  
  // Get all collaborators from my teams (direct and hierarchical)
  const minhasEquipesIds = minhasEquipes.map(e => e.id);
  
  // Get subordinate teams
  const getSubordinateTeams = (teamIds: string[]): string[] => {
    const subordinateTeams = equipes.filter(equipe => 
      teamIds.some(id => equipe.equipeSuperiorId === id)
    );
    const subordinateTeamIds = subordinateTeams.map(equipe => equipe.id);
    
    if (subordinateTeamIds.length === 0) return teamIds;
    
    return [...teamIds, ...getSubordinateTeams(subordinateTeamIds)];
  };
  
  const allTeamIds = getSubordinateTeams(minhasEquipesIds);
  
  const meusColaboradores = colaboradores.filter(c => 
    allTeamIds.includes(c.equipeId) && c.situacao === 'ATIVO'
  );

  // Filter by search term
  const filteredColaboradores = meusColaboradores.filter(colab =>
    colab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colab.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colab.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Minha Equipe</h1>
        <p className="text-gray-600">Visualize e gerencie os membros da sua equipe</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Colaboradores</p>
              <p className="text-3xl font-bold text-gray-900">{meusColaboradores.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Minhas Equipes</p>
              <p className="text-3xl font-bold text-gray-900">{allTeamIds.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Gestores Subordinados</p>
              <p className="text-3xl font-bold text-gray-900">
                {meusColaboradores.filter(c => c.isGestor && c.id !== gestorColaborador?.id).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Minhas Equipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {minhasEquipes.map(equipe => {
            const membros = colaboradores.filter(c => c.equipeId === equipe.id && c.situacao === 'ATIVO');
            return (
              <div key={equipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{equipe.nome}</h3>
                      <p className="text-xs text-gray-500">{equipe.codigo}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Membros:</span>
                    <span className="font-medium text-gray-900">{membros.length}</span>
                  </div>
                  {equipe.equipeSuperiorId && (
                    <div className="text-xs text-gray-500">
                      Superior: {getEquipeNome(equipe.equipeSuperiorId)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collaborators List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Colaboradores</h2>
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
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Admissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColaboradores.map((colaborador) => (
                <tr key={colaborador.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {colaborador.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{colaborador.nome}</p>
                        <p className="text-xs text-gray-500">{colaborador.cpf}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {colaborador.matricula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      {colaborador.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCargoNome(colaborador.cargoId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getEquipeNome(colaborador.equipeId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(colaborador.dataAdmissao).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {colaborador.isGestor && (
                      <div className="flex items-center text-blue-600">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-xs font-medium">Gestor</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredColaboradores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum colaborador encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhaEquipe;

