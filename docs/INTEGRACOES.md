# Integrações - SinclaRH

Este documento descreve as integrações configuradas no sistema.

## Supabase

### Configuração
As credenciais do Supabase estão configuradas no arquivo `.env`:
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave pública (anon)
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Chave de service role (apenas backend)

### Uso

#### Cliente Frontend (com RLS)
```typescript
import { supabase } from '@/lib/supabase';

// Exemplo de query
const { data, error } = await supabase
  .from('usuarios')
  .select('*')
  .eq('empresa_id', empresaId);
```

#### Cliente Admin (apenas backend/server-side)
⚠️ **ATENÇÃO**: Não usar no frontend! Apenas em server-side/API routes.
```typescript
import { supabaseAdmin } from '@/lib/supabase';

if (supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('*');
}
```

### Arquivos
- `src/lib/supabase.ts`: Cliente Supabase configurado
- `docs/SUPABASE_DATABASE_PLAN.md`: Plano de migração do banco de dados

## Asaas

### Configuração
As credenciais do Asaas estão configuradas no arquivo `.env`:
- `VITE_ASAAS_API_KEY`: Token de autenticação
- `VITE_ASAAS_API_URL`: URL base da API (padrão: https://api.asaas.com/v3)

### Uso

```typescript
import { asaasClient } from '@/lib/asaas';

// GET
const customers = await asaasClient.get('/customers');

// POST
const newCustomer = await asaasClient.post('/customers', {
  name: 'João Silva',
  email: 'joao@example.com'
});

// PUT
const updated = await asaasClient.put('/customers/123', {
  name: 'João Santos'
});

// DELETE
await asaasClient.delete('/customers/123');
```

### Documentação
Documentação oficial: https://docs.asaas.com/

### Arquivo
- `src/lib/asaas.ts`: Cliente Asaas configurado

## Variáveis de Ambiente

Todas as variáveis de ambiente devem ser prefixadas com `VITE_` para serem expostas ao frontend no Vite.

O arquivo `.env` não deve ser commitado no Git (já está no `.gitignore`). Use `.env.example` como referência.

## Próximos Passos

1. Implementar autenticação com Supabase
2. Migrar dados mock para Supabase (ver `docs/SUPABASE_DATABASE_PLAN.md`)
3. Implementar integração com Asaas conforme necessário (cobranças, assinaturas, etc.)


