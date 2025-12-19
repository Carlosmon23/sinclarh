/**
 * Cliente Asaas API
 * 
 * Documentação: https://docs.asaas.com/
 */

const ASAAS_API_URL = import.meta.env.VITE_ASAAS_API_URL || 'https://api.asaas.com/v3';
const ASAAS_API_KEY = import.meta.env.VITE_ASAAS_API_KEY;

if (!ASAAS_API_KEY) {
  console.warn('Asaas API key não configurada');
}

/**
 * Configuração padrão para requisições à API Asaas
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY || '',
  };
};

/**
 * Cliente base para requisições à API Asaas
 */
export const asaasClient = {
  /**
   * Realiza uma requisição GET
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${ASAAS_API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
      throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Realiza uma requisição POST
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
      throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Realiza uma requisição PUT
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
      throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Realiza uma requisição DELETE
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
      throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};

export default asaasClient;


