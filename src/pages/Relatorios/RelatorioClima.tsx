import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Heart, Users, TrendingUp, Download, Filter, Calendar, Smile, Frown, Meh } from 'lucide-react';
import { useDataStore } from '../../stores/dataStore';

const RelatorioClima: React.FC = () => {
  const { colaboradores, equipes } = useDataStore();
  const [filtroTempo, setFiltroTempo] = useState('ultimo-trimestre');
  const [filtroEquipe, setFiltroEquipe] = useState('todas');

  // Dados mock para demonstração
  const satisfacaoGeral = [
    { categoria: 'Muito Satisfeito', quantidade: 45, cor: '#22C55E' },
    { categoria: 'Satisfeito', quantidade: 32, cor: '#84CC16' },
    { categoria: 'Neutro', quantidade: 15, cor: '#EAB308' },
    { categoria: 'Insatisfeito', quantidade: 6, cor: '#F97316' },
    { categoria: 'Muito Insatisfeito', quantidade: 2, cor: '#EF4444' }
  ];

  const climaPorEquipe = [
    { equipe: 'TI', satisfacao: 4.6, engajamento: 4.4, comunicacao: 4.2 },
    { equipe: 'Vendas', satisfacao: 4.2, engajamento: 4.5, comunicacao: 4.0 },
    { equipe: 'Marketing', satisfacao: 4.1, engajamento: 4.2, comunicacao: 4.3 },
    { equipe: 'RH', satisfacao: 4.4, engajamento: 4.1, comunicacao: 4.5 },
    { equipe: 'Financeiro', satisfacao: 3.9, engajamento: 3.8, comunicacao: 4.0 }
  ];

  const evolucaoClima = [
    { periodo: 'Jan', satisfacao: 3.8, engajamento: 3.6 },
    { periodo: 'Fev', satisfacao: 3.9, engajamento: 3.8 },
    { periodo: 'Mar', satisfacao: 4.1, engajamento: 4.0 },
    { periodo: 'Abr', satisfacao: 4.0, engajamento: 4.1 },
    { periodo: 'Mai', satisfacao: 4.2, engajamento: 4.3 },
    { periodo: 'Jun', satisfacao: 4.3, engajamento: 4.2 }
  ];

  const dimensoesClima = [
    { dimensao: 'Liderança', valor: 4.2, maximo: 5 },
    { dimensao: 'Comunicação', valor: 4.0, maximo: 5 },
    { dimensao: 'Reconhecimento', valor: 3.8, maximo: 5 },
    { dimensao: 'Desenvolvimento', valor: 4.1, maximo: 5 },
    { dimensao: 'Ambiente', valor: 4.4, maximo: 5 },
    { dimensao: 'Benefícios', valor: 3.9, maximo: 5 }
  ];

  const principaisComentarios = [
    { tipo: 'positivo', comentario: 'Excelente ambiente de trabalho e colegas colaborativos', equipe: 'TI' },
    { tipo: 'positivo', comentario: 'Gestão muito presente e suporte adequado', equipe: 'Vendas' },
    { tipo: 'neutro', comentario: 'Poderia melhorar os benefícios oferecidos', equipe: 'Marketing' },
    { tipo: 'negativo', comentario: 'Comunicação entre departamentos precisa melhorar', equipe: 'Financeiro' },
    { tipo: 'positivo', comentario: 'Oportunidades de crescimento são claras', equipe: 'RH' }
  ];

  const exportarRelatorio = () => {
    console.log('Exportando relatório de clima organizacional...');
  };

  const getIconeComentario = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return <Smile className="w-4 h-4 text-green-500" />;
      case 'negativo': return <Frown className="w-4 h-4 text-red-500" />;
      default: return <Meh className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Clima Organizacional</h1>
            <p className="text-gray-600">Análise do ambiente e satisfação dos colaboradores</p>
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
              <p className="text-sm font-medium text-gray-600">Satisfação Geral</p>
              <p className="text-2xl font-bold text-gray-900">4.2</p>
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-xs text-green-600 mt-1">+0.3 vs período anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Resposta</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-1">+12% vs período anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engajamento</p>
              <p className="text-2xl font-bold text-gray-900">4.1</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-1">+0.2 vs período anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recomendação</p>
              <p className="text-2xl font-bold text-gray-900">8.5</p>
            </div>
            <Filter className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-1">NPS Score</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Satisfação Geral */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Satisfação</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={satisfacaoGeral}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, quantidade }) => `${categoria}: ${quantidade}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {satisfacaoGeral.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Clima por Equipe */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Clima por Equipe</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={climaPorEquipe}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="equipe" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="satisfacao" fill="#3B82F6" name="Satisfação" />
              <Bar dataKey="engajamento" fill="#10B981" name="Engajamento" />
              <Bar dataKey="comunicacao" fill="#8B5CF6" name="Comunicação" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Evolução do Clima */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Evolução do Clima</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolucaoClima}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis domain={[3, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="satisfacao" fill="#F59E0B" name="Satisfação" />
              <Bar dataKey="engajamento" fill="#EF4444" name="Engajamento" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar das Dimensões */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Dimensões do Clima</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={dimensoesClima}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dimensao" />
              <PolarRadiusAxis angle={90} domain={[0, 5]} />
              <Radar name="Clima" dataKey="valor" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comentários Principais */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Principais Comentários</h3>
        <div className="space-y-4">
          {principaisComentarios.map((comentario, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              {getIconeComentario(comentario.tipo)}
              <div className="flex-1">
                <p className="text-gray-900">{comentario.comentario}</p>
                <p className="text-sm text-gray-500 mt-1">Equipe: {comentario.equipe}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatorioClima;