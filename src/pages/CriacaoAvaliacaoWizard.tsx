import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Target,
  FileText,
  Settings,
  Play,
  Plus,
  X,
  User,
  Building,
  HelpCircle,
  Info,
  UserPlus,
  UserMinus,
  LogOut,
  LogIn,
  MessageSquare,
  Edit3,
  Star,
  TrendingUp,
  UserCheck,
  UserX,
  Filter,
  Search,
  EyeOff,
  Eye,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { EscalaCompetencia } from '../types';

type TipoAvaliacao = 'DESEMPENHO' | 'AVALIACAO_DIRECIONADA' | 'ONBOARDING' | 'OFFBOARDING' | 'FEEDBACK' | 'PESQUISA' | 'CLIMA';

interface FormularioAvaliacaoWizard {
  // Step 1: Basic Info
  tipo: TipoAvaliacao;
  codigo: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  
  // Step 2: Evaluation Settings
  escalaId: string;
  competenciasSelecionadas: string[];
  instrucoes: string;
  
  // Step 3: Participants
  participantesConfig: {
    tipo: 'AUTO_AVALIACAO' | 'AVALIACAO_GESTOR' | 'AVALIACAO_360' | 'AVALIACAO_EQUIPE';
    pessoasSelecionadas: string[];
    incluirAutoAvaliacao: boolean;
    incluirAvaliacaoGestor: boolean;
    incluirAvaliacaoPares: boolean;
    incluirAvaliacaoSubordinados: boolean;
  };
  
  // Step 4: Advanced Settings
  configuracoesAvancadas: {
    permitirAvaliadorVisualizarTodasCompetencias: boolean;
    exigirJustificativaNotasBaixas: boolean;
    notaMinimaJustificativa: number;
    notasJustificativa?: number[];
    permitirAvaliadoComentarios: boolean;
    dataLembrete: string;
    mensagemLembrete: string;
  };
  
  // Campos adicionais para DESEMPENHO
  equipesSelecionadas?: string[];
  tipoAvaliacaoDesempenho?: '90' | '180' | '360';
  tiposCompetenciaSelecionados?: string[]; // IDs dos tipos de competência selecionados (Técnica, Comportamental)
  gestorSelecionadoId?: string; // ID do gestor selecionado
  diasMinimoAdmissao?: number; // Número de dias mínimos de admissão para incluir colaborador

  // Special Workflows Fields
  // OnBoarding specific
  onboardingPeriodo?: '1_PERIODO' | '2_PERIODO';
  onboardingDataAdmissaoInicio?: string;
  onboardingDataAdmissaoFim?: string;
  
  // OffBoarding specific
  offboardingDataDemissaoInicio?: string;
  offboardingDataDemissaoFim?: string;
  
  // Feedback specific
  feedbackAvaliadorId?: string;
  feedbackAvaliadoId?: string;
  feedbackTexto?: string;
  
  // Pesquisa specific
  pesquisaNome?: string;
  pesquisaInstrucoes?: string;
  pesquisaPerguntas?: {
    id: string;
    tipo: 'ABERTA' | 'ESCOLHA_SIMPLES' | 'ESCOLHA_MULTIPLA';
    pergunta: string;
    opcoes?: string[];
    obrigatoria: boolean;
  }[];
  pesquisaFiltros?: {
    setores: string[];
    cargos: string[];
    situacoes: ('ATIVO' | 'DESLIGADO')[];
  };
  
  // Temporary fields for onboarding/offboarding  
  onboardingDataInicio?: string;
  onboardingDataFim?: string;
  offboardingDataInicio?: string;
  offboardingDataFim?: string;
}

const CriacaoAvaliacaoWizard: React.FC = () => {
  const { 
    avaliacoesCiclo, 
    competencias, 
    colaboradores, 
    equipes,
    tiposCompetencia,
    escalasCompetencia,
    cargos,
    addAvaliacao,
    addAvaliacaoParticipante
  } = useDataStore();
  const { usuario } = useAuthStore();

  // Debug inicial do store no Wizard
  console.group('Wizard Store Snapshot - Inicial');
  console.log('hook avaliacoesCiclo length:', (avaliacoesCiclo || []).length);
  try {
    const state = useDataStore.getState();
    console.log('getState avaliacoesCiclo length:', (state.avaliacoesCiclo || []).length);
    console.log('getState keys:', Object.keys(state));
  } catch (e) {
    console.warn('Falha ao acessar useDataStore.getState()', e);
  }
  console.groupEnd();

  useEffect(() => {
    console.group('Wizard Store Snapshot - Effect update');
    console.log('avaliacoesCiclo atualizado length:', (avaliacoesCiclo || []).length);
    console.groupEnd();
  }, [avaliacoesCiclo]);

  // Função auxiliar para verificar se colaborador é elegível baseado na data de admissão
  const colaboradorEhElegivel = (colaborador: any): boolean => {
    const diasMinimo = (formulario as any).diasMinimoAdmissao;
    if (!diasMinimo) return true; // Se não tiver filtro de dias, todos são elegíveis
    
    const hoje = new Date();
    const dataAdmissao = new Date(colaborador.dataAdmissao);
    const diffEmMs = hoje.getTime() - dataAdmissao.getTime();
    const diffEmDias = Math.floor(diffEmMs / (1000 * 60 * 60 * 24));
    
    return diffEmDias >= diasMinimo;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMinhasEquipes, setShowMinhasEquipes] = useState(false);
  const [secaoAtual, setSecaoAtual] = useState<1 | 2>(1); // Controla qual seção do Step 1 está visível
  const [gestorExpandido, setGestorExpandido] = useState<string | null>(null); // Estado para gestor expandido na seleção de participantes
  const [filtroEquipes, setFiltroEquipes] = useState(''); // Filtro de busca para equipes
  const [participantesAutoSelecionados, setParticipantesAutoSelecionados] = useState(false); // Controla se os participantes já foram auto-selecionados
  
  const [formulario, setFormulario] = useState<FormularioAvaliacaoWizard>({
    tipo: 'DESEMPENHO',
    codigo: '',
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    escalaId: '',
    competenciasSelecionadas: [],
    instrucoes: '',
    participantesConfig: {
      tipo: 'AVALIACAO_360',
      pessoasSelecionadas: [],
      incluirAutoAvaliacao: true,
      incluirAvaliacaoGestor: true,
      incluirAvaliacaoPares: true,
      incluirAvaliacaoSubordinados: false
    },
    configuracoesAvancadas: {
      permitirAvaliadorVisualizarTodasCompetencias: true,
      exigirJustificativaNotasBaixas: false,
      notaMinimaJustificativa: 3,
      notasJustificativa: [],
      permitirAvaliadoComentarios: true,
      dataLembrete: '',
      mensagemLembrete: 'Lembre-se de completar sua avaliação'
    },
    equipesSelecionadas: [],
    tipoAvaliacaoDesempenho: undefined,
    tiposCompetenciaSelecionados: [], // Será inicializado com Técnica e Comportamental por padrão
    // Initialize special workflow fields
    onboardingPeriodo: '1_PERIODO',
    onboardingDataAdmissaoInicio: '',
    onboardingDataAdmissaoFim: '',
    offboardingDataDemissaoInicio: '',
    offboardingDataDemissaoFim: '',
    feedbackAvaliadorId: '',
    feedbackAvaliadoId: '',
    feedbackTexto: '',
    pesquisaPerguntas: [],
    pesquisaFiltros: {
      setores: [],
      cargos: [],
      situacoes: ['ATIVO']
    }
  });

  // Auto-selecionar colaboradores elegíveis quando entrar no step 3 (Participantes) para DESEMPENHO
  useEffect(() => {
    if (currentStep === 3 && formulario.tipo === 'DESEMPENHO' && !participantesAutoSelecionados) {
      // Obter gestores das equipes selecionadas
      const equipesSelecionadas = (formulario as any).equipesSelecionadas || [];
      const gestoresEquipes = equipesSelecionadas.flatMap((equipeId: string) => {
        const equipe = (equipes || []).find(e => e.id === equipeId);
        if (!equipe) return [];
        const gestor = (colaboradores || []).find(c => c.id === equipe.gestorId && c.situacao === 'ATIVO');
        return gestor ? [{ gestor, equipe }] : [];
      });
      
      // Remover duplicatas
      const gestoresUnicos = gestoresEquipes.filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((g: any) => g.gestor.id === item.gestor.id)
      );

      const todosColaboradoresElegiveis = gestoresUnicos.flatMap((item: any) => {
        const { gestor } = item;
        return (colaboradores || [])
          .filter(c => c.gestorId === gestor.id && c.situacao === 'ATIVO' && colaboradorEhElegivel(c))
          .map(c => c.id);
      });

      if (todosColaboradoresElegiveis.length > 0) {
        setFormulario(prev => ({
          ...prev,
          participantesConfig: {
            ...prev.participantesConfig,
            pessoasSelecionadas: todosColaboradoresElegiveis
          }
        }));
        setParticipantesAutoSelecionados(true);
      }
    }
  }, [currentStep, formulario.tipo, participantesAutoSelecionados, equipes, colaboradores, formulario]);

  const tiposAvaliacao = [
    {
      tipo: 'DESEMPENHO' as TipoAvaliacao,
      nome: 'Avaliação de Desempenho',
      descricao: 'Avaliação completa do desempenho do colaborador',
      icon: Target,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      escalasRecomendadas: ['escala-001', 'escala-002']
    },
    {
      tipo: 'AVALIACAO_DIRECIONADA' as TipoAvaliacao,
      nome: 'Avaliação Direcionada',
      descricao: 'Avaliação focada em aspectos específicos',
      icon: FileText,
      color: 'bg-green-50 border-green-200 text-green-700',
      escalasRecomendadas: ['escala-003', 'escala-004']
    },
    {
      tipo: 'ONBOARDING' as TipoAvaliacao,
      nome: 'Onboarding',
      descricao: 'Avaliação de integração de novos colaboradores',
      icon: Users,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      escalasRecomendadas: ['escala-005']
    },
    {
      tipo: 'OFFBOARDING' as TipoAvaliacao,
      nome: 'Offboarding',
      descricao: 'Avaliação de desligamento de colaboradores',
      icon: AlertCircle,
      color: 'bg-red-50 border-red-200 text-red-700',
      escalasRecomendadas: ['escala-006']
    },
    {
      tipo: 'FEEDBACK' as TipoAvaliacao,
      nome: 'Feedback',
      descricao: 'Avaliação de feedback contínuo',
      icon: CheckCircle,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      escalasRecomendadas: ['escala-007']
    },
    {
      tipo: 'PESQUISA' as TipoAvaliacao,
      nome: 'Pesquisa',
      descricao: 'Pesquisa de clima ou satisfação',
      icon: FileText,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      escalasRecomendadas: ['escala-008']
    }
  ];

  // Dynamic steps based on evaluation type
  const getSteps = () => {
    const baseSteps = [
      { number: 1, title: 'Tipo e Informações Básicas', icon: Target }
    ];
    
    // Special workflows have different step flows
    if (formulario.tipo === 'FEEDBACK') {
      return [
        ...baseSteps,
        { number: 2, title: 'Confirmação', icon: CheckCircle }
      ];
    }
    
    if (formulario.tipo === 'DESEMPENHO') {
      return [
        ...baseSteps,
        { number: 2, title: 'Seleção dos Avaliados', icon: Users },
        { number: 3, title: 'Participantes', icon: Users },
        { number: 4, title: 'Configurações Avançadas', icon: Settings },
        { number: 5, title: 'Revisão e Confirmação', icon: CheckCircle }
      ];
    }
    
    if (formulario.tipo === 'PESQUISA') {
      return [
        ...baseSteps,
        { number: 2, title: 'Seleção de Participantes', icon: Users },
        { number: 3, title: 'Configurações Avançadas', icon: Settings },
        { number: 4, title: 'Revisão e Confirmação', icon: CheckCircle }
      ];
    }
    
    // Standard workflow for other types
    return [
      ...baseSteps,
      { number: 2, title: 'Configuração da Avaliação', icon: Settings },
      { number: 3, title: 'Participantes', icon: Users },
      { number: 4, title: 'Configurações Avançadas', icon: FileText },
      { number: 5, title: 'Revisão e Confirmação', icon: CheckCircle }
    ];
  };
  
  const steps = getSteps();

  const handleTipoChange = (tipo: TipoAvaliacao) => {
    setFormulario(prev => ({ ...prev, tipo }));
  };

  const validateSecao1 = (): boolean => {
    // Apenas verifica se um tipo foi selecionado
    // As configurações específicas serão validadas nas etapas seguintes
    if (!formulario.tipo) {
      toast.error('Selecione um tipo de avaliação');
      return false;
    }
    return true;
  };

  const handleAvancarParaSecao2 = () => {
    if (validateSecao1()) {
      setSecaoAtual(2);
    }
  };

  const handleVoltarParaSecao1 = () => {
    setSecaoAtual(1);
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
      participantesConfig: {
        ...prev.participantesConfig,
        pessoasSelecionadas: prev.participantesConfig.pessoasSelecionadas.includes(pessoaId)
          ? prev.participantesConfig.pessoasSelecionadas.filter(id => id !== pessoaId)
          : [...prev.participantesConfig.pessoasSelecionadas, pessoaId]
      }
    }));
  };

  const handleAdicionarPergunta = () => {
    setFormulario(prev => ({
      ...prev,
      pesquisaPerguntas: [
        ...(prev.pesquisaPerguntas || []),
        {
          id: `pergunta-${Date.now()}`,
          tipo: 'ABERTA',
          pergunta: '',
          obrigatoria: false
        }
      ]
    }));
  };

  const handleRemoverPergunta = (index: number) => {
    setFormulario(prev => ({
      ...prev,
      pesquisaPerguntas: (prev.pesquisaPerguntas || []).filter((_, i) => i !== index)
    }));
  };

  const handlePerguntaChange = (index: number, field: string, value: any) => {
    setFormulario(prev => ({
      ...prev,
      pesquisaPerguntas: (prev.pesquisaPerguntas || []).map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleAdicionarOpcao = (perguntaIndex: number) => {
    setFormulario(prev => ({
      ...prev,
      pesquisaPerguntas: (prev.pesquisaPerguntas || []).map((p, i) => 
        i === perguntaIndex 
          ? { ...p, opcoes: [...(p.opcoes || []), ''] }
          : p
      )
    }));
  };

  const handleRemoverOpcao = (perguntaIndex: number, opcaoIndex: number) => {
    setFormulario(prev => ({
      ...prev,
      pesquisaPerguntas: (prev.pesquisaPerguntas || []).map((p, i) => 
        i === perguntaIndex 
          ? { ...p, opcoes: (p.opcoes || []).filter((_, oi) => oi !== opcaoIndex) }
          : p
      )
    }));
  };

  const handleOpcaoChange = (perguntaIndex: number, opcaoIndex: number, value: string) => {
    setFormulario(prev => ({
      ...prev,
      pesquisaPerguntas: (prev.pesquisaPerguntas || []).map((p, i) => 
        i === perguntaIndex 
          ? { ...p, opcoes: (p.opcoes || []).map((o, oi) => oi === opcaoIndex ? value : o) }
          : p
      )
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Special validation for different evaluation types
        if (formulario.tipo === 'ONBOARDING') {
          if (!formulario.onboardingDataAdmissaoInicio || !formulario.onboardingDataAdmissaoFim || !formulario.codigo) {
            toast.error('Preencha código e datas de admissão');
            return false;
          }
          
          const dataInicio = new Date(formulario.onboardingDataAdmissaoInicio);
          const dataFim = new Date(formulario.onboardingDataAdmissaoFim);
          
          if (dataFim <= dataInicio) {
            toast.error('Data de fim deve ser posterior à data de início');
            return false;
          }
          
          // Check if there are employees in the date range
          const colaboradoresNoPeriodo = getColaboradoresPorDataAdmissao(formulario.onboardingDataAdmissaoInicio, formulario.onboardingDataAdmissaoFim);
          if (colaboradoresNoPeriodo.length === 0) {
            toast.error('Nenhum colaborador encontrado no período de admissão selecionado');
            return false;
          }
        }
        
        if (formulario.tipo === 'OFFBOARDING') {
          if (!formulario.offboardingDataDemissaoInicio || !formulario.offboardingDataDemissaoFim || !formulario.codigo) {
            toast.error('Preencha código e datas de demissão');
            return false;
          }
          
          const dataInicio = new Date(formulario.offboardingDataDemissaoInicio);
          const dataFim = new Date(formulario.offboardingDataDemissaoFim);
          
          if (dataFim <= dataInicio) {
            toast.error('Data de fim deve ser posterior à data de início');
            return false;
          }
          
          // Check if there are employees in the date range
          const colaboradoresNoPeriodo = getColaboradoresPorDataDemissao(formulario.offboardingDataDemissaoInicio, formulario.offboardingDataDemissaoFim);
          if (colaboradoresNoPeriodo.length === 0) {
            toast.error('Nenhum colaborador encontrado no período de demissão selecionado');
            return false;
          }
        }
        
        if (formulario.tipo === 'FEEDBACK') {
          if (!formulario.feedbackAvaliadorId || !formulario.feedbackAvaliadoId || !formulario.codigo) {
            toast.error('Preencha código e selecione o avaliador e o colaborador a ser avaliado');
            return false;
          }
        }
        
        if (formulario.tipo === 'PESQUISA') {
          if (!formulario.codigo || !formulario.nome || !formulario.dataInicio || !formulario.dataFim) {
            toast.error('Preencha código, nome e datas da pesquisa');
            return false;
          }
          
          if (formulario.pesquisaPerguntas?.length === 0) {
            toast.error('Adicione pelo menos uma pergunta à pesquisa');
            return false;
          }
        }
        
        // Validation for DESEMPENHO - requires manager selection
        if (formulario.tipo === 'DESEMPENHO') {
          if (!formulario.codigo || !formulario.nome || !formulario.dataInicio) {
            toast.error('Preencha código, nome e data de início');
            return false;
          }
        }
        
        // General validation for other types
        if (formulario.tipo === 'AVALIACAO_DIRECIONADA') {
          if (!formulario.codigo || !formulario.nome || !formulario.dataInicio) {
            toast.error('Preencha código, nome e data de início');
            return false;
          }
        }
        
        // Validate dates only if both are filled
        if (formulario.dataInicio && formulario.dataFim) {
          const dataInicio = new Date(formulario.dataInicio);
          const dataFim = new Date(formulario.dataFim);
          
          if (dataFim <= dataInicio) {
            toast.error('Data de fim deve ser posterior à data de início');
            return false;
          }
        }
        return true;
        
      case 2:
        // Validação específica para DESEMPENHO
        if (formulario.tipo === 'DESEMPENHO') {
          if (!(formulario as any).tipoAvaliacaoDesempenho) {
            toast.error('Selecione o tipo de avaliação (90°, 180° ou 360°)');
            return false;
          }
          // Validação de equipes será feita no step 3 (participantes)
        }
        if (!formulario.escalaId) {
          toast.error('Selecione uma escala de avaliação');
          return false;
        }
        
        // Validar se a escala selecionada é compatível com o tipo de avaliação
        const escalaSelecionada = (escalasCompetencia || []).find(e => e.id === formulario.escalaId);
        if (escalaSelecionada) {
          const tipoEscalaEsperado = formulario.tipo === 'DESEMPENHO' ? 'AVALIACAO_DESEMPENHO' :
                                    formulario.tipo === 'AVALIACAO_DIRECIONADA' ? 'AVALIACAO_DIRECIONADA' :
                                    formulario.tipo === 'ONBOARDING' ? 'ONBOARDING' :
                                    formulario.tipo === 'OFFBOARDING' ? 'OFFBOARDING' :
                                    formulario.tipo === 'FEEDBACK' ? 'FEEDBACK' :
                                    formulario.tipo === 'PESQUISA' ? 'PESQUISA' : undefined;
          
          if (tipoEscalaEsperado && escalaSelecionada.tipo !== tipoEscalaEsperado) {
            toast.error(`A escala selecionada não é compatível com o tipo de avaliação ${formulario.tipo}`);
            return false;
          }
          
          if (!escalaSelecionada.ativa) {
            toast.error('A escala selecionada está inativa');
            return false;
          }
        }
        if (formulario.competenciasSelecionadas.length === 0) {
          toast.error('Selecione pelo menos uma competência');
          return false;
        }
        return true;
        
      case 3:
        if (formulario.participantesConfig.pessoasSelecionadas.length === 0) {
          toast.error('Selecione pelo menos um participante');
          return false;
        }
        return true;
      
      case 4:
        // Validações opcionais para configurações avançadas
        // Não há campos obrigatórios neste step
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    // Se estiver no Step 1 e na seção 1, avança para seção 2
    if (currentStep === 1 && secaoAtual === 1) {
      handleAvancarParaSecao2();
      return;
    }
    
    // Se estiver no Step 1 e na seção 2, valida e avança para Step 2
    if (currentStep === 1 && secaoAtual === 2) {
      if (validateStep(currentStep)) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
        setSecaoAtual(1); // Reset para seção 1 quando mudar de step
      }
      return;
    }
    
    // Para outros steps, comportamento normal
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    // Se estiver no Step 1 e na seção 2, volta para seção 1
    if (currentStep === 1 && secaoAtual === 2) {
      handleVoltarParaSecao1();
      return;
    }
    
    // Se estiver em outro step, volta para o step anterior
    if (currentStep > 1) {
      setCurrentStep(prev => Math.max(prev - 1, 1));
      setSecaoAtual(2); // Ao voltar para Step 1, mostra seção 2
      
      // Resetar o estado de auto-seleção quando voltar do step 3
      if (currentStep === 3) {
        setParticipantesAutoSelecionados(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let novaAvaliacao: any;
      
      // Handle special workflows
      if (formulario.tipo === 'ONBOARDING') {
        // Auto-generate name and select participants
        const nomeAutomatico = gerarNomeAvaliacaoAutomatico('ONBOARDING', formulario.onboardingDataAdmissaoInicio!, formulario.onboardingDataAdmissaoFim!);
        const colaboradoresNoPeriodo = getColaboradoresPorDataAdmissao(formulario.onboardingDataAdmissaoInicio!, formulario.onboardingDataAdmissaoFim!);
        const competenciasOnboarding = getCompetenciasPorTipoEspecial('ONBOARDING');
        
        novaAvaliacao = {
          nome: nomeAutomatico,
          descricao: formulario.descricao || `Avaliação de OnBoarding para colaboradores admitidos entre ${formulario.onboardingDataAdmissaoInicio} e ${formulario.onboardingDataAdmissaoFim}`,
          tipo: 'ONBOARDING',
          tipoAvaliacao: '360' as const,
          dataInicio: formulario.dataInicio,
          dataLimite: formulario.dataFim,
          dataFim: formulario.dataFim,
          status: 'CRIADA' as const,
          incluiTecnica: false,
          incluiComportamental: true,
          escalaId: formulario.escalaId,
          competenciasSelecionadas: competenciasOnboarding.map(c => c.id),
          instrucoes: formulario.instrucoes || 'Esta é uma avaliação de OnBoarding para novos colaboradores.',
          notasJustificativa: formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas 
            ? (formulario.configuracoesAvancadas.notasJustificativa || [])
            : undefined,
          empresaId: 'emp-001'
        };
        
        // Auto-add participants
        colaboradoresNoPeriodo.forEach(colaborador => {
          // Add logic to create participants for each new employee
        });
        
      } else if (formulario.tipo === 'OFFBOARDING') {
        // Auto-generate name and select participants
        const nomeAutomatico = gerarNomeAvaliacaoAutomatico('OFFBOARDING', formulario.offboardingDataDemissaoInicio!, formulario.offboardingDataDemissaoFim!);
        const colaboradoresNoPeriodo = getColaboradoresPorDataDemissao(formulario.offboardingDataDemissaoInicio!, formulario.offboardingDataDemissaoFim!);
        const competenciasOffboarding = getCompetenciasPorTipoEspecial('OFFBOARDING');
        
        novaAvaliacao = {
          nome: nomeAutomatico,
          descricao: formulario.descricao || `Avaliação de OffBoarding para colaboradores desligados entre ${formulario.offboardingDataDemissaoInicio} e ${formulario.offboardingDataDemissaoFim}`,
          tipo: 'OFFBOARDING',
          tipoAvaliacao: '360' as const,
          dataInicio: formulario.dataInicio,
          dataLimite: formulario.dataFim,
          dataFim: formulario.dataFim,
          status: 'CRIADA' as const,
          incluiTecnica: false,
          incluiComportamental: true,
          escalaId: formulario.escalaId,
          competenciasSelecionadas: competenciasOffboarding.map(c => c.id),
          instrucoes: formulario.instrucoes || 'Esta é uma avaliação de OffBoarding para colaboradores desligados.',
          notasJustificativa: formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas 
            ? (formulario.configuracoesAvancadas.notasJustificativa || [])
            : undefined,
          empresaId: 'emp-001'
        };
        
      } else if (formulario.tipo === 'FEEDBACK') {
        // Simplified feedback evaluation
        novaAvaliacao = {
          nome: formulario.nome || `Feedback de ${(colaboradores || []).find(c => c.id === formulario.feedbackAvaliadorId)?.nome} para ${(colaboradores || []).find(c => c.id === formulario.feedbackAvaliadoId)?.nome}`,
          descricao: formulario.descricao || 'Avaliação de feedback entre gestor e colaborador',
          tipo: 'FEEDBACK',
          tipoAvaliacao: '90' as const,
          dataInicio: formulario.dataInicio,
          dataLimite: formulario.dataFim,
          dataFim: formulario.dataFim,
          status: 'CRIADA' as const,
          incluiTecnica: false,
          incluiComportamental: false,
          escalaId: formulario.escalaId,
          competenciasSelecionadas: [], // No competencies for feedback
          instrucoes: formulario.instrucoes || 'Forneça feedback construtivo sobre o desempenho do colaborador.',
          notasJustificativa: formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas 
            ? (formulario.configuracoesAvancadas.notasJustificativa || [])
            : undefined,
          empresaId: 'emp-001'
        };
        
      } else if (formulario.tipo === 'PESQUISA') {
        // Survey evaluation with custom questions
        novaAvaliacao = {
          nome: formulario.nome,
          descricao: formulario.descricao || 'Pesquisa com perguntas personalizadas',
          tipo: 'PESQUISA',
          tipoAvaliacao: '360' as const,
          dataInicio: formulario.dataInicio,
          dataLimite: formulario.dataFim,
          dataFim: formulario.dataFim,
          status: 'CRIADA' as const,
          incluiTecnica: false,
          incluiComportamental: false,
          escalaId: formulario.escalaId,
          competenciasSelecionadas: [], // No competencies for surveys
          instrucoes: formulario.instrucoes || 'Responda às perguntas da pesquisa com sinceridade.',
          notasJustificativa: formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas 
            ? (formulario.configuracoesAvancadas.notasJustificativa || [])
            : undefined,
          empresaId: 'emp-001'
        };
        
      } else {
        // Standard evaluation (DESEMPENHO ou AVALIACAO_DIRECIONADA)
        const tipoAvaliacao = (formulario as any).tipoAvaliacaoDesempenho || '90';
        
        // Determinar incluiTecnica e incluiComportamental baseado nos tipos selecionados
        const tiposSelecionados = formulario.tiposCompetenciaSelecionados || [];
        const temTecnica = tiposSelecionados.some(id => {
          const tipo = (tiposCompetencia || []).find(t => t.id === id);
          return tipo?.nome === 'Técnica';
        });
        const temComportamental = tiposSelecionados.some(id => {
          const tipo = (tiposCompetencia || []).find(t => t.id === id);
          return tipo?.nome === 'Comportamental';
        });
        
        novaAvaliacao = {
          nome: formulario.nome,
          descricao: formulario.descricao,
          tipo: formulario.tipo,
          tipoAvaliacao: tipoAvaliacao as "90" | "180" | "360",
          dataInicio: formulario.dataInicio,
          dataLimite: formulario.dataFim || formulario.dataInicio,
          dataFim: formulario.dataFim || formulario.dataInicio,
          status: 'CRIADA' as const,
          incluiTecnica: temTecnica,
          incluiComportamental: temComportamental,
          escalaId: formulario.escalaId,
          competenciasSelecionadas: formulario.competenciasSelecionadas,
          instrucoes: formulario.instrucoes,
          notasJustificativa: formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas 
            ? (formulario.configuracoesAvancadas.notasJustificativa || [])
            : undefined,
          empresaId: 'emp-001'
        };
      }

      // Criar a avaliação
      addAvaliacao(novaAvaliacao);
      
      // Buscar a avaliação recém-criada (última do array após adicionar)
      const avaliacoesAtualizadas = useDataStore.getState().avaliacoesCiclo;
      const avaliacaoCriada = avaliacoesAtualizadas[avaliacoesAtualizadas.length - 1];
      
      // Criar participantes automaticamente para DESEMPENHO
      if (formulario.tipo === 'DESEMPENHO' && avaliacaoCriada && formulario.participantesConfig.pessoasSelecionadas.length > 0) {
        const tipoAvaliacao = (formulario as any).tipoAvaliacaoDesempenho || '90';
        
        // Determinar avaliadores baseado no tipo de avaliação
        formulario.participantesConfig.pessoasSelecionadas.forEach((avaliadoId: string) => {
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
            // Autoavaliação
            addAvaliacaoParticipante({
              avaliacaoCicloId: avaliacaoCriada.id,
              avaliadorId: avaliadoId,
              avaliadoId: avaliadoId,
              status: 'PENDENTE'
            });
          }
          
          // Para 360°: gestor + autoavaliação + pares + subordinados (se aplicável)
          if (tipoAvaliacao === '360') {
            // Gestor
            if (avaliado.gestorId && formulario.participantesConfig.incluirAvaliacaoGestor) {
              addAvaliacaoParticipante({
                avaliacaoCicloId: avaliacaoCriada.id,
                avaliadorId: avaliado.gestorId,
                avaliadoId: avaliadoId,
                status: 'PENDENTE'
              });
            }
            
            // Autoavaliação
            if (formulario.participantesConfig.incluirAutoAvaliacao) {
              addAvaliacaoParticipante({
                avaliacaoCicloId: avaliacaoCriada.id,
                avaliadorId: avaliadoId,
                avaliadoId: avaliadoId,
                status: 'PENDENTE'
              });
            }
            
            // Pares (mesma equipe, mesmo gestor, mas não o próprio)
            if (formulario.participantesConfig.incluirAvaliacaoPares) {
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
            
            // Subordinados (se o avaliado for gestor)
            if (formulario.participantesConfig.incluirAvaliacaoSubordinados && avaliado.isGestor) {
              const subordinados = (colaboradores || []).filter(c => 
                c.gestorId === avaliadoId &&
                c.situacao === 'ATIVO'
              );
              subordinados.forEach(sub => {
                addAvaliacaoParticipante({
                  avaliacaoCicloId: avaliacaoCriada.id,
                  avaliadorId: sub.id,
                  avaliadoId: avaliadoId,
                  status: 'PENDENTE'
                });
              });
            }
          }
        });
      }
      
      toast.success('Avaliação criada com sucesso!');
      
      // Reset form and go to first step
      setCurrentStep(1);
      setSecaoAtual(1); // Reset para primeira seção
      setFormulario({
        tipo: 'DESEMPENHO',
        codigo: '',
        nome: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
        escalaId: '',
        competenciasSelecionadas: [],
        instrucoes: '',
        onboardingPeriodo: undefined,
        onboardingDataAdmissaoInicio: undefined,
        onboardingDataAdmissaoFim: undefined,
        offboardingDataDemissaoInicio: undefined,
        offboardingDataDemissaoFim: undefined,
        feedbackAvaliadorId: undefined,
        feedbackAvaliadoId: undefined,
        feedbackTexto: undefined,
        pesquisaPerguntas: [],
        pesquisaFiltros: undefined,
        participantesConfig: {
          tipo: 'AVALIACAO_360',
          pessoasSelecionadas: [],
          incluirAutoAvaliacao: true,
          incluirAvaliacaoGestor: true,
          incluirAvaliacaoPares: true,
          incluirAvaliacaoSubordinados: false
        },
        configuracoesAvancadas: {
          permitirAvaliadorVisualizarTodasCompetencias: true,
          exigirJustificativaNotasBaixas: true,
          notaMinimaJustificativa: 3,
          permitirAvaliadoComentarios: true,
          dataLembrete: '',
          mensagemLembrete: 'Lembre-se de completar sua avaliação'
        }
      });
      
    } catch (error) {
      toast.error('Erro ao criar avaliação');
    } finally {
      setIsSubmitting(false);
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

  const getPessoasDisponiveis = () => {
    const tipo = formulario.participantesConfig.tipo;
    
    // For DESEMPENHO evaluation, filter by selected manager
    if (formulario.tipo === 'DESEMPENHO' && (formulario as any).gestorSelecionadoId) {
      const gestorId = (formulario as any).gestorSelecionadoId;
      let lista = getGestorEquipe(gestorId);
      
      // Aplicar filtro de dias mínimos de admissão
      const diasMinimo = (formulario as any).diasMinimoAdmissao;
      if (diasMinimo && diasMinimo > 0) {
        const hoje = new Date();
        lista = lista.filter(colaborador => {
          if (!colaborador.dataAdmissao) return true; // Incluir se não tem data de admissão
          const dataAdmissao = new Date(colaborador.dataAdmissao);
          const diffTime = hoje.getTime() - dataAdmissao.getTime();
          const diffDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return diffDias >= diasMinimo;
        });
      }
      
      return lista;
    }
    
    if (formulario.tipo === 'PESQUISA') {
      const filtros = formulario.pesquisaFiltros || { setores: [], cargos: [], situacoes: ['ATIVO'] };
      let lista = (colaboradores || []);
      if (filtros.situacoes && filtros.situacoes.length > 0) {
        lista = lista.filter(c => filtros.situacoes!.includes(c.situacao));
      }
      if (filtros.setores && filtros.setores.length > 0) {
        lista = lista.filter(c => filtros.setores!.includes(c.setor));
      }
      if (filtros.cargos && filtros.cargos.length > 0) {
        lista = lista.filter(c => filtros.cargos!.includes(c.cargoId));
      }
      return lista;
    }
    switch (tipo) {
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

  const getEscalasRecomendadas = () => {
    // Filter scales based on evaluation type
    let tipoEscala: EscalaCompetencia['tipo'] | undefined;
    
    switch (formulario.tipo) {
      case 'DESEMPENHO':
        tipoEscala = 'AVALIACAO_DESEMPENHO';
        break;
      case 'AVALIACAO_DIRECIONADA':
        tipoEscala = 'AVALIACAO_DIRECIONADA';
        break;
      case 'ONBOARDING':
        tipoEscala = 'ONBOARDING';
        break;
      case 'OFFBOARDING':
        tipoEscala = 'OFFBOARDING';
        break;
      case 'FEEDBACK':
        tipoEscala = 'FEEDBACK';
        break;
      case 'PESQUISA':
        tipoEscala = 'PESQUISA';
        break;
      default:
        break;
    }
    
    // Return only scales that match the evaluation type and are active
    // Sort to show default scales first (all marked as default will appear first)
    return (escalasCompetencia || [])
      .filter(escala => escala.tipo === tipoEscala && escala.ativa)
      .sort((a, b) => {
        // Escalas padrão sempre primeiro
        if (a.padrao && !b.padrao) return -1;
        if (!a.padrao && b.padrao) return 1;
        // Se ambas forem ou não forem padrão, ordenar por nome
        return a.nome.localeCompare(b.nome);
      });
  };

  // Selecionar escala padrão automaticamente quando tipo mudar
  useEffect(() => {
    if (formulario.tipo && escalasCompetencia && escalasCompetencia.length > 0 && !formulario.escalaId) {
      const escalasRecomendadas = getEscalasRecomendadas();
      if (escalasRecomendadas.length > 0) {
        // Buscar escala marcada como padrão
        const escalaPadrao = escalasRecomendadas.find(e => e.padrao === true);
        // Se não encontrar uma escala padrão, usar a primeira disponível
        const escalaDefault = escalaPadrao || escalasRecomendadas[0];
        if (escalaDefault) {
          setFormulario(prev => ({ ...prev, escalaId: escalaDefault.id }));
        }
      }
    }
  }, [formulario.tipo, escalasCompetencia]);

  // Role-based access control
  const podeCriarTipoAvaliacao = (tipo: TipoAvaliacao): boolean => {
    if (!usuario) return false;
    
    // Admin can create all types
    if (usuario.perfil === 'ADMIN') return true;
    
    // Gestor restrictions
    if (usuario.perfil === 'GESTOR') {
      const restricoesGestor = ['DESEMPENHO', 'ONBOARDING', 'OFFBOARDING'];
      return !restricoesGestor.includes(tipo);
    }
    
    // Colaborador cannot create any evaluations
    return false;
  };

  // Filter available evaluation types based on user role
  const tiposAvaliacaoDisponiveis = tiposAvaliacao.filter(tipo => podeCriarTipoAvaliacao(tipo.tipo));

  // Helper functions for special workflows
  const getColaboradoresPorDataAdmissao = (dataInicio: string, dataFim: string) => {
    return (colaboradores || []).filter(colaborador => {
      if (colaborador.situacao !== 'ATIVO') return false;
      const dataAdmissao = new Date(colaborador.dataAdmissao);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      return dataAdmissao >= inicio && dataAdmissao <= fim;
    });
  };

  const getColaboradoresPorDataDemissao = (dataInicio: string, dataFim: string) => {
    return (colaboradores || []).filter(colaborador => {
      if (colaborador.situacao !== 'DESLIGADO' || !colaborador.dataDemissao) return false;
      const dataDemissao = new Date(colaborador.dataDemissao);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      return dataDemissao >= inicio && dataDemissao <= fim;
    });
  };

  const getCompetenciasPorTipoEspecial = (tipo: 'ONBOARDING' | 'OFFBOARDING') => {
    return (competencias || []).filter(comp => {
      const tipoComp = tiposCompetencia?.find(t => t.id === comp.tipoCompetenciaId);
      if (!tipoComp || !tipoComp.destinos || tipoComp.destinos.length === 0) {
        return false;
      }
      // Verificar se o tipo de avaliação está nos destinos permitidos
      return tipoComp.destinos.includes(tipo);
    });
  };

  const getSetoresDisponiveis = () => {
    const setores = new Set((colaboradores || []).map(c => c.setor).filter(Boolean));
    return Array.from(setores).sort();
  };

  const getGestorEquipe = (gestorId: string) => {
    return (colaboradores || []).filter(c => c.gestorId === gestorId && c.situacao === 'ATIVO');
  };

  // Auto-generate evaluation name for special types
  const gerarNomeAvaliacaoAutomatico = (tipo: TipoAvaliacao, inicio?: string, fim?: string) => {
    const format = (d?: string) => (d ? new Date(d).toLocaleDateString() : '');
    if (tipo === 'ONBOARDING') {
      const i = inicio || formulario.onboardingDataAdmissaoInicio;
      const f = fim || formulario.onboardingDataAdmissaoFim;
      if (i && f) return `Avaliação OnBoarding de ${format(i)} a ${format(f)}`;
    }
    if (tipo === 'OFFBOARDING') {
      const i = inicio || formulario.offboardingDataDemissaoInicio;
      const f = fim || formulario.offboardingDataDemissaoFim;
      if (i && f) return `Avaliação OffBoarding de ${format(i)} a ${format(f)}`;
    }
    return formulario.nome;
  };

  // Inicializar tipos de competência com Técnica e Comportamental por padrão para DESEMPENHO
  useEffect(() => {
    if (formulario.tipo === 'DESEMPENHO' && currentStep === 2) {
      if (!formulario.tiposCompetenciaSelecionados || formulario.tiposCompetenciaSelecionados.length === 0) {
        const tiposTecnicaComportamental = (tiposCompetencia || [])
          .filter(t => t.nome === 'Técnica' || t.nome === 'Comportamental')
          .map(t => t.id);
        if (tiposTecnicaComportamental.length > 0) {
          setFormulario(prev => ({
            ...prev,
            tiposCompetenciaSelecionados: tiposTecnicaComportamental
          }));
        }
      }
    }
  }, [currentStep, formulario.tipo]);

  // Filtrar competências pelos tipos selecionados para DESEMPENHO e por destino do tipo de competência
  const getCompetenciasAgrupadas = () => {
    // Primeiro, filtrar competências pelo destino (tipo de avaliação)
    const competenciasFiltradasPorDestino = (competencias || []).filter(comp => {
      const tipoComp = (tiposCompetencia || []).find(t => t.id === comp.tipoCompetenciaId);
      if (!tipoComp || !tipoComp.destinos || tipoComp.destinos.length === 0) {
        return false; // Se não tem destino definido, não mostrar
      }
      // Verificar se o tipo de avaliação atual está nos destinos permitidos
      return tipoComp.destinos.includes(formulario.tipo);
    });

    // Para DESEMPENHO, também filtrar pelos tipos de competência selecionados
    if (formulario.tipo === 'DESEMPENHO' && formulario.tiposCompetenciaSelecionados && formulario.tiposCompetenciaSelecionados.length > 0) {
      const competenciasFiltradas = competenciasFiltradasPorDestino.filter(comp => 
        formulario.tiposCompetenciaSelecionados!.includes(comp.tipoCompetenciaId)
      );
      return competenciasFiltradas.reduce((acc, comp) => {
        const tipo = (tiposCompetencia || []).find(t => t.id === comp.tipoCompetenciaId);
        const tipoNome = tipo?.nome || 'Outros';
        if (!acc[tipoNome]) {
          acc[tipoNome] = [];
        }
        acc[tipoNome].push(comp);
        return acc;
      }, {} as Record<string, typeof competencias>);
    }
    
    // Para outros tipos de avaliação, agrupar por tipo de competência
    return competenciasFiltradasPorDestino.reduce((acc, comp) => {
      const tipo = (tiposCompetencia || []).find(t => t.id === comp.tipoCompetenciaId);
      const tipoNome = tipo?.nome || 'Outros';
      if (!acc[tipoNome]) {
        acc[tipoNome] = [];
      }
      acc[tipoNome].push(comp);
      return acc;
    }, {} as Record<string, typeof competencias>);
  };

  const competenciasAgrupadas = getCompetenciasAgrupadas();
  const pessoasDisponiveis = getPessoasDisponiveis();
  const escalasRecomendadas = getEscalasRecomendadas();
  const setoresDisponiveis = getSetoresDisponiveis();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* SEÇÃO 1: ESCOLHA DO TIPO E CONFIGURAÇÕES ESPECÍFICAS */}
            {secaoAtual === 1 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Escolha o Tipo de Avaliação</h2>
                  <p className="text-sm text-gray-600">Selecione o tipo de avaliação que deseja criar</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Avaliação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiposAvaliacaoDisponiveis.map((tipo) => {
                      const Icon = tipo.icon;
                      const isSelected = formulario.tipo === tipo.tipo;
                      return (
                        <button
                          key={tipo.tipo}
                          type="button"
                          onClick={() => handleTipoChange(tipo.tipo)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected 
                              ? `${tipo.color} border-current shadow-md` 
                              : 'bg-white border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-current' : 'text-gray-400'}`} />
                            <div>
                              <h4 className={`font-medium ${isSelected ? 'text-current' : 'text-gray-900'}`}>{tipo.nome}</h4>
                              <p className={`text-sm mt-1 ${isSelected ? 'text-current opacity-80' : 'text-gray-500'}`}>{tipo.descricao}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {tiposAvaliacaoDisponiveis.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Você não tem permissão para criar avaliações com seu perfil atual.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* SEÇÃO 2: INFORMAÇÕES GERAIS DA AVALIAÇÃO */}
            {secaoAtual === 2 && (() => {
              const tipoAvaliacaoSelecionado = tiposAvaliacao.find(t => t.tipo === formulario.tipo);
              
              // Mapear cores completas para cada tipo
              const coresConfig: Record<string, { bgGradient: string; border: string; icon: string }> = {
                'DESEMPENHO': {
                  bgGradient: 'bg-gradient-to-r from-blue-50 to-blue-100',
                  border: 'border-2 border-blue-200',
                  icon: 'bg-blue-600'
                },
                'AVALIACAO_DIRECIONADA': {
                  bgGradient: 'bg-gradient-to-r from-green-50 to-green-100',
                  border: 'border-2 border-green-200',
                  icon: 'bg-green-600'
                },
                'ONBOARDING': {
                  bgGradient: 'bg-gradient-to-r from-purple-50 to-purple-100',
                  border: 'border-2 border-purple-200',
                  icon: 'bg-purple-600'
                },
                'OFFBOARDING': {
                  bgGradient: 'bg-gradient-to-r from-red-50 to-red-100',
                  border: 'border-2 border-red-200',
                  icon: 'bg-red-600'
                },
                'FEEDBACK': {
                  bgGradient: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
                  border: 'border-2 border-yellow-200',
                  icon: 'bg-yellow-600'
                },
                'PESQUISA': {
                  bgGradient: 'bg-gradient-to-r from-orange-50 to-orange-100',
                  border: 'border-2 border-orange-200',
                  icon: 'bg-orange-600'
                }
              };
              
              const cores = coresConfig[formulario.tipo] || {
                bgGradient: 'bg-gradient-to-r from-gray-50 to-gray-100',
                border: 'border-2 border-gray-200',
                icon: 'bg-gray-600'
              };
              
              return (
            <div className={`${cores.bgGradient} ${cores.border} rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 ${cores.icon} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Informações Gerais</h2>
                  <p className="text-sm text-gray-600">Defina código, nome, período e descrição da avaliação</p>
                </div>
              </div>

              {/* Configurações específicas por tipo */}
              {formulario.tipo === 'FEEDBACK' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-yellow-900 mb-3">Configuração do Feedback</h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    Feedback independente de período, sem questionário, apenas texto de retorno do gestor para o subordinado.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">
                        {usuario?.perfil === 'ADMIN' ? 'Avaliador (Gestor) *' : 'Você (Gestor)'}
                      </label>
                      <select
                        value={formulario.feedbackAvaliadorId || ''}
                        onChange={(e) => setFormulario(prev => ({ ...prev, feedbackAvaliadorId: e.target.value }))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione o gestor</option>
                        {usuario?.perfil === 'ADMIN' 
                          ? (colaboradores || []).filter(c => c.situacao === 'ATIVO' && c.isGestor).map(colaborador => (
                              <option key={colaborador.id} value={colaborador.id}>
                                {colaborador.nome} - {colaborador.matricula}
                              </option>
                            ))
                          : (usuario?.colaboradorId ? 
                              [(colaboradores || []).find(c => c.id === usuario.colaboradorId)].filter(Boolean).map(colaborador => (
                                <option key={colaborador.id} value={colaborador.id}>
                                  {colaborador.nome} - {colaborador.matricula}
                                </option>
                              )) : [])
                        }
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">Colaborador a ser avaliado *</label>
                      <select
                        value={formulario.feedbackAvaliadoId || ''}
                        onChange={(e) => setFormulario(prev => ({ ...prev, feedbackAvaliadoId: e.target.value }))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione o colaborador</option>
                        {usuario?.perfil === 'ADMIN'
                          ? (colaboradores || []).filter(c => c.situacao === 'ATIVO').map(colaborador => (
                              <option key={colaborador.id} value={colaborador.id}>
                                {colaborador.nome} - {colaborador.matricula}
                              </option>
                            ))
                          : getGestorEquipe(usuario?.colaboradorId || '').map(colaborador => (
                              <option key={colaborador.id} value={colaborador.id}>
                                {colaborador.nome} - {colaborador.matricula}
                              </option>
                            ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Nome do Feedback</label>
                    <input
                      type="text"
                      value={formulario.nome || ''}
                      onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Ex: Feedback Trimestral - João Silva"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Tipo de Feedback</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormulario(prev => ({ ...prev, feedbackTipo: 'POSITIVO' }))}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          (formulario as any).feedbackTipo === 'POSITIVO'
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
                        }`}
                      >
                        <div className="font-medium">Positivo</div>
                        <div className="text-xs mt-1">Reconhecimento e elogios</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormulario(prev => ({ ...prev, feedbackTipo: 'CONSTRUTIVO' }))}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          (formulario as any).feedbackTipo === 'CONSTRUTIVO'
                            ? 'bg-orange-50 border-orange-500 text-orange-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300'
                        }`}
                      >
                        <div className="font-medium">Construtivo</div>
                        <div className="text-xs mt-1">Pontos de melhoria</div>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Texto do Feedback *</label>
                    <textarea
                      value={formulario.feedbackTexto || ''}
                      onChange={(e) => setFormulario(prev => ({ ...prev, feedbackTexto: e.target.value }))}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={5}
                      placeholder="Escreva o feedback para o colaborador..."
                      required
                    />
                  </div>
                </div>
              )}

              {formulario.tipo === 'PESQUISA' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-3">Configuração da Pesquisa</h4>
                  <p className="text-sm text-purple-700 mb-4">
                    Crie pesquisas personalizadas com perguntas abertas, escolhas simples ou múltiplas. Defina o público-alvo através dos filtros abaixo.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Nome da Pesquisa *</label>
                      <input
                        type="text"
                        value={formulario.nome || ''}
                        onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: Pesquisa de Clima Organizacional 2024"
                        required
                      />
                    </div>
                    
                    <div className="border border-purple-300 rounded-lg p-4 bg-white">
                      <h5 className="font-medium text-purple-900 mb-3">Filtros de Público-Alvo</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">Situação dos Colaboradores</label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(formulario.pesquisaFiltros?.situacoes || []).includes('ATIVO')}
                                onChange={(e) => {
                                  const situacoes = formulario.pesquisaFiltros?.situacoes || [];
                                  setFormulario(prev => ({
                                    ...prev,
                                    pesquisaFiltros: {
                                      ...prev.pesquisaFiltros,
                                      situacoes: e.target.checked 
                                        ? [...situacoes, 'ATIVO']
                                        : situacoes.filter(s => s !== 'ATIVO'),
                                      setores: prev.pesquisaFiltros?.setores || [],
                                      cargos: prev.pesquisaFiltros?.cargos || []
                                    }
                                  }));
                                }}
                                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">Ativos</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(formulario.pesquisaFiltros?.situacoes || []).includes('DESLIGADO')}
                                onChange={(e) => {
                                  const situacoes = formulario.pesquisaFiltros?.situacoes || [];
                                  setFormulario(prev => ({
                                    ...prev,
                                    pesquisaFiltros: {
                                      ...prev.pesquisaFiltros,
                                      situacoes: e.target.checked 
                                        ? [...situacoes, 'DESLIGADO']
                                        : situacoes.filter(s => s !== 'DESLIGADO'),
                                      setores: prev.pesquisaFiltros?.setores || [],
                                      cargos: prev.pesquisaFiltros?.cargos || []
                                    }
                                  }));
                                }}
                                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">Desligados</span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">Filtrar por Setor</label>
                          <select
                            multiple
                            value={formulario.pesquisaFiltros?.setores || []}
                            onChange={(e) => {
                              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                              setFormulario(prev => ({
                                ...prev,
                                pesquisaFiltros: {
                                  ...prev.pesquisaFiltros,
                                  setores: selectedOptions,
                                  situacoes: prev.pesquisaFiltros?.situacoes || ['ATIVO'],
                                  cargos: prev.pesquisaFiltros?.cargos || []
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            size={3}
                          >
                            {setoresDisponiveis.map(setor => (
                              <option key={setor} value={setor}>{setor}</option>
                            ))}
                          </select>
                          <p className="text-xs text-purple-600 mt-1">Segure Ctrl para múltipla seleção</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">Filtrar por Cargo</label>
                          <select
                            multiple
                            value={formulario.pesquisaFiltros?.cargos || []}
                            onChange={(e) => {
                              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                              setFormulario(prev => ({
                                ...prev,
                                pesquisaFiltros: {
                                  ...prev.pesquisaFiltros,
                                  cargos: selectedOptions,
                                  situacoes: prev.pesquisaFiltros?.situacoes || ['ATIVO'],
                                  setores: prev.pesquisaFiltros?.setores || []
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            size={3}
                          >
                            {cargos.map(cargo => (
                              <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                            ))}
                          </select>
                          <p className="text-xs text-purple-600 mt-1">Segure Ctrl para múltipla seleção</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                        <p className="text-sm text-purple-800">
                          <strong>Colaboradores que atendem aos filtros:</strong> {getPessoasDisponiveis().length}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Instruções para Participantes</label>
                      <textarea
                        value={formulario.instrucoes || ''}
                        onChange={(e) => setFormulario(prev => ({ ...prev, instrucoes: e.target.value }))}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        placeholder="Instruções gerais para os participantes da pesquisa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Perguntas da Pesquisa</label>
                      <div className="space-y-3">
                        {(formulario.pesquisaPerguntas || []).map((pergunta, index) => (
                          <div key={index} className="border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-purple-900">Pergunta {index + 1}</span>
                              <button type="button" onClick={() => handleRemoverPergunta(index)} className="text-red-600 hover:text-red-800">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={pergunta.pergunta}
                              onChange={(e) => handlePerguntaChange(index, 'pergunta', e.target.value)}
                              className="w-full px-3 py-2 border border-purple-300 rounded mb-2"
                              placeholder="Texto da pergunta"
                            />
                            <select
                              value={pergunta.tipo}
                              onChange={(e) => handlePerguntaChange(index, 'tipo', e.target.value)}
                              className="w-full px-3 py-2 border border-purple-300 rounded mb-2"
                            >
                              <option value="TEXTO">Resposta aberta</option>
                              <option value="ESCOLHA_UNICA">Escolha única</option>
                              <option value="ESCOLHA_MULTIPLA">Escolha múltipla</option>
                              <option value="ESCALA_1_5">Escala 1-5</option>
                              <option value="SIM_NAO">Sim/Não</option>
                            </select>
                            {(pergunta.tipo === 'ESCOLHA_SIMPLES' || pergunta.tipo === 'ESCOLHA_MULTIPLA') && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-purple-700">Opções:</label>
                                {(pergunta.opcoes || []).map((opcao, opcaoIndex) => (
                                  <div key={opcaoIndex} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={opcao}
                                      onChange={(e) => handleOpcaoChange(index, opcaoIndex, e.target.value)}
                                      className="flex-1 px-3 py-1 border border-purple-300 rounded text-sm"
                                      placeholder={`Opção ${opcaoIndex + 1}`}
                                    />
                                    <button type="button" onClick={() => handleRemoverOpcao(index, opcaoIndex)} className="text-red-600 hover:text-red-800">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => handleAdicionarOpcao(index)} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
                                  <Plus className="w-4 h-4" />
                                  Adicionar opção
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={handleAdicionarPergunta} className="w-full py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:text-purple-800 flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar pergunta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formulario.tipo === 'ONBOARDING' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3">Configuração do OnBoarding</h4>
                  <p className="text-sm text-green-700 mb-4">
                    Selecione o período de admissão dos colaboradores que serão avaliados. O sistema buscará automaticamente todos os colaboradores admitidos neste período.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Data Admissão Início *</label>
                      <input
                        type="date"
                        value={formulario.onboardingDataAdmissaoInicio || ''}
                        onChange={(e) => setFormulario(prev => ({ ...prev, onboardingDataAdmissaoInicio: e.target.value }))}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Data Admissão Fim *</label>
                      <input
                        type="date"
                        value={formulario.onboardingDataAdmissaoFim || ''}
                        onChange={(e) => setFormulario(prev => ({ ...prev, onboardingDataAdmissaoFim: e.target.value }))}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-green-700 mb-1">Período de Avaliação *</label>
                    <select
                      value={formulario.onboardingPeriodo || '1_PERIODO'}
                      onChange={(e) => setFormulario(prev => ({ ...prev, onboardingPeriodo: e.target.value as '1_PERIODO' | '2_PERIODO' }))}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="1_PERIODO">1º Ciclo</option>
                      <option value="2_PERIODO">2º Ciclo</option>
                    </select>
                  </div>
                  {formulario.onboardingDataAdmissaoInicio && formulario.onboardingDataAdmissaoFim && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Colaboradores encontrados:</strong> {getColaboradoresPorDataAdmissao(formulario.onboardingDataAdmissaoInicio, formulario.onboardingDataAdmissaoFim).length}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {formulario.tipo === 'OFFBOARDING' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3">Configuração do OffBoarding</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Selecione o período de desligamento dos colaboradores que serão avaliados. O sistema buscará automaticamente todos os colaboradores desligados neste período.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Data Demissão Início *</label>
                      <input
                        type="date"
                        value={formulario.offboardingDataDemissaoInicio || ''}
                        onChange={(e) => setFormulario(prev => ({ ...prev, offboardingDataDemissaoInicio: e.target.value }))}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Data Demissão Fim *</label>
                      <input
                        type="date"
                        value={formulario.offboardingDataDemissaoFim || ''}
                        onChange={(e) => setFormulario(prev => ({ ...prev, offboardingDataDemissaoFim: e.target.value }))}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  {formulario.offboardingDataDemissaoInicio && formulario.offboardingDataDemissaoFim && (
                    <div className="mt-4 p-3 bg-red-100 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Colaboradores encontrados:</strong> {getColaboradoresPorDataDemissao(formulario.offboardingDataDemissaoInicio, formulario.offboardingDataDemissaoFim).length}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código da Avaliação *</label>
                  <input
                    type="text"
                    value={formulario.codigo}
                    onChange={(e) => setFormulario(prev => ({ ...prev, codigo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: AVAL-2024-01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Avaliação *</label>
                  <input
                    type="text"
                    value={formulario.nome}
                    onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Avaliação de Desempenho 2024 - 1º Trimestre"
                    required={formulario.tipo !== 'ONBOARDING' && formulario.tipo !== 'OFFBOARDING'}
                  />
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
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
                    Data de Fim {formulario.tipo === 'DESEMPENHO' ? '' : '*'}
                  </label>
                  <input
                    type="date"
                    value={formulario.dataFim}
                    onChange={(e) => {
                      const dataFim = e.target.value;
                      if (dataFim) {
                        const hoje = new Date();
                        hoje.setHours(0, 0, 0, 0);
                        const dataFimDate = new Date(dataFim);
                        dataFimDate.setHours(0, 0, 0, 0);
                        // Permitir data de hoje (>= ao invés de >)
                        if (dataFimDate < hoje) {
                          toast.error('A data de fim não pode ser menor que a data de hoje');
                          return;
                        }
                      }
                      setFormulario(prev => ({ ...prev, dataFim }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formulario.tipo !== 'DESEMPENHO'}
                  />
                  {formulario.tipo === 'DESEMPENHO' && (
                    <p className="text-xs text-gray-500 mt-1">Opcional para avaliação de desempenho</p>
                  )}
                  {formulario.dataFim && (() => {
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    const dataFimDate = new Date(formulario.dataFim);
                    dataFimDate.setHours(0, 0, 0, 0);
                    // Permitir data de hoje (>= ao invés de >)
                    if (dataFimDate < hoje) {
                      return <p className="text-xs text-red-600 mt-1">A data de fim não pode ser menor que a data de hoje</p>;
                    }
                    return null;
                  })()}
                </div>
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formulario.descricao}
                  onChange={(e) => setFormulario(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva os objetivos desta avaliação"
                />
              </div>
            </div>
            );
            })()}
          </div>
        );

      case 2:
        if (formulario.tipo === 'FEEDBACK') {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmação</h3>
                <p className="text-gray-600">Revise as configurações do seu feedback antes de criar</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informações Básicas</h4>
                  <p className="text-sm text-gray-600">Avaliador, avaliado e período</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Feedback</h4>
                  <p className="text-sm text-gray-600">{formulario.feedbackTexto || 'Sem texto'}</p>
                </div>
              </div>
            </div>
          );
        }
        // Para DESEMPENHO, mostrar seções específicas
        if (formulario.tipo === 'DESEMPENHO') {
          return (
            <div className="space-y-6">
              {/* Filtros de Avaliação */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="font-medium text-gray-900 mb-4">Filtros de Avaliação</h4>
                <div className="space-y-4">
                  {/* Desconsiderar admissões recentes */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Desconsiderar colaboradores admitidos nos últimos X dias
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Define um período mínimo de admissão. Colaboradores admitidos recentemente não aparecerão para avaliação.
                    </p>
                    <input
                      type="number"
                      min="0"
                      value={(formulario as any).diasMinimoAdmissao || ''}
                      onChange={(e) => setFormulario(prev => ({ 
                        ...prev, 
                        diasMinimoAdmissao: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Ex: 90 (dias)"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Deixe em branco para incluir todos os colaboradores independente da data de admissão
                    </p>
                  </div>
                </div>
              </div>

              {/* Seleção dos Avaliados */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="font-medium text-gray-900 mb-3">Seleção dos Avaliados</h4>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Selecione a(s) Equipe(s) *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const todasEquipes = (equipes || []).filter(e => e.ativa).map(e => e.id);
                        const equipesAtuais = (formulario as any).equipesSelecionadas || [];
                        if (equipesAtuais.length === todasEquipes.length) {
                          setFormulario(prev => ({ ...prev, equipesSelecionadas: [] }));
                        } else {
                          setFormulario(prev => ({ ...prev, equipesSelecionadas: todasEquipes }));
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {(formulario as any).equipesSelecionadas?.length === (equipes || []).filter(e => e.ativa).length
                        ? 'Desmarcar todas'
                        : 'Selecionar todas'}
                    </button>
                  </div>
                  
                  {/* Campo de busca */}
                  <div className="mb-3 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filtroEquipes}
                      onChange={(e) => setFiltroEquipes(e.target.value)}
                      placeholder="Buscar equipe por nome, código ou gestor..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto bg-white">
                    <div className="space-y-2">
                      {(() => {
                        const equipesFiltradas = (equipes || [])
                          .filter(e => e.ativa)
                          .filter(equipe => {
                            if (!filtroEquipes) return true;
                            const filtroLower = filtroEquipes.toLowerCase();
                            const gestorNome = (colaboradores || []).find(c => c.id === equipe.gestorId)?.nome || '';
                            return (
                              equipe.nome.toLowerCase().includes(filtroLower) ||
                              equipe.codigo.toLowerCase().includes(filtroLower) ||
                              gestorNome.toLowerCase().includes(filtroLower)
                            );
                          });

                        if (equipesFiltradas.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">Nenhuma equipe encontrada</p>
                            </div>
                          );
                        }

                        return equipesFiltradas.map(equipe => {
                        const isSelected = ((formulario as any).equipesSelecionadas || []).includes(equipe.id);
                        const gestorNome = (colaboradores || []).find(c => c.id === equipe.gestorId)?.nome || 'N/A';
                        return (
                          <label
                            key={equipe.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const equipesAtuais = (formulario as any).equipesSelecionadas || [];
                                let novasEquipes: string[];
                                if (isSelected) {
                                  novasEquipes = equipesAtuais.filter((id: string) => id !== equipe.id);
                                } else {
                                  novasEquipes = [...equipesAtuais, equipe.id];
                                }
                                setFormulario(prev => ({ ...prev, equipesSelecionadas: novasEquipes }));
                              }}
                              className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm font-medium block ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                {equipe.nome}
                              </span>
                              <span className={`text-xs block mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                Código: {equipe.codigo} | Gestor: {gestorNome}
                              </span>
                            </div>
                          </label>
                        );
                      });
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo de Avaliação - Separado em caixa própria */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <h5 className="font-medium text-gray-900 mb-3">Tipo de Avaliação *</h5>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione o modelo de avaliação baseado em quantos ângulos o colaborador será avaliado.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormulario(prev => ({ ...prev, tipoAvaliacaoDesempenho: '90' }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                      (formulario as any).tipoAvaliacaoDesempenho === '90'
                          ? 'bg-blue-100 border-blue-500 shadow-md'
                          : 'bg-white border-gray-300 hover:border-blue-300'
                      }`}
                    >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">90°</h5>
                      <div className="text-2xl">📊</div>
                    </div>
                    <p className="text-sm text-gray-800 font-medium mb-1">Avaliação do Gestor</p>
                    <p className="text-xs text-gray-600">Apenas o gestor avalia o subordinado. Modelo mais simples e direto.</p>
                    </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormulario(prev => ({ ...prev, tipoAvaliacaoDesempenho: '180' }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      (formulario as any).tipoAvaliacaoDesempenho === '180'
                          ? 'bg-blue-100 border-blue-500 shadow-md'
                          : 'bg-white border-gray-300 hover:border-blue-300'
                      }`}
                    >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">180°</h5>
                      <div className="text-2xl">📈</div>
                </div>
                    <p className="text-sm text-gray-800 font-medium mb-1">Gestor + Autoavaliação</p>
                    <p className="text-xs text-gray-600">O gestor avalia o subordinado e o colaborador faz autoavaliação.</p>
                  </button>
                  
                        <button
                          type="button"
                    onClick={() => setFormulario(prev => ({ ...prev, tipoAvaliacaoDesempenho: '360' }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      (formulario as any).tipoAvaliacaoDesempenho === '360'
                        ? 'bg-blue-100 border-blue-500 shadow-md'
                        : 'bg-white border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">360°</h5>
                      <div className="text-2xl">🎯</div>
                    </div>
                    <p className="text-sm text-gray-800 font-medium mb-1">Avaliação Completa</p>
                    <p className="text-xs text-gray-600">Gestor, autoavaliação, pares, fornecedores e chefes indiretos podem avaliar.</p>
                        </button>
                      </div>
              </div>

              {/* Escala de Avaliação */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Escala da Avaliação *</h3>
                <p className="text-sm text-gray-600 mb-4">Selecione a escala que será utilizada para calcular as notas de cada competência</p>
                <select
                  value={formulario.escalaId || ''}
                  onChange={(e) => setFormulario(prev => ({ ...prev, escalaId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Selecione uma escala</option>
                  {escalasRecomendadas.map((escala) => (
                    <option key={escala.id} value={escala.id}>
                      {escala.codigo} - {escala.nome}
                    </option>
                  ))}
                </select>
                {formulario.escalaId && escalasRecomendadas.find(e => e.id === formulario.escalaId) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Escala selecionada:</strong> {escalasRecomendadas.find(e => e.id === formulario.escalaId)?.codigo} - {escalasRecomendadas.find(e => e.id === formulario.escalaId)?.nome}
                    </p>
            </div>
                  )}
              </div>

              {/* Tipo de Competência */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tipo de Competência *</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione o tipo de competência que será avaliada. O sistema selecionará automaticamente todas as competências dos tipos escolhidos que são compatíveis com este tipo de avaliação.
                </p>
                <div className="space-y-3">
                  {(tiposCompetencia || []).filter(tipo => 
                    // Filtrar tipos que têm o destino correto para este tipo de avaliação
                    tipo.destinos && tipo.destinos.length > 0 && tipo.destinos.includes(formulario.tipo)
                  ).map((tipo) => {
                    const isSelected = (formulario.tiposCompetenciaSelecionados || []).includes(tipo.id);
                    return (
                      <label
                        key={tipo.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-white border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const tiposAtuais = formulario.tiposCompetenciaSelecionados || [];
                            const novosTipos = isSelected
                              ? tiposAtuais.filter(id => id !== tipo.id)
                              : [...tiposAtuais, tipo.id];
                            
                            // Automaticamente adicionar/remover todas as competências do tipo que têm o destino correto
                            const competenciasDesseTipo = (competencias || [])
                              .filter(c => {
                                // Filtrar por tipo de competência
                                if (c.tipoCompetenciaId !== tipo.id) return false;
                                // Filtrar por destino - verificar se o tipo de competência tem o destino correto
                                if (!tipo.destinos || tipo.destinos.length === 0) return false;
                                return tipo.destinos.includes(formulario.tipo);
                              })
                              .map(c => c.id);
                            
                            const competenciasAtuais = formulario.competenciasSelecionadas;
                            let novasCompetencias: string[];
                            
                            if (isSelected) {
                              // Remover competências deste tipo
                              novasCompetencias = competenciasAtuais.filter(
                                id => !competenciasDesseTipo.includes(id)
                              );
                            } else {
                              // Adicionar competências deste tipo
                              novasCompetencias = [
                                ...competenciasAtuais,
                                ...competenciasDesseTipo.filter(id => !competenciasAtuais.includes(id))
                              ];
                            }
                            
                            setFormulario(prev => ({
                              ...prev,
                              tiposCompetenciaSelecionados: novosTipos,
                              competenciasSelecionadas: novasCompetencias
                            }));
                          }}
                          className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {tipo.nome}
                          </p>
                          <p className={`text-xs mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                            {tipo.nome === 'Técnica' 
                              ? 'Competências relacionadas ao conhecimento técnico e habilidades específicas do cargo'
                              : tipo.nome === 'Comportamental'
                              ? 'Competências relacionadas ao comportamento, atitudes e habilidades interpessoais'
                              : tipo.descricao || 'Tipo de competência'}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>


          </div>
        );
        }

        // Para outros tipos, manter o layout original
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
              <Settings className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Configuração da Avaliação</h3>
              <p className="text-gray-600">Configure a escala e as competências que serão avaliadas</p>
              </div>
              
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escala de Avaliação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {escalasRecomendadas.map((escala) => {
                  const isSelected = formulario.escalaId === escala.id;
                  return (
                    <button
                      key={escala.id}
                      type="button"
                      onClick={() => setFormulario(prev => ({ ...prev, escalaId: escala.id }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 shadow-md'
                          : 'bg-white border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{escala.codigo} - {escala.nome}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isSelected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          Peso: {escala.peso}
                        </span>
                </div>
                      <p className="text-sm text-gray-600">{escala.descricao}</p>
                    </button>
                  );
                })}
                  </div>
              {escalasRecomendadas.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhuma escala disponível para este tipo de avaliação</p>
                </div>
              )}
              </div>
        
          </div>
        );
        
      case 3:
        // Para DESEMPENHO, mostrar gestores e colaboradores por equipe
        if (formulario.tipo === 'DESEMPENHO') {
        // Obter gestores das equipes selecionadas
          const equipesSelecionadas = (formulario as any).equipesSelecionadas || [];
          const gestoresEquipes = equipesSelecionadas.flatMap((equipeId: string) => {
          const equipe = (equipes || []).find(e => e.id === equipeId);
          if (!equipe) return [];
          const gestor = (colaboradores || []).find(c => c.id === equipe.gestorId && c.situacao === 'ATIVO');
            return gestor ? [{ gestor, equipe }] : [];
        });
        
        // Remover duplicatas
          const gestoresUnicos = gestoresEquipes.filter((item: any, index: number, self: any[]) => 
            index === self.findIndex((g: any) => g.gestor.id === item.gestor.id)
        );
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Seleção de Participantes</h3>
              <p className="text-gray-600">Selecione os colaboradores que serão avaliados</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestores e Colaboradores</h3>
              <p className="text-sm text-gray-600 mb-4">
                Todos os colaboradores elegíveis já foram selecionados automaticamente. Clique no gestor para visualizar ou ajustar a seleção.
              </p>
              
              {(formulario as any).diasMinimoAdmissao && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      <strong>Filtro ativo:</strong> Apenas colaboradores admitidos há {(formulario as any).diasMinimoAdmissao} dias ou mais estão sendo exibidos.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                  {gestoresUnicos.map((item: any) => {
                    const { gestor, equipe } = item;
                  const colaboradoresGestor = (colaboradores || []).filter(
                    c => c.gestorId === gestor.id && c.situacao === 'ATIVO' && colaboradorEhElegivel(c)
                  );
                  const isExpanded = gestorExpandido === gestor.id;
                  
                  return (
                    <div key={gestor.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                        onClick={() => setGestorExpandido(isExpanded ? null : gestor.id)}
                        className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-600" />
                          <div className="text-left">
                              <p className="font-medium text-gray-900">{equipe.nome} - {gestor.nome}</p>
                            <p className="text-sm text-gray-600">{gestor.matricula} - {colaboradoresGestor.length} colaborador(es)</p>
                    </div>
              </div>
                          {isExpanded ? (
                            <ChevronRight className="w-5 h-5 text-blue-600 rotate-90" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-blue-600" />
                          )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                                {formulario.participantesConfig.pessoasSelecionadas.filter((id: string) => 
                                  colaboradoresGestor.some(c => c.id === id)
                              ).length} de {colaboradoresGestor.length} selecionado(s)
                </span>
                            <button
                              type="button"
                              onClick={() => {
                                  const todosSelecionados = colaboradoresGestor.every(c => 
                                    formulario.participantesConfig.pessoasSelecionadas.includes(c.id)
                                );
                                if (todosSelecionados) {
                                  setFormulario(prev => ({
                      ...prev,
                                    participantesConfig: {
                                      ...prev.participantesConfig,
                                      pessoasSelecionadas: prev.participantesConfig.pessoasSelecionadas.filter(
                                          (id: string) => !colaboradoresGestor.some(c => c.id === id)
                                      )
                                    }
                                  }));
                                } else {
                                    const idsParaAdicionar = colaboradoresGestor
                                      .filter(c => !formulario.participantesConfig.pessoasSelecionadas.includes(c.id))
                                      .map(c => c.id);
                                  setFormulario(prev => ({
                                    ...prev,
                                    participantesConfig: {
                                      ...prev.participantesConfig,
                                        pessoasSelecionadas: [...prev.participantesConfig.pessoasSelecionadas, ...idsParaAdicionar]
                                    }
                                  }));
                                }
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {colaboradoresGestor.every(c => 
                                formulario.participantesConfig.pessoasSelecionadas.includes(c.id)
                              ) ? 'Desmarcar Todos' : 'Selecionar Todos'}
                            </button>
              </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                              {colaboradoresGestor.map((colaborador: any) => {
                              const isSelected = formulario.participantesConfig.pessoasSelecionadas.includes(colaborador.id);
                  return (
                    <label
                                  key={colaborador.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                                    onChange={() => handlePessoaToggle(colaborador.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                      {colaborador.nome}
                                    </p>
                          <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                        Matrícula: {colaborador.matricula}
                                      </p>
                                      <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                        Cargo: {(cargos || []).find(c => c.id === colaborador.cargoId)?.nome || 'Sem cargo'}
                                      </p>
                                      <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                        Setor: {colaborador.setor || 'Não informado'}
                                      </p>
                                      <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                        Data de Admissão: {new Date(colaborador.dataAdmissao).toLocaleDateString('pt-BR')}
                          </p>
                      </div>
                    </label>
                              );
                            })}
              </div>
            </div>
                      )}
          </div>
                  );
                })}
              </div>

              {gestoresUnicos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhum gestor encontrado nas equipes selecionadas</p>
                </div>
              )}
            </div>
          </div>
        );
        }

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Participação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { tipo: 'AUTO_AVALIACAO', nome: 'Auto Avaliação', descricao: 'Colaborador avalia seu próprio desempenho' },
                  { tipo: 'AVALIACAO_GESTOR', nome: 'Avaliação do Gestor', descricao: 'Gestor avalia seus subordinados' },
                  { tipo: 'AVALIACAO_360', nome: 'Avaliação 360°', descricao: 'Avaliação por múltiplas perspectivas' },
                  { tipo: 'AVALIACAO_EQUIPE', nome: 'Avaliação de Equipe', descricao: 'Avaliação coletiva da equipe' }
                ].map((tipo) => (
                  <button
                    key={tipo.tipo}
                    type="button"
                    onClick={() => setFormulario(prev => ({
                      ...prev,
                      participantesConfig: { ...prev.participantesConfig, tipo: tipo.tipo as any }
                    }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formulario.participantesConfig.tipo === tipo.tipo
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div>
                      <h4 className="font-medium">{tipo.nome}</h4>
                      <p className="text-sm text-gray-500 mt-1">{tipo.descricao}</p>
                  </div>
                  </button>
                ))}
                  </div>
                </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seleção de {formulario.participantesConfig.tipo === 'AVALIACAO_EQUIPE' ? 'Equipes' : 'Pessoas'}
              </h3>
              <div className="mb-3">
                <span className="text-sm text-gray-600">
                  {formulario.participantesConfig.pessoasSelecionadas.length} selecionada(s)
                </span>
                  </div>
        
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                {pessoasDisponiveis.map((item) => {
                  const isSelected = formulario.participantesConfig.pessoasSelecionadas.includes(item.id);
        return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePessoaToggle(item.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{item.nome}</p>
                        {formulario.participantesConfig.tipo !== 'AVALIACAO_EQUIPE' && (item as any).matricula !== undefined && (
                          <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>{(item as any).matricula}</p>
                        )}
                        {formulario.participantesConfig.tipo === 'AVALIACAO_EQUIPE' && (item as any).gestorId !== undefined && (
                          <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                            Gestor: {(colaboradores || []).find(c => c.id === (item as any).gestorId)?.nome || 'N/A'}
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
                    Nenhuma {formulario.participantesConfig.tipo === 'AVALIACAO_EQUIPE' ? 'equipe' : 'pessoa'} disponível
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        // Para DESEMPENHO e outros tipos, mostrar configurações avançadas
        return (
            <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Avaliação</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Permitir visualização de todas as competências</h4>
                    <p className="text-sm text-gray-500">Avaliadores podem ver todas as competências, não apenas as atribuídas</p>
                </div>
                  <input
                    type="checkbox"
                    checked={formulario.configuracoesAvancadas.permitirAvaliadorVisualizarTodasCompetencias}
                    onChange={(e) => setFormulario(prev => ({
                      ...prev,
                      configuracoesAvancadas: {
                        ...prev.configuracoesAvancadas,
                        permitirAvaliadorVisualizarTodasCompetencias: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Exigir justificativa para notas</h4>
                      <p className="text-sm text-gray-500">Avaliadores devem justificar as notas selecionadas</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas}
                      onChange={(e) => setFormulario(prev => ({
                        ...prev,
                        configuracoesAvancadas: {
                          ...prev.configuracoesAvancadas,
                          exigirJustificativaNotasBaixas: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
              
                  {/* Mostrar lista de notas quando "Exigir justificativa" estiver marcado */}
                  {formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas && formulario.escalaId && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Notas que precisam de justificativa</label>
                      {(() => {
                        const escalaSelecionada = (escalasCompetencia || []).find(e => e.id === formulario.escalaId);
                        if (!escalaSelecionada || !escalaSelecionada.notas || escalaSelecionada.notas.length === 0) {
                          return (
                            <p className="text-sm text-gray-500">Selecione uma escala primeiro para configurar as notas</p>
                          );
                        }
                        const notasOrdenadas = [...escalaSelecionada.notas].sort((a, b) => a.peso - b.peso);
                        const notasSelecionadas = (formulario.configuracoesAvancadas as any).notasJustificativa || [];
                        return (
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {notasOrdenadas.map(nota => {
                              const isSelected = notasSelecionadas.includes(nota.peso);
                              return (
                                <label
                                  key={nota.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const novasNotas = e.target.checked
                                        ? [...notasSelecionadas, nota.peso]
                                        : notasSelecionadas.filter((p: number) => p !== nota.peso);
                                      setFormulario(prev => ({
                                        ...prev,
                                        configuracoesAvancadas: {
                                          ...prev.configuracoesAvancadas,
                                          notasJustificativa: novasNotas
                                        } as any
                                      }));
                                    }}
                                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900">{nota.nota}</span>
                                    <span className="text-xs text-gray-500 ml-2">(Peso: {nota.peso})</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas && !formulario.escalaId && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <Info className="w-4 h-4 inline mr-1" />
                        Selecione uma escala na etapa anterior para configurar quais notas precisam de justificativa
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Permitir comentários do avaliado</h4>
                    <p className="text-sm text-gray-500">Avaliados podem adicionar comentários às avaliações</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formulario.configuracoesAvancadas.permitirAvaliadoComentarios}
                    onChange={(e) => setFormulario(prev => ({
                      ...prev,
                      configuracoesAvancadas: {
                        ...prev.configuracoesAvancadas,
                        permitirAvaliadoComentarios: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lembretes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data do Lembrete</label>
                  <input
                    type="date"
                    value={formulario.configuracoesAvancadas.dataLembrete}
                    onChange={(e) => setFormulario(prev => ({
                      ...prev,
                      configuracoesAvancadas: {
                        ...prev.configuracoesAvancadas,
                        dataLembrete: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem do Lembrete</label>
                  <input
                    type="text"
                    value={formulario.configuracoesAvancadas.mensagemLembrete}
                    onChange={(e) => setFormulario(prev => ({
                      ...prev,
                      configuracoesAvancadas: {
                        ...prev.configuracoesAvancadas,
                        mensagemLembrete: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mensagem do lembrete"
                  />
                  </div>
              </div>
            </div>
          </div>
        );

      case 5:
        // Resumo final para DESEMPENHO
        if (formulario.tipo === 'DESEMPENHO') {
          // Calcular equipes com funcionários selecionados
          const equipesComFuncionarios = new Set<string>();
          formulario.participantesConfig.pessoasSelecionadas.forEach((pessoaId: string) => {
            const colaborador = (colaboradores || []).find(c => c.id === pessoaId);
            if (colaborador && colaborador.equipeId) {
              equipesComFuncionarios.add(colaborador.equipeId);
            }
          });
          const equipesSelecionadas = (formulario as any).equipesSelecionadas || [];
          
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Revisão e Confirmação</h3>
                <p className="text-gray-600">Revise as informações antes de criar a avaliação</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Código:</strong> {formulario.codigo}</p>
                    <p><strong>Nome:</strong> {formulario.nome}</p>
                    <p><strong>Data Início:</strong> {formulario.dataInicio}</p>
                    {formulario.dataFim && <p><strong>Data Fim:</strong> {formulario.dataFim}</p>}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Configurações</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Equipes:</strong> {equipesComFuncionarios.size} {equipesComFuncionarios.size !== equipesSelecionadas.length && `(de ${equipesSelecionadas.length} selecionadas)`}</p>
                    <p><strong>Tipo de Avaliação:</strong> {(formulario as any).tipoAvaliacaoDesempenho ? `${(formulario as any).tipoAvaliacaoDesempenho}°` : 'Não selecionado'}</p>
                    <p><strong>Escala:</strong> {(escalasCompetencia || []).find(e => e.id === formulario.escalaId)?.nome || 'Não selecionada'}</p>
                    <p><strong>Competências:</strong> {formulario.competenciasSelecionadas.length}</p>
                    <p><strong>Participantes:</strong> {formulario.participantesConfig.pessoasSelecionadas.length}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Configurações Avançadas</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Exigir justificativa:</strong> {formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas ? 'Sim' : 'Não'}</p>
                    {formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas && (formulario.configuracoesAvancadas as any).notasJustificativa?.length > 0 && (
                      <p><strong>Notas que precisam de justificativa:</strong> {(formulario.configuracoesAvancadas as any).notasJustificativa.length} nota(s)</p>
                    )}
                    <p><strong>Permitir comentários:</strong> {formulario.configuracoesAvancadas.permitirAvaliadoComentarios ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Para outros tipos, o resumo já é mostrado no step anterior
        return null;

      default:
        return null;
    }
  };


  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Criação de Avaliações</h1>
        <p className="text-gray-600">Crie uma nova avaliação com nosso assistente passo a passo</p>
      </div>

      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={
                    currentStep >= step.number
                      ? 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-blue-600 text-white'
                      : 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-600'
                  }
                >
                  {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                </div>
                <span
                  className={
                    currentStep >= step.number
                      ? 'mt-2 text-xs text-center max-w-24 text-blue-600 font-medium'
                      : 'mt-2 text-xs text-center max-w-24 text-gray-500'
                  }
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={
                    currentStep > step.number
                      ? 'w-16 h-1 mx-4 bg-blue-600'
                      : 'w-16 h-1 mx-4 bg-gray-200'
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {renderStepContent()}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 && secaoAtual === 1}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 1 && secaoAtual === 2 ? 'Voltar para Configurações' : 'Anterior'}
          </button>

          {(() => {
            // Verificar se é o último step baseado no tipo de avaliação
            const isLastStep = currentStep >= steps.length;
            
            if (isLastStep) {
              return (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando...' : 'Criar Avaliação'}
            </button>
              );
            }
            
            return (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {currentStep === 1 && secaoAtual === 1 ? 'Continuar' : 'Próximo'}
                <ChevronRight className="w-4 h-4" />
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CriacaoAvaliacaoWizard;