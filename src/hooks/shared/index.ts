import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';

interface SecretariaData {
  nome: string;
  email: string;
  id_secretaria: string;
}

interface UseSecretariaDataReturn {
  secretariaData: SecretariaData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSecretariaData = (): UseSecretariaDataReturn => {
  const [secretariaData, setSecretariaData] = useState<SecretariaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const fetchSecretariaData = useCallback(async () => {
    if (!user?.id) {
      setError('ID da secretaria não encontrado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      const response = await api.get(`/secretaria/${user.id}`);
      setSecretariaData(response.data);
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'SecretariaData');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refetch = useCallback(async () => {
    await fetchSecretariaData();
  }, [fetchSecretariaData]);

  useEffect(() => {
    if (user?.id) {
      fetchSecretariaData();
    }
  }, [user?.id, fetchSecretariaData]);

  return {
    secretariaData,
    loading,
    error,
    refetch
  };
};

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default {
  useSecretariaData,
  useLoading,
  useDebounce
};