# Plano de Banco de Dados Supabase - SinclaRH

**Data:** 2024  
**Status:** Em revisão/ajustes

## RESUMO DO PLANO

Este documento contém o plano completo para migração do sistema SinclaRH do localStorage para Supabase (PostgreSQL).

---

## 1. TABELAS PRINCIPAIS A CRIAR

### 1.1 Estrutura Base
- `empresas` - Dados da empresa
- `filiais` - Filiais/Branch offices

### 1.2 Gestão de Pessoas
- `usuarios` - Usuários do sistema (liga com `auth.users` do Supabase)
- `colaboradores` - Funcionários/Colaboradores
- `cargos` - Cargos/Posições
- `equipes` - Equipes com hierarquia

### 1.3 Sistema de Competências
- `tipos_competencia` - Tipos (Técnica, Comportamental, Clima)
- `escalas_competencia` - Escalas de avaliação
- `notas_escala` - Notas dentro de cada escala (tabela filha)
- `competencias` - Competências individuais

### 1.4 Sistema de Avaliações
- `avaliacoes_ciclo` - Ciclos de avaliação
- `avaliacao_competencias_ciclo` - Competências de cada ciclo (many-to-many)
- `avaliacao_participantes` - Participantes (avaliador + avaliado)
- `resposta_avaliacao` - Respostas por competência

### 1.5 Tabelas de Relacionamento Many-to-Many
- `cargo_competencias` - Relação Cargo ↔ Competências (atualmente está como array `competenciasIds`)

**TOTAL: 16 tabelas**

---

## 2. RELACIONAMENTOS (Foreign Keys)

### Relacionamentos Diretos
```
empresas (1) ──→ (N) filiais
empresas (1) ──→ (N) usuarios
empresas (1) ──→ (N) colaboradores
empresas (1) ──→ (N) cargos
empresas (1) ──→ (N) equipes
empresas (1) ──→ (N) tipos_competencia
empresas (1) ──→ (N) escalas_competencia
empresas (1) ──→ (N) competencias
empresas (1) ──→ (N) avaliacoes_ciclo
```

### Integração com Auth
```
auth.users (1) ──→ (1) usuarios (via auth_user_id)
```

### Relacionamentos de Pessoas
```
usuarios (N) ──→ (0..1) colaboradores (via colaborador_id)
colaboradores (N) ──→ (1) cargos
colaboradores (N) ──→ (1) equipes
colaboradores (N) ──→ (0..1) colaboradores (gestor - self-reference)
colaboradores (N) ──→ (0..1) filiais
```

### Hierarquia de Equipes
```
equipes (N) ──→ (1) colaboradores (gestor)
equipes (N) ──→ (0..1) equipes (equipe_superior - self-reference)
```

### Sistema de Competências
```
tipos_competencia (1) ──→ (N) competencias
escalas_competencia (1) ──→ (N) notas_escala
escalas_competencia (1) ──→ (N) avaliacoes_ciclo
cargos (N) ──→ (N) competencias (via cargo_competencias)
competencias (N) ──→ (N) avaliacoes_ciclo (via avaliacao_competencias_ciclo)
competencias (N) ──→ (N) resposta_avaliacao
```

### Sistema de Avaliações
```
avaliacoes_ciclo (1) ──→ (N) avaliacao_competencias_ciclo
avaliacoes_ciclo (1) ──→ (N) avaliacao_participantes
colaboradores (1) ──→ (N) avaliacao_participantes (como avaliador)
colaboradores (1) ──→ (N) avaliacao_participantes (como avaliado)
avaliacao_participantes (1) ──→ (N) resposta_avaliacao
```

---

## 3. CAMPOS ESPECÍFICOS IMPORTANTES

### Autenticação
- `usuarios.senha` → **NÃO será armazenada** (usa `auth.users` do Supabase)
- `usuarios.auth_user_id` → Referencia `auth.users(id)`
- `usuarios.username` → Para login alternativo
- `usuarios.data_inicio` e `usuarios.data_fim` → Controle de acesso temporal
- `usuarios.perfil` → Enum ('ADMIN', 'GESTOR', 'COLABORADOR')

### Hierarquias
- `equipes.equipe_superior_id` → Self-reference para hierarquia de equipes
- `colaboradores.gestor_id` → Self-reference para hierarquia de gestores

### Arrays do TypeScript → Tabelas
- `cargos.competenciasIds[]` → Tabela `cargo_competencias`
- `avaliacoes_ciclo.competenciasSelecionadas[]` → Tabela `avaliacao_competencias_ciclo`
- `escalas_competencia.notas[]` → Tabela `notas_escala`

---

## 4. QUERIES PRINCIPAIS NECESSÁRIAS

### 4.1 Autenticação e Autorização
- Login via email/username + senha (Supabase Auth)
- Validação de acesso por perfil e datas
- Buscar usuário autenticado com colaborador relacionado

### 4.2 CRUD Básico
- Todas as operações CRUD para cada entidade
- Filtros por `empresa_id` (multi-tenancy)

### 4.3 Queries Complexas de Negócio

#### Hierarquia
- Buscar colaboradores por gestor (incluindo hierarquia completa)
- Buscar equipes subordinadas recursivamente
- Validar hierarquia sem loops (circular reference check)

#### Avaliações
- Criar avaliação + participantes automaticamente
- Buscar avaliações pendentes por usuário
- Calcular médias e resultados de avaliações
- Buscar respostas com competências relacionadas

#### Relatórios
- Desempenho por equipe/período
- Clima organizacional agregado
- Top performers
- Evolução temporal de notas

### 4.4 Validações Especiais
- Verificar se competência pode ser deletada (não está em uso)
- Validar datas de avaliação
- Verificar se colaborador está ativo
- Validar hierarquia de equipes

---

## 5. RECURSOS SUPABASE NECESSÁRIOS

### 5.1 Row Level Security (RLS)
- Políticas por perfil (ADMIN vê tudo da empresa, GESTOR vê sua hierarquia, etc.)
- Isolamento por `empresa_id` (multi-tenancy)
- Proteção de dados sensíveis

### 5.2 Índices para Performance
- `empresa_id` em todas as tabelas
- `auth_user_id` em usuarios
- `colaborador_id` em usuarios
- `gestor_id` em colaboradores
- `equipe_superior_id` em equipes
- `status` em avaliacao_participantes
- `avaliacao_participante_id` em resposta_avaliacao

### 5.3 Triggers/Functions
- `updated_at` automático
- Validação de hierarquia circular
- Atualização de status de avaliação

### 5.4 Supabase Auth Integration
- Criar usuário no `auth.users` ao criar em `usuarios`
- Sincronizar email entre `auth.users` e `usuarios`
- Policy para `auth.users` acessar `usuarios` relacionados

---

## 6. CONSIDERAÇÕES IMPORTANTES

1. **Senhas:** NÃO armazenar na tabela `usuarios`, usar Supabase Auth
2. **UUIDs:** Usar `uuid` como PK (padrão Supabase)
3. **Timestamps:** `created_at` e `updated_at` automáticos
4. **Soft deletes:** Considerar `deleted_at` se necessário
5. **Multi-tenancy:** Sempre filtrar por `empresa_id`
6. **Performance:** Índices em FKs e campos de filtro frequente

---

## 7. CHECKLIST DO QUE CRIAR

### Estrutura
- [ ] 16 tabelas principais
- [ ] Foreign keys e constraints
- [ ] Índices em campos críticos
- [ ] Triggers para updated_at
- [ ] Functions para validações

### Segurança
- [ ] Row Level Security (RLS) habilitado
- [ ] Policies por perfil
- [ ] Policies de multi-tenancy

### Integração
- [ ] Integração com auth.users
- [ ] Policies para auth integration

### Queries/Views
- [ ] Views para relatórios (opcional, mas recomendado)
- [ ] Functions para hierarquias recursivas
- [ ] Functions para cálculos de médias

---

## 8. PRÓXIMOS PASSOS

1. Revisar e acertar detalhes antes de implementar
2. Criar SQL completo de todas as tabelas
3. Definir queries principais em SQL
4. Configurar policies de RLS
5. Criar functions e triggers
6. Organizar migrations

---

**Notas:** Este documento está sujeito a ajustes conforme revisão do sistema.


