import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Users, Target, Award, Calendar, FileText, Download, Filter } from 'lucide-react';
import { useDataStore } from '../stores/dataStore';

const Relatorios: React.FC = () => {
  const { 
    colaboradores, 
    avaliacoesCiclo, 
    respostasAvaliacoes, 
    competencias, 
    tiposCompetencia,
    escalasCompetencia,
    equipes,
    cargos 
  } = useDataStore();

  const [relatorioSelecionado, setRelatorioSelecionado] = useState('desempenho-geral');
  const [filtroTempo, setFiltroTempo] = useState('ultimo-trimestre');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  // Dados mockados para demonstração dos gráficos
  const dadosDesempenhoGeral = [
    { nome: 'Excelente', valor: 25, cor: '#10B981' },
    { nome: 'Bom', valor: 45, cor: '#3B82F6' },
    { nome: 'Regular', valor: 20, cor: '#F59E0B' },
    { nome: 'Insatisfatório', valor: 10, cor: '#EF4444' }
  ];

  const dadosDesempenhoPorEquipe = [
    { equipe: 'Vendas', media: 4.2, meta: 4.0 },
    { equipe: 'Marketing', media: 3.8, meta: 4.0 },
    { equipe: 'TI', media: 4.5, meta: 4.0 },
    { equipe: 'RH', media: 4.1, meta: 4.0 },
    { equipe: 'Financeiro', media: 3.9, meta: 4.0 }
  ];

  const dadosCompetenciasPorTipo = [
    { tipo: 'Técnicas', media: 4.1 },
    { tipo: 'Comportamentais', media: 3.8 },
    { tipo: 'Liderança', media: 3.9 },
    { tipo: 'Comunicação', media: 4.0 }
  ];

  const dadosEvolucaoTemporal = [
    { periodo: 'Q1 2024', media: 3.5 },
    { periodo: 'Q2 2024', media: 3.7 },
    { periodo: 'Q3 2024', media: 3.9 },
    { periodo: 'Q4 2024', media: 4.1 }
  ];

  const dadosRadarCompetencias = [
    { competencia: 'Liderança', valor: 4.2, maximo: 5 },
    { competencia: 'Comunicação', valor: 3.8, maximo: 5 },
    { competencia: 'Técnica', valor: 4.5, maximo: 5 },
    { competencia: 'Inovação', valor: 3.6, maximo: 5 },
    { competencia: 'Trabalho em Equipe', valor: 4.0, maximo: 5 },
    { competencia: 'Resolução de Problemas', valor: 3.9, maximo: 5 }
  ];

  const relatorios = [
    {
      id: 'desempenho-geral',
      nome: 'Desempenho Geral',
      descricao: 'Visão geral do desempenho organizacional',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      id: 'desempenho-equipes',
      nome: 'Desempenho por Equipes',
      descricao: 'Comparativo entre equipes',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'competencias-tipo',
      nome: 'Competências por Tipo',
      descricao: 'Análise por categoria de competência',
      icon: Target,
      color: 'bg-purple-500'
    },
    {
      id: 'evolucao-temporal',
      nome: 'Evolução Temporal',
      descricao: 'Tendências ao longo do tempo',
      icon: Calendar,
      color: 'bg-orange-500'
    },
    {
      id: 'radar-competencias',
      nome: 'Radar de Competências',
      descricao: 'Mapa de competências organizacional',
      icon: Award,
      color: 'bg-indigo-500'
    },
    {
      id: 'participacao-avaliacoes',
      nome: 'Participação em Avaliações',
      descricao: 'Taxa de participação e engajamento',
      icon: FileText,
      color: 'bg-pink-500'
    },
    {
      id: 'top-performers',
      nome: 'Top Performers',
      descricao: 'Colaboradores com melhor desempenho',
      icon: Award,
      color: 'bg-yellow-500'
    },
    {
      id: 'gaps-competencias',
      nome: 'Gaps de Competências',
      descricao: 'Lacunas identificadas por área',
      icon: Target,
      color: 'bg-red-500'
    },
    {
      id: 'metas-realizacoes',
      nome: 'Metas vs Realizações',
      descricao: 'Comparativo de objetivos alcançados',
      icon: TrendingUp,
      color: 'bg-teal-500'
    },
    {
      id: 'feedback-360',
      nome: 'Análise 360°',
      descricao: 'Visão multidimensional das avaliações',
      icon: Users,
      color: 'bg-cyan-500'
    }
  ];

  const renderGrafico = () => {
    switch (relatorioSelecionado) {
      case 'desempenho-geral':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Distribuição de Desempenho</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosDesempenhoGeral}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nome, valor }) => `${nome}: ${valor}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {dadosDesempenhoGeral.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Métricas Principais</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Média Geral</span>
                    <span className="text-xl font-bold text-blue-600">4.1</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium">Taxa de Participação</span>
                    <span className="text-xl font-bold text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="text-sm font-medium">Avaliações Concluídas</span>
                    <span className="text-xl font-bold text-purple-600">156</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Melhoria vs Período Anterior</span>
                    <span className="text-xl font-bold text-orange-600">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'desempenho-equipes':
        return (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Desempenho por Equipe</h3>
            <ResponsiveContainer width="100%" height={400}>
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
        );

      case 'competencias-tipo':
        return (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Competências por Tipo</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dadosCompetenciasPorTipo} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="tipo" type="category" />
                <Tooltip />
                <Bar dataKey="media" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'evolucao-temporal':
        return (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Evolução Temporal do Desempenho</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dadosEvolucaoTemporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="media" stroke="#F59E0B" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'radar-competencias':
        return (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Radar de Competências</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={dadosRadarCompetencias}>
                <PolarGrid />
                <PolarAngleAxis dataKey="competencia" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar name="Competências" dataKey="valor" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return (
          <div className="bg-white p-12 rounded-lg border text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Relatório em Desenvolvimento</h3>
            <p className="text-gray-600">Este relatório está sendo desenvolvido e estará disponível em breve.</p>
          </div>
        );
    }
  };

  const relatorioAtual = relatorios.find(r => r.id === relatorioSelecionado);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios e Analytics</h1>
        <p className="text-gray-600">Análises detalhadas do desempenho organizacional</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Lista de Relatórios */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h2>
            <div className="flex gap-2">
              <select
                value={filtroTempo}
                onChange={(e) => setFiltroTempo(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              >
                <option value="ultimo-mes">Último Mês</option>
                <option value="ultimo-trimestre">Último Trimestre</option>
                <option value="ultimo-semestre">Último Semestre</option>
                <option value="ultimo-ano">Último Ano</option>
              </select>
              <button className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                <Filter className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {relatorios.map((relatorio) => {
              const Icon = relatorio.icon;
              const isSelected = relatorioSelecionado === relatorio.id;
              
              return (
                <button
                  key={relatorio.id}
                  onClick={() => setRelatorioSelecionado(relatorio.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 border' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${relatorio.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {relatorio.nome}
                      </h3>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {relatorio.descricao}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Área Principal - Gráficos */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{relatorioAtual?.nome}</h2>
                <p className="text-gray-600 text-sm">{relatorioAtual?.descricao}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>

            {renderGrafico()}
          </div>

          {/* Insights e Recomendações */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights e Recomendações</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Pontos Fortes</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Equipe de TI com desempenho excepcional (4.5)</li>
                  <li>• Melhoria consistente ao longo dos trimestres</li>
                  <li>• Alta taxa de participação nas avaliações (87%)</li>
                </ul>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">⚠️ Áreas de Atenção</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Equipe de Marketing abaixo da meta (3.8)</li>
                  <li>• Competências comportamentais precisam de foco</li>
                  <li>• 13% dos colaboradores não participaram</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Recomendações</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Implementar programa de mentoria para Marketing</li>
                  <li>• Workshops de desenvolvimento comportamental</li>
                  <li>• Campanha de engajamento para não participantes</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">🎯 Próximos Passos</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Definir PDIs individualizados</li>
                  <li>• Agendar reuniões de feedback com gestores</li>
                  <li>• Planejar treinamentos para Q1 2025</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;