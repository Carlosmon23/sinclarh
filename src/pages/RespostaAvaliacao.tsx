import React, { useState, useEffect } from 'react';
import { Save, Send, User, Building2, Briefcase, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';

interface RespostaCompetencia {
  competenciaId: string;
  escala: number;
  justificativa: string;
}

const RespostaAvaliacao: React.FC = () => {
  const [searchParams] = useSearchParams();
  const participanteIdFromUrl = searchParams.get('participante');
  
  const { 
    avaliacoesCiclo, 
    avaliacaoParticipantes,
    respostasAvaliacao,
    competencias, 
    tiposCompetencia, 
    escalasCompetencia,
    colaboradores,
    cargos,
    equipes,
    addRespostaAvaliacao,
    updateRespostaAvaliacao,
    updateAvaliacaoParticipante
  } = useDataStore();
  const { usuario } = useAuthStore();

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<string>('');
  const [participanteSelecionado, setParticipanteSelecionado] = useState<string>(participanteIdFromUrl || '');
  const [respostas, setRespostas] = useState<RespostaCompetencia[]>([]);

  // Filtrar avaliações disponíveis para o usuário atual
  const avaliacoesDisponiveis = (avaliacoesCiclo || []).filter(avaliacao => {
    if (!usuario?.colaboradorId) return false;
    
    const temParticipacao = (avaliacaoParticipantes || []).some(p => 
      p.avaliacaoCicloId === avaliacao.id && 
      p.avaliadorId === usuario.colaboradorId &&
      p.status !== 'CONCLUIDA'
    );
    
    return avaliacao.status === 'EM_ANDAMENTO' && temParticipacao;
  });

  const avaliacaoAtual = (avaliacoesCiclo || []).find(a => a.id === avaliacaoSelecionada);
  
  // Buscar participantes disponíveis para o usuário atual nesta avaliação
  const participantesDisponiveis = React.useMemo(() => {
    if (!avaliacaoSelecionada || !usuario?.colaboradorId) return [];
    
    return (avaliacaoParticipantes || []).filter(p => 
      p.avaliacaoCicloId === avaliacaoSelecionada &&
      p.avaliadorId === usuario.colaboradorId &&
      p.status !== 'CONCLUIDA'
    );
  }, [avaliacaoSelecionada, usuario?.colaboradorId, avaliacaoParticipantes]);
  
  // Participante atual selecionado
  const participanteAtual = (avaliacaoParticipantes || []).find(p => p.id === participanteSelecionado);
  
  // Dados do avaliado
  const avaliado = participanteAtual ? (colaboradores || []).find(c => c.id === participanteAtual.avaliadoId) : null;
  const cargoAvaliado = avaliado ? (cargos || []).find(c => c.id === avaliado.cargoId) : null;
  const equipeAvaliado = avaliado ? (equipes || []).find(e => e.id === avaliado.equipeId) : null;

  // Buscar autoavaliação do subordinado (para 180°)
  const autoAvaliacaoSubordinado = React.useMemo(() => {
    if (!participanteAtual || !avaliacaoAtual || avaliacaoAtual.tipoAvaliacao !== '180') return null;
    
    // Buscar a autoavaliação do subordinado (onde avaliador = avaliado)
    return (avaliacaoParticipantes || []).find(p => 
      p.avaliacaoCicloId === avaliacaoAtual.id &&
      p.avaliadoId === participanteAtual.avaliadoId &&
      p.avaliadorId === participanteAtual.avaliadoId
    );
  }, [participanteAtual, avaliacaoAtual, avaliacaoParticipantes]);

  // Respostas da autoavaliação do subordinado (para 180°)
  const respostasAutoAvaliacao = React.useMemo(() => {
    if (!autoAvaliacaoSubordinado) return [];
    
    return (respostasAvaliacao || []).filter(r => 
      r.avaliacaoParticipanteId === autoAvaliacaoSubordinado.id
    );
  }, [autoAvaliacaoSubordinado, respostasAvaliacao]);

  // Competências agrupadas por tipo
  const competenciasAgrupadas = React.useMemo(() => {
    if (!avaliacaoAtual) return [];

    const competenciasAvaliacao = (competencias || []).filter(c => 
      (avaliacaoAtual.competenciasSelecionadas || []).includes(c.id)
    );

    // Agrupar por tipo e ordenar
    const agrupadas = competenciasAvaliacao.reduce((acc, comp) => {
      const tipo = (tiposCompetencia || []).find(t => t.id === comp.tipoCompetenciaId);
      const tipoNome = tipo?.nome || 'Outros';
      
      if (!acc[tipoNome]) {
        acc[tipoNome] = [];
      }
      acc[tipoNome].push(comp);
      return acc;
    }, {} as Record<string, typeof competenciasAvaliacao>);

    // Converter para array plano mantendo ordem: Técnica primeiro, depois Comportamental
    const ordem = ['Técnica', 'Comportamental'];
    const resultado: Array<{ tipo: string; competencia: typeof competenciasAvaliacao[0] }> = [];
    
    ordem.forEach(tipoNome => {
      if (agrupadas[tipoNome]) {
        agrupadas[tipoNome].forEach(comp => {
          resultado.push({ tipo: tipoNome, competencia: comp });
        });
      }
    });
    
    // Adicionar outros tipos
    Object.keys(agrupadas).forEach(tipoNome => {
      if (!ordem.includes(tipoNome)) {
        agrupadas[tipoNome].forEach(comp => {
          resultado.push({ tipo: tipoNome, competencia: comp });
        });
      }
    });

    return resultado;
  }, [avaliacaoAtual, competencias, tiposCompetencia]);

  // Inicializar respostas quando participante é selecionado
  useEffect(() => {
    if (participanteAtual && avaliacaoAtual) {
      const competenciasIds = avaliacaoAtual.competenciasSelecionadas || [];
      
      // Carregar respostas existentes para este participante
      const respostasExistentes = (respostasAvaliacao || []).filter(r => 
        r.avaliacaoParticipanteId === participanteAtual.id
      );
      
      const respostasIniciais = competenciasIds.map(id => {
        const respostaExistente = respostasExistentes.find(r => r.competenciaId === id);
        return {
          competenciaId: id,
          escala: respostaExistente?.nota || 0,
          justificativa: respostaExistente?.justificativa || ''
        };
      });
      
      setRespostas(respostasIniciais);
    }
  }, [participanteAtual, avaliacaoAtual, respostasAvaliacao]);

  // Auto-selecionar participante quando avaliação muda
  useEffect(() => {
    if (participanteIdFromUrl) {
      const participanteFromUrl = (avaliacaoParticipantes || []).find(p => p.id === participanteIdFromUrl);
      if (participanteFromUrl && participanteFromUrl.avaliadorId === usuario?.colaboradorId) {
        setParticipanteSelecionado(participanteIdFromUrl);
        setAvaliacaoSelecionada(participanteFromUrl.avaliacaoCicloId);
      }
    } else if (avaliacaoSelecionada && participantesDisponiveis.length === 1) {
      setParticipanteSelecionado(participantesDisponiveis[0].id);
    } else if (avaliacaoSelecionada && participantesDisponiveis.length > 0 && !participanteSelecionado) {
      setParticipanteSelecionado(participantesDisponiveis[0].id);
    }
  }, [participanteIdFromUrl, avaliacaoSelecionada, participantesDisponiveis, avaliacaoParticipantes, usuario?.colaboradorId]);

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

  const getRespostaAutoAvaliacao = (competenciaId: string) => {
    return respostasAutoAvaliacao.find(r => r.competenciaId === competenciaId);
  };

  const getEscalasDisponiveis = () => {
    if (!avaliacaoAtual || !avaliacaoAtual.escalaId) return [];
    const escala = (escalasCompetencia || []).find(e => e.id === avaliacaoAtual.escalaId);
    if (!escala || !escala.notas) return [];
    return escala.notas.sort((a, b) => a.peso - b.peso);
  };

  const getNotaPorPeso = (peso: number) => {
    const escalas = getEscalasDisponiveis();
    const nota = escalas.find(n => n.peso === peso);
    return nota?.nota || '';
  };

  // Calcular média da avaliação
  const calcularMedia = () => {
    const respostasComNota = respostas.filter(r => r.escala > 0);
    if (respostasComNota.length === 0) return 0;
    
    const soma = respostasComNota.reduce((acc, r) => acc + r.escala, 0);
    return soma / respostasComNota.length;
  };

  // Calcular média da autoavaliação (para 180°)
  const calcularMediaAutoAvaliacao = () => {
    if (!autoAvaliacaoSubordinado) return 0;
    
    const respostasComNota = respostasAutoAvaliacao.filter(r => r.nota > 0);
    if (respostasComNota.length === 0) return 0;
    
    const soma = respostasComNota.reduce((acc, r) => acc + r.nota, 0);
    return soma / respostasComNota.length;
  };

  const handleSalvarRascunho = () => {
    if (!participanteSelecionado) {
      toast.error('Selecione um participante');
      return;
    }

    respostas.forEach(resposta => {
      const respostaExistente = (respostasAvaliacao || []).find(r => 
        r.avaliacaoParticipanteId === participanteSelecionado &&
        r.competenciaId === resposta.competenciaId
      );
      
      if (respostaExistente) {
        updateRespostaAvaliacao(respostaExistente.id, {
          nota: resposta.escala,
          justificativa: resposta.justificativa
        });
      } else {
        addRespostaAvaliacao({
          avaliacaoParticipanteId: participanteSelecionado,
          competenciaId: resposta.competenciaId,
          nota: resposta.escala,
          justificativa: resposta.justificativa
        });
      }
    });
    
    if (participanteAtual) {
      updateAvaliacaoParticipante(participanteAtual.id, { status: 'EM_RASCUNHO' });
    }

    toast.success('Rascunho salvo com sucesso!');
  };

  const handleFinalizar = () => {
    if (!participanteSelecionado) {
      toast.error('Selecione um participante');
      return;
    }

    // Validar se todas as competências foram respondidas
    const respostasIncompletas = respostas.filter(r => r.escala === 0);
    if (respostasIncompletas.length > 0) {
      toast.error('Responda todas as competências antes de finalizar');
      return;
    }

    respostas.forEach(resposta => {
      const respostaExistente = (respostasAvaliacao || []).find(r => 
        r.avaliacaoParticipanteId === participanteSelecionado &&
        r.competenciaId === resposta.competenciaId
      );
      
      if (respostaExistente) {
        updateRespostaAvaliacao(respostaExistente.id, {
          nota: resposta.escala,
          justificativa: resposta.justificativa
        });
      } else {
        addRespostaAvaliacao({
          avaliacaoParticipanteId: participanteSelecionado,
          competenciaId: resposta.competenciaId,
          nota: resposta.escala,
          justificativa: resposta.justificativa
        });
      }
    });
    
    if (participanteAtual) {
      updateAvaliacaoParticipante(participanteAtual.id, { 
        status: 'CONCLUIDA',
        dataFinalizacao: new Date().toISOString()
      });
    }

    toast.success('Avaliação finalizada com sucesso!');
    
    // Reset
    setAvaliacaoSelecionada('');
    setParticipanteSelecionado('');
    setRespostas([]);
  };

  const isAvaliacao180 = avaliacaoAtual?.tipoAvaliacao === '180';
  const mediaAvaliacao = calcularMedia();
  const mediaAutoAvaliacao = calcularMediaAutoAvaliacao();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Seleção de Avaliação - Só mostrar se não veio da URL */}
      {!participanteIdFromUrl && (
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
                    {avaliacao.nome} - {avaliacao.tipoAvaliacao}°
                  </option>
                ))}
              </select>
            </div>
            
            {avaliacaoSelecionada && participantesDisponiveis.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecionar Participante {participantesDisponiveis.length > 1 ? '*' : ''}
                </label>
                <select
                  value={participanteSelecionado}
                  onChange={(e) => setParticipanteSelecionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={participantesDisponiveis.length > 1}
                >
                  <option value="">Selecione um participante</option>
                  {participantesDisponiveis.map((participante) => {
                    const avaliado = (colaboradores || []).find(c => c.id === participante.avaliadoId);
                    return (
                      <option key={participante.id} value={participante.id}>
                        {avaliado?.nome || 'Avaliado'}
                        {participante.status === 'EM_RASCUNHO' ? ' (Rascunho)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {avaliacaoAtual && participanteAtual && avaliado && (
        <>
          {/* Título da Avaliação */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-6 mb-0">
            <h1 className="text-2xl font-bold">{avaliacaoAtual.nome}</h1>
          </div>

          {/* Informações do Avaliado */}
          <div className="bg-white border-x border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Avaliado</p>
                    <p className="font-semibold text-gray-900">{avaliado.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Função</p>
                    <p className="font-semibold text-gray-900">{cargoAvaliado?.nome || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Departamento</p>
                    <p className="font-semibold text-gray-900">{equipeAvaliado?.nome || avaliado.setor || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="ml-6">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
                  <User className="w-12 h-12 text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Avaliação */}
          <div className="bg-white border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                      TIPO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                      QUESTÃO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                      AVALIAÇÃO
                    </th>
                    {isAvaliacao180 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                        AVALIAÇÃO SUBORDINADO
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                      CONSIDERAÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {competenciasAgrupadas.map((item, index) => {
                    const competencia = item.competencia;
                    const resposta = getRespostaCompetencia(competencia.id);
                    const respostaAuto = isAvaliacao180 ? getRespostaAutoAvaliacao(competencia.id) : null;
                    const escalas = getEscalasDisponiveis();
                    const tipoAnterior = index > 0 ? competenciasAgrupadas[index - 1].tipo : null;
                    const mostrarTipo = tipoAnterior !== item.tipo;

                    return (
                      <tr key={competencia.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {mostrarTipo && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.tipo.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{competencia.nome}</p>
                            <p className="text-xs text-gray-500 mt-1">{competencia.pergunta}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={resposta.escala}
                            onChange={(e) => handleRespostaChange(competencia.id, 'escala', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="0">Selecione...</option>
                            {escalas.map((nota) => (
                              <option key={nota.id} value={nota.peso}>
                                {nota.nota}
                              </option>
                            ))}
                          </select>
                        </td>
                        {isAvaliacao180 && (
                          <td className="px-6 py-4">
                            {respostaAuto ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {getNotaPorPeso(respostaAuto.nota)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Aguardando...</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <textarea
                            value={resposta.justificativa}
                            onChange={(e) => handleRespostaChange(competencia.id, 'justificativa', e.target.value)}
                            placeholder="Adicione considerações sobre esta competência..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            rows={2}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Média da Avaliação */}
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Média da Avaliação</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {mediaAvaliacao > 0 ? getNotaPorPeso(Math.round(mediaAvaliacao)) : 'Não calculada'}
                    </p>
                  </div>
                  {isAvaliacao180 && mediaAutoAvaliacao > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Média Subordinado</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {getNotaPorPeso(Math.round(mediaAutoAvaliacao))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={handleSalvarRascunho}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar
            </button>
            <button
              onClick={handleFinalizar}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Send className="w-5 h-5 mr-2" />
              Finalizar
            </button>
          </div>
        </>
      )}

      {(!avaliacaoAtual || !participanteAtual) && !participanteIdFromUrl && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma avaliação selecionada</h3>
          <p className="text-gray-600">
            Selecione uma avaliação e participante para começar.
          </p>
        </div>
      )}
    </div>
  );
};

export default RespostaAvaliacao;
