import React, { useState, useEffect } from 'react';
import { Save, Send, ChevronDown, ChevronUp, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';

interface RespostaCompetencia {
  competenciaId: string;
  escala: number;
  justificativa: string;
}

interface RespostaAvaliacao {
  avaliacaoId: string;
  respostas: RespostaCompetencia[];
  observacoesGerais: string;
  status: 'RASCUNHO' | 'FINALIZADA';
}

const RespostaAvaliacao: React.FC = () => {
  const { 
    avaliacoesCiclo, 
    competencias, 
    tiposCompetencia, 
    escalasCompetencia,
    addRespostaAvaliacao,
    updateRespostaAvaliacao 
  } = useDataStore();
  const { usuario } = useAuthStore();

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<string>('');
  const [respostas, setRespostas] = useState<RespostaCompetencia[]>([]);
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [abaSelecionada, setAbaSelecionada] = useState<string>('');
  const [acordeaoAberto, setAcordeaoAberto] = useState<Record<string, boolean>>({});

  // Filtrar avaliações disponíveis para o usuário atual
  const avaliacoesDisponiveis = (avaliacoesCiclo || []).filter(avaliacao => {
    // Lógica simplificada - em um sistema real, seria mais complexa
    return avaliacao.status === 'EM_ANDAMENTO';
  });

  const avaliacaoAtual = (avaliacoesCiclo || []).find(a => a.id === avaliacaoSelecionada);

  // Agrupar competências por tipo
  const competenciasAgrupadas = React.useMemo(() => {
    if (!avaliacaoAtual) return {};

    const competenciasAvaliacao = (competencias || []).filter(c => 
      (avaliacaoAtual.competenciasSelecionadas || []).includes(c.id)
    );

    return competenciasAvaliacao.reduce((acc, comp) => {
      const tipo = (tiposCompetencia || []).find(t => t.id === comp.tipoCompetenciaId);
      const tipoNome = tipo?.nome || 'Outros';
      
      if (!acc[tipoNome]) {
        acc[tipoNome] = {
          tipo: tipo,
          competencias: []
        };
      }
      acc[tipoNome].competencias.push(comp);
      return acc;
    }, {} as Record<string, { tipo: any; competencias: typeof competencias }>);
  }, [avaliacaoAtual, competencias, tiposCompetencia]);

  // Inicializar respostas quando avaliação é selecionada
  useEffect(() => {
    if (avaliacaoAtual) {
      const competenciasIds = avaliacaoAtual.competenciasSelecionadas || [];
      const respostasIniciais = competenciasIds.map(id => ({
        competenciaId: id,
        escala: 0,
        justificativa: ''
      }));
      setRespostas(respostasIniciais);
      
      // Abrir primeira aba
      const primeiroTipo = Object.keys(competenciasAgrupadas)[0];
      if (primeiroTipo) {
        setAbaSelecionada(primeiroTipo);
        setAcordeaoAberto({ [primeiroTipo]: true });
      }
    }
  }, [avaliacaoAtual, competenciasAgrupadas]);

  const handleRespostaChange = (competenciaId: string, campo: 'escala' | 'justificativa', valor: any) => {
    setRespostas(prev => prev.map(resp => 
      resp.competenciaId === competenciaId 
        ? { ...resp, [campo]: valor }
        : resp
    ));
  };

  const getRespostaCompetencia = (competenciaId: string) => {
    return respostas.find(r => r.competenciaId === competenciaId) || {
      competenciaId,
      escala: 0,
      justificativa: ''
    };
  };

  const handleSalvarRascunho = () => {
    if (!avaliacaoSelecionada) {
      toast.error('Selecione uma avaliação');
      return;
    }

    // Create individual responses for each competencia
    respostas.forEach(resposta => {
      const respostaAvaliacao = {
        avaliacaoParticipanteId: avaliacaoSelecionada,
        competenciaId: resposta.competenciaId,
        nota: resposta.escala,
        justificativa: resposta.justificativa
      };
      addRespostaAvaliacao(respostaAvaliacao);
    });

    toast.success('Rascunho salvo com sucesso!');
  };

  const handleFinalizar = () => {
    if (!avaliacaoSelecionada) {
      toast.error('Selecione uma avaliação');
      return;
    }

    // Validar se todas as competências foram respondidas
    const respostasIncompletas = respostas.filter(r => r.escala === 0);
    if (respostasIncompletas.length > 0) {
      toast.error('Responda todas as competências antes de finalizar');
      return;
    }

    // Create individual responses for each competencia
    respostas.forEach(resposta => {
      const respostaAvaliacao = {
        avaliacaoParticipanteId: avaliacaoSelecionada,
        competenciaId: resposta.competenciaId,
        nota: resposta.escala,
        justificativa: resposta.justificativa
      };
      addRespostaAvaliacao(respostaAvaliacao);
    });

    toast.success('Avaliação finalizada com sucesso!');
    
    // Reset
    setAvaliacaoSelecionada('');
    setRespostas([]);
    setObservacoesGerais('');
  };

  const toggleAcordeao = (tipo: string) => {
    setAcordeaoAberto(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  const getProgressoPorTipo = (tipo: string) => {
    const competenciasTipo = competenciasAgrupadas[tipo]?.competencias || [];
    const respostasCompletas = competenciasTipo.filter(comp => {
      const resposta = getRespostaCompetencia(comp.id);
      return resposta.escala > 0;
    }).length;
    
    return {
      completas: respostasCompletas,
      total: competenciasTipo.length,
      percentual: competenciasTipo.length > 0 ? (respostasCompletas / competenciasTipo.length) * 100 : 0
    };
  };

  const getEscalasDisponiveis = () => {
    return (escalasCompetencia || []).sort((a, b) => a.peso - b.peso);
  };

  const getCorEscala = (peso: number) => {
    if (peso <= 2) return 'text-red-600 bg-red-50 border-red-200';
    if (peso <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (peso <= 4) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Responder Avaliação</h1>
        <p className="text-gray-600">Complete sua avaliação de desempenho</p>
      </div>

      {/* Seleção de Avaliação */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Avaliação</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avaliação Disponível
            </label>
            <select
              value={avaliacaoSelecionada}
              onChange={(e) => setAvaliacaoSelecionada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma avaliação</option>
              {avaliacoesDisponiveis.map((avaliacao) => (
                <option key={avaliacao.id} value={avaliacao.id}>
                  {avaliacao.nome} - {avaliacao.tipoAvaliacao}
                </option>
              ))}
            </select>
          </div>
          {avaliacaoAtual && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">{avaliacaoAtual.nome}</h3>
              <p className="text-sm text-blue-700 mb-1">{avaliacaoAtual.descricao}</p>
              <p className="text-xs text-blue-600">
                Período: {new Date(avaliacaoAtual.dataInicio).toLocaleDateString()} - {new Date(avaliacaoAtual.dataFim).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {avaliacaoAtual && (
        <>
          {/* Instruções */}
          {avaliacaoAtual.instrucoes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">Instruções</h3>
                  <p className="text-sm text-amber-800">{avaliacaoAtual.instrucoes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Abas por Tipo de Competência */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {Object.keys(competenciasAgrupadas).map((tipo) => {
                  const progresso = getProgressoPorTipo(tipo);
                  const isActive = abaSelecionada === tipo;
                  
                  return (
                    <button
                      key={tipo}
                      onClick={() => setAbaSelecionada(tipo)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tipo}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          progresso.percentual === 100 
                            ? 'bg-green-100 text-green-800' 
                            : progresso.percentual > 0 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {progresso.completas}/{progresso.total}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Conteúdo da Aba Selecionada */}
            <div className="p-6">
              {abaSelecionada && competenciasAgrupadas[abaSelecionada] && (
                <div className="space-y-4">
                  {competenciasAgrupadas[abaSelecionada].competencias.map((competencia) => {
                    const resposta = getRespostaCompetencia(competencia.id);
                    const escalas = getEscalasDisponiveis();
                    
                    return (
                      <div key={competencia.id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleAcordeao(competencia.id)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{competencia.nome}</h3>
                            <p className="text-sm text-gray-600 mt-1">{competencia.pergunta}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {resposta.escala > 0 && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {acordeaoAberto[competencia.id] ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {acordeaoAberto[competencia.id] && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            {/* Escalas de Avaliação */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-3">
                                Avaliação *
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {escalas.map((escala) => (
                                  <label
                                    key={escala.id}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                      resposta.escala === escala.peso
                                        ? getCorEscala(escala.peso)
                                        : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`escala-${competencia.id}`}
                                      value={escala.peso}
                                      checked={resposta.escala === escala.peso}
                                      onChange={(e) => handleRespostaChange(
                                        competencia.id, 
                                        'escala', 
                                        parseInt(e.target.value)
                                      )}
                                      className="sr-only"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{escala.peso}</span>
                                        <span className="text-sm">{escala.nome}</span>
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Área de Justificativa */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Justificativa / Comentários
                              </label>
                              <textarea
                                value={resposta.justificativa}
                                onChange={(e) => handleRespostaChange(
                                  competencia.id, 
                                  'justificativa', 
                                  e.target.value
                                )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                placeholder="Descreva exemplos específicos, situações ou justifique sua avaliação..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Observações Gerais */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Observações Gerais
            </h3>
            <textarea
              value={observacoesGerais}
              onChange={(e) => setObservacoesGerais(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Adicione comentários gerais sobre esta avaliação, pontos de melhoria, objetivos para o próximo período, etc."
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={handleSalvarRascunho}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Rascunho
            </button>
            <button
              onClick={handleFinalizar}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Finalizar Avaliação
            </button>
          </div>
        </>
      )}

      {avaliacoesDisponiveis.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma avaliação disponível</h3>
          <p className="text-gray-600">
            Não há avaliações pendentes para você no momento.
          </p>
        </div>
      )}
    </div>
  );
};

export default RespostaAvaliacao;