import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { UserMinus, TrendingDown, AlertTriangle, Download, Filter, Calendar, Users, Target } from 'lucide-react';
import { useDataStore } from '../../stores/dataStore';

const RelatorioOffboarding: React.FC = () => {
  const { colaboradores, equipes } = useDataStore();
  const [filtroTempo, setFiltroTempo] = useState('ultimo-trimestre');
  const [filtroEquipe, setFiltroEquipe] = useState('todas');

  // Dados mock para demonstração
  const motivosDesligamento = [
    { motivo: 'Melhor Oportunidade', quantidade: 15, cor: '#3B82F6' },
    { motivo: 'Salário', quantidade: 12, cor: '#10B981' },
    { motivo: 'Ambiente de Trabalho', quantidade: 8, cor: '#F59E0B' },
    { motivo: 'Falta de Crescimento', quantidade: 6, cor: '#EF4444' },
    { motivo: 'Localização', quantidade: 4, cor: '#8B5CF6' },
    { motivo: 'Outros', quantidade: 5, cor: '#6B7280' }
  ];

  const desligamentosPorEquipe = [
    { equipe: 'Vendas', desligamentos: 8, colaboradores: 25, taxa: 32 },
    { equipe: 'TI', desligamentos: 5, colaboradores: 20, taxa: 25 },
    { equipe: 'Marketing', desligamentos: 6, colaboradores: 15, taxa: 40 },
    { equipe: 'RH', desligamentos: 2, colaboradores: 8, taxa: 25 },
    { equipe: 'Financeiro', desligamentos: 3, colaboradores: 12, taxa: 25 }
  ];

  const evolucaoTurnover = [
    { periodo: 'Jan', taxa: 2.1, meta: 2.5 },
    { periodo: 'Fev', taxa: 2.8, meta: 2.5 },
    { periodo: 'Mar', taxa: 3.2, meta: 2.5 },
    { periodo: 'Abr', taxa: 2.9, meta: 2.5 },
    { periodo: 'Mai', taxa: 3.5, meta: 2.5 },
    { periodo: 'Jun', taxa: 3.1, meta: 2.5 }
  ];

  const perfilDesligados = [
    { perfil: '0-1 ano', quantidade: 18, cor: '#EF4444' },
    { perfil: '1-2 anos', quantidade: 12, cor: '#F97316' },
    { perfil: '2-5 anos', quantidade: 8, cor: '#EAB308' },
    { perfil: '5+ anos', quantidade: 4, cor: '#22C55E' }
  ];

  const principaisFeedbacks = [
    { categoria: 'Positivo', feedback: 'Excelente ambiente de trabalho e colegas', impacto: 'alto' },
    { categoria: 'Melhoria', feedback: 'Salários abaixo do mercado', impacto: 'alto' },
    { categoria: 'Melhoria', feedback: 'Falta de oportunidades de crescimento', impacto: 'medio' },
    { categoria: 'Positivo', feedback: 'Boa liderança e suporte', impacto: 'medio' },
    { categoria: 'Melhoria', feedback: 'Processos burocráticos demais', impacto: 'baixo' }
  ];

  const exportarRelatorio = () => {
    console.log('Exportando relatório de offboarding...');
  };

  const getCorImpacto = (impacto: string) => {
    switch (impacto) {
      case 'alto': return 'text-red-600 bg-red-100';
      case 'medio': return 'text-yellow-600 bg-yellow-100';
      case 'baixo': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Offboarding</h1>
            <p className="text-gray-600">Análise de desligamentos e retenção de talentos</p>
          </div>
          <button
            onClick={exportarRelatorio}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={filtroTempo}
              onChange={(e) => setFiltroTempo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ultimo-mes">Último Mês</option>
              <option value="ultimo-trimestre">Último Trimestre</option>
              <option value="ultimo-semestre">Último Semestre</option>
              <option value="ultimo-ano">Último Ano</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              value={filtroEquipe}
              onChange={(e) => setFiltroEquipe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as Equipes</option>
              {(equipes || []).map(equipe => (
                <option key={equipe.id} value={equipe.id}>{equipe.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Turnover</p>
              <p className="text-2xl font-bold text-gray-900">3.1%</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xs text-red-600 mt-1">+0.6% vs período anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Desligamentos</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <UserMinus className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-1">no período</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-1">meses na empresa</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risco Alto</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-xs text-yellow-600 mt-1">colaboradores</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Motivos de Desligamento */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Motivos de Desligamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={motivosDesligamento}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ motivo, quantidade }) => `${motivo}: ${quantidade}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {motivosDesligamento.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Desligamentos por Equipe */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Desligamentos por Equipe</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={desligamentosPorEquipe}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="equipe" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="desligamentos" fill="#EF4444" name="Desligamentos" />
              <Bar dataKey="taxa" fill="#F97316" name="Taxa (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Evolução do Turnover */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Evolução do Turnover</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoTurnover}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis domain={[0, 4]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="taxa" stroke="#EF4444" strokeWidth={2} name="Taxa Atual" />
              <Line type="monotone" dataKey="meta" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Perfil dos Desligados */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Perfil dos Desligados (Tempo de Casa)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={perfilDesligados} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="perfil" type="category" />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Principais Feedbacks */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Principais Feedbacks do Offboarding</h3>
        <div className="space-y-4">
          {principaisFeedbacks.map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`px-2 py-1 rounded text-xs font-medium ${getCorImpacto(item.impacto)}`}>
                {item.impacto.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.categoria === 'Positivo' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {item.categoria}
                  </span>
                </div>
                <p className="text-gray-900">{item.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Recomendadas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
        <h3 className="text-lg font-semibold mb-4">Ações Recomendadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Urgente</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Revisar política salarial da equipe de Marketing</li>
              <li>• Implementar plano de carreira mais claro</li>
              <li>• Melhorar processo de onboarding</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Médio Prazo</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Criar programa de mentoria</li>
              <li>• Implementar pesquisa de clima trimestral</li>
              <li>• Desenvolver programa de retenção de talentos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioOffboarding;