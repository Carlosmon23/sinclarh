import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building2, 
  UserCheck, 
  Settings, 
  BarChart3, 
  ClipboardList,
  Target,
  Heart,
  UserMinus,
  LogOut,
  ChevronDown,
  ChevronRight,
  Cog
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';
import Logo from '../Common/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { usuario, logout, empresa } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      roles: ['ADMIN', 'GESTOR', 'COLABORADOR']
    },
    {
      title: 'Avaliações',
      icon: ClipboardList,
      path: '/avaliacoes',
      roles: ['ADMIN', 'GESTOR'],
      submenu: [
        { title: 'Criar Avaliação', path: '/avaliacoes/criar-wizard' },
        { title: 'Gerenciar Avaliações', path: '/avaliacoes/gerenciar' }
      ]
    },
    {
      title: 'Minhas Avaliações',
      icon: UserCheck,
      path: '/minhas-avaliacoes',
      roles: ['GESTOR', 'COLABORADOR']
    },
    {
      title: 'Minha Equipe',
      icon: Users,
      path: '/minha-equipe',
      roles: ['GESTOR']
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      path: '/relatorios',
      roles: ['ADMIN', 'GESTOR'],
      submenu: [
        { title: 'Desempenho', path: '/relatorios/desempenho' },
        { title: 'Clima Organizacional', path: '/relatorios/clima' },
        { title: 'Offboarding', path: '/relatorios/offboarding' }
      ]
    },
    {
      title: 'Parametrização',
      icon: Settings,
      path: '/parametrizacao',
      roles: ['ADMIN'],
      submenu: [
        { title: 'Tipos de Competência', path: '/parametrizacao/tipos-competencia' },
        { title: 'Escalas de Competência', path: '/parametrizacao/escalas-competencia' },
        { title: 'Competências', path: '/parametrizacao/competencias' },
        { title: 'Cargos', path: '/parametrizacao/cargos' },
        { title: 'Colaboradores', path: '/parametrizacao/colaboradores' },
        { title: 'Equipes', path: '/parametrizacao/equipes' },
        { title: 'Usuários', path: '/parametrizacao/usuarios' }
      ]
    },
    {
      title: 'Configurações',
      icon: Cog,
      path: '/configuracoes',
      roles: ['ADMIN'],
      submenu: [
        { title: 'Empresa', path: '/configuracoes/empresa' }
      ]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(usuario?.perfil || '')
  );

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:relative lg:z-auto lg:shadow-none"
      )}>
        <div className="flex flex-col h-full">
          {/* Header - Logo e Nome da Empresa */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              {empresa?.logo ? (
                <img 
                  src={empresa.logo} 
                  alt={`${empresa.nome} logo`}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 truncate">
                  {empresa?.nome || 'Empresa'}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  {usuario?.perfil}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              const isExpanded = expandedMenus.includes(item.path);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              
              return (
                <div key={item.path} className="space-y-1">
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleMenu(item.path)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-blue-50 text-blue-700" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-blue-50 text-blue-700" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  )}
                  
                  {/* Submenu */}
                  {hasSubmenu && isExpanded && (
                    <div className="ml-8 space-y-1">
                      {item.submenu!.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={onClose}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors",
                            location.pathname === subItem.path
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {usuario?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {usuario?.nome}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {usuario?.email}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 mb-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
            
            {/* SinclaRH no rodapé */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <Logo size="sm" showText={false} />
                <span className="text-xs font-medium text-gray-600">SinclaRH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;