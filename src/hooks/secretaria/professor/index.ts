import { useState, useContext, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { transformProfessorFormToDTO } from '@/utils/transformers';
import { 
  professorFormSchema, 
  type ProfessorFormData,
  type ProfessorDTO 
} from '@/schemas';
import type { 
  Professor, 
  UseProfessorFormReturn,
  ProfessorFormProps 
} from '@/types/index';

interface UseProfessorListReturn {
  professores: Professor[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearError: () => void;
}

interface UseProfessorFormOptions {
  onSuccess?: () => void;
  initialData?: Partial<ProfessorFormData>;
}

export const useProfessorForm = ({ 
  onSuccess, 
  initialData 
}: UseProfessorFormOptions = {}): UseProfessorFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const form = useForm<ProfessorFormData>({
    resolver: zodResolver(professorFormSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: initialData?.nome || '',
      cpf: initialData?.cpf || '',
      email: initialData?.email || '',
      senha: initialData?.senha || '',
      telefone: initialData?.telefone || '',
      data_nasc: initialData?.data_nasc || '',
      sexo: initialData?.sexo || 'M',
      logradouro: initialData?.logradouro || '',
      bairro: initialData?.bairro || '',
      numero: initialData?.numero || '',
      cidade: initialData?.cidade || '',
      uf: initialData?.uf || ''
    }
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  const onSubmit = useCallback(async (data: ProfessorFormData) => {
    if (!user?.id) {
      setError('ID da secretaria não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const professorDTO = transformProfessorFormToDTO(data, user.id);
      const api = getAPIClient();
      
      await api.post(`/professor/${user.id}`, professorDTO);
      
      setSuccessMessage('Professor cadastrado com sucesso!');
      form.reset();
      onSuccess?.();
      
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'CreateProfessor');
      
      if (message.includes('já cadastrado')) {
        setError('Este professor já está cadastrado no sistema.');
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

export const useProfessorList = (): UseProfessorListReturn => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const clearError = useCallback(() => setError(null), []);

  const fetchProfessores = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      const response = await api.get(`/professor/${user.id}`);
      setProfessores(response.data || []);
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'FetchProfessores');
      setError(message);
      setProfessores([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refetch = useCallback(() => {
    fetchProfessores();
  }, [fetchProfessores]);

  useEffect(() => {
    if (user?.id) {
      fetchProfessores();
    }
  }, [user?.id, fetchProfessores]);

  return {
    professores,
    loading,
    error,
    refetch,
    clearError
  };
};

export default {
  useProfessorForm,
  useProfessorList
};