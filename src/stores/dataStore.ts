import { create } from 'zustand';
import { 
  Cargo, 
  Colaborador, 
  Equipe, 
  TipoCompetencia, 
  EscalaCompetencia, 
  Competencia,
  AvaliacaoCiclo,
  AvaliacaoParticipante,
  RespostaAvaliacao,
  Usuario,
  CicloAvaliacao
} from '../types';
import { mockAvaliacoesCiclo } from '../data/mockData';

interface DataStore {
  // Estados
  cargos: Cargo[];
  colaboradores: Colaborador[];
  equipes: Equipe[];
  tiposCompetencia: TipoCompetencia[];
  escalasCompetencia: EscalaCompetencia[];
  competencias: Competencia[];
  avaliacoesCiclo: AvaliacaoCiclo[];
  ciclosAvaliacao: CicloAvaliacao[]; // Alias for avaliacoesCiclo
  avaliacoes: AvaliacaoCiclo[]; // Another alias for avaliacoesCiclo
  avaliacaoParticipantes: AvaliacaoParticipante[];
  respostasAvaliacao: RespostaAvaliacao[];
  respostasAvaliacoes: RespostaAvaliacao[]; // Alias for respostasAvaliacao
  usuarios: Usuario[];
  
  // Actions para Cargos
  loadCargos: () => void;
  addCargo: (cargo: Omit<Cargo, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  updateCargo: (id: string, cargo: Partial<Cargo>) => void;
  deleteCargo: (id: string) => void;
  getCompetenciasByCargo: (cargoId: string) => Competencia[];
  
  // Actions para Colaboradores
  loadColaboradores: () => void;
  addColaborador: (colaborador: Omit<Colaborador, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  updateColaborador: (id: string, colaborador: Partial<Colaborador>) => void;
  deleteColaborador: (id: string) => void;
  getColaboradoresByEquipe: (equipeId: string) => Colaborador[];
  getColaboradoresByGestor: (gestorId: string) => Colaborador[];
  getColaboradoresByManagerHierarchy: (managerId: string) => Colaborador[];
  getEquipesByManagerHierarchy: (managerId: string) => Equipe[];
  
  // Actions para Equipes
  loadEquipes: () => void;
  addEquipe: (equipe: Omit<Equipe, 'id' | 'criadaEm' | 'atualizadaEm'>) => void;
  updateEquipe: (id: string, equipe: Partial<Equipe>) => void;
  deleteEquipe: (id: string) => void;
  getEquipesByEquipeSuperior: (equipeSuperiorId: string) => Equipe[];
  validateEquipeHierarchy: (equipeId: string, equipeSuperiorId?: string) => boolean;
  
  // Actions para Tipos de Competência
  loadTiposCompetencia: () => void;
  addTipoCompetencia: (tipo: Omit<TipoCompetencia, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  updateTipoCompetencia: (id: string, tipo: Partial<TipoCompetencia>) => void;
  deleteTipoCompetencia: (id: string) => void;
  
  // Actions para Escalas de Competência
  loadEscalasCompetencia: () => void;
  addEscalaCompetencia: (escala: Omit<EscalaCompetencia, 'id' | 'criadaEm' | 'atualizadaEm'>) => void;
  updateEscalaCompetencia: (id: string, escala: Partial<EscalaCompetencia>) => void;
  deleteEscalaCompetencia: (id: string) => void;
  
  // Actions para Competências
  loadCompetencias: () => void;
  addCompetencia: (competencia: Omit<Competencia, 'id' | 'criadaEm' | 'atualizadaEm'>) => void;
  updateCompetencia: (id: string, competencia: Partial<Competencia>) => void;
  deleteCompetencia: (id: string) => void;
  canDeleteCompetencia: (competenciaId: string) => boolean;
  
  // Actions para Avaliações
  loadAvaliacoesCiclo: () => void;
  addAvaliacaoCiclo: (avaliacao: Omit<AvaliacaoCiclo, 'id' | 'criadaEm' | 'atualizadaEm'>) => void;
  addAvaliacao: (avaliacao: Omit<AvaliacaoCiclo, 'id' | 'criadaEm' | 'atualizadaEm'>) => void; // Alias for addAvaliacaoCiclo
  addCicloAvaliacao: (avaliacao: Omit<AvaliacaoCiclo, 'id' | 'criadaEm' | 'atualizadaEm'>) => void; // Alias for addAvaliacaoCiclo
  updateAvaliacaoCiclo: (id: string, avaliacao: Partial<AvaliacaoCiclo>) => void;
  updateCicloAvaliacao: (id: string, avaliacao: Partial<AvaliacaoCiclo>) => void; // Alias for updateAvaliacaoCiclo
  deleteAvaliacaoCiclo: (id: string) => void;
  deleteCicloAvaliacao: (id: string) => void; // Alias for deleteAvaliacaoCiclo
  
  // Actions para Participantes
  loadAvaliacaoParticipantes: () => void;
  addAvaliacaoParticipante: (participante: Omit<AvaliacaoParticipante, 'id' | 'criadaEm' | 'atualizadaEm'>) => void;
  updateAvaliacaoParticipante: (id: string, participante: Partial<AvaliacaoParticipante>) => void;
  
  // Actions para Respostas
  loadRespostasAvaliacao: () => void;
  addRespostaAvaliacao: (resposta: Omit<RespostaAvaliacao, 'id' | 'criadaEm' | 'atualizadaEm'>) => void;
  updateRespostaAvaliacao: (id: string, resposta: Partial<RespostaAvaliacao>) => void;
  
  // Actions para Usuários
  loadUsuarios: () => void;
  addUsuario: (usuario: Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
  validateUsuarioAccess: (usuarioId: string) => boolean;
  getUsuarioByUsernameOrEmail: (login: string) => Usuario | undefined;
  
  // Inicialização
  initialize: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const getCurrentTimestamp = () => new Date().toISOString();

export const useDataStore = create<DataStore>((set, get) => ({
  // Estados iniciais
  cargos: [],
  colaboradores: [],
  equipes: [],
  tiposCompetencia: [],
  escalasCompetencia: [],
  competencias: [],
  avaliacoesCiclo: [],
  get ciclosAvaliacao() { return get().avaliacoesCiclo; }, // Alias getter
  get avaliacoes() { return get().avaliacoesCiclo; }, // Alias getter
  avaliacaoParticipantes: [],
  respostasAvaliacao: [],
  get respostasAvaliacoes() { return get().respostasAvaliacao; }, // Alias getter
  usuarios: [],

  // Cargos
  loadCargos: () => {
    const saved = localStorage.getItem('cargos');
    if (saved) {
      set({ cargos: JSON.parse(saved) });
    }
  },

  addCargo: (cargoData) => {
    const cargo: Cargo = {
      ...cargoData,
      id: generateId(),
      criadoEm: getCurrentTimestamp(),
      atualizadoEm: getCurrentTimestamp()
    };
    
    const newCargos = [...get().cargos, cargo];
    set({ cargos: newCargos });
    localStorage.setItem('cargos', JSON.stringify(newCargos));
  },

  updateCargo: (id, cargoData) => {
    const newCargos = get().cargos.map(cargo => 
      cargo.id === id 
        ? { ...cargo, ...cargoData, atualizadoEm: getCurrentTimestamp() }
        : cargo
    );
    set({ cargos: newCargos });
    localStorage.setItem('cargos', JSON.stringify(newCargos));
  },

  deleteCargo: (id) => {
    const newCargos = get().cargos.filter(cargo => cargo.id !== id);
    set({ cargos: newCargos });
    localStorage.setItem('cargos', JSON.stringify(newCargos));
  },

  getCompetenciasByCargo: (cargoId) => {
    const cargo = get().cargos.find(c => c.id === cargoId);
    if (!cargo || !cargo.competenciasIds) return [];
    return get().competencias.filter(comp => cargo.competenciasIds.includes(comp.id));
  },

  // Colaboradores
  loadColaboradores: () => {
    const saved = localStorage.getItem('colaboradores');
    if (saved) {
      set({ colaboradores: JSON.parse(saved) });
    }
  },

  addColaborador: (colaboradorData) => {
    const colaborador: Colaborador = {
      ...colaboradorData,
      id: generateId(),
      criadoEm: getCurrentTimestamp(),
      atualizadoEm: getCurrentTimestamp()
    };
    
    const newColaboradores = [...get().colaboradores, colaborador];
    set({ colaboradores: newColaboradores });
    localStorage.setItem('colaboradores', JSON.stringify(newColaboradores));
  },

  updateColaborador: (id, colaboradorData) => {
    const newColaboradores = get().colaboradores.map(colaborador => 
      colaborador.id === id 
        ? { ...colaborador, ...colaboradorData, atualizadoEm: getCurrentTimestamp() }
        : colaborador
    );
    set({ colaboradores: newColaboradores });
    localStorage.setItem('colaboradores', JSON.stringify(newColaboradores));
  },

  deleteColaborador: (id) => {
    const newColaboradores = get().colaboradores.filter(colaborador => colaborador.id !== id);
    set({ colaboradores: newColaboradores });
    localStorage.setItem('colaboradores', JSON.stringify(newColaboradores));
  },

  getColaboradoresByEquipe: (equipeId) => {
    return get().colaboradores.filter(colaborador => colaborador.equipeId === equipeId);
  },

  getColaboradoresByGestor: (gestorId) => {
    return get().colaboradores.filter(colaborador => colaborador.gestorId === gestorId);
  },

  getColaboradoresByManagerHierarchy: (managerId) => {
    const state = get();
    const manager = state.colaboradores.find(c => c.id === managerId);
    if (!manager) return [];

    // Get all teams managed by this manager
    const managedTeams = state.equipes.filter(equipe => equipe.gestorId === managerId);
    const managedTeamIds = managedTeams.map(equipe => equipe.id);

    // Get all subordinate teams (teams that have this manager's teams as superior)
    const getSubordinateTeams = (teamIds: string[]): string[] => {
      const subordinateTeams = state.equipes.filter(equipe => 
        teamIds.includes(equipe.equipeSuperiorId)
      );
      const subordinateTeamIds = subordinateTeams.map(equipe => equipe.id);
      
      if (subordinateTeamIds.length === 0) return teamIds;
      
      return [...teamIds, ...getSubordinateTeams(subordinateTeamIds)];
    };

    const allTeamIds = getSubordinateTeams(managedTeamIds);

    // Return all collaborators in these teams
    return state.colaboradores.filter(colaborador => 
      allTeamIds.includes(colaborador.equipeId)
    );
  },

  getEquipesByManagerHierarchy: (managerId) => {
    const state = get();
    
    // Get teams directly managed by this manager
    const managedTeams = state.equipes.filter(equipe => equipe.gestorId === managerId);
    const managedTeamIds = managedTeams.map(equipe => equipe.id);

    // Get all subordinate teams recursively
    const getSubordinateTeams = (teamIds: string[]): Equipe[] => {
      const subordinateTeams = state.equipes.filter(equipe => 
        teamIds.includes(equipe.equipeSuperiorId)
      );
      
      if (subordinateTeams.length === 0) return [];
      
      return [...subordinateTeams, ...getSubordinateTeams(subordinateTeams.map(t => t.id))];
    };

    const subordinateTeams = getSubordinateTeams(managedTeamIds);
    
    return [...managedTeams, ...subordinateTeams];
  },

  // Equipes
  loadEquipes: () => {
    const saved = localStorage.getItem('equipes');
    if (saved) {
      set({ equipes: JSON.parse(saved) });
    }
  },

  addEquipe: (equipeData) => {
    const equipe: Equipe = {
      ...equipeData,
      id: generateId(),
      criadaEm: getCurrentTimestamp(),
      atualizadaEm: getCurrentTimestamp()
    };
    
    const newEquipes = [...get().equipes, equipe];
    set({ equipes: newEquipes });
    localStorage.setItem('equipes', JSON.stringify(newEquipes));
  },

  updateEquipe: (id, equipeData) => {
    const newEquipes = get().equipes.map(equipe => 
      equipe.id === id 
        ? { ...equipe, ...equipeData, atualizadaEm: getCurrentTimestamp() }
        : equipe
    );
    set({ equipes: newEquipes });
    localStorage.setItem('equipes', JSON.stringify(newEquipes));
  },

  deleteEquipe: (id) => {
    const newEquipes = get().equipes.filter(equipe => equipe.id !== id);
    set({ equipes: newEquipes });
    localStorage.setItem('equipes', JSON.stringify(newEquipes));
  },

  getEquipesByEquipeSuperior: (equipeSuperiorId) => {
    return get().equipes.filter(equipe => equipe.equipeSuperiorId === equipeSuperiorId);
  },

  validateEquipeHierarchy: (equipeId, equipeSuperiorId) => {
    if (!equipeSuperiorId) return true;
    if (equipeId === equipeSuperiorId) return false;
    
    // Check for circular references by traversing up the hierarchy
    let currentEquipeId = equipeSuperiorId;
    const visited = new Set<string>();
    
    while (currentEquipeId) {
      if (visited.has(currentEquipeId)) return false;
      visited.add(currentEquipeId);
      
      if (currentEquipeId === equipeId) return false;
      
      const currentEquipe = get().equipes.find(e => e.id === currentEquipeId);
      currentEquipeId = currentEquipe?.equipeSuperiorId || '';
    }
    
    return true;
  },

  // Tipos de Competência
  loadTiposCompetencia: () => {
    const saved = localStorage.getItem('tiposCompetencia');
    if (saved) {
      set({ tiposCompetencia: JSON.parse(saved) });
    }
  },

  addTipoCompetencia: (tipoData) => {
    const tipo: TipoCompetencia = {
      ...tipoData,
      id: generateId(),
      criadoEm: getCurrentTimestamp(),
      atualizadoEm: getCurrentTimestamp()
    };
    
    const newTipos = [...get().tiposCompetencia, tipo];
    set({ tiposCompetencia: newTipos });
    localStorage.setItem('tiposCompetencia', JSON.stringify(newTipos));
  },

  updateTipoCompetencia: (id, tipoData) => {
    const newTipos = get().tiposCompetencia.map(tipo => 
      tipo.id === id 
        ? { ...tipo, ...tipoData, atualizadoEm: getCurrentTimestamp() }
        : tipo
    );
    set({ tiposCompetencia: newTipos });
    localStorage.setItem('tiposCompetencia', JSON.stringify(newTipos));
  },

  deleteTipoCompetencia: (id) => {
    const newTipos = get().tiposCompetencia.filter(tipo => tipo.id !== id);
    set({ tiposCompetencia: newTipos });
    localStorage.setItem('tiposCompetencia', JSON.stringify(newTipos));
  },

  // Escalas de Competência
  loadEscalasCompetencia: () => {
    const saved = localStorage.getItem('escalasCompetencia');
    if (saved) {
      set({ escalasCompetencia: JSON.parse(saved) });
    }
  },

  addEscalaCompetencia: (escalaData) => {
    const escala: EscalaCompetencia = {
      ...escalaData,
      id: generateId(),
      criadaEm: getCurrentTimestamp(),
      atualizadaEm: getCurrentTimestamp()
    };
    
    const newEscalas = [...get().escalasCompetencia, escala];
    set({ escalasCompetencia: newEscalas });
    localStorage.setItem('escalasCompetencia', JSON.stringify(newEscalas));
  },

  updateEscalaCompetencia: (id, escalaData) => {
    const newEscalas = get().escalasCompetencia.map(escala => 
      escala.id === id 
        ? { ...escala, ...escalaData, atualizadaEm: getCurrentTimestamp() }
        : escala
    );
    set({ escalasCompetencia: newEscalas });
    localStorage.setItem('escalasCompetencia', JSON.stringify(newEscalas));
  },

  deleteEscalaCompetencia: (id) => {
    const newEscalas = get().escalasCompetencia.filter(escala => escala.id !== id);
    set({ escalasCompetencia: newEscalas });
    localStorage.setItem('escalasCompetencia', JSON.stringify(newEscalas));
  },

  // Competências
  loadCompetencias: () => {
    const saved = localStorage.getItem('competencias');
    if (saved) {
      set({ competencias: JSON.parse(saved) });
    }
  },

  addCompetencia: (competenciaData) => {
    const competencia: Competencia = {
      ...competenciaData,
      id: generateId(),
      criadaEm: getCurrentTimestamp(),
      atualizadaEm: getCurrentTimestamp()
    };
    
    const newCompetencias = [...get().competencias, competencia];
    set({ competencias: newCompetencias });
    localStorage.setItem('competencias', JSON.stringify(newCompetencias));
  },

  updateCompetencia: (id, competenciaData) => {
    const newCompetencias = get().competencias.map(competencia => 
      competencia.id === id 
        ? { ...competencia, ...competenciaData, atualizadaEm: getCurrentTimestamp() }
        : competencia
    );
    set({ competencias: newCompetencias });
    localStorage.setItem('competencias', JSON.stringify(newCompetencias));
  },

  deleteCompetencia: (id) => {
    const newCompetencias = get().competencias.filter(competencia => competencia.id !== id);
    set({ competencias: newCompetencias });
    localStorage.setItem('competencias', JSON.stringify(newCompetencias));
  },

  canDeleteCompetencia: (competenciaId) => {
    const competencia = get().competencias.find(c => c.id === competenciaId);
    if (!competencia) return false;
    
    // Check if competency is linked to any job roles
    const isLinkedToCargo = get().cargos.some(cargo => 
      cargo.competenciasIds && cargo.competenciasIds.includes(competenciaId)
    );
    
    // Check if competency is used in any evaluations
    const isUsedInAvaliacao = get().avaliacoesCiclo.some(avaliacao =>
      avaliacao.competenciasSelecionadas && avaliacao.competenciasSelecionadas.includes(competenciaId)
    );
    
    return !isLinkedToCargo && !isUsedInAvaliacao;
  },

  // Avaliações Ciclo
  loadAvaliacoesCiclo: () => {
    try {
      console.group('DataStore Debug - loadAvaliacoesCiclo');
      console.log('Chamado loadAvaliacoesCiclo');
      const saved = localStorage.getItem('avaliacoesCiclo');
      console.log('Conteúdo bruto localStorage[avaliacoesCiclo]:', saved ? `string(${saved.length})` : 'null');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Parsed avaliacoesCiclo é array?', Array.isArray(parsed));
        console.log('Tamanho parsed:', Array.isArray(parsed) ? parsed.length : 'N/A');
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ avaliacoesCiclo: parsed });
          console.log('Carregado de localStorage com sucesso. Status:', parsed.map((c: any) => c.status));
          console.groupEnd();
          return;
        }
      }
      // Fallback: initialize with mock data when absent or empty
      set({ avaliacoesCiclo: mockAvaliacoesCiclo });
      localStorage.setItem('avaliacoesCiclo', JSON.stringify(mockAvaliacoesCiclo));
      console.log('Fallback para mockAvaliacoesCiclo aplicado. Quantidade:', mockAvaliacoesCiclo.length);
      console.groupEnd();
    } catch (error) {
      // If localStorage content is corrupted, reset with mock
      set({ avaliacoesCiclo: mockAvaliacoesCiclo });
      localStorage.setItem('avaliacoesCiclo', JSON.stringify(mockAvaliacoesCiclo));
      console.error('Erro ao carregar avaliacoesCiclo. Reset para mock.', error);
      console.groupEnd();
    }
  },

  addAvaliacaoCiclo: (avaliacaoData) => {
    const avaliacao: AvaliacaoCiclo = {
      ...avaliacaoData,
      id: generateId(),
      criadaEm: getCurrentTimestamp(),
      atualizadaEm: getCurrentTimestamp()
    };
    
    const newAvaliacoes = [...get().avaliacoesCiclo, avaliacao];
    set({ avaliacoesCiclo: newAvaliacoes });
    localStorage.setItem('avaliacoesCiclo', JSON.stringify(newAvaliacoes));
  },

  updateAvaliacaoCiclo: (id, avaliacaoData) => {
    const newAvaliacoes = get().avaliacoesCiclo.map(avaliacao => 
      avaliacao.id === id 
        ? { ...avaliacao, ...avaliacaoData, atualizadaEm: getCurrentTimestamp() }
        : avaliacao
    );
    set({ avaliacoesCiclo: newAvaliacoes });
    localStorage.setItem('avaliacoesCiclo', JSON.stringify(newAvaliacoes));
  },

  deleteAvaliacaoCiclo: (id) => {
    const newAvaliacoes = get().avaliacoesCiclo.filter(avaliacao => avaliacao.id !== id);
    set({ avaliacoesCiclo: newAvaliacoes });
    localStorage.setItem('avaliacoesCiclo', JSON.stringify(newAvaliacoes));
  },

  // Participantes
  loadAvaliacaoParticipantes: () => {
    const saved = localStorage.getItem('avaliacaoParticipantes');
    if (saved) {
      set({ avaliacaoParticipantes: JSON.parse(saved) });
    }
  },

  addAvaliacaoParticipante: (participanteData) => {
    const participante: AvaliacaoParticipante = {
      ...participanteData,
      id: generateId(),
      criadaEm: getCurrentTimestamp(),
      atualizadaEm: getCurrentTimestamp()
    };
    
    const newParticipantes = [...get().avaliacaoParticipantes, participante];
    set({ avaliacaoParticipantes: newParticipantes });
    localStorage.setItem('avaliacaoParticipantes', JSON.stringify(newParticipantes));
  },

  updateAvaliacaoParticipante: (id, participanteData) => {
    const newParticipantes = get().avaliacaoParticipantes.map(participante => 
      participante.id === id 
        ? { ...participante, ...participanteData, atualizadaEm: getCurrentTimestamp() }
        : participante
    );
    set({ avaliacaoParticipantes: newParticipantes });
    localStorage.setItem('avaliacaoParticipantes', JSON.stringify(newParticipantes));
  },

  // Respostas
  loadRespostasAvaliacao: () => {
    const saved = localStorage.getItem('respostasAvaliacao');
    if (saved) {
      set({ respostasAvaliacao: JSON.parse(saved) });
    }
  },

  addRespostaAvaliacao: (respostaData) => {
    const resposta: RespostaAvaliacao = {
      ...respostaData,
      id: generateId(),
      criadaEm: getCurrentTimestamp(),
      atualizadaEm: getCurrentTimestamp()
    };
    
    const newRespostas = [...get().respostasAvaliacao, resposta];
    set({ respostasAvaliacao: newRespostas });
    localStorage.setItem('respostasAvaliacao', JSON.stringify(newRespostas));
  },

  updateRespostaAvaliacao: (id, respostaData) => {
    const newRespostas = get().respostasAvaliacao.map(resposta => 
      resposta.id === id 
        ? { ...resposta, ...respostaData, atualizadaEm: getCurrentTimestamp() }
        : resposta
    );
    set({ respostasAvaliacao: newRespostas });
    localStorage.setItem('respostasAvaliacao', JSON.stringify(newRespostas));
  },

  // Alias methods for compatibility
  addAvaliacao: (avaliacaoData) => get().addAvaliacaoCiclo(avaliacaoData),
  addCicloAvaliacao: (avaliacaoData) => get().addAvaliacaoCiclo(avaliacaoData),
  updateCicloAvaliacao: (id, avaliacaoData) => get().updateAvaliacaoCiclo(id, avaliacaoData),
  deleteCicloAvaliacao: (id) => get().deleteAvaliacaoCiclo(id),

  // Usuários
  loadUsuarios: () => {
    const saved = localStorage.getItem('usuarios');
    if (saved) {
      set({ usuarios: JSON.parse(saved) });
    }
  },

  addUsuario: (usuarioData) => {
    const usuario: Usuario = {
      ...usuarioData,
      id: generateId(),
      criadoEm: getCurrentTimestamp(),
      atualizadoEm: getCurrentTimestamp()
    };
    
    const newUsuarios = [...get().usuarios, usuario];
    set({ usuarios: newUsuarios });
    localStorage.setItem('usuarios', JSON.stringify(newUsuarios));
  },

  updateUsuario: (id, usuarioData) => {
    const newUsuarios = get().usuarios.map(usuario => 
      usuario.id === id 
        ? { ...usuario, ...usuarioData, atualizadoEm: getCurrentTimestamp() }
        : usuario
    );
    set({ usuarios: newUsuarios });
    localStorage.setItem('usuarios', JSON.stringify(newUsuarios));
  },

  deleteUsuario: (id) => {
    const newUsuarios = get().usuarios.filter(usuario => usuario.id !== id);
    set({ usuarios: newUsuarios });
    localStorage.setItem('usuarios', JSON.stringify(newUsuarios));
  },

  validateUsuarioAccess: (usuarioId) => {
    const usuario = get().usuarios.find(u => u.id === usuarioId);
    if (!usuario) return false;
    
    // Check if user is active
    if (!usuario.ativo) return false;
    
    // Check date validation
    const now = new Date();
    const dataInicio = new Date(usuario.dataInicio);
    const dataFim = usuario.dataFim ? new Date(usuario.dataFim) : null;
    
    if (now < dataInicio) return false;
    if (dataFim && now > dataFim) return false;
    
    return true;
  },

  getUsuarioByUsernameOrEmail: (login) => {
    return get().usuarios.find(usuario => 
      usuario.username === login || usuario.email === login
    );
  },

  // Inicialização
  initialize: () => {
    console.group('DataStore Debug - initialize');
    console.log('Inicializando DataStore');
    get().loadCargos();
    get().loadColaboradores();
    get().loadEquipes();
    get().loadTiposCompetencia();
    get().loadEscalasCompetencia();
    get().loadCompetencias();
    get().loadAvaliacoesCiclo();
    get().loadAvaliacaoParticipantes();
    get().loadRespostasAvaliacao();
    get().loadUsuarios();
    console.groupEnd();
  }
}));