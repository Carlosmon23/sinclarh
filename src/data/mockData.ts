// Dados MOCK para o sistema de gestão de desempenho
import { 
  Empresa, 
  Usuario, 
  Cargo, 
  Colaborador, 
  Equipe, 
  TipoCompetencia, 
  EscalaCompetencia, 
  Competencia,
  AvaliacaoCiclo,
  AvaliacaoCompetenciasDoCiclo,
  AvaliacaoParticipante,
  RespostaAvaliacao,
  Filial
} from '../types';

// Empresa
export const mockEmpresa: Empresa = {
  id: 'emp-001',
  nome: 'TechCorp Soluções',
  cnpj: '12.345.678/0001-90',
  logo: undefined, // Logo será exibido via ícone SVG
  ativa: true,
  criadaEm: '2024-01-01T00:00:00Z',
  atualizadaEm: '2024-01-01T00:00:00Z'
};

// Filiais
export const mockFiliais: Filial[] = [
  {
    id: 'filial-001',
    codigo: 'FIL-SP',
    nome: 'São Paulo',
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'filial-002',
    codigo: 'FIL-RJ',
    nome: 'Rio de Janeiro',
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'filial-003',
    codigo: 'FIL-MG',
    nome: 'Belo Horizonte',
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  }
];

// Cargos
export const mockCargos: Cargo[] = [
  {
    id: 'cargo-001',
    codigo: 'DEV-SR',
    nome: 'Desenvolvedor Sênior',
    descricaoAtividade: 'Desenvolvimento de software, mentoria de desenvolvedores júnior',
    empresaId: 'emp-001',
    competenciasIds: ['comp-001', 'comp-002'],
    ativo: true,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cargo-002',
    codigo: 'GER-TI',
    nome: 'Gerente de TI',
    descricaoAtividade: 'Gestão da equipe de tecnologia, planejamento estratégico',
    empresaId: 'emp-001',
    competenciasIds: ['comp-001', 'comp-002', 'comp-003'],
    ativo: true,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cargo-003',
    codigo: 'ANA-RH',
    nome: 'Analista de RH',
    descricaoAtividade: 'Gestão de pessoas, recrutamento e seleção',
    empresaId: 'emp-001',
    competenciasIds: ['comp-003', 'comp-004'],
    ativo: true,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  }
];

// Colaboradores
export const mockColaboradores: Colaborador[] = [
  {
    id: 'colab-001',
    matricula: '001',
    nome: 'João Silva',
    email: 'joao.silva@techcorp.com',
    cpf: '123.456.789-01',
    dataAdmissao: '2023-01-15',
    situacao: 'ATIVO',
    cargoId: 'cargo-002',
    equipeId: 'equipe-001',
    setor: 'Tecnologia',
    gestor: true,
    isGestor: true, // Compatibility alias
    gestorId: undefined,
    empresaId: 'emp-001',
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'colab-002',
    matricula: '002',
    nome: 'Maria Santos',
    email: 'maria.santos@techcorp.com',
    cpf: '987.654.321-02',
    dataAdmissao: '2023-03-20',
    situacao: 'ATIVO',
    cargoId: 'cargo-001',
    equipeId: 'equipe-001',
    setor: 'Tecnologia',
    gestor: false,
    isGestor: false, // Compatibility alias
    gestorId: 'colab-001',
    empresaId: 'emp-001',
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'colab-003',
    matricula: '003',
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@techcorp.com',
    cpf: '456.789.123-03',
    dataAdmissao: '2023-06-10',
    situacao: 'ATIVO',
    cargoId: 'cargo-001',
    equipeId: 'equipe-001',
    setor: 'Tecnologia',
    gestor: false,
    isGestor: false, // Compatibility alias
    gestorId: 'colab-001',
    empresaId: 'emp-001',
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'colab-004',
    matricula: '004',
    nome: 'Ana Costa',
    email: 'ana.costa@techcorp.com',
    cpf: '789.123.456-04',
    dataAdmissao: '2023-02-01',
    situacao: 'ATIVO',
    cargoId: 'cargo-003',
    equipeId: 'equipe-002',
    setor: 'Recursos Humanos',
    gestor: true,
    isGestor: true, // Compatibility alias
    gestorId: undefined,
    empresaId: 'emp-001',
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  }
];

// Usuários
export const mockUsuarios: Usuario[] = [
  {
    id: 'user-001',
    nome: 'Admin Sistema',
    username: 'admin',
    email: 'admin@techcorp.com',
    senha: '123456',
    perfil: 'ADMIN',
    empresaId: 'emp-001',
    ativo: true,
    dataInicio: '2024-01-01',
    dataFim: undefined,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-002',
    nome: 'João Silva',
    username: 'joao.silva',
    email: 'joao.silva@techcorp.com',
    senha: '123456',
    perfil: 'GESTOR',
    colaboradorId: 'colab-001',
    empresaId: 'emp-001',
    ativo: true,
    dataInicio: '2024-01-01',
    dataFim: undefined,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-003',
    nome: 'Maria Santos',
    username: 'maria.santos',
    email: 'maria.santos@techcorp.com',
    senha: '123456',
    perfil: 'COLABORADOR',
    colaboradorId: 'colab-002',
    empresaId: 'emp-001',
    ativo: true,
    dataInicio: '2024-01-01',
    dataFim: undefined,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-004',
    nome: 'Ana Costa',
    username: 'ana.costa',
    email: 'ana.costa@techcorp.com',
    senha: '123456',
    perfil: 'GESTOR',
    colaboradorId: 'colab-004',
    empresaId: 'emp-001',
    ativo: true,
    dataInicio: '2024-01-01',
    dataFim: undefined,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  }
];

// Equipes
export const mockEquipes: Equipe[] = [
  {
    id: 'equipe-001',
    codigo: 'TI-001',
    nome: 'Equipe de Desenvolvimento',
    equipeSuperiorId: undefined,
    gestorId: 'colab-001',
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'equipe-002',
    codigo: 'RH-001',
    nome: 'Equipe de Recursos Humanos',
    equipeSuperiorId: undefined,
    gestorId: 'colab-004',
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  }
];

// Tipos de Competência
export const mockTiposCompetencia: TipoCompetencia[] = [
  {
    id: 'tipo-001',
    nome: 'TECNICA',
    descricao: 'Competências técnicas específicas do cargo',
    empresaId: 'emp-001',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tipo-002',
    nome: 'COMPORTAMENTAL',
    descricao: 'Competências comportamentais e soft skills',
    empresaId: 'emp-001',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tipo-003',
    nome: 'CLIMA',
    descricao: 'Competências relacionadas ao clima organizacional',
    empresaId: 'emp-001',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00Z',
    atualizadoEm: '2024-01-01T00:00:00Z'
  }
];

// Escalas de Competência
export const mockEscalasCompetencia: EscalaCompetencia[] = [
  {
    id: 'escala-001',
    codigo: 'PDR',
    tipo: 'AVALIACAO_DESEMPENHO',
    nome: 'Padrão',
    notas: [
      {
        id: 'nota-001',
        nota: 'Insuficiente',
        peso: 1,
        escalaId: 'escala-001',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-002',
        nota: 'Adequado',
        peso: 2,
        escalaId: 'escala-001',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-003',
        nota: 'Bom',
        peso: 3,
        escalaId: 'escala-001',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-004',
        nota: 'Excelente',
        peso: 4,
        escalaId: 'escala-001',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      }
    ],
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Escala para OnBoarding
  {
    id: 'escala-005',
    codigo: 'ON-PDR',
    tipo: 'ONBOARDING',
    nome: 'Padrão',
    notas: [
      {
        id: 'nota-005',
        nota: 'Insuficiente',
        peso: 1,
        escalaId: 'escala-005',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-006',
        nota: 'Adequado',
        peso: 2,
        escalaId: 'escala-005',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-007',
        nota: 'Bom',
        peso: 3,
        escalaId: 'escala-005',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-008',
        nota: 'Excelente',
        peso: 4,
        escalaId: 'escala-005',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      }
    ],
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Escala para OffBoarding
  {
    id: 'escala-009',
    codigo: 'OFF-PDR',
    tipo: 'OFFBOARDING',
    nome: 'Padrão',
    notas: [
      {
        id: 'nota-009',
        nota: 'Insatisfeito',
        peso: 1,
        escalaId: 'escala-009',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-010',
        nota: 'Neutro',
        peso: 2,
        escalaId: 'escala-009',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-011',
        nota: 'Satisfeito',
        peso: 3,
        escalaId: 'escala-009',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-012',
        nota: 'Muito Satisfeito',
        peso: 4,
        escalaId: 'escala-009',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      }
    ],
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Escala para Avaliação Direcionada
  {
    id: 'escala-013',
    codigo: 'DIR-PDR',
    tipo: 'AVALIACAO_DIRECIONADA',
    nome: 'Padrão',
    notas: [
      {
        id: 'nota-013',
        nota: 'Insuficiente',
        peso: 1,
        escalaId: 'escala-013',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-014',
        nota: 'Adequado',
        peso: 2,
        escalaId: 'escala-013',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-015',
        nota: 'Bom',
        peso: 3,
        escalaId: 'escala-013',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-016',
        nota: 'Excelente',
        peso: 4,
        escalaId: 'escala-013',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      }
    ],
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Escala para Pesquisa
  {
    id: 'escala-017',
    codigo: 'PES-PDR',
    tipo: 'PESQUISA',
    nome: 'Padrão',
    notas: [
      {
        id: 'nota-017',
        nota: 'Discordo Totalmente',
        peso: 1,
        escalaId: 'escala-017',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-018',
        nota: 'Discordo',
        peso: 2,
        escalaId: 'escala-017',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-019',
        nota: 'Neutro',
        peso: 3,
        escalaId: 'escala-017',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-020',
        nota: 'Concordo',
        peso: 4,
        escalaId: 'escala-017',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-021',
        nota: 'Concordo Totalmente',
        peso: 5,
        escalaId: 'escala-017',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      }
    ],
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Escala para Feedback
  {
    id: 'escala-022',
    codigo: 'FB-PDR',
    tipo: 'FEEDBACK',
    nome: 'Padrão',
    notas: [
      {
        id: 'nota-022',
        nota: 'Precisa Melhorar',
        peso: 1,
        escalaId: 'escala-022',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-023',
        nota: 'Adequado',
        peso: 2,
        escalaId: 'escala-022',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-024',
        nota: 'Bom',
        peso: 3,
        escalaId: 'escala-022',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      },
      {
        id: 'nota-025',
        nota: 'Excelente',
        peso: 4,
        escalaId: 'escala-022',
        criadaEm: '2024-01-01T00:00:00Z',
        atualizadaEm: '2024-01-01T00:00:00Z'
      }
    ],
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  }
];

// Competências
export const mockCompetencias: Competencia[] = [
  {
    id: 'comp-001',
    tipoCompetenciaId: 'tipo-001',
    competencia: 'Conhecimento Técnico',
    nome: 'Conhecimento Técnico', // Compatibility alias
    perguntaParaAvaliar: 'Como você avalia o conhecimento técnico do colaborador em sua área de atuação?',
    pergunta: 'Como você avalia o conhecimento técnico do colaborador em sua área de atuação?', // Compatibility alias
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-002',
    tipoCompetenciaId: 'tipo-001',
    competencia: 'Resolução de Problemas',
    nome: 'Resolução de Problemas', // Compatibility alias
    perguntaParaAvaliar: 'Como você avalia a capacidade do colaborador em resolver problemas complexos?',
    pergunta: 'Como você avalia a capacidade do colaborador em resolver problemas complexos?', // Compatibility alias
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-003',
    tipoCompetenciaId: 'tipo-002',
    competencia: 'Comunicação',
    nome: 'Comunicação', // Compatibility alias
    perguntaParaAvaliar: 'Como você avalia a capacidade de comunicação do colaborador?',
    pergunta: 'Como você avalia a capacidade de comunicação do colaborador?', // Compatibility alias
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-004',
    tipoCompetenciaId: 'tipo-002',
    competencia: 'Trabalho em Equipe',
    nome: 'Trabalho em Equipe', // Compatibility alias
    perguntaParaAvaliar: 'Como você avalia a capacidade do colaborador em trabalhar em equipe?',
    pergunta: 'Como você avalia a capacidade do colaborador em trabalhar em equipe?', // Compatibility alias
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-005',
    tipoCompetenciaId: 'tipo-002',
    competencia: 'Adaptabilidade',
    nome: 'Adaptabilidade', // Compatibility alias
    perguntaParaAvaliar: 'Como você avalia a capacidade do colaborador em se adaptar a mudanças?',
    pergunta: 'Como você avalia a capacidade do colaborador em se adaptar a mudanças?', // Compatibility alias
    empresaId: 'emp-001',
    ativa: true,
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  }
];

// Ciclos de Avaliação
export const mockAvaliacoesCiclo: AvaliacaoCiclo[] = [
  {
    id: 'ciclo-001',
    nome: 'Avaliação de Desempenho 2024 - 1º Semestre',
    descricao: 'Avaliação semestral de desempenho dos colaboradores',
    tipo: 'DESEMPENHO',
    tipoAvaliacao: '360',
    dataInicio: '2024-01-01',
    dataLimite: '2024-01-31',
    dataFim: '2024-01-31', // Compatibility alias
    status: 'EM_ANDAMENTO',
    incluiTecnica: true,
    incluiComportamental: true,
    escalaId: 'escala-001',
    competenciasSelecionadas: ['comp-001', 'comp-002', 'comp-003', 'comp-004'],
    instrucoes: 'Avalie cada competência de acordo com o desempenho observado no período.',
    empresaId: 'emp-001',
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ciclo-002',
    nome: 'Pesquisa de Clima 2024',
    descricao: 'Pesquisa anual de clima organizacional',
    tipo: 'CLIMA',
    tipoAvaliacao: '90',
    dataInicio: '2024-02-01',
    dataLimite: '2024-02-15',
    dataFim: '2024-02-15', // Compatibility alias
    status: 'FINALIZADA',
    incluiTecnica: false,
    incluiComportamental: false,
    escalaId: 'escala-001',
    competenciasSelecionadas: [],
    instrucoes: 'Responda com sinceridade sobre sua percepção do ambiente de trabalho.',
    empresaId: 'emp-001',
    criadaEm: '2024-02-01T00:00:00Z',
    atualizadaEm: '2024-02-15T00:00:00Z'
  },
  // Ciclos adicionais para testes
  {
    id: 'ciclo-003',
    nome: 'Programa de Onboarding Q4 2024',
    descricao: 'Avaliação de integração de novos colaboradores durante o onboarding',
    tipo: 'ONBOARDING',
    tipoAvaliacao: '90',
    dataInicio: '2024-10-01',
    dataLimite: '2024-10-31',
    dataFim: '2024-10-31',
    status: 'CRIADA',
    incluiTecnica: false,
    incluiComportamental: true,
    escalaId: 'escala-001',
    competenciasSelecionadas: ['comp-003', 'comp-005'],
    instrucoes: 'Foque em adaptação, comunicação e entendimento da cultura.',
    empresaId: 'emp-001',
    criadaEm: '2024-09-25T00:00:00Z',
    atualizadaEm: '2024-09-25T00:00:00Z'
  },
  {
    id: 'ciclo-004',
    nome: 'Avaliação de Offboarding Outubro 2024',
    descricao: 'Coleta de feedback de colaboradores em processo de desligamento',
    tipo: 'OFFBOARDING',
    tipoAvaliacao: '180',
    dataInicio: '2024-10-15',
    dataLimite: '2024-11-15',
    dataFim: '2024-11-15',
    status: 'EM_ANDAMENTO',
    incluiTecnica: false,
    incluiComportamental: true,
    escalaId: 'escala-001',
    competenciasSelecionadas: ['comp-003', 'comp-004', 'comp-005'],
    instrucoes: 'Avalie transição de conhecimento e colaboração até a saída.',
    empresaId: 'emp-001',
    criadaEm: '2024-10-15T00:00:00Z',
    atualizadaEm: '2024-10-20T00:00:00Z'
  },
  {
    id: 'ciclo-005',
    nome: 'Feedback Contínuo 2024',
    descricao: 'Ciclo contínuo para feedback comportamental recorrente',
    tipo: 'FEEDBACK',
    tipoAvaliacao: '360',
    dataInicio: '2024-09-01',
    dataLimite: '2024-12-31',
    dataFim: '2024-12-31',
    status: 'EM_ANDAMENTO',
    incluiTecnica: false,
    incluiComportamental: true,
    escalaId: 'escala-001',
    competenciasSelecionadas: ['comp-003', 'comp-004'],
    instrucoes: 'Priorizar comportamentos, colaboração e comunicação no dia a dia.',
    empresaId: 'emp-001',
    criadaEm: '2024-09-01T00:00:00Z',
    atualizadaEm: '2024-10-01T00:00:00Z'
  },
  {
    id: 'ciclo-006',
    nome: 'Pesquisa de Engajamento 2024',
    descricao: 'Pesquisa rápida de engajamento e satisfação',
    tipo: 'PESQUISA',
    tipoAvaliacao: '90',
    dataInicio: '2024-11-01',
    dataLimite: '2024-11-15',
    dataFim: '2024-11-15',
    status: 'EM_ANDAMENTO',
    incluiTecnica: false,
    incluiComportamental: false,
    escalaId: 'escala-017',
    competenciasSelecionadas: [],
    instrucoes: 'Responda anonimamente sobre motivação e percepção geral.',
    empresaId: 'emp-001',
    criadaEm: '2024-11-01T00:00:00Z',
    atualizadaEm: '2024-11-01T00:00:00Z'
  },
  // Avaliação Direcionada
  {
    id: 'ciclo-007',
    nome: 'Avaliação Direcionada - Competências Técnicas Q4 2024',
    descricao: 'Avaliação focada em competências técnicas específicas',
    tipo: 'AVALIACAO_DIRECIONADA',
    tipoAvaliacao: '180',
    dataInicio: '2024-10-01',
    dataLimite: '2024-10-31',
    dataFim: '2024-10-31',
    status: 'EM_ANDAMENTO',
    incluiTecnica: true,
    incluiComportamental: false,
    escalaId: 'escala-013',
    competenciasSelecionadas: ['comp-001', 'comp-002'],
    instrucoes: 'Avalie as competências técnicas selecionadas.',
    empresaId: 'emp-001',
    criadaEm: '2024-09-25T00:00:00Z',
    atualizadaEm: '2024-10-01T00:00:00Z'
  },
  // Onboarding
  {
    id: 'ciclo-008',
    nome: 'Avaliação de Onboarding - Novos Colaboradores Outubro 2024',
    descricao: 'Avaliação de integração de novos colaboradores',
    tipo: 'ONBOARDING',
    tipoAvaliacao: '90',
    dataInicio: '2024-10-15',
    dataLimite: '2024-11-15',
    dataFim: '2024-11-15',
    status: 'EM_ANDAMENTO',
    incluiTecnica: false,
    incluiComportamental: true,
    escalaId: 'escala-005',
    competenciasSelecionadas: ['comp-003', 'comp-005'],
    instrucoes: 'Avalie a adaptação e integração do novo colaborador.',
    empresaId: 'emp-001',
    criadaEm: '2024-10-10T00:00:00Z',
    atualizadaEm: '2024-10-15T00:00:00Z'
  },
  // Offboarding
  {
    id: 'ciclo-009',
    nome: 'Avaliação de Offboarding - Novembro 2024',
    descricao: 'Coleta de feedback de colaboradores em processo de desligamento',
    tipo: 'OFFBOARDING',
    tipoAvaliacao: '90',
    dataInicio: '2024-11-01',
    dataLimite: '2024-11-30',
    dataFim: '2024-11-30',
    status: 'EM_ANDAMENTO',
    incluiTecnica: false,
    incluiComportamental: true,
    escalaId: 'escala-009',
    competenciasSelecionadas: ['comp-003', 'comp-004'],
    instrucoes: 'Avalie sua experiência durante o período na empresa.',
    empresaId: 'emp-001',
    criadaEm: '2024-10-25T00:00:00Z',
    atualizadaEm: '2024-11-01T00:00:00Z'
  },
  // Feedback
  {
    id: 'ciclo-010',
    nome: 'Feedback Contínuo - Outubro 2024',
    descricao: 'Feedback contínuo sobre desempenho e desenvolvimento',
    tipo: 'FEEDBACK',
    tipoAvaliacao: '360',
    dataInicio: '2024-10-01',
    dataLimite: '2024-10-31',
    dataFim: '2024-10-31',
    status: 'EM_ANDAMENTO',
    incluiTecnica: false,
    incluiComportamental: true,
    escalaId: 'escala-022',
    competenciasSelecionadas: ['comp-003', 'comp-004'],
    instrucoes: 'Forneça feedback construtivo sobre o desempenho.',
    empresaId: 'emp-001',
    criadaEm: '2024-09-30T00:00:00Z',
    atualizadaEm: '2024-10-01T00:00:00Z'
  }
];

// Competências do Ciclo
export const mockAvaliacaoCompetenciasDoCiclo: AvaliacaoCompetenciasDoCiclo[] = [
  {
    id: 'acc-001',
    avaliacaoCicloId: 'ciclo-001',
    competenciaId: 'comp-001',
    obrigatoria: true,
    peso: 1,
    criadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'acc-002',
    avaliacaoCicloId: 'ciclo-001',
    competenciaId: 'comp-002',
    obrigatoria: true,
    peso: 1,
    criadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'acc-003',
    avaliacaoCicloId: 'ciclo-001',
    competenciaId: 'comp-003',
    obrigatoria: true,
    peso: 1,
    criadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'acc-004',
    avaliacaoCicloId: 'ciclo-001',
    competenciaId: 'comp-004',
    obrigatoria: true,
    peso: 1,
    criadaEm: '2024-01-01T00:00:00Z'
  }
];

// Participantes da Avaliação
export const mockAvaliacaoParticipantes: AvaliacaoParticipante[] = [
  // Avaliações do gestor João Silva (colab-001) para seus subordinados
  {
    id: 'part-001',
    avaliacaoCicloId: 'ciclo-001',
    avaliadorId: 'colab-001',
    avaliadoId: 'colab-002',
    status: 'EM_RASCUNHO',
    dataInicio: '2024-01-01T00:00:00Z',
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'part-002',
    avaliacaoCicloId: 'ciclo-001',
    avaliadorId: 'colab-001',
    avaliadoId: 'colab-003',
    status: 'PENDENTE',
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Autoavaliações dos colaboradores
  {
    id: 'part-003',
    avaliacaoCicloId: 'ciclo-001',
    avaliadorId: 'colab-002',
    avaliadoId: 'colab-002',
    status: 'CONCLUIDA',
    dataInicio: '2024-01-01T00:00:00Z',
    dataFinalizacao: '2024-01-05T00:00:00Z',
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-05T00:00:00Z'
  },
  {
    id: 'part-004',
    avaliacaoCicloId: 'ciclo-001',
    avaliadorId: 'colab-003',
    avaliadoId: 'colab-003',
    status: 'PENDENTE',
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Avaliação da gestora Ana Costa (colab-004) - RH
  {
    id: 'part-005',
    avaliacaoCicloId: 'ciclo-001',
    avaliadorId: 'colab-004',
    avaliadoId: 'colab-004',
    status: 'EM_RASCUNHO',
    dataInicio: '2024-01-01T00:00:00Z',
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Avaliações cruzadas (peer review)
  {
    id: 'part-006',
    avaliacaoCicloId: 'ciclo-001',
    avaliadorId: 'colab-002',
    avaliadoId: 'colab-003',
    status: 'PENDENTE',
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  {
    id: 'part-007',
    avaliacaoCicloId: 'ciclo-001',
    avaliadorId: 'colab-003',
    avaliadoId: 'colab-002',
    status: 'PENDENTE',
    criadaEm: '2024-01-01T00:00:00Z',
    atualizadaEm: '2024-01-01T00:00:00Z'
  },
  // Participantes para Avaliação Direcionada (ciclo-007)
  {
    id: 'part-008',
    avaliacaoCicloId: 'ciclo-007',
    avaliadorId: 'colab-001',
    avaliadoId: 'colab-002',
    status: 'PENDENTE',
    criadaEm: '2024-10-01T00:00:00Z',
    atualizadaEm: '2024-10-01T00:00:00Z'
  },
  {
    id: 'part-009',
    avaliacaoCicloId: 'ciclo-007',
    avaliadorId: 'colab-002',
    avaliadoId: 'colab-002',
    status: 'PENDENTE',
    criadaEm: '2024-10-01T00:00:00Z',
    atualizadaEm: '2024-10-01T00:00:00Z'
  },
  // Participantes para Onboarding (ciclo-008)
  {
    id: 'part-010',
    avaliacaoCicloId: 'ciclo-008',
    avaliadorId: 'colab-001',
    avaliadoId: 'colab-002',
    status: 'PENDENTE',
    criadaEm: '2024-10-15T00:00:00Z',
    atualizadaEm: '2024-10-15T00:00:00Z'
  },
  {
    id: 'part-011',
    avaliacaoCicloId: 'ciclo-008',
    avaliadorId: 'colab-001',
    avaliadoId: 'colab-003',
    status: 'PENDENTE',
    criadaEm: '2024-10-15T00:00:00Z',
    atualizadaEm: '2024-10-15T00:00:00Z'
  },
  // Participantes para Offboarding (ciclo-009)
  {
    id: 'part-012',
    avaliacaoCicloId: 'ciclo-009',
    avaliadorId: 'colab-002',
    avaliadoId: 'colab-002',
    status: 'PENDENTE',
    criadaEm: '2024-11-01T00:00:00Z',
    atualizadaEm: '2024-11-01T00:00:00Z'
  },
  // Participantes para Feedback (ciclo-010)
  {
    id: 'part-013',
    avaliacaoCicloId: 'ciclo-010',
    avaliadorId: 'colab-001',
    avaliadoId: 'colab-002',
    status: 'PENDENTE',
    criadaEm: '2024-10-01T00:00:00Z',
    atualizadaEm: '2024-10-01T00:00:00Z'
  },
  {
    id: 'part-014',
    avaliacaoCicloId: 'ciclo-010',
    avaliadorId: 'colab-002',
    avaliadoId: 'colab-003',
    status: 'PENDENTE',
    criadaEm: '2024-10-01T00:00:00Z',
    atualizadaEm: '2024-10-01T00:00:00Z'
  },
  // Participantes para Pesquisa (ciclo-006)
  {
    id: 'part-015',
    avaliacaoCicloId: 'ciclo-006',
    avaliadorId: 'colab-001',
    avaliadoId: 'colab-001',
    status: 'PENDENTE',
    criadaEm: '2024-11-01T00:00:00Z',
    atualizadaEm: '2024-11-01T00:00:00Z'
  },
  {
    id: 'part-016',
    avaliacaoCicloId: 'ciclo-006',
    avaliadorId: 'colab-002',
    avaliadoId: 'colab-002',
    status: 'PENDENTE',
    criadaEm: '2024-11-01T00:00:00Z',
    atualizadaEm: '2024-11-01T00:00:00Z'
  },
  {
    id: 'part-017',
    avaliacaoCicloId: 'ciclo-006',
    avaliadorId: 'colab-003',
    avaliadoId: 'colab-003',
    status: 'PENDENTE',
    criadaEm: '2024-11-01T00:00:00Z',
    atualizadaEm: '2024-11-01T00:00:00Z'
  },
  {
    id: 'part-018',
    avaliacaoCicloId: 'ciclo-006',
    avaliadorId: 'colab-004',
    avaliadoId: 'colab-004',
    status: 'PENDENTE',
    criadaEm: '2024-11-01T00:00:00Z',
    atualizadaEm: '2024-11-01T00:00:00Z'
  }
];

// Respostas das Avaliações
export const mockRespostasAvaliacao: RespostaAvaliacao[] = [
  {
    id: 'resp-001',
    avaliacaoParticipanteId: 'part-002',
    competenciaId: 'comp-001',
    nota: 3,
    justificativa: 'Demonstra bom conhecimento técnico, sempre busca se atualizar.',
    criadaEm: '2024-01-05T00:00:00Z',
    atualizadaEm: '2024-01-05T00:00:00Z'
  },
  {
    id: 'resp-002',
    avaliacaoParticipanteId: 'part-002',
    competenciaId: 'comp-002',
    nota: 4,
    justificativa: 'Excelente capacidade de resolver problemas complexos de forma criativa.',
    criadaEm: '2024-01-05T00:00:00Z',
    atualizadaEm: '2024-01-05T00:00:00Z'
  },
  {
    id: 'resp-003',
    avaliacaoParticipanteId: 'part-002',
    competenciaId: 'comp-003',
    nota: 3,
    justificativa: 'Comunica-se bem com a equipe, poderia melhorar apresentações.',
    criadaEm: '2024-01-05T00:00:00Z',
    atualizadaEm: '2024-01-05T00:00:00Z'
  },
  {
    id: 'resp-004',
    avaliacaoParticipanteId: 'part-002',
    competenciaId: 'comp-004',
    nota: 4,
    justificativa: 'Trabalha muito bem em equipe, sempre colaborativo.',
    criadaEm: '2024-01-05T00:00:00Z',
    atualizadaEm: '2024-01-05T00:00:00Z'
  }
];

// Função para inicializar dados no localStorage
export const initializeMockData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('empresa', JSON.stringify(mockEmpresa));
    localStorage.setItem('usuarios', JSON.stringify(mockUsuarios));
    localStorage.setItem('cargos', JSON.stringify(mockCargos));
    localStorage.setItem('colaboradores', JSON.stringify(mockColaboradores));
    localStorage.setItem('equipes', JSON.stringify(mockEquipes));
    localStorage.setItem('tiposCompetencia', JSON.stringify(mockTiposCompetencia));
    localStorage.setItem('escalasCompetencia', JSON.stringify(mockEscalasCompetencia));
    localStorage.setItem('competencias', JSON.stringify(mockCompetencias));
    localStorage.setItem('avaliacoesCiclo', JSON.stringify(mockAvaliacoesCiclo));
    localStorage.setItem('avaliacaoCompetenciasDoCiclo', JSON.stringify(mockAvaliacaoCompetenciasDoCiclo));
    localStorage.setItem('avaliacaoParticipantes', JSON.stringify(mockAvaliacaoParticipantes));
    localStorage.setItem('respostasAvaliacao', JSON.stringify(mockRespostasAvaliacao));
  }
};