# HR System Enhancement Requirements Documentation

## 1. UI/UX Changes

### 1.1 Menu Lateral - ADMIN Access

**Requirement**: Move "Parametrização" item to the last position in the sidebar menu.

**Technical Implementation**:

* Update `Sidebar.tsx` component

* Reorder menu items array to place parametrization last

* Maintain existing icons and navigation logic

### 1.2 Visão Superior do Sistema

**Requirement**: Add client logo and company name in the top header section.

**Technical Implementation**:

* Modify header component to include logo placeholder

* Add company name field to configuration/settings

* Create responsive layout for logo + company name display

* Support both image and text logo options

## 2. User Management Enhancements

### 2.1 Configurações > Usuários

**New Fields Required**:

1. **Username Field**

   * Purpose: Alternative login method (email OR username)

   * Use case: Integration with existing client systems using employee codes (Matricula/CPF)

   * Validation: Unique, alphanumeric, 6-20 characters

2. **User Status Control**

   * Active/Inactive flag (boolean)

   * Start Date (mandatory): Access activation date

   * End Date (optional): Access expiration date

**Data Model Changes**:

```typescript
interface Usuario {
  id: string;
  email: string;
  username?: string; // New field
  nome: string;
  ativo: boolean; // New field
  dataInicio: Date; // New field
  dataFim?: Date; // New field
  perfil: 'ADMIN' | 'GESTOR' | 'COLABORADOR';
  colaboradorId?: string;
  empresaId: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

**Authentication Logic**:

* Login should accept either email OR username

* Check user status and date validity during authentication

* Block access for inactive users or expired accounts

## 3. Colaborador Management

### 3.1 Configurações > Gestão de Colaboradores

**New Fields Required**:

1. **Equipe Assignment**

   * Dropdown to select team

   * Filter evaluations by team for managers

   * Manager sees only their team members

2. **Email Field**

   * Professional email address

   * Validation: Email format required

3. **Setor Field**

   * Department/Area specification

   * Free text or predefined list

**Data Model Changes**:

```typescript
interface Colaborador {
  id: string;
  matricula: string;
  nome: string;
  cpf: string;
  email: string; // New field
  dataAdmissao: Date;
  dataDemissao?: Date;
  situacao: 'ATIVO' | 'DESLIGADO';
  cargoId: string;
  equipeId: string; // New field
  setor: string; // New field
  gestor: boolean;
  gestorId?: string;
  empresaId: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

## 4. Team Hierarchy

### 4.1 Configurações > Equipes

**New Field Required**:

* **Parent Team Selection**: Dropdown to select superior team

* Purpose: Create organizational hierarchy and org chart

**Data Model Changes**:

```typescript
interface Equipe {
  id: string;
  codigo: string;
  nome: string;
  equipeSuperiorId?: string; // New field
  gestorId: string;
  ativa: boolean;
  empresaId: string;
  criadaEm: Date;
  atualizadaEm: Date;
}
```

**Implementation**:

* Prevent circular references in team hierarchy

* Create visual org chart component

* Support multi-level team structures

## 5. Cargo-Competencia Integration

### 5.1 Configurações > Cargos

**New Feature Required**:

* **Competency Selection Button**: Opens modal with competency list

* Multi-select competencies for each position

* System automatically uses position-linked competencies for evaluations

**Implementation**:

```typescript
interface Cargo {
  id: string;
  codigo: string;
  nome: string;
  descricaoAtividade: string;
  competenciasIds: string[]; // New field
  empresaId: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

**UI Component**:

* Modal with searchable competency list

* Selected competencies display

* Save/cancel functionality

## 6. Competencia Management

### 6.1 Configurações > Competências

**New Features Required**:

1. **Active/Inactive Flag**

   * Boolean field to mark competencies as inactive

   * Inactive competencies hidden from new evaluations

2. **Deletion Restrictions**

   * Block deletion if competency is linked to any cargo

   * Block deletion if competency was used in any evaluation

   * Show warning message with usage details

**Data Model Changes**:

```typescript
interface Competencia {
  id: string;
  tipoCompetenciaId: string;
  competencia: string;
  perguntaParaAvaliar: string;
  ativa: boolean; // New field
  empresaId: string;
  criadaEm: Date;
  atualizadaEm: Date;
}
```

## 7. Escala de Competencia

### 7.1 Configurações > Escala de Competência

**New Fields Required**:

1. **Code Field**: Unique identifier for the scale

2. **Type Field**: Restricted selection with options:

   * Avaliação de Desempenho

   * Avaliação Direcionada

   * OnBoarding

   * OffBoarding

3. **Default Scales**: Pre-create scales for:

   * Avaliação de Desempenho

   * OnBoarding

   * OffBoarding

4. **Type-based Filtering**: Show only scales matching selected type

**Data Model Changes**:

```typescript
interface EscalaCompetencia {
  id: string;
  codigo: string; // New field
  tipo: 'AVALIACAO_DESEMPENHO' | 'AVALIACAO_DIRECIONADA' | 'ONBOARDING' | 'OFFBOARDING'; // New field
  nome: string;
  peso: number;
  descricao: string;
  empresaId: string;
  ativa: boolean;
  criadaEm: Date;
  atualizadaEm: Date;
}
```

## 8. Data Import

### 8.1 Importação de Dados

**Requirements**:

* TXT format with semicolon (;) separator

* Fixed field order

* Support for bulk data import

* Integration capabilities for external systems

**Implementation Considerations**:

* Create import wizard component

* Field mapping interface

* Data validation before import

* Rollback capability for failed imports

* Progress indicator for large imports

**File Format Specification**:

```
matricula;nome;cpf;email;dataAdmissao;cargoId;equipeId;setor;gestor
001;João Silva;12345678901;joao@empresa.com;2023-01-15;CARGO001;EQUIPE001;TI;false
```

## 9. Progressive Form for Avaliacao Creation

### 9.1 Criação de Avaliações - Formulário Progressivo

**Requirements**:

* Horizontal layout for evaluation type selection

* Conditional fields based on evaluation type

* Step-by-step form progression

**Evaluation Types**:

1. Avaliação de Desempenho
2. Avaliação Direcionada
3. OnBoarding
4. OffBoarding
5. Feedback
6. Pesquisa

### 9.2 Avaliação de Desempenho - Specific Fields

**Form Fields**:

* Código e Nome da Avaliação

* Descrição da Avaliação

* Data Início e Fim

* Tipo de Competência (optional - filters by cargo)

* Tipo de Avaliação (90º, 180º, 360º)

* Escala selection (default: Padrão)

* Generate consensual note automatically? (checkbox)

* Manager can see evaluated's score? (checkbox)

* Gestor selection (only managers)

* Funcionários selection (only team members)

**Logic Rules**:

* Competencies loaded from employee's cargo

* If competency type selected, only show that type

* Manager only sees their team members

* Automatic email notification to manager

### 9.3 Avaliação Direcionada - Specific Fields

**Form Fields**:

* Código e Nome da Avaliação

* Descrição da Avaliação

* Data Início e Fim

* Competency selection (from cargo-linked competencies)

* Escala selection

* Gestor selection (ADMIN only)

* Funcionários selection

**Access Rules**:

* ADMIN: Can select any manager and their team

* GESTOR: Can only select their own team members

## 10. Technical Implementation Priority

### Phase 1 - Critical (Week 1)

1. Type system fixes and data model updates
2. User management enhancements (username, status)
3. Colaborador management (email, setor, equipe)
4. Team hierarchy implementation

### Phase 2 - Core Features (Week 2)

1. Cargo-competencia integration
2. Competencia management (active/inactive, deletion rules)
3. Escala de competencia enhancements
4. Progressive evaluation form structure

### Phase 3 - Advanced Features (Week 3)

1. Specific evaluation type implementations
2. Data import functionality
3. Email notifications
4. Advanced filtering and search

### Phase 4 - Polish (Week 4)

1. UI/UX refinements
2. Performance optimization
3. Testing and bug fixes
4. Documentation completion

## 11. Database Schema Updates

### Required Table Modifications

```sql
-- Users table
ALTER TABLE usuarios ADD COLUMN username VARCHAR(50) UNIQUE;
ALTER TABLE usuarios ADD COLUMN ativo BOOLEAN DEFAULT true;
ALTER TABLE usuarios ADD COLUMN data_inicio DATE NOT NULL;
ALTER TABLE usuarios ADD COLUMN data_fim DATE;

-- Colaboradores table
ALTER TABLE colaboradores ADD COLUMN email VARCHAR(255);
ALTER TABLE colaboradores ADD COLUMN equipe_id VARCHAR(50);
ALTER TABLE colaboradores ADD COLUMN setor VARCHAR(100);

-- Equipes table
ALTER TABLE equipes ADD COLUMN equipe_superior_id VARCHAR(50);

-- Cargos table
ALTER TABLE cargos ADD COLUMN competencias_ids TEXT[];

-- Competencias table
ALTER TABLE competencias ADD COLUMN ativa BOOLEAN DEFAULT true;

-- Escalas competencia table
ALTER TABLE escalas_competencia ADD COLUMN codigo VARCHAR(50) NOT NULL;
ALTER TABLE escalas_competencia ADD COLUMN tipo VARCHAR(50) NOT NULL;
```

This documentation serves as the complete blueprint for implementing all requested enhancements to the HR system. Each section includes specific technical
