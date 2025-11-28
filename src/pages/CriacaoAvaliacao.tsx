import React, { useState } from 'react';
import { Save, Users, Calendar, CheckCircle, AlertCircle, User, Building, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';

type TipoAvaliacao = 'AUTO_AVALIACAO' | 'AVALIACAO_GESTOR' | 'AVALIACAO_360' | 'AVALIACAO_EQUIPE';

interface FormularioAvaliacao {
  nome: string;
  descricao: string;
  cicloId: string;
  dataInicio: string;
  dataFim: string;
  tipoAvaliacao: TipoAvaliacao;
  competenciasSelecionadas: string[];
  pessoasSelecionadas: string[];
  instrucoes: string;
}

const CriacaoAvaliacao: React.FC = () => {
  const { 
    ciclosAvaliacao, 
    competencias, 
    colaboradores, 
    equipes,
    tiposCompetencia,
    addAvaliacao 
  } = useDataStore();
  const { usuario } = useAuthStore();

  const [tipoSelecionado, setTipoSelecionado] = useState<TipoAvaliacao>('AUTO_AVALIACAO');
  const [formulario, setFormulario] = useState<FormularioAvaliacao>({
    nome: '',
    descricao: '',
    cicloId: '',
    dataInicio: '',
    dataFim: '',
    tipoAvaliacao: 'AUTO_AVALIACAO',
    competenciasSelecionadas: [],
    pessoasSelecionadas: [],
    instrucoes: ''
  });

  const tiposAvaliacao = [
    {
      tipo: 'AUTO_AVALIACAO' as TipoAvaliacao,
      nome: 'Auto Avaliação',
      descricao: 'Colaborador avalia seu próprio desempenho',
      icon: User,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      tipo: 'AVALIACAO_GESTOR' as TipoAvaliacao,
      nome: 'Avaliação do Gestor',
      descricao: 'Gestor avalia seus subordinados',
      icon: Building,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      tipo: 'AVALIACAO_360' as TipoAvaliacao,
      nome: 'Avaliação 360°',
      descricao: 'Avaliação por múltiplas perspectivas',
      icon: Target,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      tipo: 'AVALIACAO_EQUIPE' as TipoAvaliacao,
      nome: 'Avaliação de Equipe',
      descricao: 'Avaliação coletiva da equipe',
      icon: Users,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    }
  ];

  const handleTipoChange = (tipo: TipoAvaliacao) => {
    setTipoSelecionado(tipo);
    setFormulario(prev => ({
      ...prev,
      tipoAvaliacao: tipo,
      pessoasSelecionadas: [] // Reset pessoas quando muda tipo
    }));
  };

  const handleCompetenciaToggle = (competenciaId: string) => {
    setFormulario(prev => ({
      ...prev,
      competenciasSelecionadas: prev.competenciasSelecionadas.includes(competenciaId)
        ? prev.competenciasSelecionadas.filter(id => id !== competenciaId)
        : [...prev.competenciasSelecionadas, competenciaId]
    }));
  };

  const handlePessoaToggle = (pessoaId: string) => {
    setFormulario(prev => ({
      ...prev,
      pessoasSelecionadas: prev.pessoasSelecionadas.includes(pessoaId)
        ? prev.pessoasSelecionadas.filter(id => id !== pessoaId)
        : [...prev.pessoasSelecionadas, pessoaId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulario.nome || !formulario.cicloId || !formulario.dataInicio || !formulario.dataFim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formulario.competenciasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma competência');
      return;
    }

    if (formulario.pessoasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma pessoa');
      return;
    }

    // Validar datas
    const dataInicio = new Date(formulario.dataInicio);
    const dataFim = new Date(formulario.dataFim);
    
    if (dataFim <= dataInicio) {
      toast.error('Data de fim deve ser posterior à data de início');
      return;
    }

    // Determinar tipo de avaliação baseado no tipo selecionado
    const tipoAvaliacao = tipoSelecionado === 'AVALIACAO_360' ? '360' : 
                         tipoSelecionado === 'AVALIACAO_GESTOR' ? '90' : '90';
    
    // Determinar incluiTecnica e incluiComportamental baseado nas competências selecionadas
    const competenciasSelecionadasObjs = (competencias || []).filter(c => 
      formulario.competenciasSelecionadas.includes(c.id)
    );
    const temTecnica = competenciasSelecionadasObjs.some(c => {
      const tipo = (tiposCompetencia || []).find(t => t.id === c.tipoCompetenciaId);
      return tipo?.nome === 'Técnica';
    });
    const temComportamental = competenciasSelecionadasObjs.some(c => {
      const tipo = (tiposCompetencia || []).find(t => t.id === c.tipoCompetenciaId);
      return tipo?.nome === 'Comportamental';
    });
    
    const novaAvaliacao = {
      nome: formulario.nome,
      descricao: formulario.descricao,
      tipo: 'DESEMPENHO' as const, // CriacaoAvaliacao é sempre DESEMPENHO
      tipoAvaliacao: tipoAvaliacao as "90" | "180" | "360",
      dataInicio: formulario.dataInicio,
      dataLimite: formulario.dataFim,
      dataFim: formulario.dataFim,
      status: 'CRIADA' as const,
      incluiTecnica: temTecnica,
      incluiComportamental: temComportamental,
      escalaId: 'escala-001', // TODO: Permitir seleção de escala
      competenciasSelecionadas: formulario.competenciasSelecionadas,
      instrucoes: formulario.instrucoes,
      empresaId: 'emp-001'
    };

    addAvaliacao(novaAvaliacao);
    
    // Criar participantes automaticamente
    const { avaliacoesCiclo, addAvaliacaoParticipante, colaboradores } = useDataStore.getState();
    const avaliacaoCriada = avaliacoesCiclo[avaliacoesCiclo.length - 1];
    
    if (avaliacaoCriada && formulario.pessoasSelecionadas.length > 0) {
      formulario.pessoasSelecionadas.forEach((avaliadoId: string) => {
        const avaliado = (colaboradores || []).find(c => c.id === avaliadoId);
        if (!avaliado) return;
        
        // Para 90°: apenas gestor avalia
        if (tipoAvaliacao === '90' && avaliado.gestorId) {
          addAvaliacaoParticipante({
            avaliacaoCicloId: avaliacaoCriada.id,
            avaliadorId: avaliado.gestorId,
            avaliadoId: avaliadoId,
            status: 'PENDENTE'
          });
        }
        
        // Para 180°: gestor + autoavaliação
        if (tipoAvaliacao === '180') {
          if (avaliado.gestorId) {
            addAvaliacaoParticipante({
              avaliacaoCicloId: avaliacaoCriada.id,
              avaliadorId: avaliado.gestorId,
              avaliadoId: avaliadoId,
              status: 'PENDENTE'
            });
          }
          addAvaliacaoParticipante({
            avaliacaoCicloId: avaliacaoCriada.id,
            avaliadorId: avaliadoId,
            avaliadoId: avaliadoId,
            status: 'PENDENTE'
          });
        }
        
        // Para 360°: gestor + autoavaliação + pares
        if (tipoAvaliacao === '360') {
          if (avaliado.gestorId) {
            addAvaliacaoParticipante({
              avaliacaoCicloId: avaliacaoCriada.id,
              avaliadorId: avaliado.gestorId,
              avaliadoId: avaliadoId,
              status: 'PENDENTE'
            });
          }
          addAvaliacaoParticipante({
            avaliacaoCicloId: avaliacaoCriada.id,
            avaliadorId: avaliadoId,
            avaliadoId: avaliadoId,
            status: 'PENDENTE'
          });
          // Pares
          const pares = (colaboradores || []).filter(c => 
            c.id !== avaliadoId &&
            c.equipeId === avaliado.equipeId &&
            c.gestorId === avaliado.gestorId &&
            c.situacao === 'ATIVO'
          );
          pares.forEach(par => {
            addAvaliacaoParticipante({
              avaliacaoCicloId: avaliacaoCriada.id,
              avaliadorId: par.id,
              avaliadoId: avaliadoId,
              status: 'PENDENTE'
            });
          });
        }
      });
    }
    
    toast.success('Avaliação criada com sucesso!');
    
    // Reset form
    setFormulario({
      nome: '',
      descricao: '',
      cicloId: '',
      dataInicio: '',
      dataFim: '',
      tipoAvaliacao: tipoSelecionado,
      competenciasSelecionadas: [],
      pessoasSelecionadas: [],
      instrucoes: ''
    });
  };

  const getPessoasDisponiveis = () => {
    switch (tipoSelecionado) {
      case 'AUTO_AVALIACAO':
        return (colaboradores || []).filter(c => c.situacao === 'ATIVO');
      case 'AVALIACAO_GESTOR':
        return (colaboradores || []).filter(c => c.situacao === 'ATIVO' && c.gestorId);
      case 'AVALIACAO_360':
        return (colaboradores || []).filter(c => c.situacao === 'ATIVO');
      case 'AVALIACAO_EQUIPE':
        return equipes || [];
      default:
        return [];
    }
  };

  const getCompetenciasPorTipo = () => {
    const competenciasAgrupadas = (competencias || []).reduce((acc, comp) => {
      const tipo = (tiposCompetencia || []).find(t => t.id === comp.tipoCompetenciaId);
      const tipoNome = tipo?.nome || 'Outros';
      
      if (!acc[tipoNome]) {
        acc[tipoNome] = [];
      }
      acc[tipoNome].push(comp);
      return acc;
    }, {} as Record<string, typeof competencias>);

    return competenciasAgrupadas;
  };

  const ciclosAtivos = (ciclosAvaliacao || []).filter(c => c.status === 'EM_ANDAMENTO' || c.status === 'CRIADA');
  const competenciasAgrupadas = getCompetenciasPorTipo();
  const pessoasDisponiveis = getPessoasDisponiveis();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Criação de Avaliações</h1>
        <p className="text-gray-600">Configure e crie novas avaliações de desempenho</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Coluna 1: Menu Vertical - Tipos de Avaliação */}
        <div className="col-span-3 bg-white rounded-lg shadow-sm border p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Avaliação</h2>
          <div className="space-y-3">
            {tiposAvaliacao.map((tipo) => {
              const Icon = tipo.icon;
              const isSelected = tipoSelecionado === tipo.tipo;
              
              return (
                <button
                  key={tipo.tipo}
                  onClick={() => handleTipoChange(tipo.tipo)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected 
                      ? `${tipo.color} border-current shadow-md` 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-current' : 'text-gray-400'}`} />
                    <div>
                      <h3 className={`font-medium ${isSelected ? 'text-current' : 'text-gray-900'}`}>
                        {tipo.nome}
                      </h3>
                      <p className={`text-sm mt-1 ${isSelected ? 'text-current opacity-80' : 'text-gray-500'}`}>
                        {tipo.descricao}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna 2: Formulário Central */}
        <div className="col-span-6 bg-white rounded-lg shadow-sm border p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuração da Avaliação</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 border-b pb-2">Informações Básicas</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Avaliação *
                </label>
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Avaliação de Desempenho Q4 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formulario.descricao}
                  onChange={(e) => setFormulario(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva os objetivos desta avaliação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciclo de Avaliação *
                </label>
                <select
                  value={formulario.cicloId}
                  onChange={(e) => setFormulario(prev => ({ ...prev, cicloId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um ciclo</option>
                  {ciclosAtivos.map((ciclo) => (
                    <option key={ciclo.id} value={ciclo.id}>
                      {ciclo.nome} ({ciclo.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={formulario.dataInicio}
                    onChange={(e) => setFormulario(prev => ({ ...prev, dataInicio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Fim *
                  </label>
                  <input
                    type="date"
                    value={formulario.dataFim}
                    onChange={(e) => setFormulario(prev => ({ ...prev, dataFim: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Competências */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 border-b pb-2">
                Competências ({formulario.competenciasSelecionadas.length} selecionadas)
              </h3>
              
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {Object.entries(competenciasAgrupadas).map(([tipoNome, competenciasList]) => (
                  <div key={tipoNome} className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">{tipoNome}</h4>
                    <div className="space-y-2 ml-4">
                      {competenciasList.map((competencia) => (
                        <label key={competencia.id} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formulario.competenciasSelecionadas.includes(competencia.id)}
                            onChange={() => handleCompetenciaToggle(competencia.id)}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{competencia.nome}</span>
                            <p className="text-xs text-gray-500">{competencia.pergunta}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instruções */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instruções para os Avaliadores
              </label>
              <textarea
                value={formulario.instrucoes}
                onChange={(e) => setFormulario(prev => ({ ...prev, instrucoes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Instruções específicas para esta avaliação..."
              />
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 border-t">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
              >
                <Save className="w-4 h-4" />
                Criar Avaliação
              </button>
            </div>
          </form>
        </div>

        {/* Coluna 3: Seleção de Pessoas */}
        <div className="col-span-3 bg-white rounded-lg shadow-sm border p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Seleção de {tipoSelecionado === 'AVALIACAO_EQUIPE' ? 'Equipes' : 'Pessoas'}
          </h2>
          
          <div className="mb-3">
            <span className="text-sm text-gray-600">
              {formulario.pessoasSelecionadas.length} selecionada(s)
            </span>
          </div>

          <div className="space-y-2">
            {pessoasDisponiveis.map((item) => {
              const isSelected = formulario.pessoasSelecionadas.includes(item.id);
              
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handlePessoaToggle(item.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {item.nome}
                    </p>
                    {tipoSelecionado !== 'AVALIACAO_EQUIPE' && 'matricula' in item && (
                      <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {item.matricula}
                      </p>
                    )}
                    {tipoSelecionado === 'AVALIACAO_EQUIPE' && 'gestorId' in item && (
                      <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        Gestor: {(colaboradores || []).find(c => c.id === item.gestorId)?.nome || 'N/A'}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {pessoasDisponiveis.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                Nenhuma {tipoSelecionado === 'AVALIACAO_EQUIPE' ? 'equipe' : 'pessoa'} disponível
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CriacaoAvaliacao;