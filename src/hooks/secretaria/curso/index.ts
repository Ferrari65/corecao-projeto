import { useState, useContext, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { transformCursoFormToDTO } from '@/utils/transformers';
import { 
  cursoFormSchema, 
  type CursoFormData,
  type CursoResponse 
} from '@/schemas';
import type { 
  UseCursoFormReturn,
  CursoFormProps 
} from '@/types/index';

interface UseCursoListReturn {
  cursos: CursoResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearError: () => void;
}

interface UseCursoFormOptions {
  onSuccess?: () => void;
  initialData?: Partial<CursoFormData>;
}

export const useCursoForm = ({ 
  onSuccess, 
  initialData 
}: UseCursoFormOptions = {}): UseCursoFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const form = useForm<CursoFormData>({
    resolver: zodResolver(cursoFormSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: initialData?.nome || '',
      duracao: initialData?.duracao || '',
    }
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  const onSubmit = useCallback(async (data: CursoFormData) => {
    if (!user?.id) {
      setError('ID da secretaria não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cursoDTO = transformCursoFormToDTO(data, user.id);
      const api = getAPIClient();
      
      await api.post(`/curso/${user.id}`, cursoDTO);
      
      setSuccessMessage('Curso cadastrado com sucesso!');
      form.reset();
      onSuccess?.();
      
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'CreateCurso');
      
      if (message.includes('já cadastrado')) {
        setError('Este curso já está cadastrado no sistema.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, form, onSuccess]);

  return {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  };
};
export const useCursoList = (): UseCursoListReturn => {
  const [cursos, setCursos] = useState<CursoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const clearError = useCallback(() => setError(null), []);

  const fetchCursos = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      const response = await api.get(`/curso/${user.id}/secretaria`);
      setCursos(response.data || []);
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'FetchCursos');
      setError(message);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refetch = useCallback(() => {
    fetchCursos();
  }, [fetchCursos]);

  useEffect(() => {
    if (user?.id) {
      fetchCursos();
    }
  }, [user?.id, fetchCursos]);

  return {
    cursos,
    loading,
    error,
    refetch,
    clearError
  };
};
export default {
  useCursoForm,
  useCursoList
};