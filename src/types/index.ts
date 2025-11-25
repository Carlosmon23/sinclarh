// Tipos principais do sistema de gestão de desempenho

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  username?: string; // New field for alternative login
  senha: string;
  perfil: 'ADMIN' | 'GESTOR' | 'COLABORADOR';
  colaboradorId?: string;
  empresaId: string;
  ativo: boolean; // User status control
  dataInicio: string; // Access start date (mandatory)
  dataFim?: string; // Access end date (optional)
  criadoEm: string;
  atualizadoEm: string;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  logo?: string; // Company logo URL
  ativa: boolean;
  criadaEm: string;
  atualizadaEm: string;
}

export interface Filial {
  id: string;
  codigo: string;
  nome: string;
  empresaId: string;
  ativa: boolean;
  criadaEm: string;
  atualizadaEm: string;
}

export interface Cargo {
  id: string;
  codigo: string;
  nome: string;
  descricaoAtividade: string;
  competenciasIds: string[]; // New field for competency linking
  empresaId: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Colaborador {
  id: string;
  matricula: string;
  nome: string;
  cpf: string;
  email: string; // New field for professional email
  dataAdmissao: string;
  dataDemissao?: string;
  situacao: 'ATIVO' | 'DESLIGADO';
  cargoId: string;
  cargo?: Cargo;
  equipeId: string; // New field for team assignment
  setor: string; // New field for department/area
  filialId?: string; // New field for branch/filial assignment
  gestor: boolean;
  isGestor: boolean; // Alias for gestor for compatibility
  gestorId?: string; // For referencing manager
  empresaId: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Equipe {
  id: string;
  codigo: string;
  nome: string;
  gestorId: string;
  gestor?: Colaborador;
  membros?: Colaborador[];
  equipeSuperiorId?: string; // New field for parent team hierarchy
  empresaId: string;
  ativa: boolean;
  criadaEm: string;
  atualizadaEm: string;
}

export interface TipoCompetencia {
  id: string;
  nome: string;
  descricao: string;
  empresaId: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface NotaEscala {
  id: string;
  nota: string; // Nome da nota (ex: "Insuficiente", "Adequado", "Bom")
  peso: number; // Peso da nota (ex: 1, 2, 3)
  escalaId: string;
  criadaEm: string;
  atualizadaEm: string;
}

export interface EscalaCompetencia {
  id: string;
  codigo: string; // New field for scale code
  tipo: 'AVALIACAO_DESEMPENHO' | 'AVALIACAO_DIRECIONADA' | 'ONBOARDING' | 'OFFBOARDING' | 'FEEDBACK' | 'PESQUISA'; // New field for scale type
  nome: string;
  notas: NotaEscala[]; // Lista de notas da escala
  empresaId: string;
  ativa: boolean;
  criadaEm: string;
  atualizadaEm: string;
  // Campos legados para compatibilidade (deprecated)
  peso?: number;
  descricao?: string;
}

export interface Competencia {
  id: string;
  tipoCompetenciaId: string;
  tipoCompetencia?: TipoCompetencia;
  competencia: string;
  nome: string; // Alias for competencia for compatibility
  perguntaParaAvaliar: string;
  pergunta: string; // Alias for perguntaParaAvaliar for compatibility
  ativa: boolean; // New field for active/inactive status
  empresaId: string;
  criadaEm: string;
  atualizadaEm: string;
}

export interface AvaliacaoCiclo {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'DESEMPENHO' | 'CLIMA' | 'ONBOARDING' | 'OFFBOARDING' | 'FEEDBACK' | 'PESQUISA' | 'AVALIACAO_DIRECIONADA'; // Extended types
  tipoAvaliacao: '90' | '180' | '360';
  dataInicio: string;
  dataLimite: string;
  dataFim: string; // Alias for dataLimite for compatibility
  status: 'CRIADA' | 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA';
  incluiTecnica: boolean;
  incluiComportamental: boolean;
  escalaId: string;
  escala?: EscalaCompetencia;
  competenciasSelecionadas?: string[];
  instrucoes?: string;
  empresaId: string;
  criadaEm: string;
  atualizadaEm: string;
}

export interface AvaliacaoCompetenciasDoCiclo {
  id: string;
  avaliacaoCicloId: string;
  competenciaId: string;
  competencia?: Competencia;
  obrigatoria: boolean;
  peso: number;
  criadaEm: string;
}

export interface AvaliacaoParticipante {
  id: string;
  avaliacaoCicloId: string;
  avaliacaoCiclo?: AvaliacaoCiclo;
  avaliadorId: string;
  avaliador?: Colaborador;
  avaliadoId: string;
  avaliado?: Colaborador;
  status: 'PENDENTE' | 'EM_RASCUNHO' | 'CONCLUIDA';
  dataInicio?: string;
  dataFinalizacao?: string;
  criadaEm: string;
  atualizadaEm: string;
}

export interface RespostaAvaliacao {
  id: string;
  avaliacaoParticipanteId: string;
  competenciaId: string;
  competencia?: Competencia;
  nota: number;
  justificativa?: string;
  criadaEm: string;
  atualizadaEm: string;
}

// Tipos para relatórios
export interface RelatorioFiltros {
  cicloId?: string;
  departamento?: string;
  cargoId?: string;
  colaboradorId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface DadosRelatorio {
  titulo: string;
  tipo: 'DESEMPENHO' | 'CLIMA' | 'OFFBOARDING';
  dados: any;
  geradoEm: string;
}

// Tipos para autenticação
export interface AuthState {
  usuario: Usuario | null;
  empresa: Empresa | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Export CicloAvaliacao as alias for AvaliacaoCiclo for compatibility
export type CicloAvaliacao = AvaliacaoCiclo;

// Tipos para formulários
export interface FormErrors {
  [key: string]: string;
}

export interface SelectOption {
  value: string;
  label: string;
}