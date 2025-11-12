import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Download, Filter, Calendar } from 'lucide-react';
import { useDataStore } from '../../stores/dataStore';

const RelatorioDesempenho: React.FC = () => {
  const { colaboradores, equipes, avaliacoes } = useDataStore();
  const [filtroTempo, setFiltroTempo] = useState('ultimo-trimestre');
  const [filtroEquipe, setFiltroEquipe] = useState('todas');

  // Dados mock para demonstração
  const dadosDesempenhoPorEquipe = [
    { equipe: 'Vendas', media: 4.2, meta: 4.0, participacao: 95 },
    { equipe: 'Marketing', media: 3.8, meta: 4.0, participacao: 88 },
    { equipe: 'TI', media: 4.5, meta: 4.2, participacao: 100 },
    { equipe: 'RH', media: 4.1, meta: 4.0, participacao: 92 },
    { equipe: 'Financeiro', media: 3.9, meta: 4.0, participacao: 85 }
  ];

  const evolucaoDesempenho = [
    { periodo: 'Jan', media: 3.8 },
    { periodo: 'Fev', media: 3.9 },
    { periodo: 'Mar', media: 4.1 },
    { periodo: 'Abr', media: 4.0 },
    { periodo: 'Mai', media: 4.2 },
    { periodo: 'Jun', media: 4.3 }
  ];

  const distribuicaoNotas = [
    { faixa: '1.0-2.0', quantidade: 5, cor: '#EF4444' },
    { faixa: '2.1-3.0', quantidade: 12, cor: '#F97316' },
    { faixa: '3.1-4.0', quantidade: 35, cor: '#EAB308' },
    { faixa: '4.1-5.0', quantidade: 48, cor: '#22C55E' }
  ];

  const topPerformers = [
    { nome: 'Ana Silva', equipe: 'Vendas', media: 4.8, crescimento: '+0.3' },
    { nome: 'Carlos Santos', equipe: 'TI', media: 4.7, crescimento: '+0.2' },
    { nome: 'Maria Oliveira', equipe: 'Marketing', media: 4.6, crescimento: '+0.4' },
    { nome: 'João Costa', equipe: 'Financeiro', media: 4.5, crescimento: '+0.1' },
    { nome: 'Lucia Ferreira', equipe: 'RH', media: 4.4, crescimento: '+0.2' }
  ];

  const exportarRelatorio = () => {
    // Implementar exportação
    console.log('Exportando relatório de desempenho...');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Desempenho</h1>
            <p className="text-gray-600">Análise detalhada do desempenho organizacional</p>
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
              <p className="text-sm font-medium text-gray-600">Média Geral</p>
              <p className="text-2xl font-bold text-gray-900">4.1</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-1">+0.2 vs período anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Participação</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-1">+5% vs período anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meta Atingida</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-1">das equipes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliações</p>
              <p className="text-2xl font-bold text-gray-900">{(avaliacoes || []).length}</p>
            </div>
            <Filter className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-1">concluídas</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Desempenho por Equipe */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Desempenho por Equipe</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosDesempenhoPorEquipe}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="equipe" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="media" fill="#3B82F6" name="Média Atual" />
              <Bar dataKey="meta" fill="#10B981" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolução Temporal */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Evolução do Desempenho</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoDesempenho}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis domain={[3, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="media" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Notas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Notas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoNotas}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ faixa, quantidade }) => `${faixa}: ${quantidade}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {distribuicaoNotas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{performer.nome}</p>
                  <p className="text-sm text-gray-600">{performer.equipe}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{performer.media}</p>
                  <p className="text-xs text-green-500">{performer.crescimento}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioDesempenho;