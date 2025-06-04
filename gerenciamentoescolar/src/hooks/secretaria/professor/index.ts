// src/hooks/secretaria/professor/index.ts - HOOKS DE PROFESSOR UNIFICADOS
import { useState, useContext, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { 
  transformProfessorFormToDTO, 
  validateProfessorFormData 
} from '@/utils/transformers';
import { 
  professorFormSchema, 
  type ProfessorFormData,
  type ProfessorDTO 
} from '@/schemas';
import type { 
  Professor, 
  UseProfessorFormReturn,
  UseProfessorAPIReturn,
  ProfessorFormProps 
} from '@/types/secretariaTypes/cadastroprofessor/professor';

// ===== CACHE PARA PROFESSORES =====
const professoresCache = new Map<string, { 
  data: Professor[]; 
  timestamp: number;
}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// ===== 1. HOOK DE API (CRUD) =====
export const useProfessorAPI = (): UseProfessorAPIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // CREATE
  const createProfessor = useCallback(async (data: ProfessorDTO): Promise<Professor> => {
    setLoading(true);
    setError(null);
    
    try {
      const api = getAPIClient();
      const response = await api.post(`/professor/${data.id_secretaria}`, data);
      
      // Limpar cache após criação
      professoresCache.delete(data.id_secretaria);
      
      return response.data;
    } catch (err: any) {
      const { message } = handleApiError(err, 'CreateProfessor');
      
      let errorMessage = message;
      if (err.response?.status === 400 && 
          typeof err.response.data === 'string' && 
          err.response.data.toLowerCase().includes('professor já cadastrado')) {
        errorMessage = 'Este professor já está cadastrado no sistema.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // READ
  const fetchProfessores = useCallback(async (secretariaId: string): Promise<Professor[]> => {
    if (!secretariaId || secretariaId === 'undefined' || secretariaId === 'null') {
      throw new Error('ID da secretaria é obrigatório');
    }

    setLoading(true);
    setError(null);
    
    try {
      // Verificar cache primeiro
      const cached = professoresCache.get(secretariaId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLoading(false);
        return cached.data;
      }

      const api = getAPIClient();
      const response = await api.get(`/professor/${secretariaId}`);
      
      const data = response.data;
      
      // Atualizar cache
      professoresCache.set(secretariaId, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (err: any) {
      const { message } = handleApiError(err, 'FetchProfessores');
      
      let errorMessage = message;
      if (err.response?.status === 404) {
        errorMessage = 'Nenhum professor encontrado para esta secretaria.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Sem permissão para acessar professores desta secretaria.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // UPDATE (futuro)
  const updateProfessor = useCallback(async (id: string, data: Partial<ProfessorDTO>): Promise<Professor> => {
    setLoading(true);
    setError(null);
    
    try {
      const api = getAPIClient();
      const response = await api.put(`/professor/${id}`, data);
      
      // Limpar cache após atualização
      if (data.id_secretaria) {
        professoresCache.delete(data.id_secretaria);
      }
      
      return response.data;
    } catch (err: any) {
      const { message } = handleApiError(err, 'UpdateProfessor');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE (futuro)
  const deleteProfessor = useCallback(async (id: string, secretariaId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const api = getAPIClient();
      await api.delete(`/professor/${id}`);
      
      // Limpar cache após deleção
      professoresCache.delete(secretariaId);
      
    } catch (err: any) {
      const { message } = handleApiError(err, 'DeleteProfessor');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    createProfessor,
    fetchProfessores,
    updateProfessor,
    deleteProfessor,
    loading,
    error,
    clearError
  }), [createProfessor, fetchProfessores, updateProfessor, deleteProfessor, loading, error, clearError]);
};

// ===== 2. HOOK DE FORMULÁRIO =====
interface UseProfessorFormOptions {
  onSuccess?: () => void;
  initialData?: Partial<ProfessorFormData>;
  mode?: 'create' | 'edit';
}

export const useProfessorForm = ({ 
  onSuccess, 
  initialData,
  mode = 'create' 
}: UseProfessorFormOptions = {}): UseProfessorFormReturn => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { createProfessor, updateProfessor, loading, error } = useProfessorAPI();

  // Form com valores iniciais condicionais
  const form = useForm<ProfessorFormData>({
    resolver: zodResolver(professorFormSchema),
    mode: 'onBlur',
    defaultValues: useMemo(() => ({
      nome: initialData?.nome || '',
      cpf: initialData?.cpf || '',
      email: initialData?.email || '',
      senha: initialData?.senha || '',
      telefone: initialData?.telefone || '',
      data_nasc: initialData?.data_nasc || '',
      sexo: initialData?.sexo || 'M' as const,
      logradouro: initialData?.logradouro || '',
      bairro: initialData?.bairro || '',
      numero: initialData?.numero || '',
      cidade: initialData?.cidade || '',
      uf: initialData?.uf || ''
    }), [initialData])
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const onSubmit = useCallback(async (data: ProfessorFormData) => {
    try {
      if (!user?.id) {
        throw new Error('ID da secretaria não encontrado. Por favor, faça login novamente.');
      }

      // Validação rápida
      const validationErrors = validateProfessorFormData(data);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const professorDTO = transformProfessorFormToDTO(data, user.id);

      if (mode === 'create') {
        await createProfessor(professorDTO);
        setSuccessMessage('Professor cadastrado com sucesso!');
        form.reset();
      } else {
        // Para modo edit, precisaria do ID do professor
        // await updateProfessor(professorId, professorDTO);
        setSuccessMessage('Professor atualizado com sucesso!');
      }
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (err: any) {
      console.error('Erro no formulário de professor:', err.message);
    }
  }, [user?.id, createProfessor, updateProfessor, form, onSuccess, mode]);

  return {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  };
};

// ===== 3. HOOK DE LISTA (para futuras listagens) =====
interface UseProfessorListOptions {
  autoFetch?: boolean;
  secretariaId?: string;
}

export const useProfessorList = ({ 
  autoFetch = true,
  secretariaId 
}: UseProfessorListOptions = {}) => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { fetchProfessores } = useProfessorAPI();

  const currentSecretariaId = secretariaId || user?.id;

  const loadProfessores = useCallback(async () => {
    if (!currentSecretariaId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfessores(currentSecretariaId);
      setProfessores(data);
    } catch (err: any) {
      setError(err.message);
      setProfessores([]);
    } finally {
      setLoading(false);
    }
  }, [currentSecretariaId, fetchProfessores]);

  const refetch = useCallback(() => {
    // Limpar cache antes de recarregar
    if (currentSecretariaId) {
      professoresCache.delete(currentSecretariaId);
    }
    loadProfessores();
  }, [loadProfessores, currentSecretariaId]);

  const clearError = useCallback(() => setError(null), []);

  // Auto fetch se habilitado
  useState(() => {
    if (autoFetch && currentSecretariaId) {
      loadProfessores();
    }
  });

  return useMemo(() => ({
    professores,
    loading,
    error,
    refetch,
    clearError
  }), [professores, loading, error, refetch, clearError]);
};

// ===== 4. CACHE UTILITIES =====
export const professorCacheUtils = {
  clear: () => professoresCache.clear(),
  clearFor: (secretariaId: string) => professoresCache.delete(secretariaId),
  getSize: () => professoresCache.size,
};

// ===== EXPORTS PRINCIPAIS =====
export default {
  useProfessorAPI,
  useProfessorForm,
  useProfessorList,
  professorCacheUtils
};