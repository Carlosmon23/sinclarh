# SinclaRH

Sistema de Gestão de Desempenho e Avaliações

## Sobre

SinclaRH é uma plataforma completa para gestão de desempenho, avaliações e desenvolvimento de colaboradores. O sistema permite criar e gerenciar diferentes tipos de avaliações, acompanhar o desempenho de equipes e gerar relatórios detalhados.

## Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **Lucide React** - Ícones
- **Sonner** - Notificações toast
- **Recharts** - Gráficos e visualizações

## Funcionalidades

### Tipos de Avaliação
- **Avaliação de Desempenho** - Avaliação completa 90°, 180° ou 360°
- **Avaliação Direcionada** - Focada em competências específicas
- **Onboarding** - Avaliação de integração de novos colaboradores
- **Offboarding** - Feedback de colaboradores em desligamento
- **Feedback** - Feedback contínuo
- **Pesquisa** - Pesquisas de clima e engajamento

### Módulos
- Dashboard com visão geral e estatísticas
- Criação e gerenciamento de avaliações
- Resposta e acompanhamento de avaliações
- Gestão de equipes e colaboradores
- Parametrização completa (competências, escalas, cargos, etc.)
- Relatórios e análises

## Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── stores/         # Gerenciamento de estado (Zustand)
├── types/          # Definições TypeScript
├── data/           # Dados mock
└── lib/            # Utilitários
```

## Licença

© 2024 SinclaRH. Todos os direitos reservados.
