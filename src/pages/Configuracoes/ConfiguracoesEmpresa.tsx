import React, { useState } from 'react';
import { Building2, Upload, Save, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { toast } from 'sonner';

const ConfiguracoesEmpresa: React.FC = () => {
  const { empresa, updateEmpresa } = useAuthStore();
  const { updateEmpresa: updateEmpresaStore } = useDataStore();
  const [formData, setFormData] = useState({
    nome: empresa?.nome || '',
    cnpj: empresa?.cnpj || '',
    logo: empresa?.logo || ''
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(empresa?.logo || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem');
        return;
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB');
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData(prev => ({
          ...prev,
          logo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({
      ...prev,
      logo: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.nome.trim()) {
        toast.error('O nome da empresa é obrigatório');
        setIsLoading(false);
        return;
      }

      if (!formData.cnpj.trim()) {
        toast.error('O CNPJ é obrigatório');
        setIsLoading(false);
        return;
      }

      // Atualizar no store
      const empresaAtualizada = {
        ...empresa!,
        nome: formData.nome.trim(),
        cnpj: formData.cnpj.trim(),
        logo: formData.logo || undefined,
        atualizadaEm: new Date().toISOString()
      };

      updateEmpresa(empresaAtualizada);
      updateEmpresaStore(empresa!.id, {
        nome: formData.nome.trim(),
        cnpj: formData.cnpj.trim(),
        logo: formData.logo || undefined
      });

      toast.success('Configurações da empresa atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar configurações da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurações da Empresa</h1>
        <p className="text-gray-600">Gerencie as informações e identidade visual da sua empresa</p>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome da empresa"
                />
              </div>

              <div>
                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          </div>

          {/* Logo da Empresa */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo da Empresa</h2>
            
            <div className="space-y-4">
              {/* Preview do Logo */}
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo da empresa"
                        className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center border border-gray-200">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoPreview ? 'Alterar Logo' : 'Enviar Logo'}
                  </label>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nome: empresa?.nome || '',
                  cnpj: empresa?.cnpj || '',
                  logo: empresa?.logo || ''
                });
                setLogoPreview(empresa?.logo || null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfiguracoesEmpresa;


