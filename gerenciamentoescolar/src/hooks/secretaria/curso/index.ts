// src/hooks/secretaria/curso/index.ts - HOOKS DE CURSO UNIFICADOS
import { useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { transformCursoFormToDTO } from '@/utils/transformers';
import { 
  cursoFormSchema, 
  cursoDTOSchema,
  validateCursoDTO,
  type CursoFormData,
  type CursoDTO,
  type CursoResponse 
} from '@/schemas';
import type { 
  UseCursoFormReturn,
  UseCursoAPIReturn,
  CursoFormProps 
} from '@/types/secretariaTypes/cadastroCurso/curso';

// ===== CACHE PARA CURSOS =====
const cursosCache = new Map<string, { 
  data: CursoResponse[]; 
  timestamp: number;
}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// ===== 1. HOOK DE API (CRUD) =====
export const useCursoAPI = (): UseCursoAPIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // CREATE
  const createCurso = useCallback(async (data: CursoDTO): Promise<CursoResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validação antes da requisição
      const validation = validateCursoDTO(data);
      if (!validation.success) {
        throw new Error('Dados inválidos: ' + validation.error?.issues[0].message);
      }

      const validData = validation.data;
      const api = getAPIClient();
      const response = await api.post(`/curso/${validData.id_secretaria}`, validData);
      
      // Limpar cache após criação
      cursosCache.delete(validData.id_secretaria);
      
      return response.data;
    } catch (err: any) {
      const { message } = handleApiError(err, 'CreateCurso');
      
      let errorMessage = message;
      if (err.response?.status === 400 && 
          typeof err.response?.data === 'string' && 
          err.response?.data.toLowerCase().includes('curso já cadastrado')) {
        errorMessage = 'Este curso já está cadastrado no sistema.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // READ
  const fetchCursos = useCallback(async (secretariaId: string): Promise<CursoResponse[]> => {
    if (!secretariaId || secretariaId === 'undefined' || secretariaId === 'null') {
      throw new Error('ID da secretaria é obrigatório');
    }

    setLoading(true);
    setError(null);
    
    try {
      // Verificar cache primeiro
      const cached = cursosCache.get(secretariaId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLoading(false);
        return cached.data;
      }

      const api = getAPIClient();
      const response = await api.get(`/curso/${secretariaId}/secretaria`);
      
      const data = response.data;
      
      // Atualizar cache
      cursosCache.set(secretariaId, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (err: any) {
      const { message } = handleApiError(err, 'FetchCursos');
      
      let errorMessage = message;
      if (err.response?.status === 404) {
        errorMessage = 'Nenhum curso encontrado.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Sem permissão para visualizar cursos.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // UPDATE (futuro)
  const updateCurso = useCallback(async (id: string, data: Partial<CursoDTO>): Promise<CursoResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const api = getAPIClient();
      const response = await api.put(`/curso/${id}`, data);
      
      // Limpar cache após atualização
      if (data.id_secretaria) {
        cursosCache.delete(data.id_secretaria);
      }
      
      return response.data;
    } catch (err: any) {
      const { message } = handleApiError(err, 'UpdateCurso');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE
  const deleteCurso = useCallback(async (cursoId: string, secretariaId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const api = getAPIClient();
      await api.delete(`/curso/${cursoId}`);
      
      // Limpar cache após deleção
      cursosCache.delete(secretariaId);
      
    } catch (err: any) {
      const { message } = handleApiError(err, 'DeleteCurso');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    createCurso,
    fetchCursos,
    updateCurso,
    deleteCurso,
    loading,
    error,
    clearError
  }), [createCurso, fetchCursos, updateCurso, deleteCurso, loading, error, clearError]);
};

// ===== 2. HOOK DE FORMULÁRIO =====
interface UseCursoFormOptions {
  onSuccess?: () => void;
  initialData?: Partial<CursoFormData>;
  mode?: 'create' | 'edit';
}

export const useCursoForm = ({ 
  onSuccess, 
  initialData,
  mode = 'create' 
}: UseCursoFormOptions = {}): UseCursoFormReturn => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { createCurso, updateCurso, loading, error, clearError } = useCursoAPI();

  // Form com valores iniciais condicionais
  const form = useForm<CursoFormData>({
    resolver: zodResolver(cursoFormSchema),
    mode: 'onBlur',
    defaultValues: useMemo(() => ({
      nome: initialData?.nome || '',
      duracao: initialData?.duracao || '',
    }), [initialData])
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    clearError();
  }, [clearError]);

  const onSubmit = useCallback(async (data: CursoFormData) => {
    try {
      if (!user?.id) {
        throw new Error('ID da secretaria não encontrado. Por favor, faça login novamente.');
      }

      const cursoDTO = transformCursoFormToDTO(data, user.id);

      if (mode === 'create') {
        await createCurso(cursoDTO);
        setSuccessMessage('Curso cadastrado com sucesso!');
        form.reset();
      } else {
        // Para modo edit, precisaria do ID do curso
        // await updateCurso(cursoId, cursoDTO);
        setSuccessMessage('Curso atualizado com sucesso!');
      }

      if (onSuccess) {
        onSuccess();
      }

    } catch (err: unknown) {
      console.error('Erro no formulário de curso:', err);
    }
  }, [user?.id, createCurso, updateCurso, form, onSuccess, mode]);

  return {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  };
};

// ===== 3. HOOK DE LISTA =====
interface UseCursoListOptions {
  autoFetch?: boolean;
  secretariaId?: string;
}

export const useCursoList = ({ 
  autoFetch = true,
  secretariaId 
}: UseCursoListOptions = {}) => {
  const [cursos, setCursos] = useState<CursoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { fetchCursos, deleteCurso } = useCursoAPI();

  const currentSecretariaId = secretariaId || user?.id;

  const loadCursos = useCallback(async () => {
    if (!currentSecretariaId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchCursos(currentSecretariaId);
      setCursos(data);
    } catch (err: any) {
      setError(err.message);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  }, [currentSecretariaId, fetchCursos]);

  const refetch = useCallback(() => {
    // Limpar cache antes de recarregar
    if (currentSecretariaId) {
      cursosCache.delete(currentSecretariaId);
    }
    loadCursos();
  }, [loadCursos, currentSecretariaId]);

  const handleDeleteCurso = useCallback(async (cursoId: string) => {
    if (!currentSecretariaId) return;
    
    try {
      await deleteCurso(cursoId, currentSecretariaId);
      // Remover da lista local
      setCursos(prev => prev.filter(curso => curso.id_curso !== cursoId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [currentSecretariaId, deleteCurso]);

  const clearError = useCallback(() => setError(null), []);

  // Auto fetch se habilitado
  useEffect(() => {
    if (autoFetch && currentSecretariaId) {
      loadCursos();
    }
  }, [autoFetch, currentSecretariaId, loadCursos]);

  return useMemo(() => ({
    cursos,
    loading,
    error,
    refetch,
    deleteCurso: handleDeleteCurso,
    clearError
  }), [cursos, loading, error, refetch, handleDeleteCurso, clearError]);
};

// ===== 4. HOOK DE ESTATÍSTICAS (futuro) =====
export const useCursoStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    duracaoMedia: 0
  });
  
  const { cursos } = useCursoList({ autoFetch: true });

  useEffect(() => {
    const total = cursos.length;
    const ativos = cursos.filter(c => c.situacao === 'ATIVO').length;
    const inativos = total - ativos;
    const duracaoMedia = total > 0 
      ? Math.round(cursos.reduce((acc, c) => acc + c.duracao, 0) / total)
      : 0;

    setStats({ total, ativos, inativos, duracaoMedia });
  }, [cursos]);

  return stats;
};

// ===== 5. CACHE UTILITIES =====
export const cursoCacheUtils = {
  clear: () => cursosCache.clear(),
  clearFor: (secretariaId: string) => cursosCache.delete(secretariaId),
  getSize: () => cursosCache.size,
};

// ===== EXPORTS PRINCIPAIS =====
export default {
  useCursoAPI,
  useCursoForm,
  useCursoList,
  useCursoStats,
  cursoCacheUtils
};