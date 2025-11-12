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
    permitirAvaliadoComentarios: boolean;
    dataLembrete: string;
    mensagemLembrete: string;
  };

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
    addAvaliacao 
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

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMinhasEquipes, setShowMinhasEquipes] = useState(false);
  const [secaoAtual, setSecaoAtual] = useState<1 | 2>(1); // Controla qual seção do Step 1 está visível
  
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
      exigirJustificativaNotasBaixas: true,
      notaMinimaJustificativa: 3,
      permitirAvaliadoComentarios: true,
      dataLembrete: '',
      mensagemLembrete: 'Lembre-se de completar sua avaliação'
    },
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
    // Validações específicas de cada tipo de avaliação
    if (formulario.tipo === 'DESEMPENHO') {
      if (!(formulario as any).gestorSelecionadoId) {
        toast.error('Selecione um gestor para a avaliação');
        return false;
      }
      if (!(formulario as any).tipoAvaliacaoDesempenho) {
        toast.error('Selecione o tipo de avaliação (90°, 180° ou 360°)');
        return false;
      }
    }
    
    if (formulario.tipo === 'FEEDBACK') {
      if (!formulario.feedbackAvaliadorId) {
        toast.error('Selecione o avaliador');
        return false;
      }
      if (!formulario.feedbackAvaliadoId) {
        toast.error('Selecione o colaborador a ser avaliado');
        return false;
      }
      if (!formulario.feedbackTexto) {
        toast.error('Escreva o texto do feedback');
        return false;
      }
    }
    
    if (formulario.tipo === 'ONBOARDING') {
      if (!formulario.onboardingDataAdmissaoInicio || !formulario.onboardingDataAdmissaoFim) {
        toast.error('Preencha as datas de admissão');
        return false;
      }
      if (!formulario.onboardingPeriodo) {
        toast.error('Selecione o período de avaliação');
        return false;
      }
    }
    
    if (formulario.tipo === 'OFFBOARDING') {
      if (!formulario.offboardingDataDemissaoInicio || !formulario.offboardingDataDemissaoFim) {
        toast.error('Preencha as datas de demissão');
        return false;
      }
    }
    
    if (formulario.tipo === 'PESQUISA') {
      if (!formulario.pesquisaPerguntas || formulario.pesquisaPerguntas.length === 0) {
        toast.error('Adicione pelo menos uma pergunta à pesquisa');
        return false;
      }
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
          if (!(formulario as any).gestorSelecionadoId) {
            toast.error('Selecione um gestor para a avaliação');
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
        if (!formulario.escalaId) {
          toast.error('Selecione uma escala de avaliação');
          return false;
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
          empresaId: 'emp-001'
        };
        
      } else {
        // Standard evaluation
        novaAvaliacao = {
          nome: formulario.nome,
          descricao: formulario.descricao,
          tipo: formulario.tipo,
          tipoAvaliacao: (formulario.participantesConfig.tipo === 'AVALIACAO_360' ? '360' : '90') as "90" | "180" | "360",
          dataInicio: formulario.dataInicio,
          dataLimite: formulario.dataFim,
          dataFim: formulario.dataFim,
          status: 'CRIADA' as const,
          incluiTecnica: true,
          incluiComportamental: true,
          escalaId: formulario.escalaId,
          competenciasSelecionadas: formulario.competenciasSelecionadas,
          instrucoes: formulario.instrucoes,
          empresaId: 'emp-001'
        };
      }

      addAvaliacao(novaAvaliacao);
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
      return getGestorEquipe(gestorId);
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
    return (escalasCompetencia || []).filter(escala => 
      escala.tipo === tipoEscala && escala.ativa
    );
  };

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
      return tipoComp?.nome?.toLowerCase().includes(tipo.toLowerCase());
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

  const competenciasAgrupadas = getCompetenciasPorTipo();
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
                  <p className="text-sm text-gray-600">Selecione o tipo e configure suas opções específicas</p>
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

              {formulario.tipo === 'FEEDBACK' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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

              {formulario.tipo === 'DESEMPENHO' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-3">Configuração da Avaliação de Desempenho</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Selecione o Gestor *</label>
                    <select
                      value={(formulario as any).gestorSelecionadoId || ''}
                      onChange={(e) => setFormulario(prev => ({ 
                        ...prev, 
                        gestorSelecionadoId: e.target.value,
                        participantesConfig: {
                          ...prev.participantesConfig,
                          pessoasSelecionadas: [] // Reset selected participants when changing manager
                        }
                      }))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione um gestor</option>
                      {(colaboradores || []).filter(c => c.isGestor && c.situacao === 'ATIVO').map(gestor => (
                        <option key={gestor.id} value={gestor.id}>
                          {gestor.nome} - {gestor.matricula}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-blue-600 mt-1">Apenas colaboradores da equipe deste gestor aparecerão para avaliação</p>
                    {(formulario as any).gestorSelecionadoId && (
                      <div className="mt-2 p-2 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Colaboradores diretos encontrados:</strong> {getGestorEquipe((formulario as any).gestorSelecionadoId).length}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-blue-200 pt-4 mt-4">
                    <h5 className="font-medium text-blue-900 mb-3">Tipo de Avaliação</h5>
                    <p className="text-sm text-blue-700 mb-4">
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
                        <h5 className="font-semibold text-blue-900">90°</h5>
                        <div className="text-2xl">📊</div>
                      </div>
                      <p className="text-sm text-blue-800 font-medium mb-1">Avaliação do Gestor</p>
                      <p className="text-xs text-blue-600">Apenas o gestor avalia o subordinado. Modelo mais simples e direto.</p>
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
                        <h5 className="font-semibold text-blue-900">180°</h5>
                        <div className="text-2xl">📈</div>
                      </div>
                      <p className="text-sm text-blue-800 font-medium mb-1">Gestor + Autoavaliação</p>
                      <p className="text-xs text-blue-600">O gestor avalia o subordinado e o colaborador faz autoavaliação.</p>
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
                        <h5 className="font-semibold text-blue-900">360°</h5>
                        <div className="text-2xl">🎯</div>
                      </div>
                      <p className="text-sm text-blue-800 font-medium mb-1">Avaliação Completa</p>
                      <p className="text-xs text-blue-600">Gestor, autoavaliação, pares, fornecedores e chefes indiretos podem avaliar.</p>
                    </button>
                  </div>
                  
                  {(formulario as any).tipoAvaliacaoDesempenho === '360' && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-2">Configurações adicionais para 360°:</p>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formulario.participantesConfig.incluirAvaliacaoGestor}
                            onChange={(e) => setFormulario(prev => ({
                              ...prev,
                              participantesConfig: {
                                ...prev.participantesConfig,
                                incluirAvaliacaoGestor: e.target.checked
                              }
                            }))}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-blue-800">Incluir avaliação do gestor direto</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formulario.participantesConfig.incluirAutoAvaliacao}
                            onChange={(e) => setFormulario(prev => ({
                              ...prev,
                              participantesConfig: {
                                ...prev.participantesConfig,
                                incluirAutoAvaliacao: e.target.checked
                              }
                            }))}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-blue-800">Incluir autoavaliação</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formulario.participantesConfig.incluirAvaliacaoPares}
                            onChange={(e) => setFormulario(prev => ({
                              ...prev,
                              participantesConfig: {
                                ...prev.participantesConfig,
                                incluirAvaliacaoPares: e.target.checked
                              }
                            }))}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-blue-800">Incluir avaliação de pares</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formulario.participantesConfig.incluirAvaliacaoSubordinados}
                            onChange={(e) => setFormulario(prev => ({
                              ...prev,
                              participantesConfig: {
                                ...prev.participantesConfig,
                                incluirAvaliacaoSubordinados: e.target.checked
                              }
                            }))}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-blue-800">Incluir avaliação de subordinados (se gestor)</span>
                        </label>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}
              </div>
            </div>
            )}

            {/* SEÇÃO 2: INFORMAÇÕES GERAIS DA AVALIAÇÃO */}
            {secaoAtual === 2 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Informações Gerais</h2>
                  <p className="text-sm text-gray-600">Defina código, nome, período e descrição da avaliação</p>
                </div>
              </div>

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
                    onChange={(e) => setFormulario(prev => ({ ...prev, dataFim: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formulario.tipo !== 'DESEMPENHO'}
                  />
                  {formulario.tipo === 'DESEMPENHO' && (
                    <p className="text-xs text-gray-500 mt-1">Opcional para avaliação de desempenho</p>
                  )}
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
            )}
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

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Competências</h3>
              <p className="text-sm text-gray-600 mb-4">Selecione as competências que serão avaliadas</p>
              
              {Object.entries(competenciasAgrupadas).map(([tipoNome, comps]) => (
                <div key={tipoNome} className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    {tipoNome}
                  </h4>
                  <div className="space-y-2">
                    {comps.map((competencia) => {
                      const isSelected = formulario.competenciasSelecionadas.includes(competencia.id);
                      return (
                        <label
                          key={competencia.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCompetenciaToggle(competencia.id)}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {competencia.competencia}
                            </p>
                            <p className={`text-xs mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                              {competencia.perguntaParaAvaliar}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {Object.keys(competenciasAgrupadas).length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhuma competência disponível</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
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

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Exigir justificativa para notas baixas</h4>
                    <p className="text-sm text-gray-500">Avaliadores devem justificar notas abaixo do mínimo</p>
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

                {formulario.configuracoesAvancadas.exigirJustificativaNotasBaixas && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nota mínima para justificativa</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formulario.configuracoesAvancadas.notaMinimaJustificativa}
                      onChange={(e) => setFormulario(prev => ({
                        ...prev,
                        configuracoesAvancadas: {
                          ...prev.configuracoesAvancadas,
                          notaMinimaJustificativa: parseInt(e.target.value) || 3
                        }
                      }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

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

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {currentStep === 1 && secaoAtual === 1 ? 'Continuar' : 'Próximo'}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando...' : 'Criar Avaliação'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CriacaoAvaliacaoWizard;